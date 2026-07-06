// app.js

// 1. Simulated Headless CMS Product Data (Fallback)
const MOCK_CMS_PERFUMES = [
  {
    id: "lily-edp",
    name: "Lily Eau de Parfum (O Boticário)",
    category: "Floral Fresco",
    notes: "Lírios, Pêra, Pimenta Rosa, Sândalo",
    description: "Uma fragrância sofisticada que traz a pureza feminina dos lírios aliada a um toque fresco e elegante.",
    intensity: "Moderada",
    price: "R$ 299,90",
    volume: "75ml",
    tags: ["dia", "trabalho", "floral"]
  },
  {
    id: "malbec-gold",
    name: "Malbec Gold (O Boticário)",
    category: "Amadeirado Quente",
    notes: "Notas de Âmbar, Patchouli, Cedro e Uva Gold",
    description: "Fragrância marcante e misteriosa, sinônimo de poder e atração para noites inesquecíveis.",
    intensity: "Intensa",
    price: "R$ 224,90",
    volume: "100ml",
    tags: ["noite", "encontro", "amadeirado"]
  },
  {
    id: "kaiak-aventura",
    name: "Kaiak Aventura (Natura)",
    category: "Cítrico Herbáceo",
    notes: "Acorde Cítrico, Artemísia, Almíscar e Âmbar",
    description: "A energia vibrante do ar livre em um aroma fresco e revigorante para o seu dia a dia dinâmico.",
    intensity: "Suave a Moderada",
    price: "R$ 172,90",
    volume: "100ml",
    tags: ["dia", "esporte", "fresco"]
  },
  {
    id: "essencial-unico",
    name: "Essencial Único (Natura)",
    category: "Oriental Especiado",
    notes: "Copaíba, Oud, Pimenta-Preta, Âmbar",
    description: "Uma obra de arte olfativa marcante e opulenta para quem busca sofisticação absoluta e exclusividade.",
    intensity: "Intensa",
    price: "R$ 282,00",
    volume: "90ml",
    tags: ["noite", "festa", "sofisticado"]
  },
  {
    id: "patricia-abravanel",
    name: "Patricia Abravanel (Jequiti)",
    category: "Cítrico Floral",
    notes: "Flor de Laranjeira, Frutas Vermelhas, Baunilha",
    description: "Uma mistura alegre, charmosa e cativante que equilibra notas florais com a doçura da baunilha.",
    intensity: "Moderada",
    price: "R$ 119,90",
    volume: "100ml",
    tags: ["dia", "relaxar", "floral"]
  },
  {
    id: "portiolli-black",
    name: "Portiolli Black Edition (Jequiti)",
    category: "Amadeirado Ambarado",
    notes: "Limão Siciliano, Pimenta Preta, Cedro, Âmbar",
    description: "Elegante e moderno, ideal para o homem que se destaca por sua personalidade forte e atitude contemporânea.",
    intensity: "Intensa",
    price: "R$ 129,90",
    volume: "100ml",
    tags: ["noite", "sofisticado", "amadeirado"]
  }
];

// Global catalog that will be populated with Scraper data + CMS quantities
let perfumesCatalog = [];

// WhatsApp number configuration
const WHATSAPP_NUMBER = "5511999999999"; // Replace with real number

// Load Perfumes Data from JSON and merge with CMS quantity
async function loadPerfumesData() {
  try {
    const response = await fetch('./perfumes_data.json');
    if (!response.ok) throw new Error("Não foi possível ler perfumes_data.json");
    const scrapedData = await response.json();
    
    // Simulate stock quantities coming from a Headless CMS
    const cmsStock = {};
    scrapedData.forEach(perfume => {
      // Each perfume has a quantity managed in the CMS (some out of stock, some high stock)
      cmsStock[perfume.id] = Math.floor(Math.random() * 10);
    });

    perfumesCatalog = scrapedData.map(perfume => ({
      ...perfume,
      quantity: cmsStock[perfume.id] !== undefined ? cmsStock[perfume.id] : 0
    }));

    console.log("[CMS & SCRAPER] Banco de dados integrado carregado com sucesso.");

  } catch (error) {
    console.warn("[CMS & SCRAPER] Usando dados locais como fallback:", error);
    perfumesCatalog = MOCK_CMS_PERFUMES.map(p => ({
      ...p,
      quantity: 5 // Default fallback quantity
    }));
  }
}

// 2. Initialize AOS (Animate on Scroll) and dynamic content
document.addEventListener("DOMContentLoaded", async () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: "ease-in-out-cubic",
      once: true,
      offset: 50
    });
  }

  // Auto-hide header configuration
  setupAutoHideHeader();

  // Mobile menu configuration
  setupMobileMenu();

  // Load the scraper and CMS data
  await loadPerfumesData();

  // Setup cart drawer and badge state
  setupCartDrawer();
  updateCartBadge();
  setupProductModal();

  // Detect which page we are on
  const isCollectionsPage = window.location.pathname.includes("colecoes.html");
  const isAdminPage = window.location.pathname.includes("admin.html");

  if (isCollectionsPage) {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryQuery = urlParams.get('category');
    
    if (categoryQuery) {
      let activeQuery = categoryQuery;
      // Map legacy categories to produtos
      if (categoryQuery === "perfumes" || categoryQuery === "cremes" || categoryQuery === "cosmeticos") {
        activeQuery = "produtos";
      }

      // Find the button for this category and click it to trigger filter
      const filterBtn = document.querySelector(`.filter-btn[data-category="${activeQuery}"]`);
      if (filterBtn) {
        activeCategory = activeQuery;
        // Also update filter button active classes
        const buttons = document.querySelectorAll(".filter-btn");
        buttons.forEach(btn => {
          btn.classList.remove("bg-[#4A5E4E]", "text-white");
          btn.classList.add("bg-[#FAF7F2]", "text-[#4A5E4E]");
        });
        filterBtn.classList.remove("bg-[#FAF7F2]", "text-[#4A5E4E]");
        filterBtn.classList.add("bg-[#4A5E4E]", "text-white");

        // Populate brand/line options
        if (activeCategory === "produtos") {
          updateLineOptions();
        }
        applyAllFilters();
      } else {
        renderCatalog(perfumesCatalog);
      }
    } else {
      renderCatalog(perfumesCatalog);
    }
    setupFilterButtons(false);
    setupSearch();
    setupBrandAndLineFilters();
  } else if (isAdminPage) {
    initAdminDashboard();
  } else {
    // Show 5 showcase products per category on home page
    renderCategoryShowcase("Perfumes", "perfumes-grid", 5);
    renderCategoryShowcase("Cremes", "cremes-grid", 5);
    renderCategoryShowcase("Cestas", "cestas-grid", 5);
    renderCategoryShowcase("Roupas", "roupas-grid", 5);
    renderCategoryShowcase("Flores", "flores-grid", 5);
    
    setupQuiz();
    startHeroSlideshow();
  }
});

// Setup Mobile Menu Toggle Behavior
function setupMobileMenu() {
  const toggleBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIcon = document.getElementById("menu-icon");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  if (!toggleBtn || !mobileMenu) return;

  function closeMenu() {
    mobileMenu.classList.add("opacity-0", "-translate-y-4", "pointer-events-none");
    mobileMenu.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
    if (menuIcon) {
      menuIcon.setAttribute("d", "M4 6h16M4 12h16M4 18h16"); // Hamburger icon
    }
  }

  function openMenu() {
    mobileMenu.classList.remove("opacity-0", "-translate-y-4", "pointer-events-none");
    mobileMenu.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
    if (menuIcon) {
      menuIcon.setAttribute("d", "M6 18L18 6M6 6l12 12"); // X close icon
    }
  }

  toggleBtn.addEventListener("click", () => {
    const isClosed = mobileMenu.classList.contains("pointer-events-none");
    if (isClosed) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  // Close menu when clicking any link
  mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });
}

// Auto-hide Header (Smart Header) on scroll
function setupAutoHideHeader() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // Don't hide if scroll is near top (less than 80px)
    if (currentScrollY < 80) {
      nav.classList.remove("-translate-y-full");
    } else if (currentScrollY > lastScrollY) {
      // Scrolling down - hide
      nav.classList.add("-translate-y-full");
    } else {
      // Scrolling up - show
      nav.classList.remove("-translate-y-full");
    }

    lastScrollY = currentScrollY;
  });
}

// Hero slideshow cycling among catalog products
function startHeroSlideshow() {
  const card = document.getElementById("hero-perfume-card");
  if (!card || perfumesCatalog.length === 0) return;

  const numEl = document.getElementById("hero-perfume-number");
  const bottleTextEl = document.getElementById("hero-bottle-text");
  const volumeEl = document.getElementById("hero-bottle-volume");
  const titleEl = document.getElementById("hero-perfume-title");
  const subtitleEl = document.getElementById("hero-perfume-subtitle");

  let currentIndex = 0;

  // Rich premium gradients matching catalog scent vibes
  const gradients = [
    "from-sage-200 to-terracotta-200", 
    "from-terracotta-200 to-sage-300", 
    "from-sage-100 to-sage-300",       
    "from-terracotta-100 to-terracotta-300",
    "from-cream-200 to-terracotta-200", 
    "from-sage-200 to-sage-900/20"      
  ];

  setInterval(() => {
    // Add fade and shrink transform
    card.classList.add("opacity-0", "scale-95");

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % perfumesCatalog.length;
      const perfume = perfumesCatalog[currentIndex];

      // Update text details
      numEl.textContent = `N° 0${(currentIndex % 9) + 1}`;
      
      const shortName = perfume.name.split(" ")[0].toUpperCase();
      bottleTextEl.textContent = shortName;
      
      volumeEl.textContent = perfume.volume.toUpperCase();
      titleEl.textContent = perfume.name;
      
      // Extract brand/origin from name in parentheses e.g. "O Boticário"
      const brandMatch = perfume.name.match(/\(([^)]+)\)/);
      const brand = brandMatch ? brandMatch[1] : "";
      subtitleEl.textContent = `${perfume.notes} (${brand})`;

      // Update background gradient
      gradients.forEach(g => {
        g.split(" ").forEach(cls => card.classList.remove(cls));
      });
      const newGrad = gradients[currentIndex % gradients.length];
      newGrad.split(" ").forEach(cls => card.classList.add(cls));

      // Fade back in with pop scale transition
      card.classList.remove("opacity-0", "scale-95");
    }, 500);
  }, 5000); // cycle every 5 seconds
}

// 3. Render Catalog Items
function renderCatalog(perfumes, limit = null) {
  const container = document.getElementById("catalog-grid");
  if (!container) return;

  container.innerHTML = "";

  const itemsToRender = limit ? perfumes.slice(0, limit) : perfumes;

  if (itemsToRender.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-sage-600">
        <p class="font-serif-elegant text-xl">Nenhum produto encontrado com estas características.</p>
      </div>
    `;
    return;
  }

  itemsToRender.forEach((perfume, idx) => {
    const card = document.createElement("div");
    card.className = "catalog-item-bg rounded-2xl p-5 md:p-6 flex flex-col justify-between text-white border border-white/5";
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", `${idx * 100}`);

    const hasStock = perfume.quantity > 0;

    card.innerHTML = `
      <div class="cursor-pointer" onclick="openProductModal('${perfume.id}')">
        <div class="flex justify-between items-start mb-4">
          <span class="text-[10px] uppercase tracking-widest text-[#D1E2D3] bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm font-semibold">
            ${perfume.category === "Cosméticos" ? perfume.type : perfume.category}
          </span>
          <span class="text-xs font-light text-white/80">${perfume.volume}</span>
        </div>
        
        <div class="flex items-start space-x-4 mb-4">
          ${perfume.image ? `
            <div class="flex-shrink-0">
              <img src="${perfume.image}" alt="${perfume.name}" class="object-contain rounded-xl border border-white/10 shadow-md bg-white/5 transition-transform duration-300 hover:scale-105" style="width: 10rem; height: auto;" onerror="this.style.display='none'">
            </div>
          ` : ''}
          <div class="flex flex-col min-w-0">
            <h3 class="text-base font-serif-elegant text-white tracking-wide leading-tight mb-2 truncate">${perfume.name}</h3>
            <p class="text-[12px] text-[#D1E2D3]/90 font-light leading-relaxed mb-2 break-words line-clamp-3">${perfume.description}</p>
            ${perfume.variations && perfume.variations.length > 0 ? `
              <p class="text-[10px] text-amber-250 italic font-light truncate w-full">
                <span class="font-medium">Modelos:</span> ${perfume.variations.join(', ')}
              </p>
            ` : ''}
            ${perfume.sizes && perfume.sizes.length > 0 ? `
              <p class="text-[10px] text-white/80 italic font-light truncate w-full mt-0.5">
                <span class="font-medium text-white/90">Tamanhos:</span> ${perfume.sizes.join(', ')}
              </p>
            ` : ''}
          </div>
        </div>
        
        <div class="space-y-1 mb-5 min-w-0">
          <p class="text-[10px] text-[#D1E2D3] uppercase tracking-wider">Características:</p>
          <p class="text-xs text-white/95 font-medium italic break-words">${perfume.notes}</p>
        </div>
      </div>
      
      <div>
        <div class="border-t border-white/10 pt-3 mb-1 flex justify-between items-baseline">
          <span class="text-[11px] text-[#D1E2D3]/70">Detalhe: ${perfume.intensity}</span>
          <span class="text-2xl font-bold text-amber-300 font-serif">${perfume.price}</span>
        </div>
        
        <div class="mb-4 flex justify-between items-baseline">
          <span class="text-[10px] text-[#D1E2D3]/50">Disponibilidade:</span>
          <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${hasStock ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
            ${hasStock ? `Em estoque` : 'Esgotado'}
          </span>
        </div>
        
        <div class="mt-3">
          ${((perfume.variations && perfume.variations.length > 0) || (perfume.sizes && perfume.sizes.length > 0)) ? `
            <button onclick="openProductModal('${perfume.id}')" class="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-smooth flex items-center justify-center space-x-1.5 border border-white/10 focus:outline-none">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span>Escolher Opções</span>
            </button>
          ` : `
            ${hasStock ? `
              <button id="btn-add-${perfume.id}" onclick="addToCart('${perfume.id}')" class="w-full bg-[#FAF7F2] text-[#2F3E33] hover:bg-[#D1E2D3] text-xs font-semibold py-2.5 px-3 rounded-xl transition-smooth flex items-center justify-center space-x-1.5 focus:outline-none">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span>Carrinho</span>
              </button>
            ` : `
              <button disabled class="w-full bg-rose-950/40 text-rose-300 border border-rose-500/20 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 cursor-not-allowed">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
                <span>Esgotado</span>
              </button>
            `}
          `}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Render Showcase per Category
function renderCategoryShowcase(categoryName, containerId, limit = 5) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const filtered = perfumesCatalog.filter(p => 
    p.category.toLowerCase() === categoryName.toLowerCase() ||
    (p.type && p.type.toLowerCase() === categoryName.toLowerCase())
  );
  const itemsToRender = filtered.slice(0, limit);

  container.innerHTML = "";

  if (itemsToRender.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-sage-600">
        <p class="font-serif-elegant text-xl">Nenhum produto disponível nesta categoria.</p>
      </div>
    `;
    return;
  }

  itemsToRender.forEach((product, idx) => {
    const card = document.createElement("div");
    card.className = "snap-align-start flex-shrink-0 w-80 md:w-96 catalog-item-bg rounded-2xl p-5 md:p-6 flex flex-col justify-between text-white border border-white/5";
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", `${idx * 100}`);

    const hasStock = product.quantity > 0;

    card.innerHTML = `
      <div class="cursor-pointer" onclick="openProductModal('${product.id}')">
        <div class="flex justify-between items-start mb-4">
          <span class="text-[10px] uppercase tracking-widest text-[#D1E2D3] bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm font-semibold">
            ${product.category === "Cosméticos" ? product.type : product.category}
          </span>
          <span class="text-xs font-light text-white/80">${product.volume}</span>
        </div>
        
        <div class="flex items-start space-x-4 mb-4">
          ${product.image ? `
            <div class="flex-shrink-0">
              <img src="${product.image}" alt="${product.name}" class="object-contain rounded-xl border border-white/10 shadow-md bg-white/5 transition-transform duration-300 hover:scale-105" style="width: 10rem; height: auto;" onerror="this.style.display='none'">
            </div>
          ` : ''}
          <div class="flex flex-col min-w-0">
            <h3 class="text-base font-serif-elegant text-white tracking-wide leading-tight mb-2 truncate">${product.name}</h3>
            <p class="text-[12px] text-[#D1E2D3]/90 font-light leading-relaxed mb-2 break-words line-clamp-3">${product.description}</p>
            ${product.variations && product.variations.length > 0 ? `
              <p class="text-[10px] text-amber-250 italic font-light truncate w-full">
                <span class="font-medium">Modelos:</span> ${product.variations.join(', ')}
              </p>
            ` : ''}
            ${product.sizes && product.sizes.length > 0 ? `
              <p class="text-[10px] text-white/80 italic font-light truncate w-full mt-0.5">
                <span class="font-medium text-white/90">Tamanhos:</span> ${product.sizes.join(', ')}
              </p>
            ` : ''}
          </div>
        </div>
        
        <div class="space-y-1 mb-5 min-w-0">
          <p class="text-[10px] text-[#D1E2D3] uppercase tracking-wider">Características:</p>
          <p class="text-xs text-white/95 font-medium italic break-words">${product.notes}</p>
        </div>
      </div>
      
      <div>
        <div class="border-t border-white/10 pt-3 mb-1 flex justify-between items-baseline">
          <span class="text-[11px] text-[#D1E2D3]/70">Detalhe: ${product.intensity}</span>
          <span class="text-2xl font-bold text-amber-300 font-serif">${product.price}</span>
        </div>
        
        <div class="mb-4 flex justify-between items-baseline">
          <span class="text-[10px] text-[#D1E2D3]/50">Disponibilidade:</span>
          <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${hasStock ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
            ${hasStock ? `Em estoque` : 'Esgotado'}
          </span>
        </div>
        
        <div class="mt-3">
          ${((product.variations && product.variations.length > 0) || (product.sizes && product.sizes.length > 0)) ? `
            <button onclick="openProductModal('${product.id}')" class="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-smooth flex items-center justify-center space-x-1.5 border border-white/10 focus:outline-none">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span>Escolher Opções</span>
            </button>
          ` : `
            ${hasStock ? `
              <button id="btn-add-${product.id}" onclick="addToCart('${product.id}')" class="w-full bg-[#FAF7F2] text-[#2F3E33] hover:bg-[#D1E2D3] text-xs font-semibold py-2.5 px-3 rounded-xl transition-smooth flex items-center justify-center space-x-1.5 focus:outline-none">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span>Carrinho</span>
              </button>
            ` : `
              <button disabled class="w-full bg-rose-950/40 text-rose-300 border border-rose-500/20 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 cursor-not-allowed">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
                <span>Esgotado</span>
              </button>
            `}
          `}
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Append a "Ver mais" (See more) card at the end of the carousel
  const moreCard = document.createElement("div");
  moreCard.className = "snap-align-start flex-shrink-0 w-80 md:w-96 catalog-item-bg rounded-2xl p-5 md:p-6 flex flex-col justify-between text-white border border-white/5 bg-gradient-to-br from-sage-800 to-sage-900 shadow-lg min-h-[350px]";
  moreCard.innerHTML = `
    <div class="flex-1 flex flex-col justify-center items-center text-center space-y-4 py-12">
      <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
        <svg class="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
        </svg>
      </div>
      <div>
        <h3 class="text-xl font-serif-elegant text-white leading-tight mb-2">Gostou da Coleção?</h3>
        <p class="text-xs text-[#D1E2D3]/80 font-light max-w-[200px] mx-auto">Explore todo o catálogo de ${categoryName} com filtros de marcas e linhas.</p>
      </div>
    </div>
    <a href="colecoes.html?category=${categoryName.toLowerCase()}" class="w-full bg-[#FAF7F2] text-[#2F3E33] hover:bg-[#D1E2D3] text-xs font-semibold py-3 px-3 rounded-xl transition-smooth flex items-center justify-center space-x-1.5 focus:outline-none uppercase tracking-wider">
      <span>Ver Todos</span>
    </a>
  `;
  container.appendChild(moreCard);
}

// State variables to track currently selected category filter, brand, and line
let activeCategory = "all";
let activeBrand = "all";
let activeLine = "all";

// Unified Filter Application
function applyAllFilters() {
  let filtered = perfumesCatalog;

  // 1. Category Filter
  if (activeCategory !== "all") {
    filtered = filtered.filter(p => 
      p.category.toLowerCase().includes(activeCategory) || 
      (p.type && p.type.toLowerCase().includes(activeCategory)) || 
      p.tags.includes(activeCategory)
    );
  }

  // 2. Brand & Line Filter (only if category is produtos)
  const subContainer = document.getElementById("sub-filters-container");
  if (activeCategory === "produtos") {
    if (subContainer) subContainer.classList.remove("hidden");

    if (activeBrand !== "all") {
      filtered = filtered.filter(p => p.brand && p.brand.toLowerCase() === activeBrand.toLowerCase());
    }

    if (activeLine !== "all") {
      filtered = filtered.filter(p => p.line && p.line.toLowerCase() === activeLine.toLowerCase());
    }
  } else {
    if (subContainer) subContainer.classList.add("hidden");
  }

  // 3. Search Filter
  const searchInput = document.getElementById("search-input");
  if (searchInput && searchInput.value.trim() !== "") {
    const query = searchInput.value.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.notes.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.brand && p.brand.toLowerCase().includes(query)) ||
      (p.line && p.line.toLowerCase().includes(query))
    );
  }

  renderCatalog(filtered);
}

// 4. Filter Buttons Logic
function setupFilterButtons(isHomepage = false) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      buttons.forEach(btn => {
        btn.classList.remove("bg-[#4A5E4E]", "text-white");
        btn.classList.add("bg-[#FAF7F2]", "text-[#4A5E4E]");
      });

      // Add active class to clicked button
      button.classList.remove("bg-[#FAF7F2]", "text-[#4A5E4E]");
      button.classList.add("bg-[#4A5E4E]", "text-white");

      activeCategory = button.getAttribute("data-category");
      
      // Reset brand & line filters on category change
      activeBrand = "all";
      activeLine = "all";
      const brandSelect = document.getElementById("filter-brand");
      const lineSelect = document.getElementById("filter-line");
      if (brandSelect) brandSelect.value = "all";
      if (lineSelect) {
        lineSelect.value = "all";
        lineSelect.innerHTML = `<option value="all">Todas as Linhas</option>`;
      }

      if (activeCategory === "produtos") {
        updateLineOptions();
      }

      applyAllFilters();
    });
  });
}

// Setup live search for collections page
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    applyAllFilters();
  });
}

// Dynamic brand and line logic
function updateLineOptions() {
  const brandSelect = document.getElementById("filter-brand");
  const lineSelect = document.getElementById("filter-line");
  if (!brandSelect || !lineSelect) return;

  const selectedBrand = brandSelect.value;
  activeBrand = selectedBrand;

  // Filter available cosmetics products for unique lines
  let availableProducts = perfumesCatalog.filter(p => 
    p.category.toLowerCase() === "produtos" ||
    (p.type && (p.type.toLowerCase() === "perfumes" || p.type.toLowerCase() === "cremes"))
  );

  if (selectedBrand !== "all") {
    availableProducts = availableProducts.filter(p => p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
  }

  // Extract unique lines
  const uniqueLines = [...new Set(availableProducts.map(p => p.line).filter(Boolean))];

  // Re-populate select
  lineSelect.innerHTML = `<option value="all">Todas as Linhas</option>`;
  uniqueLines.forEach(line => {
    const opt = document.createElement("option");
    opt.value = line;
    opt.textContent = line;
    lineSelect.appendChild(opt);
  });

  // Reset line selection
  lineSelect.value = "all";
  activeLine = "all";
}

function setupBrandAndLineFilters() {
  const brandSelect = document.getElementById("filter-brand");
  const lineSelect = document.getElementById("filter-line");

  if (brandSelect) {
    brandSelect.addEventListener("change", () => {
      updateLineOptions();
      applyAllFilters();
    });
  }

  if (lineSelect) {
    lineSelect.addEventListener("change", () => {
      activeLine = lineSelect.value;
      applyAllFilters();
    });
  }
}

// 5. Fragrance Selection Assistant / Interactive Quiz
let quizAnswers = {
  moment: "",
  style: ""
};

function setupQuiz() {
  const momentOptions = document.querySelectorAll(".quiz-moment");
  const styleOptions = document.querySelectorAll(".quiz-style");

  momentOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      momentOptions.forEach(o => o.classList.remove("border-[#4A5E4E]", "bg-[#4A5E4E]/5"));
      opt.classList.add("border-[#4A5E4E]", "bg-[#4A5E4E]/5");
      quizAnswers.moment = opt.getAttribute("data-value");
      evaluateQuiz();
    });
  });

  styleOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      styleOptions.forEach(o => o.classList.remove("border-[#4A5E4E]", "bg-[#4A5E4E]/5"));
      opt.classList.add("border-[#4A5E4E]", "bg-[#4A5E4E]/5");
      quizAnswers.style = opt.getAttribute("data-value");
      evaluateQuiz();
    });
  });
}

function evaluateQuiz() {
  if (!quizAnswers.moment || !quizAnswers.style || perfumesCatalog.length === 0) return;

  const resultContainer = document.getElementById("quiz-result");
  if (!resultContainer) return;

  // Simple recommendation algorithm
  let recommendation = perfumesCatalog[0]; // fallback

  if (quizAnswers.moment === "dia") {
    if (quizAnswers.style === "casual") {
      recommendation = perfumesCatalog.find(p => p.id.includes("kaiak") || p.id.includes("virtude")) || recommendation;
    } else {
      recommendation = perfumesCatalog.find(p => p.id.includes("lily") || p.id.includes("patricia")) || recommendation;
    }
  } else {
    // noite
    if (quizAnswers.style === "elegante") {
      recommendation = perfumesCatalog.find(p => p.id.includes("portiolli") || p.id.includes("essencial")) || recommendation;
    } else {
      recommendation = perfumesCatalog.find(p => p.id.includes("malbec") || p.id.includes("intima")) || recommendation;
    }
  }

  resultContainer.innerHTML = `
    <div class="p-6 bg-[#FAF7F2] rounded-2xl border border-[#4A5E4E]/20 text-center animate-fade-in">
      <p class="text-xs uppercase tracking-widest text-[#4A5E4E]/80 mb-2">Sua Recomendação Ideal</p>
      <h4 class="text-2xl font-serif-elegant text-[#2C382E] mb-2">${recommendation.name}</h4>
      <p class="text-sm text-gray-600 mb-4 max-w-md mx-auto">${recommendation.description}</p>
      <div class="text-xs text-gray-500 mb-6 italic">Notas: ${recommendation.notes}</div>
      <button onclick="addToCart('${recommendation.id}')" class="inline-flex items-center space-x-2 bg-[#4A5E4E] hover:bg-[#3D4D40] text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-md">
        <span>Adicionar ao Carrinho</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
        </svg>
      </button>
    </div>
  `;
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// --- Shopping Cart System ---
let cart = JSON.parse(localStorage.getItem("lessence_cart")) || [];

// Toggle Cart Drawer
function setupCartDrawer() {
  const cartToggle = document.getElementById("cart-toggle");
  const cartClose = document.getElementById("cart-close");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartBackdrop = document.getElementById("cart-backdrop");
  const cartPanel = document.getElementById("cart-panel");
  const checkoutForm = document.getElementById("checkout-form");

  if (!cartDrawer || !cartPanel) return;

  function openCart() {
    cartDrawer.classList.remove("pointer-events-none");
    cartBackdrop.classList.remove("opacity-0", "pointer-events-none");
    cartBackdrop.classList.add("opacity-100", "pointer-events-auto");
    cartPanel.classList.remove("translate-x-full");
    renderCart();
  }

  function closeCart() {
    cartDrawer.classList.add("pointer-events-none");
    cartBackdrop.classList.remove("opacity-100", "pointer-events-auto");
    cartBackdrop.classList.add("opacity-0", "pointer-events-none");
    cartPanel.classList.add("translate-x-full");
  }

  if (cartToggle) {
    cartToggle.addEventListener("click", openCart);
  }
  if (cartClose) {
    cartClose.addEventListener("click", closeCart);
  }
  if (cartBackdrop) {
    cartBackdrop.addEventListener("click", closeCart);
  }

  if (checkoutForm) {
    // Prevent default form behavior and trigger WhatsApp submit
    checkoutForm.onsubmit = (e) => {
      e.preventDefault();
      handleCheckout();
    };
  }
}

// Add Item to Cart
function addToCart(productId) {
  const product = perfumesCatalog.find(p => p.id === productId);
  if (!product) return;

  const defaultVar = (product.variations && product.variations.length > 0) ? product.variations[0] : "";
  const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : "";
  
  let cartProductName = product.name;
  if (defaultVar) cartProductName += ` - ${defaultVar}`;
  if (defaultSize) cartProductName += ` (${defaultSize})`;

  const existingItem = cart.find(item => item.id === productId && item.variation === defaultVar && item.size === defaultSize);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: cartProductName,
      variation: defaultVar,
      size: defaultSize,
      price: product.price,
      image: product.image,
      volume: product.volume,
      quantity: 1
    });
  }

  localStorage.setItem("lessence_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCart();

  // Show a temporary visual feedback on the button if possible
  const btn = document.getElementById(`btn-add-${productId}`);
  if (btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span>✓ Salvo!</span>`;
    btn.classList.remove("bg-[#FAF7F2]", "text-[#2F3E33]");
    btn.classList.add("bg-emerald-600", "text-white");
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.add("bg-[#FAF7F2]", "text-[#2F3E33]");
      btn.classList.remove("bg-emerald-600", "text-white");
    }, 1500);
  }

  // Open cart drawer for premium UX feedback
  const cartDrawer = document.getElementById("cart-drawer");
  const cartBackdrop = document.getElementById("cart-backdrop");
  const cartPanel = document.getElementById("cart-panel");
  if (cartDrawer && cartPanel) {
    cartDrawer.classList.remove("pointer-events-none");
    if (cartBackdrop) {
      cartBackdrop.classList.remove("opacity-0", "pointer-events-none");
      cartBackdrop.classList.add("opacity-100", "pointer-events-auto");
    }
    cartPanel.classList.remove("translate-x-full");
  }
}

// Update Cart Badge on Navbar
function updateCartBadge() {
  const badges = document.querySelectorAll("#cart-badge");
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  badges.forEach(badge => {
    badge.textContent = totalCount;
    if (totalCount > 0) {
      badge.classList.remove("scale-0");
      badge.classList.add("scale-100");
    } else {
      badge.classList.remove("scale-100");
      badge.classList.add("scale-0");
    }
  });

  const cartCountTitle = document.getElementById("cart-count-title");
  if (cartCountTitle) {
    cartCountTitle.textContent = `${totalCount} ${totalCount === 1 ? 'item' : 'itens'}`;
  }
}

// Modify Quantities
function changeQuantity(productId, variation, size, amount) {
  const item = cart.find(item => item.id === productId && item.variation === variation && item.size === size);
  if (!item) return;

  item.quantity += amount;
  if (item.quantity <= 0) {
    cart = cart.filter(i => !(i.id === productId && i.variation === variation && i.size === size));
  }
  
  localStorage.setItem("lessence_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

// Remove Individual Item from Cart
function removeFromCart(productId, variation, size) {
  cart = cart.filter(i => !(i.id === productId && i.variation === variation && i.size === size));
  localStorage.setItem("lessence_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

// Clear Entire Cart
function clearCart() {
  if (cart.length === 0) return;
  if (confirm("Deseja realmente esvaziar todo o seu carrinho?")) {
    cart = [];
    localStorage.removeItem("lessence_cart");
    updateCartBadge();
    renderCart();
  }
}

// Render Cart Items
function renderCart() {
  const container = document.getElementById("cart-items-container");
  const checkoutSection = document.getElementById("cart-checkout-section");
  const totalEl = document.getElementById("cart-total-price");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-sage-600 space-y-3">
        <svg class="w-12 h-12 mx-auto text-sage-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <p class="font-serif-elegant text-lg">Seu carrinho está vazio</p>
        <p class="text-xs font-light text-sage-500">Adicione alguns mimos especiais para começar.</p>
      </div>
    `;
    if (checkoutSection) checkoutSection.classList.add("hidden");
    return;
  }

  if (checkoutSection) checkoutSection.classList.remove("hidden");

  container.innerHTML = "";
  let totalSum = 0;

  cart.forEach(item => {
    // Parse price string like "R$ 299,90"
    const numericPrice = parseFloat(item.price.replace("R$", "").replace(".", "").replace(",", ".").trim());
    const subtotal = numericPrice * item.quantity;
    totalSum += subtotal;

    const itemRow = document.createElement("div");
    itemRow.className = "flex items-center space-x-4 p-3 bg-white rounded-2xl border border-sage-100 shadow-sm";
    
    itemRow.innerHTML = `
      ${item.image ? `
        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-contain rounded-xl bg-sage-50 border border-sage-100 p-1 flex-shrink-0">
      ` : `
        <div class="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center text-sage-500 flex-shrink-0 font-serif">L</div>
      `}
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-semibold text-sage-900 truncate">${item.name}</h4>
        <p class="text-[10px] text-sage-500">${item.volume || ''}</p>
        <div class="flex justify-between items-center mt-2">
          <span class="text-xs font-medium text-sage-800">${item.price}</span>
          <div class="flex items-center space-x-1.5">
            <div class="flex items-center space-x-2 bg-sage-50 border border-sage-200/60 rounded-lg px-1.5 py-0.5">
              <button onclick="changeQuantity('${item.id}', '${item.variation || ''}', '${item.size || ''}', -1)" class="text-sage-600 hover:text-sage-900 font-bold px-1 focus:outline-none text-xs">-</button>
              <span class="text-xs font-semibold text-sage-850 px-1 min-w-[12px] text-center">${item.quantity}</span>
              <button onclick="changeQuantity('${item.id}', '${item.variation || ''}', '${item.size || ''}', 1)" class="text-sage-600 hover:text-sage-900 font-bold px-1 focus:outline-none text-xs">+</button>
            </div>
            <button onclick="removeFromCart('${item.id}', '${item.variation || ''}', '${item.size || ''}')" class="text-rose-500 hover:text-rose-700 transition-colors p-1.5 focus:outline-none bg-rose-50 hover:bg-rose-100 rounded-lg" title="Excluir item">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(itemRow);
  });

  if (totalEl) {
    totalEl.textContent = `R$ ${totalSum.toFixed(2).replace(".", ",")}`;
  }
}

// Handle Checkout Submission (Sends data to WhatsApp)
function handleCheckout() {
  const nameInput = document.getElementById("client-name");
  const phoneInput = document.getElementById("client-phone");
  const notesInput = document.getElementById("client-notes");

  if (!nameInput || !phoneInput) return;

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const notes = notesInput ? notesInput.value.trim() : "";

  if (name === "" || phone === "") {
    alert("Por favor, preencha os campos obrigatórios (*)");
    return;
  }

  // Format cart items text
  let itemsText = "";
  let totalSum = 0;
  cart.forEach(item => {
    const numericPrice = parseFloat(item.price.replace("R$", "").replace(".", "").replace(",", ".").trim());
    const subtotal = numericPrice * item.quantity;
    totalSum += subtotal;
    itemsText += `- *${item.quantity}x* ${item.name} (${item.price}/un)\n`;
  });

  // Build message
  let message = `*Novo Pedido - L'Essence*\n`;
  message += `-------------------------\n`;
  message += `*Cliente:* ${name}\n`;
  message += `*Contato:* ${phone}\n`;
  if (notes !== "") {
    message += `*Obs:* ${notes}\n`;
  }
  message += `\n*Itens do Pedido:*\n${itemsText}\n`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  // Save order to localStorage
  const orderId = Date.now().toString();
  const newOrder = {
    id: orderId,
    customer: {
      name: name,
      phone: phone,
      notes: notes
    },
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      variation: item.variation || "",
      size: item.size || "",
      price: item.price,
      quantity: item.quantity
    })),
    status: "Pendente",
    total: `R$ ${totalSum.toFixed(2).replace(".", ",")}`,
    timestamp: new Date().toLocaleString("pt-BR")
  };

  const existingOrders = JSON.parse(localStorage.getItem("lessence_orders")) || [];
  existingOrders.unshift(newOrder);
  localStorage.setItem("lessence_orders", JSON.stringify(existingOrders));

  // Clear cart
  cart = [];
  localStorage.removeItem("lessence_cart");
  updateCartBadge();
  renderCart();

  // Reset form
  document.getElementById("checkout-form").reset();

  // Close drawer
  const cartDrawer = document.getElementById("cart-drawer");
  const cartBackdrop = document.getElementById("cart-backdrop");
  const cartPanel = document.getElementById("cart-panel");
  if (cartDrawer) {
    cartDrawer.classList.add("pointer-events-none");
    if (cartBackdrop) cartBackdrop.classList.add("opacity-0", "pointer-events-none");
    if (cartPanel) cartPanel.classList.add("translate-x-full");
  }

  // Open WhatsApp
  window.open(whatsappUrl, "_blank");
}



// --- Product Modal Logic ---
let selectedVariation = "";
let selectedSize = "";

function openProductModal(productId) {
  const product = perfumesCatalog.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("product-modal");
  const backdrop = document.getElementById("product-modal-backdrop");
  const panel = document.getElementById("product-modal-panel");

  if (!modal || !panel) return;

  // Show container
  modal.classList.remove("hidden");

  // Wait a tick for transition
  setTimeout(() => {
    modal.classList.remove("pointer-events-none");
    if (backdrop) {
      backdrop.classList.remove("opacity-0", "pointer-events-none");
      backdrop.classList.add("opacity-100", "pointer-events-auto");
    }
    panel.classList.remove("scale-95", "opacity-0");
  }, 10);

  // Set standard info
  document.getElementById("modal-product-image").src = product.image || "";
  document.getElementById("modal-product-image").alt = product.name;
  document.getElementById("modal-product-category").textContent = product.category;
  document.getElementById("modal-product-name").textContent = product.name;
  document.getElementById("modal-product-description").textContent = product.description;
  document.getElementById("modal-product-notes").textContent = product.notes;
  document.getElementById("modal-product-price").textContent = product.price;

  const hasStock = product.quantity > 0;
  const stockEl = document.getElementById("modal-product-stock");
  if (stockEl) {
    if (hasStock) {
      stockEl.textContent = `Em Estoque (${product.quantity} un)`;
      stockEl.className = "text-xs font-semibold text-emerald-600";
    } else {
      stockEl.textContent = "Esgotado";
      stockEl.className = "text-xs font-semibold text-rose-600";
    }
  }

  // Populate variations
  const varContainer = document.getElementById("modal-product-variations");
  varContainer.innerHTML = "";
  selectedVariation = "";

  if (product.variations && product.variations.length > 0) {
    product.variations.forEach((v, index) => {
      const btn = document.createElement("button");
      btn.className = "variation-btn border border-sage-300 hover:border-sage-700 text-sage-800 text-xs py-1.5 px-3 rounded-lg transition-smooth focus:outline-none";
      btn.textContent = v;
      
      // Auto-select first variation
      if (index === 0) {
        btn.classList.add("bg-[#2F3E33]", "text-white", "border-[#2F3E33]");
        selectedVariation = v;
      }

      btn.onclick = () => {
        // Remove active class from all variation buttons
        document.querySelectorAll(".variation-btn").forEach(b => {
          b.classList.remove("bg-[#2F3E33]", "text-white", "border-[#2F3E33]");
        });
        // Add to this button
        btn.classList.add("bg-[#2F3E33]", "text-white", "border-[#2F3E33]");
        selectedVariation = v;
      };
      
      varContainer.appendChild(btn);
    });
  } else {
    // If no variations
    const placeholder = document.createElement("span");
    placeholder.className = "text-xs text-sage-500 italic";
    placeholder.textContent = "Modelo único";
    varContainer.appendChild(placeholder);
  }

  // Populate sizes
  const sizeContainer = document.getElementById("modal-product-sizes");
  sizeContainer.innerHTML = "";
  selectedSize = "";

  if (product.sizes && product.sizes.length > 0) {
    product.sizes.forEach((s, index) => {
      const btn = document.createElement("button");
      btn.className = "size-btn border border-sage-300 hover:border-sage-700 text-sage-800 text-xs py-1.5 px-3 rounded-lg transition-smooth focus:outline-none";
      btn.textContent = s;
      
      // Auto-select first size
      if (index === 0) {
        btn.classList.add("bg-[#2F3E33]", "text-white", "border-[#2F3E33]");
        selectedSize = s;
      }

      btn.onclick = () => {
        // Remove active class from all size buttons
        document.querySelectorAll(".size-btn").forEach(b => {
          b.classList.remove("bg-[#2F3E33]", "text-white", "border-[#2F3E33]");
        });
        // Add to this button
        btn.classList.add("bg-[#2F3E33]", "text-white", "border-[#2F3E33]");
        selectedSize = s;
      };
      
      sizeContainer.appendChild(btn);
    });
  } else {
    // If no sizes
    const placeholder = document.createElement("span");
    placeholder.className = "text-xs text-sage-500 italic";
    placeholder.textContent = "Tamanho padrão";
    sizeContainer.appendChild(placeholder);
  }

  // Set action button for modal
  const addBtn = document.getElementById("modal-add-to-cart-btn");
  if (addBtn) {
    addBtn.disabled = !hasStock;
    if (hasStock) {
      addBtn.className = "w-full bg-[#2F3E33] hover:bg-sage-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center space-x-2 text-xs tracking-wider uppercase";
      addBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <span>Adicionar ao Carrinho</span>
      `;
      addBtn.onclick = () => {
        // Add to cart with variation info appended to name if any selected
        let cartProductName = product.name;
        if (selectedVariation) cartProductName += ` - ${selectedVariation}`;
        if (selectedSize) cartProductName += ` (${selectedSize})`;
        
        // Add custom cart adder logic
        const existingItem = cart.find(item => item.id === product.id && item.variation === selectedVariation && item.size === selectedSize);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            id: product.id,
            name: cartProductName,
            variation: selectedVariation,
            size: selectedSize,
            price: product.price,
            image: product.image,
            volume: product.volume,
            quantity: 1
          });
        }

        localStorage.setItem("lessence_cart", JSON.stringify(cart));
        updateCartBadge();
        renderCart();
        closeProductModal();

        // Open cart drawer
        const cartDrawer = document.getElementById("cart-drawer");
        const cartBackdrop = document.getElementById("cart-backdrop");
        const cartPanel = document.getElementById("cart-panel");
        if (cartDrawer && cartPanel) {
          cartDrawer.classList.remove("pointer-events-none");
          if (cartBackdrop) {
            cartBackdrop.classList.remove("opacity-0", "pointer-events-none");
            cartBackdrop.classList.add("opacity-100", "pointer-events-auto");
          }
          cartPanel.classList.remove("translate-x-full");
        }
      };
    } else {
      addBtn.className = "w-full bg-rose-950/40 text-rose-300 border border-rose-500/20 font-medium py-3 px-4 rounded-xl cursor-not-allowed flex items-center justify-center space-x-2 text-xs tracking-wider uppercase";
      addBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
        </svg>
        <span>Produto Esgotado</span>
      `;
      addBtn.onclick = null;
    }
  }

  // Open Animations
  modal.classList.remove("pointer-events-none");
  backdrop.classList.remove("opacity-0", "pointer-events-none");
  backdrop.classList.add("opacity-100", "pointer-events-auto");
  panel.classList.remove("scale-95", "opacity-0");
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  const backdrop = document.getElementById("product-modal-backdrop");
  const panel = document.getElementById("product-modal-panel");

  if (!modal || !panel) return;

  modal.classList.add("pointer-events-none");
  if (backdrop) {
    backdrop.classList.remove("opacity-100", "pointer-events-auto");
    backdrop.classList.add("opacity-0", "pointer-events-none");
  }
  panel.classList.add("scale-95", "opacity-0");

  // Hide container after transition ends
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

// Bind modal closing elements
function setupProductModal() {
  const closeBtn = document.getElementById("product-modal-close");
  const backdrop = document.getElementById("product-modal-backdrop");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeProductModal);
  }
  if (backdrop) {
    backdrop.addEventListener("click", closeProductModal);
  }
}


// --- ADMIN PORTAL LOGIC ---
let editingProductId = null;
let activeAdminCategory = "all";

// Filter products table by category
window.filterAdminCategory = function(category) {
  activeAdminCategory = category;
  
  // Highlight active button
  const buttons = document.querySelectorAll(".admin-filter-btn");
  buttons.forEach(btn => {
    btn.classList.remove("bg-sage-800", "text-white");
    btn.classList.add("bg-white", "hover:bg-sage-50", "text-sage-800", "border", "border-sage-200");
  });
  
  const activeBtn = document.getElementById(`filter-admin-${category}`);
  if (activeBtn) {
    activeBtn.classList.add("bg-sage-800", "text-white");
    activeBtn.classList.remove("bg-white", "hover:bg-sage-50", "text-sage-800", "border", "border-sage-200");
  }
  
  renderAdminProducts();
};

// Render Admin Products Table
window.renderAdminProducts = function() {
  const tableBody = document.getElementById("admin-products-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const filteredProducts = activeAdminCategory === "all" 
    ? perfumesCatalog 
    : perfumesCatalog.filter(p => p.category.toLowerCase() === activeAdminCategory.toLowerCase());

  filteredProducts.forEach(p => {
    const tr = document.createElement("tr");
    tr.className = "border-b border-sage-100 hover:bg-sage-50/50 transition-colors";
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-sage-950 font-medium">
        <div class="flex items-center space-x-3">
          ${p.image ? `<img src="${p.image}" class="w-8 h-8 rounded-lg object-contain bg-white border border-sage-200 p-0.5">` : `<div class="w-8 h-8 rounded-lg bg-sage-200"></div>`}
          <span class="truncate max-w-[150px]">${p.name}</span>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-sage-600">${p.category}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-sage-600">${p.brand || '-'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-sage-600">${p.line || '-'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-sage-800 font-semibold">${p.price}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.quantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
          ${p.quantity > 0 ? `${p.quantity} un` : 'Esgotado'}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <button onclick="openProductFormModal('${p.id}')" class="text-sage-600 hover:text-sage-900 transition-colors">Editar</button>
        <button onclick="deleteProduct('${p.id}')" class="text-rose-500 hover:text-rose-700 transition-colors">Deletar</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
};

// Render Admin Orders
window.renderAdminOrders = function() {
  const tableBody = document.getElementById("admin-orders-table-body");
  if (!tableBody) return;

  const orders = JSON.parse(localStorage.getItem("lessence_orders")) || [];
  tableBody.innerHTML = "";

  if (orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-sm text-sage-500 italic">
          Nenhum pedido registrado no sistema.
        </td>
      </tr>
    `;
    return;
  }

  orders.forEach(o => {
    const itemsList = o.items.map(i => `${i.quantity}x ${i.name}`).join("<br>");
    
    // Status color
    let statusClass = "bg-yellow-100 text-yellow-800";
    if (o.status === "Aprovado") statusClass = "bg-emerald-100 text-emerald-800";
    if (o.status === "Cancelado") statusClass = "bg-rose-100 text-rose-800";

    const tr = document.createElement("tr");
    tr.className = "border-b border-sage-100 hover:bg-sage-50/50 transition-colors";
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-xs text-sage-600">${o.timestamp}</td>
      <td class="px-6 py-4 text-sm text-sage-950 font-medium">
        <div>${o.customer.name}</div>
        <div class="text-xs text-sage-500 font-normal">${o.customer.phone}</div>
        ${o.customer.notes ? `<div class="text-[10px] text-amber-600 font-light mt-1">Obs: ${o.customer.notes}</div>` : ''}
      </td>
      <td class="px-6 py-4 text-xs text-sage-700 leading-relaxed">${itemsList}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-sage-900 font-bold">${o.total}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass}">
          ${o.status}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        ${o.status === "Pendente" ? `
          <button onclick="approveOrder('${o.id}')" class="text-emerald-600 hover:text-emerald-800 transition-colors font-semibold">Validar/Aprovar</button>
          <button onclick="cancelOrder('${o.id}')" class="text-rose-500 hover:text-rose-700 transition-colors">Cancelar</button>
        ` : ''}
        <button onclick="deleteOrder('${o.id}')" class="text-sage-400 hover:text-sage-700 transition-colors">Excluir</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
};

// Open Form Modal
window.openProductFormModal = function(productId = null) {
  const modal = document.getElementById("product-form-modal");
  const modalTitle = document.getElementById("form-modal-title");
  const form = document.getElementById("product-form");

  if (!modal || !form) return;

  editingProductId = productId;
  modal.classList.remove("hidden");

  if (productId) {
    if (modalTitle) modalTitle.textContent = "Editar Produto";
    const p = perfumesCatalog.find(item => item.id === productId);
    if (p) {
      document.getElementById("prod-name").value = p.name || "";
      document.getElementById("prod-category").value = p.category || "Produtos";
      document.getElementById("prod-type").value = p.type || "Perfumes";
      document.getElementById("prod-brand").value = p.brand || "";
      document.getElementById("prod-line").value = p.line || "";
      document.getElementById("prod-price").value = p.price || "";
      document.getElementById("prod-volume").value = p.volume || "";
      document.getElementById("prod-quantity").value = p.quantity ?? 10;
      document.getElementById("prod-image").value = p.image || "";
      document.getElementById("prod-intensity").value = p.intensity || "";
      document.getElementById("prod-notes").value = p.notes || "";
      document.getElementById("prod-description").value = p.description || "";
      document.getElementById("prod-variations").value = p.variations ? p.variations.join(", ") : "";
      document.getElementById("prod-sizes").value = p.sizes ? p.sizes.join(", ") : "";
    }
  } else {
    if (modalTitle) modalTitle.textContent = "Novo Produto";
    form.reset();
  }
};

// Close Form Modal
window.closeProductFormModal = function() {
  const modal = document.getElementById("product-form-modal");
  if (modal) modal.classList.add("hidden");
  editingProductId = null;
};

// Handle Form Submit
window.handleProductFormSubmit = function(e) {
  if (e) e.preventDefault();

  const name = document.getElementById("prod-name").value.trim();
  const category = document.getElementById("prod-category").value;
  const type = document.getElementById("prod-type").value;
  const brand = document.getElementById("prod-brand").value.trim();
  const line = document.getElementById("prod-line").value.trim();
  const price = document.getElementById("prod-price").value.trim();
  const volume = document.getElementById("prod-volume").value.trim();
  const quantity = parseInt(document.getElementById("prod-quantity").value || "0");
  const image = document.getElementById("prod-image").value.trim();
  const intensity = document.getElementById("prod-intensity").value.trim();
  const notes = document.getElementById("prod-notes").value.trim();
  const description = document.getElementById("prod-description").value.trim();
  
  const varsInput = document.getElementById("prod-variations").value.trim();
  const variations = varsInput ? varsInput.split(",").map(v => v.trim()).filter(Boolean) : [];

  const sizesInput = document.getElementById("prod-sizes").value.trim();
  const sizes = sizesInput ? sizesInput.split(",").map(s => s.trim()).filter(Boolean) : [];

  if (!name || !price) {
    alert("Nome e Preço são obrigatórios.");
    return;
  }

  if (editingProductId) {
    const idx = perfumesCatalog.findIndex(p => p.id === editingProductId);
    if (idx !== -1) {
      perfumesCatalog[idx] = {
        ...perfumesCatalog[idx],
        name, category, type, brand, line, price, volume, quantity, image, intensity, notes, description, variations, sizes
      };
    }
  } else {
    const newId = "prod-" + Date.now();
    perfumesCatalog.push({
      id: newId,
      name, category, type, brand, line, price, volume, quantity, image, intensity, notes, description, variations, sizes,
      tags: [category.toLowerCase()]
    });
  }

  saveAdminCatalog();
  closeProductFormModal();
};

// Save Admin Catalog Changes
function saveAdminCatalog() {
  localStorage.setItem("lessence_catalog_override", JSON.stringify(perfumesCatalog));
  renderAdminProducts();
}

// Delete Product
window.deleteProduct = function(productId) {
  if (confirm("Tem certeza que deseja excluir este produto do catálogo?")) {
    perfumesCatalog = perfumesCatalog.filter(p => p.id !== productId);
    saveAdminCatalog();
  }
};

// Export Catalog JSON
window.exportCatalogJSON = function() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(perfumesCatalog, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "perfumes_data.json");
  dlAnchorElem.click();
};

// Reset Catalog to Default
window.resetCatalogDefault = function() {
  if (confirm("Tem certeza que deseja redefinir o catálogo? Todas as suas edições locais serão apagadas.")) {
    localStorage.removeItem("lessence_catalog_override");
    window.location.reload();
  }
};

// Approve Order (Validates order and subtracts stock)
window.approveOrder = function(orderId) {
  const orders = JSON.parse(localStorage.getItem("lessence_orders")) || [];
  const orderIdx = orders.findIndex(o => o.id === orderId);
  if (orderIdx === -1) return;

  const order = orders[orderIdx];
  if (order.status !== "Pendente") return;

  if (confirm("Aprovar este pedido? Isso irá abater a quantidade comprada do estoque dos produtos correspondentes.")) {
    order.items.forEach(orderItem => {
      const product = perfumesCatalog.find(p => p.id === orderItem.id);
      if (product) {
        if (typeof product.quantity === "number") {
          product.quantity = Math.max(0, product.quantity - orderItem.quantity);
        }
      }
    });

    order.status = "Aprovado";
    orders[orderIdx] = order;

    localStorage.setItem("lessence_orders", JSON.stringify(orders));
    saveAdminCatalog();
    renderAdminOrders();
    alert("Pedido aprovado com sucesso! Estoque atualizado.");
  }
};

// Cancel Order
window.cancelOrder = function(orderId) {
  const orders = JSON.parse(localStorage.getItem("lessence_orders")) || [];
  const orderIdx = orders.findIndex(o => o.id === orderId);
  if (orderIdx === -1) return;

  if (confirm("Deseja realmente cancelar este pedido?")) {
    orders[orderIdx].status = "Cancelado";
    localStorage.setItem("lessence_orders", JSON.stringify(orders));
    renderAdminOrders();
  }
};

// Delete Order Log
window.deleteOrder = function(orderId) {
  if (confirm("Tem certeza que deseja excluir o registro deste pedido do histórico?")) {
    let orders = JSON.parse(localStorage.getItem("lessence_orders")) || [];
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem("lessence_orders", JSON.stringify(orders));
    renderAdminOrders();
  }
};

// Init Admin Dashboard
function initAdminDashboard() {
  renderAdminProducts();
  renderAdminOrders();

  const tabCatalogBtn = document.getElementById("tab-catalog-btn");
  const tabOrdersBtn = document.getElementById("tab-orders-btn");
  const tabCatalogContent = document.getElementById("tab-catalog-content");
  const tabOrdersContent = document.getElementById("tab-orders-content");

  if (tabCatalogBtn && tabOrdersBtn) {
    tabCatalogBtn.onclick = () => {
      tabCatalogBtn.classList.add("border-sage-600", "text-sage-900");
      tabCatalogBtn.classList.remove("border-transparent", "text-sage-500");
      tabOrdersBtn.classList.remove("border-sage-600", "text-sage-900");
      tabOrdersBtn.classList.add("border-transparent", "text-sage-500");
      tabCatalogContent.classList.remove("hidden");
      tabOrdersContent.classList.add("hidden");
    };

    tabOrdersBtn.onclick = () => {
      tabOrdersBtn.classList.add("border-sage-600", "text-sage-900");
      tabOrdersBtn.classList.remove("border-transparent", "text-sage-500");
      tabCatalogBtn.classList.remove("border-sage-600", "text-sage-900");
      tabCatalogBtn.classList.add("border-transparent", "text-sage-500");
      tabOrdersContent.classList.remove("hidden");
      tabCatalogContent.classList.add("hidden");
    };
  }

  // Bind Form Submit
  const form = document.getElementById("product-form");
  if (form) {
    form.onsubmit = handleProductFormSubmit;
  }
}

// Carousel Navigation Helper
window.scrollCarousel = function(containerId, direction) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const cardWidth = container.querySelector(".snap-align-start")?.clientWidth || 320;
  container.scrollBy({
    left: cardWidth * direction,
    behavior: "smooth"
  });
};

// app.js

// 1. Simulated Headless CMS Product Data
const MOCK_CMS_PERFUMES = [
  {
    id: "aurora",
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
    id: "santal-dune",
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
    id: "jardin-citrique",
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
    id: "velvet-ambre",
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
    id: "neroli-serene",
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
    id: "rose-oud",
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

// WhatsApp number configuration
const WHATSAPP_NUMBER = "5511999999999"; // Replace with real number

// 2. Initialize AOS (Animate on Scroll)
document.addEventListener("DOMContentLoaded", () => {
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

  // Detect which page we are on
  const isCollectionsPage = window.location.pathname.includes("colecoes.html");

  if (isCollectionsPage) {
    renderCatalog(MOCK_CMS_PERFUMES);
    setupFilterButtons(false);
    setupSearch();
  } else {
    // Show only first 3 featured perfumes on homepage
    renderCatalog(MOCK_CMS_PERFUMES, 3);
    setupFilterButtons(true);
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
  if (!card) return;

  const numEl = document.getElementById("hero-perfume-number");
  const bottleTextEl = document.getElementById("hero-bottle-text");
  const volumeEl = document.getElementById("hero-bottle-volume");
  const titleEl = document.getElementById("hero-perfume-title");
  const subtitleEl = document.getElementById("hero-perfume-subtitle");

  let currentIndex = 0;

  // Rich premium gradients matching catalog scent vibes
  const gradients = [
    "from-sage-200 to-terracotta-200", // Lily
    "from-terracotta-200 to-sage-300", // Malbec
    "from-sage-100 to-sage-300",       // Kaiak
    "from-terracotta-100 to-terracotta-300", // Essencial
    "from-cream-200 to-terracotta-200", // Patricia
    "from-sage-200 to-sage-900/20"      // Portiolli
  ];

  setInterval(() => {
    // Add fade and shrink transform
    card.classList.add("opacity-0", "scale-95");

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % MOCK_CMS_PERFUMES.length;
      const perfume = MOCK_CMS_PERFUMES[currentIndex];

      // Update text details
      numEl.textContent = `N° 0${currentIndex + 1}`;
      
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
      const newGrad = gradients[currentIndex];
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
        <p class="font-serif-elegant text-xl">Nenhum perfume encontrado com estas características.</p>
      </div>
    `;
    return;
  }

  itemsToRender.forEach((perfume, idx) => {
    // Generate beautiful scaled-down catalog cards with green grid pattern as requested
    const card = document.createElement("div");
    card.className = "catalog-item-bg rounded-2xl p-5 md:p-6 flex flex-col justify-between text-white border border-white/5";
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", `${idx * 100}`);

    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-4">
          <span class="text-[10px] uppercase tracking-widest text-[#D1E2D3] bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm font-semibold">
            ${perfume.category}
          </span>
          <span class="text-xs font-light text-white/80">${perfume.volume}</span>
        </div>
        
        <h3 class="text-xl font-serif-elegant mb-2 text-white tracking-wide">${perfume.name}</h3>
        <p class="text-[13px] text-[#D1E2D3]/90 font-light mb-4 leading-relaxed">${perfume.description}</p>
        
        <div class="space-y-1 mb-5">
          <p class="text-[10px] text-[#D1E2D3] uppercase tracking-wider">Notas Olfativas:</p>
          <p class="text-xs text-white/95 font-medium italic">${perfume.notes}</p>
        </div>
      </div>
      
      <div>
        <div class="border-t border-white/10 pt-3 mb-3 flex justify-between items-baseline">
          <span class="text-[11px] text-[#D1E2D3]/70">Intensidade: ${perfume.intensity}</span>
          <span class="text-lg font-semibold text-white">${perfume.price}</span>
        </div>
        
        <button onclick="contactWhatsApp('${perfume.name}')" class="w-full bg-[#FAF7F2] text-[#2F3E33] hover:bg-[#D1E2D3] hover:text-[#2F3E33] text-sm font-medium py-2.5 px-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group">
          <span>Conversar no WhatsApp</span>
          <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// State variable to track currently selected category filter
let activeCategory = "all";

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
      let filtered = MOCK_CMS_PERFUMES;
      if (activeCategory !== "all") {
        filtered = MOCK_CMS_PERFUMES.filter(p => p.category.toLowerCase().includes(activeCategory) || p.tags.includes(activeCategory));
      }

      // If on collections page, also apply search filter
      if (!isHomepage) {
        const searchInput = document.getElementById("search-input");
        if (searchInput && searchInput.value.trim() !== "") {
          const query = searchInput.value.toLowerCase().trim();
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.notes.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
          );
        }
      }

      renderCatalog(filtered, isHomepage ? 3 : null);
    });
  });
}

// Setup live search for collections page
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    
    let filtered = MOCK_CMS_PERFUMES;
    if (activeCategory !== "all") {
      filtered = MOCK_CMS_PERFUMES.filter(p => p.category.toLowerCase().includes(activeCategory) || p.tags.includes(activeCategory));
    }

    if (query !== "") {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.notes.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    renderCatalog(filtered);
  });
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
  if (!quizAnswers.moment || !quizAnswers.style) return;

  const resultContainer = document.getElementById("quiz-result");
  if (!resultContainer) return;

  // Simple recommendation algorithm
  let recommendation = MOCK_CMS_PERFUMES[0]; // fallback

  if (quizAnswers.moment === "dia") {
    if (quizAnswers.style === "casual") {
      recommendation = MOCK_CMS_PERFUMES.find(p => p.id === "jardin-citrique") || recommendation;
    } else {
      recommendation = MOCK_CMS_PERFUMES.find(p => p.id === "aurora") || recommendation;
    }
  } else {
    // noite
    if (quizAnswers.style === "elegante") {
      recommendation = MOCK_CMS_PERFUMES.find(p => p.id === "rose-oud") || recommendation;
    } else {
      recommendation = MOCK_CMS_PERFUMES.find(p => p.id === "santal-dune") || recommendation;
    }
  }

  resultContainer.innerHTML = `
    <div class="p-6 bg-[#FAF7F2] rounded-2xl border border-[#4A5E4E]/20 text-center animate-fade-in">
      <p class="text-xs uppercase tracking-widest text-[#4A5E4E]/80 mb-2">Sua Recomendação Ideal</p>
      <h4 class="text-2xl font-serif-elegant text-[#2C382E] mb-2">${recommendation.name}</h4>
      <p class="text-sm text-gray-600 mb-4 max-w-md mx-auto">${recommendation.description}</p>
      <div class="text-xs text-gray-500 mb-6 italic">Notas: ${recommendation.notes}</div>
      <button onclick="contactWhatsApp('${recommendation.name}', true)" class="inline-flex items-center space-x-2 bg-[#4A5E4E] hover:bg-[#3D4D40] text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-md">
        <span>Experimentar via WhatsApp</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
        </svg>
      </button>
    </div>
  `;
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 6. Redirect to WhatsApp with pre-filled personalized message
function contactWhatsApp(perfumeName, isRecommendation = false) {
  let message = "";
  if (isRecommendation) {
    message = `Olá! Fiz o teste no site e gostaria de saber mais sobre o perfume recomendado: *${perfumeName}*. Como posso adquirir?`;
  } else {
    message = `Olá! Fiquei muito interessado(a) no perfume *${perfumeName}* que vi no catálogo. Poderia me passar mais informações?`;
  }

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(whatsappUrl, "_blank");
}

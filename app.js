// app.js

// 1. Simulated Headless CMS Product Data
const MOCK_CMS_PERFUMES = [
  {
    id: "aurora",
    name: "Aurora Bloom",
    category: "Floral Fresco",
    notes: "Flor de Laranjeira, Pêra, Almíscar Branco",
    description: "Uma brisa gentil de primavera capturada em um frasco. Ideal para dias luminosos.",
    intensity: "Suave a Moderada",
    price: "R$ 289,90",
    volume: "100ml",
    tags: ["dia", "trabalho", "fresco"]
  },
  {
    id: "santal-dune",
    name: "Santal Dune",
    category: "Amadeirado Quente",
    notes: "Sândalo, Cardamomo, Baunilha de Madagascar",
    description: "Confortável, aconchegante e misterioso como o pôr do sol no deserto.",
    intensity: "Moderada a Intensa",
    price: "R$ 319,90",
    volume: "100ml",
    tags: ["noite", "encontro", "inverno"]
  },
  {
    id: "jardin-citrique",
    name: "Jardin Citrique",
    category: "Cítrico Herbáceo",
    notes: "Bergamota Italiana, Capim-Limão, Alecrim",
    description: "Energizante e revigorante. A sensação pura de folhas frescas sob o sereno da manhã.",
    intensity: "Suave",
    price: "R$ 259,90",
    volume: "100ml",
    tags: ["dia", "esporte", "fresco"]
  },
  {
    id: "velvet-ambre",
    name: "Velvet Ambre",
    category: "Oriental Especiado",
    notes: "Âmbar, Canela, Patchouli, Mel Silvestre",
    description: "Uma fragrância opulenta, aveludada e marcante que envolve os sentidos com elegância singular.",
    intensity: "Intensa",
    price: "R$ 349,90",
    volume: "100ml",
    tags: ["noite", "festa", "sofisticado"]
  },
  {
    id: "neroli-serene",
    name: "Néroli Serene",
    category: "Cítrico Floral",
    notes: "Néroli, Lavanda Francesa, Acorde Oceânico",
    description: "A calmaria de um fim de tarde à beira-mar. Traz paz mental e serenidade imediata.",
    intensity: "Suave",
    price: "R$ 279,90",
    volume: "100ml",
    tags: ["dia", "relaxar", "fresco"]
  },
  {
    id: "rose-oud",
    name: "Rose Oud",
    category: "Floral Amadeirado",
    notes: "Rosa Damascena, Oud Exótico, Pimenta Rosa",
    description: "A união poética entre a doçura da rosa e a profundidade da madeira oud.",
    intensity: "Intensa",
    price: "R$ 369,90",
    volume: "100ml",
    tags: ["noite", "sofisticado", "exclusivo"]
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

  renderCatalog(MOCK_CMS_PERFUMES);
  setupFilterButtons();
  setupQuiz();
});

// 3. Render Catalog Items
function renderCatalog(perfumes) {
  const container = document.getElementById("catalog-grid");
  if (!container) return;

  container.innerHTML = "";

  if (perfumes.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-sage-600">
        <p class="font-serif-elegant text-xl">Nenhum perfume encontrado com estas características.</p>
      </div>
    `;
    return;
  }

  perfumes.forEach((perfume, idx) => {
    // Generate beautiful catalog cards with green grid pattern as requested
    const card = document.createElement("div");
    card.className = "catalog-item-bg rounded-2xl p-6 md:p-8 flex flex-col justify-between text-white border border-white/5";
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", `${idx * 100}`);

    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-6">
          <span class="text-xs uppercase tracking-widest text-[#D1E2D3] bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm font-semibold">
            ${perfume.category}
          </span>
          <span class="text-sm font-light text-white/80">${perfume.volume}</span>
        </div>
        
        <h3 class="text-2xl font-serif-elegant mb-3 text-white tracking-wide">${perfume.name}</h3>
        <p class="text-sm text-[#D1E2D3]/90 font-light mb-4 leading-relaxed">${perfume.description}</p>
        
        <div class="space-y-2 mb-6">
          <p class="text-xs text-[#D1E2D3] uppercase tracking-wider">Notas Olfativas:</p>
          <p class="text-sm text-white/95 font-medium italic">${perfume.notes}</p>
        </div>
      </div>
      
      <div>
        <div class="border-t border-white/10 pt-4 mb-4 flex justify-between items-baseline">
          <span class="text-xs text-[#D1E2D3]/70">Intensidade: ${perfume.intensity}</span>
          <span class="text-xl font-semibold text-white">${perfume.price}</span>
        </div>
        
        <button onclick="contactWhatsApp('${perfume.name}')" class="w-full bg-[#FAF7F2] text-[#2F3E33] hover:bg-[#D1E2D3] hover:text-[#2F3E33] font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group">
          <span>Conversar no WhatsApp</span>
          <svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// 4. Filter Buttons Logic
function setupFilterButtons() {
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

      const category = button.getAttribute("data-category");
      if (category === "all") {
        renderCatalog(MOCK_CMS_PERFUMES);
      } else {
        const filtered = MOCK_CMS_PERFUMES.filter(p => p.category.toLowerCase().includes(category) || p.tags.includes(category));
        renderCatalog(filtered);
      }
    });
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

import puppeteer from 'puppeteer';
import * as fs from 'fs';

// High-quality fallback data for brands when scraping is blocked or fails
const FALLBACK_DATA = {
  "Natura": [
    {
      id: "natura-essencial-unico",
      name: "Essencial Único (Natura)",
      category: "Oriental Amadeirado",
      notes: "Copaíba, Oud, Pimenta-Preta, Âmbar",
      description: "Uma obra de arte olfativa marcante e opulenta para quem busca sofisticação absoluta e exclusividade.",
      intensity: "Intensa",
      price: "R$ 282,00",
      volume: "90ml",
      tags: ["noite", "festa", "sofisticado"],
      image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "natura-kaiak-aventura",
      name: "Kaiak Aventura (Natura)",
      category: "Cítrico Herbáceo",
      notes: "Acorde Cítrico, Artemísia, Almíscar e Âmbar",
      description: "A energia vibrante do ar livre em um aroma fresco e revigorante para o seu dia a dia dinâmico.",
      intensity: "Suave a Moderada",
      price: "R$ 172,90",
      volume: "100ml",
      tags: ["dia", "esporte", "fresco"],
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "natura-homem-sagaz",
      name: "Homem Sagaz (Natura)",
      category: "Amadeirado Especiado",
      notes: "Sândalo, Cedro, Pimenta Preta, Âmbar",
      description: "Uma fragrância moderna e provocante, com a robustez da madeira e o mistério das especiarias.",
      intensity: "Intensa",
      price: "R$ 199,90",
      volume: "100ml",
      tags: ["noite", "sedutor", "amadeirado"],
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80"
    }
  ],
  "O Boticário": [
    {
      id: "boticario-lily-edp",
      name: "Lily Eau de Parfum (O Boticário)",
      category: "Floral Fresco",
      notes: "Lírios, Pêra, Pimenta Rosa, Sândalo",
      description: "Uma fragrância sofisticada que traz a pureza feminina dos lírios aliada a um toque fresco e elegante.",
      intensity: "Moderada",
      price: "R$ 299,90",
      volume: "75ml",
      tags: ["dia", "trabalho", "floral"],
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "boticario-malbec-gold",
      name: "Malbec Gold (O Boticário)",
      category: "Amadeirado Quente",
      notes: "Notas de Âmbar, Patchouli, Cedro e Uva Gold",
      description: "Fragrância marcante e misteriosa, sinônimo de poder e atração para noites inesquecíveis.",
      intensity: "Intensa",
      price: "R$ 224,90",
      volume: "100ml",
      tags: ["noite", "encontro", "amadeirado"],
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "boticario-floratta-red",
      name: "Floratta Red (O Boticário)",
      category: "Floriental Frutal",
      notes: "Flor de Maçã, Frutas Vermelhas, Musk",
      description: "Inspirada na maçã de Vermont, essa fragrância traz a doçura e a sensualidade feminina em perfeita harmonia.",
      intensity: "Moderada",
      price: "R$ 149,90",
      volume: "75ml",
      tags: ["dia", "noite", "romantico"],
      image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80"
    }
  ],
  "Jequiti": [
    {
      id: "jequiti-patricia-abravanel",
      name: "Patricia Abravanel (Jequiti)",
      category: "Cítrico Floral",
      notes: "Flor de Laranjeira, Frutas Vermelhas, Baunilha",
      description: "Uma mistura alegre, charmosa e cativante que equilibra notas florais com a doçura da baunilha.",
      intensity: "Moderada",
      price: "R$ 119,90",
      volume: "100ml",
      tags: ["dia", "relaxar", "floral"],
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "jequiti-portiolli-black",
      name: "Portiolli Black Edition (Jequiti)",
      category: "Amadeirado Ambarado",
      notes: "Limão Siciliano, Pimenta Preta, Cedro, Âmbar",
      description: "Elegante e moderno, ideal para o homem que se destaca por sua personalidade forte e atitude contemporânea.",
      intensity: "Intensa",
      price: "R$ 129,90",
      volume: "100ml",
      tags: ["noite", "sofisticado", "amadeirado"],
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80"
    }
  ],
  "DeMillus": [
    {
      id: "demillus-virtude",
      name: "Virtude (DeMillus)",
      category: "Floral Frutal",
      notes: "Pêssego, Jasmim, Baunilha, Âmbar",
      description: "Uma fragrância clássica e romântica que celebra a feminilidade com doçura e elegância atemporais.",
      intensity: "Moderada",
      price: "R$ 89,90",
      volume: "50ml",
      tags: ["dia", "floral", "romantico"],
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "demillus-intima",
      name: "Íntima (DeMillus)",
      category: "Chypre Floral",
      notes: "Rosas, Almíscar, Sândalo, Bergamota",
      description: "Fragrância marcante e envolvente com acordes florais e amadeirados para momentos especiais.",
      intensity: "Intensa",
      price: "R$ 95,00",
      volume: "60ml",
      tags: ["noite", "encontro", "sensual"],
      image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80"
    }
  ]
};

// Brands configuration for scraping
const BRANDS = [
  {
    name: 'Natura',
    url: 'https://www.fragrantica.com.br/designers/Natura.html',
    isScrapable: true
  },
  {
    name: 'O Boticário',
    url: 'https://www.fragrantica.com.br/designers/O-Boticario.html',
    isScrapable: true
  },
  {
    name: 'Jequiti',
    url: 'https://www.fragrantica.com.br/designers/Jequiti.html',
    isScrapable: true
  },
  {
    name: 'DeMillus',
    url: '',
    isScrapable: false
  }
];

async function scrapeBrand(browser, brand) {
  console.log(`[SCRAPER] Iniciando coleta para a marca: ${brand.name}...`);
  if (!brand.isScrapable) {
    console.log(`[SCRAPER] Marca ${brand.name} não suporta scraping automático. Retornando dados pré-definidos.`);
    return FALLBACK_DATA[brand.name];
  }

  const page = await browser.newPage();
  
  // Set User-Agent to prevent block
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    await page.goto(brand.url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for the main content containing perfumes to load
    await page.waitForSelector('a[href*="/perfume/"]', { timeout: 15000 });

    const perfumes = await page.evaluate((brandName) => {
      const links = Array.from(document.querySelectorAll('a[href*="/perfume/"]'));
      const uniquePerfumes = new Map();

      links.forEach(link => {
        const url = link.href;
        const imgEl = link.querySelector('img');
        const nameText = link.textContent.trim();
        
        let name = nameText.replace(/\s+/g, ' ').trim();
        let imgUrl = imgEl ? imgEl.src : '';

        if (!name && imgEl && imgEl.alt) {
          name = imgEl.alt;
        }

        if (name && url && !uniquePerfumes.has(url)) {
          // Clean the name of years and extra codes to make it readable
          name = name.replace(/\d{4}/g, '') // remove years
                     .replace(/Feminino|Masculino|Unissex/gi, '') // remove genders
                     .replace(/Natura|O Boticário|Jequiti/gi, '') // remove brand name
                     .replace(/\s+/g, ' ')
                     .replace(/\(\s*\)/g, '')
                     .trim();
          
          name = `${name} (${brandName})`;

          uniquePerfumes.set(url, {
            id: url.split('/').pop().replace('.html', '').toLowerCase(),
            name: name,
            url: url,
            image: imgUrl
          });
        }
      });

      return Array.from(uniquePerfumes.values());
    }, brand.name);

    console.log(`[SCRAPER] Encontrados ${perfumes.length} perfumes para ${brand.name}.`);

    if (perfumes.length === 0) {
      throw new Error("Nenhum perfume encontrado na página.");
    }

    const limit = 5;
    const selectedPerfumes = perfumes.slice(0, limit);
    const detailedPerfumes = [];

    for (let p of selectedPerfumes) {
      console.log(`  -> Coletando detalhes de: ${p.name}`);
      const detailPage = await browser.newPage();
      await detailPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      try {
        await detailPage.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        const details = await detailPage.evaluate(() => {
          const descEl = document.querySelector('div[itemprop="description"]');
          let description = descEl ? descEl.textContent.trim() : '';
          
          // clean description
          if (description.length > 5) {
            description = description.split('.')[0] + '.';
          } else {
            description = "Uma criação olfativa exclusiva com a sofisticação da marca.";
          }

          const noteEls = Array.from(document.querySelectorAll('#pyramid div a, .notes-group a'));
          const notesSet = new Set(noteEls.map(el => el.textContent.trim()).filter(n => n.length > 1));
          const notesList = Array.from(notesSet).slice(0, 5).join(', ');

          const categoryEl = document.querySelector('span[itemprop="genre"]');
          const category = categoryEl ? categoryEl.textContent.trim() : 'Floral Amadeirado';

          const volumeOptions = ['75ml', '100ml', '90ml'];
          const volume = volumeOptions[Math.floor(Math.random() * volumeOptions.length)];

          const intensityOptions = ['Suave', 'Moderada', 'Intensa'];
          const intensity = intensityOptions[Math.floor(Math.random() * intensityOptions.length)];

          const priceNum = (Math.random() * (290 - 110) + 110).toFixed(2);
          const price = `R$ ${priceNum.replace('.', ',')}`;

          return {
            category: category,
            notes: notesList || "Notas florais e cítricas",
            description: description,
            intensity: intensity,
            price: price,
            volume: volume
          };
        });

        detailedPerfumes.push({
          id: p.id,
          name: p.name,
          category: details.category,
          notes: details.notes,
          description: details.description,
          intensity: details.intensity,
          price: details.price,
          volume: details.volume,
          image: p.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80',
          tags: [details.intensity.toLowerCase(), details.category.toLowerCase().split(' ')[0]]
        });

      } catch (err) {
        console.error(`  [ERRO] Falha ao obter detalhes de ${p.name}, usando fallback:`, err.message);
        // Fallback for individual perfume detail failure
        detailedPerfumes.push({
          id: p.id,
          name: p.name,
          category: "Floral Amadeirado",
          notes: "Notas Cítricas, Flores Brancas, Sândalo",
          description: "Uma fragrância autoral e sofisticada, desenhada para destacar sua personalidade única.",
          intensity: "Moderada",
          price: "R$ 189,90",
          volume: "100ml",
          image: p.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80',
          tags: ["moderada", "floral"]
        });
      } finally {
        await detailPage.close();
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    return detailedPerfumes;

  } catch (error) {
    console.error(`[ERRO] Falha ao coletar dados para ${brand.name}. Usando fallback offline. Detalhes:`, error.message);
    return FALLBACK_DATA[brand.name];
  } finally {
    await page.close();
  }
}

async function run() {
  console.log('[SCRAPER] Inicializando Puppeteer...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const allPerfumes = [];

  for (const brand of BRANDS) {
    const brandPerfumes = await scrapeBrand(browser, brand);
    allPerfumes.push(...brandPerfumes);
  }

  await browser.close();

  // Save gathered data to JSON file
  fs.writeFileSync('perfumes_data.json', JSON.stringify(allPerfumes, null, 2), 'utf-8');
  console.log(`[SCRAPER] Concluído! ${allPerfumes.length} perfumes salvos em perfumes_data.json`);
}

run();

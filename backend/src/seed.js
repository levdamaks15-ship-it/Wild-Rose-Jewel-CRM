import { pool, query } from './db.js';

export const initialProducts = [
  {
    id: "wr-001",
    sku: "WR-NECK-001",
    title: "Колье «Жемчужная Нить Афродиты»",
    category: "necklaces",
    capsule: "Pearl Essence",
    price: 18500,
    oldPrice: 21000,
    status: "in_stock",
    isNew: true,
    isBestseller: true,
    mainImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80",
    hoverImage: "https://images.unsplash.com/photo-1611591475152-47702f3a63a5?auto=format&fit=crop&w=1000&q=80",
    detailImages: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1611591475152-47702f3a63a5?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80"
    ],
    videoUrl: "",
    metal: "Серебро 925 с позолотой 18K",
    stones: "Натуральный барочный жемчуг",
    sizes: ["40 + 5 см"],
    weight: "14.2 г",
    lockType: "Карабин с фирменной гравировкой",
    story: "Воплощение морской стихии и античной грации. Каждая жемчужина отобрана вручную мастером и имеет неповторимую форму.",
    styleAdvice: "Великолепно смотрится как солирующее украшение с шелковой рубашкой или в сете с тонкими золотыми цепочками.",
    care: "Беречь от духов и влаги. Хранить в индивидуальном мешочке из микрофибры."
  },
  {
    id: "wr-002",
    sku: "WR-RING-002",
    title: "Кольцо «Дикая Роза Solitaire»",
    category: "rings",
    capsule: "Iconic Rose",
    price: 12900,
    oldPrice: null,
    status: "in_stock",
    isNew: true,
    isBestseller: true,
    mainImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80",
    hoverImage: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80",
    detailImages: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80"
    ],
    videoUrl: "",
    metal: "Серебро 925, Родиевое покрытие",
    stones: "Ограненный турмалин глубокого винного оттенка",
    sizes: ["16.0", "16.5", "17.0", "17.5", "18.0"],
    weight: "4.8 г",
    lockType: "Глухая закрепка",
    story: "Символ внутренней силы и утонченной страсти. Оттенок камня перекликается с легендарным цветом дикой розы.",
    styleAdvice: "Акцентное кольцо для указательного или среднего пальца. Идеально под вечерний образ.",
    care: "Чистить мягкой ювелирной салфеткой без абразивов."
  },
  {
    id: "wr-003",
    sku: "WR-EAR-003",
    title: "Серьги-капли «Мерцающий Гранат»",
    category: "earrings",
    capsule: "Garnet Twilight",
    price: 15400,
    oldPrice: 17200,
    status: "in_stock",
    isNew: false,
    isBestseller: true,
    mainImage: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80",
    hoverImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80",
    detailImages: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80"
    ],
    videoUrl: "",
    metal: "Желтое золото 585 пробы",
    stones: "Натуральный гранат каплевидной огранки",
    sizes: ["Универсальный"],
    weight: "6.1 г",
    lockType: "Английский замок повышенной надежности",
    story: "Игра света в гранях граната напоминает мерцание вечерних огней в цветущем саду.",
    styleAdvice: "Подчеркивают линию шеи и овал лица. Рекомендуются с собранными волосами.",
    care: "Избегать резких перепадов температуры."
  },
  {
    id: "wr-004",
    sku: "WR-BRAC-004",
    title: "Жесткий браслет-кафф «Змеиная Текстура»",
    category: "bracelets",
    capsule: "Sculptural Gold",
    price: 22000,
    oldPrice: null,
    status: "preorder",
    isNew: true,
    isBestseller: false,
    mainImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80",
    hoverImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80",
    detailImages: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80"
    ],
    videoUrl: "",
    metal: "Серебро 925 с матовой позолотой 24K",
    stones: "Без вставок",
    sizes: ["S (15-16 см)", "M (17-18 см)"],
    weight: "21.5 г",
    lockType: "Кафф открытого типа (регулируемый)",
    story: "Скульптурная пластика металла. Текстура нанесена вручную резцом ювелира.",
    styleAdvice: "Носите поверх трикотажного манжета или на открытом запястье.",
    care: "Хранить отдельно от изделий с острыми гранями."
  },
  {
    id: "wr-005",
    sku: "WR-SET-005",
    title: "Сет «Небесная Роса» (Колье + Серьги)",
    category: "sets",
    capsule: "Pearl Essence",
    price: 31000,
    oldPrice: 35500,
    status: "limited",
    isNew: false,
    isBestseller: true,
    mainImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80",
    hoverImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80",
    detailImages: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80"
    ],
    videoUrl: "",
    metal: "Серебро 925, Родий",
    stones: "Белый речной жемчуг, микрофианиты",
    sizes: ["Колье 42 см, Серьги 2.5 см"],
    weight: "18.3 г",
    lockType: "Пусеты (серьги) + Шпрингельный замок (колье)",
    story: "Гармоничный дуэт, созданный для самых трепетных и важных моментов вашей жизни.",
    styleAdvice: "Идеальный выбор для свадебного или торжественного образа.",
    care: "Рекомендуется профессиональная чистка раз в год."
  }
];

export const initialPageSections = [
  {
    id: "hero",
    name: "Главный баннер (Hero)",
    type: "hero",
    enabled: true,
    orderIndex: 0,
    title: "Вне Времени. Вне Правил.",
    subtitle: "Новая Коллекция 2026",
    buttonText: "Смотреть Каталог",
    buttonLink: "#catalog",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=85",
    text: null,
    extraData: {}
  },
  {
    id: "capsules",
    name: "Коллекции и направления",
    type: "capsules",
    enabled: true,
    orderIndex: 1,
    title: "Коллекция Украшений",
    subtitle: "Выберите свою эстетику",
    buttonText: null,
    buttonLink: null,
    imageUrl: null,
    text: null,
    extraData: {}
  },
  {
    id: "lookbook",
    name: "Интерактивный Лукбук (Shop the Look)",
    type: "lookbook",
    enabled: true,
    orderIndex: 2,
    title: "Образы Wild Rose",
    subtitle: "Нажмите на изделие, чтобы узнать детали",
    buttonText: null,
    buttonLink: null,
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
    text: null,
    extraData: {},
    hotspots: [
      { id: "h1", top: "38%", left: "42%", productId: "wr-003", label: "Серьги Гранат" },
      { id: "h2", top: "54%", left: "48%", productId: "wr-001", label: "Колье Жемчуг" },
      { id: "h3", top: "72%", left: "62%", productId: "wr-002", label: "Кольцо Solitaire" }
    ]
  },
  {
    id: "bestsellers",
    name: "Каталог Изделий",
    type: "bestsellers",
    enabled: true,
    orderIndex: 3,
    title: "Каталог Изделий",
    subtitle: "Выбор наших ценителей",
    buttonText: null,
    buttonLink: null,
    imageUrl: null,
    text: null,
    extraData: {}
  },
  {
    id: "craftsmanship",
    name: "О Бренде и Мастерстве (Story)",
    type: "craftsmanship",
    enabled: true,
    orderIndex: 4,
    title: "Магия Ручной Работы",
    subtitle: "КАЖДОЕ ИЗДЕЛИЕ ХРАНИТ ТЕПЛО РУК МАСТЕРА",
    buttonText: null,
    buttonLink: null,
    imageUrl: null,
    text: "Мы верим, что ювелирные украшения — это не просто драгоценный металл, а личный талисман. В нашей мастерской традиции ювелирного искусства соединяются с дерзким современным дизайном.",
    extraData: {
      features: [
        { num: "925 / 585", label: "Благородные сплавы и проба" },
        { num: "100%", label: "Ручной отбор натуральных камней" },
        { num: "Lifetime", label: "Безупречная полировка и сервис" }
      ]
    }
  },
  {
    id: "journal",
    name: "Instagram & UGC Лента",
    type: "journal",
    enabled: true,
    orderIndex: 5,
    title: "Вдохновение #WildRoseJewel",
    subtitle: "Как наши изделия живут в ваших образах",
    buttonText: null,
    buttonLink: null,
    imageUrl: null,
    text: null,
    extraData: {}
  }
];

export const initialSiteSettings = {
  brandName: "Wild Rose Jewel",
  contactPhone: "+7 (999) 000-00-00",
  contactEmail: "concierge@wildrosejewel.com",
  instagramUrl: "https://instagram.com",
  telegramUrl: "https://t.me/wildrosejewel",
  whatsappUrl: "https://wa.me/79990000000",
  googleSheetsWebhookUrl: "",
  googleDriveFolderId: ""
};

export const seedDatabase = async () => {
  try {
    // 1. Seed Products
    const countRes = await query('SELECT COUNT(*) FROM products');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial products...');
      for (const p of initialProducts) {
        await query(
          `INSERT INTO products (
            id, sku, title, category, capsule, price, old_price, status, is_new, is_bestseller,
            metal, stones, sizes, weight, lock_type, main_image, hover_image, detail_images,
            video_url, story, style_advice, care
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          ON CONFLICT (id) DO NOTHING`,
          [
            p.id, p.sku, p.title, p.category, p.capsule, p.price, p.oldPrice, p.status, p.isNew, p.isBestseller,
            p.metal, p.stones, JSON.stringify(p.sizes), p.weight, p.lockType, p.mainImage, p.hoverImage,
            JSON.stringify(p.detailImages || []), p.videoUrl, p.story, p.styleAdvice, p.care
          ]
        );
      }
      console.log(`✅ ${initialProducts.length} products seeded successfully.`);
    }

    // 2. Seed Page Sections & Hotspots
    const secCountRes = await query('SELECT COUNT(*) FROM page_sections');
    if (parseInt(secCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial page sections...');
      for (const s of initialPageSections) {
        await query(
          `INSERT INTO page_sections (
            id, name, type, enabled, order_index, title, subtitle, button_text, button_link, image_url, text, extra_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO NOTHING`,
          [
            s.id, s.name, s.type, s.enabled, s.orderIndex, s.title, s.subtitle, s.buttonText, s.buttonLink,
            s.imageUrl, s.text, JSON.stringify(s.extraData || {})
          ]
        );

        if (s.hotspots && s.hotspots.length > 0) {
          for (const h of s.hotspots) {
            await query(
              `INSERT INTO lookbook_hotspots (id, section_id, product_id, top, left_coord, label)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (id) DO NOTHING`,
              [h.id, s.id, h.productId, h.top, h.left, h.label]
            );
          }
        }
      }
      console.log(`✅ ${initialPageSections.length} sections seeded successfully.`);
    }

    // 3. Seed Site Settings
    const setRes = await query('SELECT COUNT(*) FROM site_settings');
    if (parseInt(setRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding site settings...');
      await query(
        `INSERT INTO site_settings (key, value) VALUES ('general', $1)
         ON CONFLICT (key) DO NOTHING`,
        [JSON.stringify(initialSiteSettings)]
      );
      console.log('✅ Site settings seeded successfully.');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

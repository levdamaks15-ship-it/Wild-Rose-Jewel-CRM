/**
 * Wild Rose Jewel - Данные о товарах
 * Используется для динамической отрисовки каталога.
 */

const productsData = [
    // --- Коллекция 0001_Баблгам ---
    {
        id: "0001-1",
        season: "spring",
        collection: "Баблгам",
        name: "Кольцо «Сияние Ночи»",
        category: "rings",
        material: "Крупный фианит, серебро 925 (покрытие)",
        price: "По запросу",
        mainImage: "assets/products/spring/0001_Баблгам/rings/main.jpg",
        lookModel: null,
        lookCaption: "Акцент, притягивающий взгляды."
    },
    {
        id: "0001-2",
        season: "spring",
        collection: "Баблгам",
        name: "Колье «Баблгам»",
        category: "necklaces",
        material: "Натуральные камни, микс бусин, 18к фурнитура",
        price: "По запросу",
        mainImage: "assets/products/spring/0001_Баблгам/necklace/character/main.jpeg",
        lookModel: "assets/products/spring/0001_Баблгам/necklace/character/main.jpeg",
        lookCaption: "Яркость и стиль в одном колье."
    },
    {
        id: "0001-3",
        season: "spring",
        collection: "Баблгам",
        name: "Браслет «Лазурный Бриз»",
        category: "bracelets",
        material: "Тонированный кварц, серебряная фурнитура",
        price: "По запросу",
        mainImage: "assets/products/spring/0001_Баблгам/bracelets/main.jpg",
        lookModel: null,
        lookCaption: "Лазурные блики на вашем запястье."
    },
    {
        id: "0001-4",
        season: "spring",
        collection: "Баблгам",
        name: "Серьги «Капля Серебра»",
        category: "earrings",
        material: "Фианиты, ювелирный сплав, родиевое покрытие",
        price: "По запросу",
        mainImage: "assets/products/spring/0001_Баблгам/earrings/main.jpg",
        lookModel: null,
        lookCaption: "Минимализм и чистота формы."
    },
    {
        id: "0001-5",
        season: "spring",
        collection: "Баблгам",
        name: "Сет «Баблгам»",
        category: "sets",
        material: "Полный набор: колье, браслет, серьги, кольцо",
        price: "По запросу",
        mainImage: "assets/products/spring/0001_Баблгам/set/main.jpg",
        lookModel: null,
        lookcaption: "Все грани вашего стиля в одной коллекции."
    },
    // --- Коллекция 0002_Белый лев (Символы) ---
    {
        id: "symbol-0002-1",
        season: "symbol",
        collection: "Белый лев",
        name: "Сет «Белый лев» (Жемчуг)",
        category: "sets",
        material: "Натуральный жемчуг, позолоченная фурнитура, эмаль",
        price: "По запросу",
        mainImage: "assets/products/symbol/0002_Белый лев/set/IMG_20250430_181528_790.jpg",
        lookModel: "assets/products/symbol/0002_Белый лев/set/character/IMG_20260118_194240_317.jpeg",
        lookCaption: "Символ силы и грации."
    },
    // --- Коллекция 0003_Большой жемчуг (Гранатовое вино) ---
    {
        id: "symbol-0003-1",
        season: "symbol",
        collection: "Гранатовое вино",
        name: "Браслет",
        category: "bracelets",
        material: "Майорка-барокко, позолоченная фурнитура",
        price: "По запросу",
        mainImage: "assets/products/symbol/0003_Большой жемчуг/bracelets/IMG_20260318_193356_979.jpg",
        lookModel: "assets/products/symbol/0003_Большой жемчуг/bracelets/character/file_00000000e2f0720a85a901b237d089b8.png",
        lookCaption: "Изысканная форма и глубокий цвет."
    },
    {
        id: "symbol-0003-2",
        season: "symbol",
        collection: "Гранатовое вино",
        name: "Колье",
        category: "necklaces",
        material: "Майорка-барокко, позолоченная фурнитура",
        price: "По запросу",
        mainImage: "assets/products/symbol/0003_Большой жемчуг/necklace/character/IMG_20260320_230532_002.png",
        lookModel: "assets/products/symbol/0003_Большой жемчуг/necklace/character/IMG_20260320_231406_476.png",
        lookCaption: "Вечная классика в новом прочтении."
    },
    // --- Коллекция 0004_Браслет двойной песок (Белый песок) ---
    {
        id: "summer-0004-1",
        season: "summer",
        collection: "Белый песок",
        name: "Двойной браслет",
        category: "bracelets",
        material: "Имитация белого агата, позолоченная фурнитура, фианиты",
        price: "По запросу",
        mainImage: "assets/products/summer/0004_Браслет двойной песок/bracelets/IMG_20260122_181828_221.jpeg",
        lookModel: "assets/products/summer/0004_Браслет двойной песок/bracelets/character/IMG_20260122_181827_418.jpeg",
        lookCaption: "Тёплое дыхание летнего берега."
    },
    // --- Коллекция 0005_Браслет жемчуг муха (Жемчужная муха) ---
    {
        id: "spring-0005-1",
        season: "spring",
        collection: "Жемчужная муха",
        name: "Браслет",
        category: "bracelets",
        material: "Натуральный жемчуг, позолоченная фурнитура",
        price: "По запросу",
        mainImage: "assets/products/spring/0005_Браслет жемчуг муха/bracelets/character/IMG_20260323_164118_169.jpg",
        lookModel: null, // Пока нет основного фото, это используется как главное
        lookCaption: "Изысканный жемчуг и дерзкая деталь."
    },
    // --- Коллекция 0006_Браслет жемчуг рис коктейль (Жемчужный коктейль) ---
    {
        id: "summer-0006-1",
        season: "summer",
        collection: "Жемчужный коктейль",
        name: "Браслет",
        category: "bracelets",
        material: "Натуральный жемчуг «рис», ювелирная фурнитура",
        price: "По запросу",
        mainImage: "assets/products/summer/0006_Браслет жемчуг рис коктейль/bracelets/file_00000000000471f8acc26612c9473e90.png",
        lookModel: null,
        lookCaption: "Лёгкое прикосновение океанского бриза."
    },
    // --- Коллекция 0007_Браслет жемчуг цветок (Аленький цветочек) ---
    {
        id: "spring-0007-1",
        season: "spring",
        collection: "Аленький цветочек",
        name: "Двойной браслет",
        category: "bracelets",
        material: "Натуральный жемчуг, ювелирная фурнитура, фианиты",
        price: "По запросу",
        mainImage: "assets/products/spring/0007_Браслет жемчуг цветок/bracelets/IMG_20260307_181004_147.jpg",
        lookModel: null,
        lookCaption: "Красота в деталях."
    },
    // --- Коллекция 0008_Браслет перламутр морской (Бриз) ---
    {
        id: "summer-0008-1",
        season: "summer",
        collection: "Бриз",
        name: "Браслет",
        category: "bracelets",
        material: "Натуральный перламутр, позолоченная фурнитура, эмаль",
        price: "По запросу",
        mainImage: "assets/products/summer/0008_Браслет перламутр морской/bracelets/file_000000008a4071f882abe135e9474e29.png",
        lookModel: null,
        lookCaption: "Летнее настроение в каждом движении."
    },
    // --- Коллекция 0009_Браслет черепаха (Тортуга) ---
    {
        id: "summer-0009-1",
        season: "summer",
        collection: "Тортуга",
        name: "Браслет",
        category: "bracelets",
        material: "Майорка, позолоченная фурнитура, эмаль",
        price: "По запросу",
        mainImage: "assets/products/summer/0009_Браслет черепаха/bracelets/IMG_20250512_182359_185.jpg",
        lookModel: null,
        lookCaption: "Свобода морского приключения."
    },
    // --- Коллекция 0013_Морской жемчуг синий (Лазурный берег) ---
    {
        id: "summer-0013-1",
        season: "summer",
        collection: "Лазурный берег",
        name: "Браслет",
        category: "bracelets",
        material: "Натуральный жемчуг, ювелирная эмаль, позолота",
        price: "По запросу",
        mainImage: "assets/products/summer/0013_Морской жемчуг  синий/bracelets/IMG_20250614_175832_027.jpg",
        lookModel: null,
        lookCaption: "Свежесть морской волны на вашем запястье."
    },
    // --- Коллекция 0014_Морской жемчуг белый (Жемчужина моря) ---
    {
        id: "summer-0014-1",
        season: "summer",
        collection: "Жемчужина моря",
        name: "Колье",
        category: "necklaces",
        material: "Натуральный жемчуг, позолоченная фурнитура, ювелирная эмаль",
        price: "По запросу",
        mainImage: "assets/products/summer/0014_Морской жемчуг белый/necklace/IMG_20250617_210134_709.jpg",
        lookModel: "assets/products/summer/0014_Морской жемчуг белый/necklace/character/IMG_20260119_215335_897.jpeg",
        lookCaption: "Сияние моря в вашем взгляде."
    },
    {
        id: "summer-0014-2",
        season: "summer",
        collection: "Жемчужина моря",
        name: "Сет: колье и браслет",
        category: "sets",
        material: "Натуральный жемчуг, позолоченная фурнитура, ювелирная эмаль",
        price: "По запросу",
        mainImage: "assets/products/summer/0014_Морской жемчуг белый/set/IMG_20260119_215335_866.jpeg",
        lookModel: "assets/products/summer/0014_Морской жемчуг белый/set/character/IMG_20260119_215335_897.jpeg",
        lookCaption: "Полный образ для берега океана."
    },
    // --- Коллекция 0010_Египет (Тайны Нила) ---
    {
        id: "symbol-0010-1",
        season: "symbol",
        collection: "Тайны Нила",
        name: "Колье-чокер",
        category: "necklaces",
        material: "Матовый кахолонг, ювелирная эмаль, позолота",
        price: "По запросу",
        mainImage: "assets/products/symbol/0010_Египет/necklace/IMG_20250706_193122_154.jpg",
        lookModel: null,
        lookCaption: "Древние смыслы в современном исполнении."
    },
    // --- Коллекция 0011_Клеопатра (Клеопатра) ---
    {
        id: "symbol-0011-1",
        season: "symbol",
        collection: "Клеопатра",
        name: "Двойное колье",
        category: "necklaces",
        material: "Матовый кахолонг, позолоченная фурнитура",
        price: "По запросу",
        mainImage: "assets/products/symbol/0011_Клеопатра/necklace/IMG_20251105_162412_055.jpg",
        lookModel: "assets/products/symbol/0011_Клеопатра/necklace/character/IMG_20260211_193308_690.jpeg",
        lookCaption: "Сила и женственность великой царицы."
    },
    // --- Коллекция 0012_Мишка (Тёплое сердце) ---
    {
        id: "symbol-0012-1",
        season: "symbol",
        collection: "Тёплое сердце",
        name: "Сет: колье и серьги",
        category: "sets",
        material: "Натуральный жемчуг, позолоченная фурнитура, фианиты",
        price: "По запросу",
        mainImage: "assets/products/symbol/0012_Мишка/set/IMG_20260109_225803_204.jpg",
        lookModel: null,
        lookCaption: "Милые детали, согревающие душу."
    },
    {
        id: "symbol-0012-2",
        season: "symbol",
        collection: "Тёплое сердце",
        name: "Серьги",
        category: "earrings",
        material: "Позолоченная фурнитура, фианиты",
        price: "По запросу",
        mainImage: "assets/products/symbol/0012_Мишка/earrings/IMG_20260210_152252_515.jpg",
        lookModel: null,
        lookCaption: "Очаровательный спутник на каждый день."
    }
];

// Для совместимости, если мы захотим использовать это как модуль в будущем
if (typeof module !== 'undefined') {
    module.exports = productsData;
}

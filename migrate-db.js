const fs = require('fs');

const SUPABASE_URL = 'https://oaemthhzdyypnbregxxh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZW10aGh6ZHl5cG5icmVneHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODY3NDAsImV4cCI6MjA5MjE2Mjc0MH0.srnGItP3v4wbhbFVZZaHUaol8Ce16zcjzEFV6rEEFMk';

// Помощник для вставки в Supabase (REST API)
async function dbInsert(table, items) {
    if (!items || items.length === 0) return;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal' // не возвращать вставленные данные
        },
        body: JSON.stringify(items)
    });
    
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ошибка вставки в таблицу ${table}: ${errorText}`);
    }
}

async function migrate() {
    try {
        console.log('Чтение локального файла products-data.js...');
        const data = require('./products-data.js').productsData;
        console.log(`Найдено товаров: ${data.length}\n`);
        
        // 1. Данные для главной таблицы (products)
        const productsParams = data.map(p => {
             // Пытаемся получить базовую числовую цену, если она есть
             let priceBase = parseInt(String(p.price).replace(/\D/g, ''), 10);
             if (isNaN(priceBase)) priceBase = null;

             return {
                 id: p.id,
                 season: p.season,
                 category: p.category,
                 collection: p.collection || null,
                 price_base: priceBase,
                 main_image: p.mainImage,
                 look_model: p.lookModel || null,
                 is_bestseller: !!p.isBestseller
             };
        });

        process.stdout.write(`Вставка в таблицу 'products'... `);
        // Вставляем пачками по 50 записей на случай ограничений API
        for (let i = 0; i < productsParams.length; i += 50) {
             const batch = productsParams.slice(i, i + 50);
             await dbInsert('products', batch);
        }
        console.log('✅ ОК');

        // 2. Данные для таблицы переводов (product_translations)
        const langParams = [];
        data.forEach(p => {
            ['ru', 'en', 'kk'].forEach(lang => {
                 let tDesc = p; 
                 // Если есть перевод для конкретного языка, берем его данные
                 if (p.translations && p.translations[lang]) {
                     tDesc = p.translations[lang];
                 }
                 
                 const tName = tDesc.name || p.name;
                 if (tName) {
                     langParams.push({
                         product_id: p.id,
                         lang: lang,
                         name: tName,
                         material: tDesc.material || p.material,
                         price_display: String(tDesc.price || p.price),
                         description: tDesc.description || p.description,
                         look_caption: tDesc.lookCaption || p.lookCaption
                     });
                 }
            });
        });

        process.stdout.write(`Вставка ${langParams.length} записей в таблицу 'product_translations'... `);
        for (let i = 0; i < langParams.length; i += 50) {
             const batch = langParams.slice(i, i + 50);
             await dbInsert('product_translations', batch);
        }
        console.log('✅ ОК');

        console.log('\n🎉 Миграция успешно завершена! Все данные перенесены в Supabase.');
    } catch (e) {
        console.error('\n❌ Ошибка миграции:', e);
    }
}

migrate();

const fs = require('fs');

try {
    const data = require('./products-data.js').productsData;
    let sql = `-- Скрипт миграции данных в Supabase (Сгенерировано автоматически)\n\n`;
    
    // 1. Очистка таблиц (на случай повторного запуска)
    sql += `DELETE FROM product_translations;\n`;
    sql += `DELETE FROM products;\n\n`;

    // 2. Вставка товаров
    sql += `-- Вставка продуктов\n`;
    data.forEach(p => {
         let priceBase = parseInt(String(p.price).replace(/\\D/g, ''), 10);
         if (isNaN(priceBase)) priceBase = 'NULL';

         const cColl = p.collection ? `'${p.collection.replace(/'/g, "''")}'` : 'NULL';
         const cLook = p.lookModel ? `'${p.lookModel.replace(/'/g, "''")}'` : 'NULL';
         const isBest = p.isBestseller ? 'true' : 'false';
         
         sql += `INSERT INTO products (id, season, category, collection, price_base, main_image, look_model, is_bestseller) VALUES `;
         sql += `('${p.id}', '${p.season}', '${p.category}', ${cColl}, ${priceBase}, '${p.mainImage.replace(/'/g, "''")}', ${cLook}, ${isBest});\n`;
    });
    sql += `\n`;

    // 3. Вставка переводов
    sql += `-- Вставка переводов\n`;
    data.forEach(p => {
        ['ru', 'en', 'kk'].forEach(lang => {
             let tDesc = p; 
             if (p.translations && p.translations[lang]) {
                 tDesc = p.translations[lang];
             }
             const tName = tDesc.name || p.name;
             if (tName) {
                 const nameStr = tName ? `'${tName.replace(/'/g, "''")}'` : 'NULL';
                 const matStr = tDesc.material || p.material ? `'${(tDesc.material || p.material).replace(/'/g, "''")}'` : 'NULL';
                 const priStr = tDesc.price || p.price ? `'${String(tDesc.price || p.price).replace(/'/g, "''")}'` : 'NULL';
                 const descStr = tDesc.description || p.description ? `'${(tDesc.description || p.description).replace(/'/g, "''")}'` : 'NULL';
                 const capStr = tDesc.lookCaption || p.lookCaption ? `'${(tDesc.lookCaption || p.lookCaption).replace(/'/g, "''")}'` : 'NULL';

                 sql += `INSERT INTO product_translations (product_id, lang, name, material, price_display, description, look_caption) VALUES `;
                 sql += `('${p.id}', '${lang}', ${nameStr}, ${matStr}, ${priStr}, ${descStr}, ${capStr});\n`;
             }
        });
    });

    fs.writeFileSync('migration.sql', sql);
    console.log('SQL сгенерирован: migration.sql');
} catch (e) {
    console.error(e);
}

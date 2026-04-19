const { productsData } = require('./products-data.js');

const SUPABASE_URL = 'https://oaemthhzdyypnbregxxh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZW10aGh6ZHl5cG5icmVneHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODY3NDAsImV4cCI6MjA5MjE2Mjc0MH0.srnGItP3v4wbhbFVZZaHUaol8Ce16zcjzEFV6rEEFMk';

global.WRJ_CURRENCY_RATES = {};
global.WRJ_CONFIG = { whatsappNumber: '', instagram: ''};
global.productsData = productsData;

async function loadSupabaseData() {
    try {
        const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };
        const [pRes, tRes, cRes] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/product_translations?select=*`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/site_config?select=*`, { headers })
        ]);
        
        let dbProducts = await pRes.json();
        let dbTrans = await tRes.json();
        let dbConfig = await cRes.json();

        // Check if any error from json
        if (dbProducts.error) console.error("PRODUCTS ERR", dbProducts);
        
        const mappedProducts = dbProducts.map(p => {
            const trs = {};
            const itemTrans = dbTrans.filter(t => t.product_id === p.id);
            itemTrans.forEach(t => {
                trs[t.lang] = {
                    name: t.name,
                    material: t.material,
                    price: t.price_display !== 'null' && t.price_display !== null ? t.price_display : (p.price_base || 'По запросу'),
                    description: t.description || '',
                    lookCaption: t.look_caption || ''
                };
            });
            const ru = trs.ru || {};
            return {
                id: p.id,
                season: p.season,
                category: p.category,
                collection: p.collection || '',
                name: ru.name || 'Название',
                material: ru.material || '',
                price: ru.price || (p.price_base || 'По запросу'),
                description: ru.description || '',
                lookCaption: ru.lookCaption || '',
                mainImage: p.main_image,
                lookModel: p.look_model,
                isBestseller: !!p.is_bestseller,
                translations: trs
            };
        });

        global.productsData.length = 0;
        global.productsData.push(...mappedProducts);
        
        console.log("MAPPED LENGTH: ", global.productsData.length);
        console.log("SAMPLE ITEM: ", global.productsData[0]);

    } catch(err) {
        console.error("Supabase load error:", err);
    }
}
loadSupabaseData();

/**
 * Wild Rose Jewel - Utility Functions & Health Check
 * Содержит общие инструменты для работы с данными, путями и безопасностью.
 */

const WRJ_UTILS = {
    /**
     * Простая защита от XSS
     */
    sanitize: function(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Генератор путей к изображениям согласно ГОСТу
     * @param {Object} product - Объект товара из базы
     * @param {string} type - 'main', 'look', 'thumb'
     */
    getAssetPath: function(product, type = 'main') {
        if (!product || !product.id || !product.season) return 'assets/placeholder.webp';
        
        // Извлекаем компоненты из ID (например, "spring-0001-1")
        const parts = product.id.split('-');
        const idNum = parts[1]; // "0001"
        
        // Базовый путь на основе сезона и категории
        // Мы предполагаем стандартную структуру: assets/products/[season]/[id]_Coll/[category]/[id-index]_[type].webp
        // Но так как у нас в базе уже прописаны полные пути, эта функция будет служить валидатором/исправителем
        
        const path = product.mainImage;
        
        // Если путь пуст или битый — возвращаем дефолт
        if (!path || path.includes('undefined')) {
            console.error(`[ERROR] Missing path for product: ${product.id}`);
            return 'assets/WRJ.png';
        }

        return path;
    },

    /**
     * Получить перевод по ключу
     */
    t: function(key, lang = 'ru') {
        if (typeof WRJ_TRANSLATIONS !== 'undefined' && WRJ_TRANSLATIONS[lang] && WRJ_TRANSLATIONS[lang][key]) {
            return WRJ_TRANSLATIONS[lang][key];
        }
        return key;
    },

    /**
     * Конвертация валют
     */
    convertCurrency: function(priceAmount, targetCurrency = 'RUB') {
        if (isNaN(priceAmount)) return priceAmount;
        let rate = 5.0; // Дефолт (страховка)
        if (typeof WRJ_CURRENCY_RATES !== 'undefined' && WRJ_CURRENCY_RATES.RUB_TO_KZT) {
            rate = WRJ_CURRENCY_RATES.RUB_TO_KZT;
        }

        if (targetCurrency === 'KZT') {
            return Math.ceil(priceAmount * rate);
        }
        return priceAmount;
    },

    /**
     * Форматирование цены
     */
    formatPrice: function(price, lang = 'ru', targetCurrency = 'RUB') {
        // Проверка на 'По запросу' или пустую цену
        if (!price || price === 'По запросу' || price === 'On request' || price === 'Сұраныс бойынша') {
            return this.t('price_request', lang);
        }

        // Пытаемся извлечь число (если цена записана как "5400 ₽" или "5400")
        const numPrice = parseInt(String(price).replace(/\D/g, ''), 10);
        
        if (!isNaN(numPrice) && numPrice > 0) {
            const converted = this.convertCurrency(numPrice, targetCurrency);
            
            // Форматируем с учетом региона
            if (targetCurrency === 'KZT') {
                return new Intl.NumberFormat('kk-KZ', { style: 'currency', currency: 'KZT', minimumFractionDigits: 0 }).format(converted);
            }
            if (targetCurrency === 'RUB') {
                return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(converted);
            }
        }
        
        return price;
    },

    /**
     * Валидация всей базы данных (Health Check)
     */
    runHealthCheck: function(products, looks) {
        console.group('%c[WRJ HEALTH CHECK]', 'color: #c09a53; font-weight: bold; font-size: 14px;');
        
        let errors = 0;
        let warnings = 0;

        if (!products || !Array.isArray(products)) {
            console.error('❌ Products database is missing or invalid!');
            errors++;
        } else {
            console.log(`📊 Total Products: ${products.length}`);
            
            products.forEach(p => {
                // Проверка ID
                if (!p.id) {
                    console.error(`❌ Product missing ID at index ${products.indexOf(p)}`);
                    errors++;
                }
                
                // Проверка путей к изображениям
                if (!p.mainImage || p.mainImage === '') {
                    console.warn(`⚠️ Product ${p.id} has no mainImage`);
                    warnings++;
                } else if (!p.mainImage.endsWith('.webp')) {
                    console.warn(`⚠️ Product ${p.id} uses non-WebP format: ${p.mainImage}`);
                    warnings++;
                }
            });
        }

        if (looks) {
            console.log(`🖼️ Total Looks: ${looks.length}`);
            looks.forEach(l => {
                if (!l.id) console.error(`❌ Look missing ID`);
                l.hotspots.forEach(hs => {
                    const linked = products.find(p => p.id === hs.productId);
                    if (!linked) {
                        console.error(`❌ Look ${l.id} refers to non-existent product: ${hs.productId}`);
                        errors++;
                    }
                });
            });
        }

        if (errors === 0) {
            console.log('%c✅ Data Integrity: PERFECT', 'color: #27ae60; font-weight: bold;');
        } else {
            console.log(`%c❌ Found ${errors} critical errors. Fix them to avoid site breakage.`, 'color: #e74c3c; font-weight: bold;');
        }

        console.groupEnd();
        
        return { errors, warnings };
    },

    /**
     * Формирование сообщения для WhatsApp
     */
    formatWhatsAppMessage: function(items, productsData, lang = 'ru', currency = 'RUB', total = 0) {
        const title = this.t('order_msg_title', lang) || 'Новый заказ:';
        let msg = `${title}\n\n`;

        items.forEach((id, index) => {
            const p = productsData.find(item => String(item.id) === String(id));
            if (p) {
                const t = p.translations && p.translations[lang] ? p.translations[lang] : p;
                const name = t.name || p.name;
                const material = t.material || p.material;
                const price = this.formatPrice(t.price || p.price, lang, currency);
                
                msg += `${index + 1}. *${name}*\n`;
                if (material) msg += `   _${material}_\n`;
                msg += `   Цена: ${price}\n\n`;
            }
        });

        const totalLabel = this.t('order_msg_total', lang) || 'Итого:';
        msg += `*${totalLabel} ${this.formatPrice(total, lang, currency)}*\n\n`;
        msg += `Здравствуйте! Хочу приобрести эти украшения. Есть ли они в наличии?`;

        return msg;
    }
};

/**
 * Wild Rose Jewel - Global Application Logic
 * Централизованное управление состоянием, мультиязычностью, корзиной и интерактивом.
 */






const WRJ_CART_DRAWER = {
    render: function() {
        const container = document.getElementById('cartItemsContainer');
        const totalPriceEl = document.getElementById('cartTotalPrice');
        if (!container || !totalPriceEl || typeof productsData === 'undefined') return;

        const lang = WRJ_APP.state.currentLang;
        const cur = WRJ_APP.state.currentCurrency;
        const items = WRJ_CART.items;

        if (items.length === 0) {
            container.innerHTML = `<div class="cart-empty-msg" data-i18n="cart_empty">${WRJ_UTILS.t('cart_empty', lang)}</div>`;
            totalPriceEl.textContent = WRJ_UTILS.formatPrice(0, lang, cur);
            return;
        }

        
        let total = 0;
        container.innerHTML = items.map(id => {
            const p = productsData.find(item => String(item.id) === String(id));
            if (!p) return '';
            
            const t = p.translations && p.translations[lang] ? p.translations[lang] : p;
            const price = Number(t.price || p.price || 0); // ПРИНУДИТЕЛЬНО В ЧИСЛО
            total += price;

            return `
                <div class="cart-item">
                    <img src="${p.mainImage}" alt="${WRJ_UTILS.sanitize(t.name || p.name)}">
                    <div class="cart-item-info">
                        <h4>${WRJ_UTILS.sanitize(t.name || p.name)}</h4>
                        <p class="cart-item-price">${WRJ_UTILS.formatPrice(price, lang, cur)}</p>
                    </div>
                    <button class="remove-cart-item" onclick="WRJ_CART.remove('${String(p.id)}')">&times;</button>
                </div>
            `;
        }).join('');


        totalPriceEl.textContent = WRJ_UTILS.formatPrice(total, lang, cur);

        // Биндим кнопку чекаута
        const checkoutBtn = document.getElementById('cartCheckoutBtn');
        if (checkoutBtn) {
            checkoutBtn.onclick = () => {
                const message = WRJ_UTILS.formatWhatsAppMessage(items, productsData, lang, cur, total);
                // Очищаем номер от всего кроме цифр для надежности ссылки
                const cleanPhone = String(WRJ_CONFIG.whatsappNumber).replace(/\D/g, '');
                const url = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
            };
        }
    }
};


const WRJ_CART = {
    items: [],
    
    init: function() {
        const saved = localStorage.getItem('wrj_cart');
        if (saved) {
            try {
                this.items = JSON.parse(saved).map(id => String(id));
            } catch (e) {
                this.items = [];
            }
        }
        this.updateUI();
    },

    save: function() {
        localStorage.setItem('wrj_cart', JSON.stringify(this.items));
        this.updateUI();
    },

    has: function(productId) {
        return this.items.includes(String(productId));
    },

    add: function(productId) {
        const id = String(productId);
        if (!this.has(id)) {
            this.items.push(id);
            this.save();
        }
    },

    remove: function(productId) {
        const id = String(productId);
        this.items = this.items.filter(i => i !== id);
        this.save();
    },

    updateUI: function() {
        const lang = WRJ_APP.state.currentLang;
        const count = this.items.length;
        
        // Обновляем бейдж корзины (по ID из components.js)
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }

        // Обновляем кнопки товаров в каталоге
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            const id = btn.getAttribute('data-id');
            if (this.has(id)) {
                btn.textContent = WRJ_UTILS.t('btn_cart_added', lang);
                btn.classList.add('added');
            } else {
                btn.textContent = WRJ_UTILS.t('btn_cart_add', lang);
                btn.classList.remove('added');
            }
        });

        if (typeof WRJ_CART_DRAWER !== 'undefined') {
            WRJ_CART_DRAWER.render();
        }
    }
};





const SUPABASE_URL = 'https://oaemthhzdyypnbregxxh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZW10aGh6ZHl5cG5icmVneHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODY3NDAsImV4cCI6MjA5MjE2Mjc0MH0.srnGItP3v4wbhbFVZZaHUaol8Ce16zcjzEFV6rEEFMk';

// Базовый URL для медиа-файлов (оставьте пустым для локальной разработки)
// Когда загрузите фото в Supabase, замените на: 'https://oaemthhzdyypnbregxxh.supabase.co/storage/v1/object/public/media/'
let MEDIA_BASE_URL = ''; 

async function loadSupabaseData() {
    console.log("🌐 Fetching data from Supabase...");
    try {
        const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };
        const [pRes, tRes, cRes] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/product_translations?select=*`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/site_config?select=*`, { headers })
        ]);

        if (!pRes.ok) throw new Error(`HTTP error! status: ${pRes.status}`);
        
        const dbProducts = await pRes.json();
        const dbTrans = await tRes.json();
        const dbConfig = await cRes.json();
        
        console.log(`📦 Received ${dbProducts.length} products and ${dbTrans.length} translations`);

        if (!dbProducts || dbProducts.length === 0) {
            console.warn("⚠️ Supabase returned no products. Keeping local data.");
            return;
        }

        // Settings via Config Table
        dbConfig.forEach(c => {
            if (c.key === 'currency_rates' && typeof WRJ_CURRENCY_RATES !== 'undefined') {
                Object.assign(WRJ_CURRENCY_RATES, c.value);
            }
            if (c.key === 'contact_info') {
                if (typeof WRJ_CONFIG !== 'undefined') {
                    WRJ_CONFIG.whatsappNumber = c.value.whatsapp || WRJ_CONFIG.whatsappNumber;
                    WRJ_CONFIG.instagram = c.value.instagram || WRJ_CONFIG.instagram;
                    
                    // Update media URL if set in DB
                    if (c.value.media_base_url) MEDIA_BASE_URL = c.value.media_base_url;

                    document.querySelectorAll('a[href*="wa.me/77000000000"]').forEach(a => {
                        a.href = `https://wa.me/${WRJ_CONFIG.whatsappNumber}`;
                    });
                    document.querySelectorAll('a[href*="instagram.com/wild_rose_jewel"]').forEach(a => {
                        a.href = `https://www.instagram.com/${WRJ_CONFIG.instagram}`;
                    });
                }
            }
        });

        // Функция-помощник для нормализации путей
        const getUrl = (path) => {
            if (!path) return '';
            if (path.startsWith('http')) return path;
            return MEDIA_BASE_URL ? `${MEDIA_BASE_URL}${path}` : path;
        };

        // Remap to legacy struct
        const mappedProducts = dbProducts.map(p => {
            const trs = {};
            const itemTrans = dbTrans.filter(t => t.product_id === p.id);
            itemTrans.forEach(t => {
                trs[t.lang] = {
                    name: t.name, material: t.material,
                    price: t.price_display && t.price_display !== 'null' ? t.price_display : (p.price_base || 'По запросу'),
                    description: t.description || '', lookCaption: t.look_caption || ''
                };
            });
            const ru = trs.ru || {};
            return {
                id: p.id, season: p.season, category: p.category, 
                collection: p.collection || '', name: ru.name || 'Ожидание названия',
                material: ru.material || '', price: ru.price || (p.price_base || 'По запросу'),
                description: ru.description || '', lookCaption: ru.lookCaption || '',
                mainImage: getUrl(p.main_image), 
                lookModel: getUrl(p.look_model), 
                isBestseller: !!p.is_bestseller, translations: trs
            };
        });

        // Mutate the original const bindings
        if (typeof productsData !== 'undefined') {
            productsData.length = 0;
            productsData.push(...mappedProducts);
            console.log("✅ productsData successfully updated from Supabase");
        }

    } catch(err) {
        console.error("❌ Supabase Load Failed:", err);
        console.log("ℹ️ Falling back to local data.");
    }
}

const WRJ_APP = {
    state: {
        currentSeason: 'spring',
        currentCategory: 'all',
        currentLang: 'ru',
        currentCurrency: 'RUB',
        initialized: false
    },

    init: async function() {
        if (this.state.initialized) return;
        this.state.initialized = true;

        console.log("%c🌿 WRJ Application Starting...", "color: #c09a53; font-weight: bold;");
        
        // Load Database
        await loadSupabaseData();

        // 1. Проверка здоровья данных
        if (typeof WRJ_UTILS !== 'undefined' && typeof productsData !== 'undefined') {
            WRJ_UTILS.runHealthCheck(productsData);
        }

        // 2. Язык и параметры
        this.initI18n();
        this.parseParams();

        // 3. Инициализация функциональных модулей
        WRJ_CART.init();
        this.initHeaderLogic();
        this.initCartDrawer();
        this.initSidebarLogic();
        this.initCatalogLogic();
        this.initDynamicCards();
        this.initCookieBanner();
        this.initVideoLoop();

        console.log("%c✅ WRJ Application Ready", "color: #27ae60; font-weight: bold;");
    },

    
    
    
    initI18n: function() {
        // 1. Загружаем сохраненный язык
        const savedLang = localStorage.getItem('wrj_lang');
        if (savedLang && ['ru', 'en', 'kk'].includes(savedLang)) {
            this.state.currentLang = savedLang;
        }

        this.state.currentCurrency = this.state.currentLang === 'kk' ? 'KZT' : 'RUB';

        const updateButtons = () => {
            document.querySelectorAll('.lang-btn').forEach(btn => {
                const bLang = btn.getAttribute('data-lang');
                if (bLang === this.state.currentLang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        };

        // Делегирование событий
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.lang-btn');
            if (!btn) return;

            const l = btn.getAttribute('data-lang');
            if (!l) return;

            console.log("Language switch identified:", l);
            
            // Сохраняем и обновляем состояние
            this.state.currentLang = l;
            localStorage.setItem('wrj_lang', l);
            this.state.currentCurrency = l === 'kk' ? 'KZT' : 'RUB';
            
            // Моментальное обновление без перезагрузки
            updateButtons();
            if(this.applyTranslations) this.applyTranslations();
            
            // Если мы находимся в каталоге, перерисовываем его, чтобы обновить данные из БД
            if (this.initCatalogLogic && document.getElementById('productsGrid')) {
                this.initCatalogLogic(); 
            }

            // Обновляем корзину
            if (WRJ_CART) WRJ_CART.updateUI();

            // Если открыто боковое меню, закрываем через небольшую паузу для наглядности
            const sidebar = document.getElementById('sidebarMenu');
            if (sidebar && sidebar.classList.contains('active')) {
                setTimeout(() => document.getElementById('closeMenuBtn')?.click(), 300);
            }
        });

        // Первичная настройка
        updateButtons();
        if(this.applyTranslations) this.applyTranslations();
    },




    applyTranslations: function() {
        const lang = this.state.currentLang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = WRJ_UTILS.t(key, lang);
            if (text) {
                if (el.tagName === 'META') {
                    el.setAttribute('content', text);
                } else if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
                    el.placeholder = text;
                } else {
                    el.textContent = text;
                }
            }
        });
    },

    
    initCartDrawer: function() {
        const drawer = document.getElementById('cartDrawer');
        const overlay = document.getElementById('cartOverlay');
        const toggle = document.getElementById('cartToggleBtn');
        const closeBtn = document.getElementById('closeCartBtn');
        
        if (!drawer || !overlay) return;

        const close = () => {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        const open = () => {
            drawer.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (typeof WRJ_CART_DRAWER !== 'undefined') WRJ_CART_DRAWER.render();
        };

        // Экспортируем метод для программного открытия
        this.openCart = open;

        if (toggle) toggle.addEventListener('click', open);
        if (overlay) overlay.addEventListener('click', close);
        if (closeBtn) closeBtn.addEventListener('click', close);
    },

    quickBuy: function(productId) {
        if (typeof WRJ_CART !== 'undefined') {
            WRJ_CART.add(productId);
            if (this.openCart) this.openCart();
        }
    },

    quickOrderWhatsApp: function(productId) {
        if (typeof productsData === 'undefined') return;
        const p = productsData.find(item => String(item.id) === String(productId));
        if (!p) return;
        
        const lang = this.state.currentLang;
        const cur = this.state.currentCurrency;
        const t = p.translations && p.translations[lang] ? p.translations[lang] : p;
        const name = t.name || p.name;
        const material = t.material || p.material;
        const price = WRJ_UTILS.formatPrice(t.price || p.price, lang, cur);
        const cleanPhone = String(WRJ_CONFIG.whatsappNumber || '77472722698').replace(/\D/g, '');

        let msg = `Здравствуйте! Хочу оформить заказ:\n\n✨ *${name}*\nАртикул: ${p.id}\n`;
        if (material) msg += `Материал: ${material}\n`;
        msg += `Цена: ${price}\n\nПодскажите, есть ли в наличии?`;

        const url = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    },

    initVideoLoop: function() {
        const video = document.querySelector('.hero-video');
        if (!video) return;

        let fadeTimeout;

        video.addEventListener('play', () => {
            video.classList.remove('fading');
            clearTimeout(fadeTimeout);
            
            // Schedule the fade right before the video ends to loop smoothly
            if (video.duration) {
                const timeUntilFade = (video.duration - video.currentTime - 0.6) * 1000;
                if (timeUntilFade > 0) {
                    fadeTimeout = setTimeout(() => {
                        video.classList.add('fading');
                    }, timeUntilFade);
                }
            }
        });

        // Handle case where duration isn't available immediately
        video.addEventListener('loadedmetadata', () => {
            if (!video.paused) {
                video.dispatchEvent(new Event('play'));
            }
        });
    },

    parseParams: function() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('season')) this.state.currentSeason = params.get('season');
        if (params.get('category')) this.state.currentCategory = params.get('category');
    },

    initHeaderLogic: function() {
        const header = document.getElementById('mainHeader');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) header.classList.add('scrolled');
                else header.classList.remove('scrolled');
            }, { passive: true });
        }
    },

    initSidebarLogic: function() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        const toggle = document.getElementById('menuToggle');
        
        if (!sidebar || !overlay) return;

        const close = () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        const open = () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        if (toggle) toggle.addEventListener('click', open);

        document.addEventListener('click', (e) => {
            const isClose = e.target.closest('#closeMenuBtn') || e.target.closest('.close-menu');
            const isMenuLink = e.target.closest('.sidebar-links a');
            if (isClose || e.target === overlay || isMenuLink) close();
        });
    },

    initCatalogLogic: function() {
        const grid = document.getElementById('productsGrid');
        if (!grid || typeof productsData === 'undefined') return;

        const filterBtns = document.querySelectorAll('.filter-btn');
        const seasonBtns = document.querySelectorAll('.season-btn');
        const searchInput = document.getElementById('catalogSearchInput');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        let searchQuery = '';

        const lang = this.state.currentLang;
        const cur = this.state.currentCurrency;

        // Синхронизация состояния кнопок с начальным состоянием (из URL)
        seasonBtns.forEach(btn => {
            if (btn.getAttribute('data-season') === this.state.currentSeason) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        filterBtns.forEach(btn => {
            if (btn.getAttribute('data-filter') === this.state.currentCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const render = () => {
            grid.innerHTML = '';
            
            // Атмосфера (лепестки)
            this.toggleAtmosphere(this.state.currentSeason === 'spring' && !searchQuery);

            const q = searchQuery.toLowerCase().trim();

            const filtered = productsData.filter(p => {
                // Если есть активный поисковый запрос, ищем по всей базе
                if (q) {
                    const t = p.translations && p.translations[lang] ? p.translations[lang] : p;
                    const searchCorpus = [
                        t.name || p.name || '',
                        t.material || p.material || '',
                        t.collection || p.collection || '',
                        t.description || p.description || '',
                        p.category || '',
                        p.season || '',
                        p.id || ''
                    ].join(' ').toLowerCase();

                    const matchesSearch = searchCorpus.includes(q);
                    const matchesCategory = (this.state.currentCategory === 'all' || p.category === this.state.currentCategory);
                    return matchesSearch && matchesCategory;
                }

                // Стандартная фильтрация по сезону и категории
                return p.season === this.state.currentSeason && 
                    (this.state.currentCategory === 'all' || p.category === this.state.currentCategory);
            });

            if (filtered.length === 0) {
                if (q) {
                    const searchEmpty = WRJ_UTILS.t('search_empty', lang);
                    const resetText = WRJ_UTILS.t('search_reset', lang);
                    grid.innerHTML = `
                        <div class="coming-soon-message search-empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                            <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 15px;">${searchEmpty} «${WRJ_UTILS.sanitize(searchQuery)}»</h3>
                            <button id="resetSearchActionBtn" class="btn-primary" style="margin-top: 10px;">${resetText}</button>
                        </div>
                    `;
                    document.getElementById('resetSearchActionBtn')?.addEventListener('click', () => {
                        if (searchInput) searchInput.value = '';
                        searchQuery = '';
                        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
                        render();
                    });
                } else {
                    const comingSoon = WRJ_UTILS.t('coming_soon', lang);
                    grid.innerHTML = `<div class="coming-soon-message" style="grid-column: 1/-1; text-align: center; padding: 100px 20px; opacity: 0.7;">
                        <h2 style="font-family: 'Playfair Display', serif;">${comingSoon}</h2>
                    </div>`;
                }
                return;
            }

            filtered.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.id = `product-${p.id}`;
                card.style.animation = 'fadeIn 0.4s ease forwards';

                // Мультиязычность данных товара
                const t = p.translations && p.translations[lang] ? p.translations[lang] : p;
                const name = t.name || p.name;
                const material = t.material || p.material;
                const colName = t.collection || p.collection;
                const collection = colName ? `<span class="product-collection">${WRJ_UTILS.sanitize(colName)}:</span> ` : '';
                
                const sPrice = WRJ_UTILS.formatPrice(t.price || p.price, lang, cur);
                
                const isAdded = WRJ_CART.has(p.id);
                const btnText = isAdded ? WRJ_UTILS.t('btn_cart_added', lang) : WRJ_UTILS.t('btn_cart_add', lang);
                const btnClass = isAdded ? 'btn-secondary add-to-cart-btn added' : 'btn-secondary add-to-cart-btn';
                const quickOrderText = WRJ_UTILS.t('btn_quick_order', lang);

                card.innerHTML = `
                    <div class="product-image">
                        <img src="${p.mainImage}" alt="${WRJ_UTILS.sanitize(name)}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3>${collection}${WRJ_UTILS.sanitize(name)}</h3>
                        <p class="product-material">${WRJ_UTILS.sanitize(material)}</p>
                        <p class="product-price">${sPrice}</p>
                        <div class="product-actions">
                            <button class="${btnClass}" data-id="${p.id}">${btnText}</button>
                            <button class="btn-quick-order" data-id="${p.id}" title="${quickOrderText}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.1-.47-.15-.665.15-.195.3-.757.942-.927 1.137-.17.194-.339.219-.64.07-.3-.15-1.263-.465-2.403-1.485-.888-.792-1.487-1.77-1.662-2.07-.174-.3-.019-.462.13-.61.135-.133.301-.35.452-.52.15-.174.198-.298.3-.497.101-.198.05-.371-.026-.52-.075-.149-.665-1.604-.911-2.198-.239-.575-.483-.498-.665-.507-.172-.008-.368-.01-.564-.01-.196 0-.516.075-.785.371-.27.298-1.026 1.003-1.026 2.446 0 1.443 1.05 2.84 1.196 3.037.147.198 2.067 3.155 5.006 4.43.7.303 1.246.484 1.673.619.704.224 1.345.193 1.851.118.564-.084 1.767-.721 2.017-1.417.25-.694.25-1.289.175-1.416-.075-.126-.276-.198-.57-.348h-.001zm-5.437 7.02c-1.802 0-3.57-.487-5.11-1.405L2.8 21.042l1.085-3.992a9.61 9.61 0 01-1.278-4.83c0-5.304 4.316-9.617 9.632-9.617 2.578 0 5.002 1.002 6.824 2.825a9.61 9.61 0 012.822 6.827c0 5.304-4.314 9.617-9.63 9.617h-.001zM12.03 0C5.385 0 .012 5.371.012 12.013c0 2.126.552 4.197 1.604 6.02L0 24l6.143-1.61c1.766 1.025 3.774 1.566 5.86 1.566h.01C18.667 23.956 24 18.585 24 11.933c0-3.226-1.257-6.257-3.535-8.536A11.94 11.94 0 0012.03 0z"/></svg>
                                <span>${quickOrderText}</span>
                            </button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });

            // Биндим кнопки корзины
            grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    if (WRJ_CART.has(id)) {
                        WRJ_CART.remove(id);
                    } else {
                        WRJ_CART.add(id);
                    }
                });
            });

            // Биндим кнопки быстрого заказа WhatsApp
            grid.querySelectorAll('.btn-quick-order').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    WRJ_APP.quickOrderWhatsApp(id);
                });
            });

            this.handleDeepLink();
        };

        // Слушатель поиска
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = searchQuery.trim() ? 'block' : 'none';
                }
                render();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                searchQuery = '';
                clearSearchBtn.style.display = 'none';
                render();
            });
        }

        const scrollToStart = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };

        seasonBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                seasonBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.currentSeason = btn.getAttribute('data-season');
                this.state.currentCategory = 'all';
                filterBtns.forEach(b => b.classList.remove('active'));
                const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allBtn) allBtn.classList.add('active');
                render();
                scrollToStart();
            });
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.currentCategory = btn.getAttribute('data-filter');
                render();
                scrollToStart();
            });
        });

        render();
    },

    toggleAtmosphere: function(show) {
        let atm = document.querySelector('.spring-atmosphere');
        if (show) {
            if (!atm) {
                atm = document.createElement('div');
                atm.className = 'spring-atmosphere';
                const parent = document.querySelector('.catalog-section');
                if (parent) parent.appendChild(atm);
                for (let i = 0; i < 20; i++) this.createPetal(atm);
                
                setTimeout(() => {
                    if (atm && atm.parentElement) {
                        atm.style.transition = 'opacity 5s ease';
                        atm.style.opacity = '0';
                        setTimeout(() => atm.remove(), 5000);
                    }
                }, 15000);
            }
        } else if (atm) {
            atm.remove();
        }
    },

    createPetal: function(container) {
        const p = document.createElement('div');
        p.className = 'petal';
        p.style.width = p.style.height = `${Math.random() * 10 + 5}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDelay = `${Math.random() * 10}s`;
        p.style.animationDuration = `${Math.random() * 10 + 10}s`;
        container.appendChild(p);
    },

    handleDeepLink: function() {
        const productId = new URLSearchParams(window.location.search).get('productId');
        if (productId) {
            setTimeout(() => {
                const el = document.getElementById(`product-${productId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const grid = document.getElementById('productsGrid');
                    grid.classList.add('spotlight-active');
                    el.classList.add('highlight');
                    setTimeout(() => {
                        grid.classList.remove('spotlight-active');
                        el.classList.remove('highlight');
                    }, 3500);
                }
            }, 500);
        }
    },




    initDynamicCards: function() {
        console.log("🎲 Initializing Dynamic Cards...");
        const cards = document.querySelectorAll('.category-card');
        if (cards.length > 0 && typeof productsData !== 'undefined' && productsData.length > 0) {
            cards.forEach(card => {
                const cat = card.getAttribute('data-category');
                const sea = card.getAttribute('data-season');
                if (!cat && !sea) return;
                
                const items = productsData.filter(p => (cat ? p.category === cat : p.season === sea));
                if (items.length > 0) {
                    const randomIndex = Math.floor(Math.random() * items.length);
                    const img = card.querySelector('img');
                    if (img) img.src = items[randomIndex].mainImage;
                }
            });
        }

        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.onclick = () => {
                    const isOpen = item.classList.contains('active');
                    faqItems.forEach(i => i.classList.remove('active'));
                    if (!isOpen) item.classList.add('active');
                };
            }
        });
    },

    initCookieBanner: function() {
        if (localStorage.getItem('cookieConsent')) return;
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `<div class="cookie-content"><p>Мы используем файлы cookie. <a href="privacy.html">Подробнее</a></p></div><button class="cookie-btn" id="acceptCookies">Принять</button>`;
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('show'), 100);
        const btn = document.getElementById('acceptCookies');
        if (btn) {
            btn.onclick = () => {
                localStorage.setItem('cookieConsent', 'true');
                banner.classList.remove('show');
                setTimeout(() => banner.remove(), 500);
            };
        }
    }
};

const startApp = () => {
    if (typeof WRJ_APP !== 'undefined') {
        WRJ_APP.init();
        console.log("✅ WRJ Application Ready");
    }
};

document.addEventListener('wrjComponentsReady', startApp);
if (document.getElementById('mainHeader') && document.getElementById('mainHeader').innerHTML !== '') {
    startApp();
}
if (document.readyState === 'complete') {
    setTimeout(startApp, 500);
} else {
    window.addEventListener('load', () => setTimeout(startApp, 500));
}

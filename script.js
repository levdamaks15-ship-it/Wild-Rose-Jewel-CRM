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
            WRJ_UTILS.runHealthCheck(productsData, typeof looksData !== 'undefined' ? looksData : null);
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
        this.initAlbumLogic();
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
                if (el.tagName === 'INPUT' && el.type === 'placeholder') {
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

        if (toggle) toggle.addEventListener('click', open);
        if (overlay) overlay.addEventListener('click', close);
        if (closeBtn) closeBtn.addEventListener('click', close);
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
            this.toggleAtmosphere(this.state.currentSeason === 'spring');

            const filtered = productsData.filter(p => 
                p.season === this.state.currentSeason && 
                (this.state.currentCategory === 'all' || p.category === this.state.currentCategory)
            );

            if (filtered.length === 0) {
                const comingSoon = WRJ_UTILS.t('coming_soon', lang);
                grid.innerHTML = `<div class="coming-soon-message" style="grid-column: 1/-1; text-align: center; padding: 100px 20px; opacity: 0.7;">
                    <h2 style="font-family: 'Playfair Display', serif;">${comingSoon}</h2>
                </div>`;
                return;
            }

            filtered.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.id = `product-${p.id}`;
                card.style.animation = 'fadeIn 0.5s ease forwards';

                // Мультиязычность данных товара
                const t = p.translations && p.translations[lang] ? p.translations[lang] : p;
                const name = t.name || p.name;
                const material = t.material || p.material;
                const colName = t.collection || p.collection;
                const collection = colName ? `<span class="product-collection">${WRJ_UTILS.sanitize(colName)}:</span> ` : '';
                const lookCaption = t.lookCaption || p.lookCaption || '';
                
                const sPrice = WRJ_UTILS.formatPrice(t.price || p.price, lang, cur);
                
                const isAdded = WRJ_CART.has(p.id);
                const btnText = isAdded ? WRJ_UTILS.t('btn_cart_added', lang) : WRJ_UTILS.t('btn_cart_add', lang);
                const btnClass = isAdded ? 'btn-secondary add-to-cart-btn added' : 'btn-secondary add-to-cart-btn';

                card.innerHTML = `
                    <div class="product-image">
                        <img src="${p.mainImage}" alt="${WRJ_UTILS.sanitize(name)}" loading="lazy">
                        ${p.lookModel ? `<div class="look-link" data-model="${p.lookModel}" data-caption="${WRJ_UTILS.sanitize(lookCaption)}"><span>${WRJ_UTILS.t('look_btn', lang)}</span></div>` : ''}
                    </div>
                    <div class="product-info">
                        <h3>${collection}${WRJ_UTILS.sanitize(name)}</h3>
                        <p class="product-material">${WRJ_UTILS.sanitize(material)}</p>
                        <p class="product-price">${sPrice}</p>
                        <button class="${btnClass}" data-id="${p.id}">${btnText}</button>
                    </div>
                `;
                grid.appendChild(card);
            });

            // Биндим кнопки корзины (с логикой переключателя)
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

            this.handleDeepLink();
        };

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
        this.initLookModal(grid);
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

    initLookModal: function(grid) {
        const modal = document.getElementById('lookModal');
        const img = document.getElementById('lookModalImg');
        const caption = document.getElementById('lookModalCaption');
        
        if (!grid || !modal) return;

        grid.addEventListener('click', (e) => {
            const link = e.target.closest('.look-link');
            if (link) {
                img.src = link.getAttribute('data-model');
                caption.textContent = link.getAttribute('data-caption');
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });

        const close = () => { modal.classList.remove('active'); document.body.style.overflow = ''; };
        document.getElementById('closeLookModal')?.addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    },

    initAlbumLogic: function() {
        const album = document.getElementById('luxuryAlbum');
        const filterBtns = document.querySelectorAll('#lookFilters .filter-btn');
        const seasonNavItems = document.querySelectorAll('#lookSeasons .season-btn');

        if (!album || typeof looksData === 'undefined') return;

        // Применяем переводы к фильтрам образа
        const lang = this.state.currentLang;
        document.querySelectorAll('#lookFilters .filter-btn, #lookSeasons .season-btn').forEach(b => {
             const filterKey = b.getAttribute('data-filter') ? 'filter_' + b.getAttribute('data-filter') : null;
             const seasonKey = b.getAttribute('data-season') ? 'season_' + b.getAttribute('data-season') : null;
             const key = filterKey || seasonKey;
             if(key) {
                 b.textContent = WRJ_UTILS.t(key, lang);
             }
        });

        let filteredLooks = [];
        let currentIndex = 0;
        let isAnimating = false;

        const render = () => {
            filteredLooks = looksData.filter(look => {
                const matchSeason = look.season === this.state.currentSeason || !look.season;
                const matchCategory = this.state.currentCategory === 'all' || 
                    look.hotspots.some(hs => {
                        const prod = productsData.find(p => p.id === hs.productId);
                        return prod && prod.category === this.state.currentCategory;
                    });
                return matchSeason && matchCategory;
            });

            album.innerHTML = '';
            if (filteredLooks.length === 0) {
                album.innerHTML = `<div style="text-align:center; padding-top:100px; opacity:0.5;">${WRJ_UTILS.t('empty_lookbook', lang)}</div>`;
                return;
            }

            filteredLooks.forEach((look, idx) => {
                const card = document.createElement('div');
                card.className = 'look-card';
                card.dataset.index = idx;
                
                // Мультиязычность данных образа
                const t = look.translations && look.translations[lang] ? look.translations[lang] : look;
                const title = t.title || look.title;
                const tagline = t.tagline || look.tagline;
                const speech = t.speech || look.speech;

                card.innerHTML = `
                    <div class="look-card-image">
                        <img src="${look.backgroundImage}" alt="${WRJ_UTILS.sanitize(title)}">
                    </div>
                    <div class="look-card-info">
                        <span class="season-tag">${WRJ_UTILS.sanitize(tagline)}</span>
                        <h3>${WRJ_UTILS.sanitize(title)}</h3>
                        <p>${WRJ_UTILS.sanitize(speech)}</p>
                    </div>
                `;
                
                album.appendChild(card);
            });

            updateStack();
        };

        const updateStack = () => {
            const cards = album.querySelectorAll('.look-card');
            const total = filteredLooks.length;
            if (total === 0) return;

            cards.forEach((card, i) => {
                const idx = parseInt(card.dataset.index);
                card.classList.remove('top', 'mid', 'bottom', 'hidden', 'exit-right', 'exit-left');

                let pos = (idx - currentIndex + total) % total;

                if (pos === 0) {
                    card.classList.add('top');
                } else if (pos === 1) {
                    card.classList.add('mid');
                } else if (pos === 2) {
                    card.classList.add('bottom');
                } else {
                    card.classList.add('hidden');
                }
            });
        };

        const prevCard = () => {
            if (isAnimating || filteredLooks.length <= 1) return;
            isAnimating = true;

            const topCard = album.querySelector('.look-card.top');
            if (topCard) {
                topCard.classList.add('hidden');
                
                currentIndex = (currentIndex - 1 + filteredLooks.length) % filteredLooks.length;
                updateStack();

                setTimeout(() => {
                    isAnimating = false;
                }, 500);
            }
        };

        const nextCard = () => {
            if (isAnimating || filteredLooks.length <= 1) return;
            isAnimating = true;

            const topCard = album.querySelector('.look-card.top');
            if (topCard) {
                topCard.classList.add('exit-right');
                
                const midCard = album.querySelector('.look-card.mid');
                if (midCard) {
                    midCard.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    midCard.classList.remove('mid');
                    midCard.classList.add('top');
                }

                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % filteredLooks.length;
                    updateStack();
                }, 300);

                setTimeout(() => {
                    isAnimating = false;
                }, 600);
            } else {
                isAnimating = false;
            }
        };

        album.addEventListener('click', (e) => {
            if (e.target.closest('.look-card-info')) return;
            nextCard();
        });

        let startX = 0;
        album.addEventListener('mousedown', (e) => startX = e.clientX);
        album.addEventListener('mouseup', (e) => {
            const diffX = e.clientX - startX;
            if (diffX < -50) nextCard();
            if (diffX > 50) prevCard(); 
        });

        album.addEventListener('touchstart', (e) => startX = e.touches[0].clientX, {passive: true});
        album.addEventListener('touchend', (e) => {
            const diffX = e.changedTouches[0].clientX - startX;
            if (diffX < -50) nextCard();
            if (diffX > 50) prevCard(); 
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.currentCategory = btn.getAttribute('data-filter');
                currentIndex = 0;
                render();
            });
        });

        seasonNavItems.forEach(item => {
            item.addEventListener('click', () => {
                seasonNavItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.state.currentSeason = item.getAttribute('data-season');
                currentIndex = 0;
                render();
            });
        });

        document.getElementById('prevCard')?.addEventListener('click', prevCard);
        document.getElementById('nextCardBtn')?.addEventListener('click', nextCard);

        render();
    },

    renderHotspots: function() {
        hsCard = document.getElementById('hotspotCard');
        hsName = document.getElementById('hsName');
        hsPrice = document.getElementById('hsPrice');
        
        const containers = document.querySelectorAll('.look-explorer-container[data-look-id]');

        containers.forEach(container => {
            const look = looksData.find(l => l.id === container.getAttribute('data-look-id'));
            if (!look) return;

            if (!container.querySelector('img')) {
                const img = document.createElement('img');
                img.src = look.backgroundImage;
                container.appendChild(img);
            }

            container.querySelectorAll('.hotspot').forEach(h => h.remove());
            look.hotspots.forEach(spot => {
                const hs = document.createElement('div');
                hs.className = 'hotspot magic';
                hs.style.top = spot.top;
                hs.style.left = spot.left;
                hs.setAttribute('data-product-id', spot.productId);
                container.appendChild(hs);
            });
        });

        let hideTimeout;
        const lang = this.state.currentLang;
        const cur = this.state.currentCurrency;

        document.addEventListener('mouseover', (e) => {
            const hs = e.target.closest('.hotspot');
            const card = e.target.closest('.hotspot-card');
            
            if (hs) {
                if (!hsCard) initHotspotElements();
                if (!hsCard) return;
                clearTimeout(hideTimeout);
                const p = productsData.find(item => item.id === hs.getAttribute('data-product-id'));
                if (p) {
                    const cont = hs.closest('.look-explorer-container');
                    if (hsCard.parentElement !== cont) cont.appendChild(hsCard);
                    
                    const t = p.translations && p.translations[lang] ? p.translations[lang] : p;
                    hsName.textContent = t.name || p.name;
                    hsPrice.textContent = WRJ_UTILS.formatPrice(t.price || p.price, lang, cur);
                    
                    const link = hsCard.querySelector('.btn-mini');
                    if (link) link.href = `catalog.html?productId=${p.id}`;
                    
                    let left = hs.offsetLeft + 35;
                    if (left > (cont.offsetWidth - 250)) left = hs.offsetLeft - 240;
                    hsCard.style.left = `${left}px`;
                    hsCard.style.top = `${hs.offsetTop - 50}px`;
                    hsCard.classList.add('active');
                }
            } else if (card) clearTimeout(hideTimeout);
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('.hotspot') || e.target.closest('.hotspot-card')) {
                hideTimeout = setTimeout(() => hsCard.classList.remove('active'), 300);
            }
        });
    },

    initDynamicCards: function() {
        console.log("🎲 Initializing Dynamic Cards (Randomizer)...");
        const cards = document.querySelectorAll('.category-card');
        if (cards.length > 0 && typeof productsData !== 'undefined' && productsData.length > 0) {
            cards.forEach(card => {
                const cat = card.getAttribute('data-category');
                if (!cat) return;
                
                const categoryItems = productsData.filter(p => p.category === cat);
                console.log(`🔎 Category [${cat}]: found ${categoryItems.length} items`);

                if (categoryItems.length > 0) {
                    const randomIndex = Math.floor(Math.random() * categoryItems.length);
                    const randomItem = categoryItems[randomIndex];
                    
                    const img = card.querySelector('img');
                    if (img) {
                        console.log(`✨ Setting random img for ${cat}: ${randomItem.id}`);
                        img.src = randomItem.mainImage;
                    }
                }
            });
        } else {
            console.warn("⚠️ productsData is empty or cards not found for randomizer");
        }

        // 2. Секция FAQ
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (!question) return;
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isOpen) item.classList.add('active');
            });
        });
    },

    initCookieBanner: function() {
        if (localStorage.getItem('cookieConsent')) return;
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `<div class="cookie-content"><p>Мы используем файлы cookie. <a href="privacy.html">Подробнее</a></p></div><button class="cookie-btn" id="acceptCookies">Принять</button>`;
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('show'), 100);
        document.getElementById('acceptCookies').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 500);
        });
    }
};

// Инициализация
const startApp = () => {
    if (typeof WRJ_APP !== 'undefined') {
        WRJ_APP.init();
    }
};

// 1. Слушаем событие от компонентов
document.addEventListener('wrjComponentsReady', startApp);

// 2. Если скрипт загрузился ПОЗЖЕ компонентов (они уже в DOM)
if (document.getElementById('mainHeader') && document.getElementById('mainHeader').innerHTML !== '') {
    startApp();
}

// 3. Резервный запуск, если что-то пошло не так
if (document.readyState === 'complete') {
    setTimeout(startApp, 500);
} else {
    window.addEventListener('load', () => setTimeout(startApp, 500));
}

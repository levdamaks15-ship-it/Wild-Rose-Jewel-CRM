/* Wild Rose Jewel - Interactive Logic */

// Глобальный флаг для предотвращения многократной инициализации
if (typeof window.wrjInitialized === 'undefined') {
    window.wrjInitialized = false;
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.wrjInitialized) return;
    window.wrjInitialized = true;
    
    // 1. Управление шапкой при скролле
    const header = document.getElementById('mainHeader');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Боковое меню (Sidebar)
    const menuToggle = document.getElementById('menuToggle');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebarMenu && closeMenuBtn && sidebarOverlay) {
        // Открытие меню
        menuToggle.addEventListener('click', () => {
            sidebarMenu.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        });

        // Закрытие меню
        const closeSidebar = () => {
            sidebarMenu.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeMenuBtn.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // 3. FAQ Аккордеон (только для главной страницы)
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            item.classList.toggle('active');
            const icon = question.querySelector('span');
            if (icon) {
                icon.textContent = item.classList.contains('active') ? '-' : '+';
            }
        });
    });

    // 4. Динамическая отрисовка и фильтрация в каталоге
    const productsGrid = document.getElementById('productsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const seasonBtns = document.querySelectorAll('.season-btn');

    let currentSeason = 'spring';
    let currentCategory = 'all';

    function renderProducts() {
        if (!productsGrid || typeof productsData === 'undefined') return;

        productsGrid.innerHTML = ''; // Очищаем сетку
        
        // Управляем весенней атмосферой
        toggleSpringAtmosphere(currentSeason === 'spring');

        const filteredProducts = productsData.filter(product => 
            product.season === currentSeason && (currentCategory === 'all' || product.category === currentCategory)
        );

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="coming-soon-message" style="grid-column: 1/-1; text-align: center; padding: 100px 20px; opacity: 0.7;">
                    <h2 style="font-family: 'Playfair Display', serif; margin-bottom: 20px;">Скоро здесь будет новая коллекция...</h2>
                    <p>Мы готовим нечто особенное для этого сезона. Следите за обновлениями!</p>
                </div>
            `;
            return;
        }

        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-category', product.category);
            card.style.animation = 'fadeIn 0.5s ease forwards';

            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.mainImage}" alt="${product.name}">
                    ${product.lookModel ? `
                    <div class="look-link" data-model="${product.lookModel}" data-caption="${product.lookCaption || ''}">
                        <i class="eye-icon"></i>
                        <span>Образ</span>
                    </div>
                    ` : ''}
                </div>
                <div class="product-info">
                    <h3>${product.collection ? `<span class="product-collection">${product.collection}:</span> ` : ''}${product.name}</h3>
                    <p class="product-material">${product.material}</p>
                    <p class="product-price">${product.price}</p>
                    <a href="https://vk.com/im?sel=-211475731" target="_blank" class="btn-secondary">Узнать подробности</a>
                </div>
            `;
            productsGrid.appendChild(card);
        });
    }

    // Слушатели для сезонов
    if (seasonBtns.length > 0) {
        seasonBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                seasonBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSeason = btn.getAttribute('data-season');
                // При смене сезона сбрасываем категорию на "Все"
                currentCategory = 'all';
                filterBtns.forEach(b => b.classList.remove('active'));
                const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allBtn) allBtn.classList.add('active');
                
                renderProducts();
            });
        });
    }

    // Слушатели для категорий
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.getAttribute('data-filter');
                renderProducts();
            });
        });
    }

    // --- Весенняя атмосфера (Лепестки) ---
    let springAtmosphereTimeout;

    function toggleSpringAtmosphere(show) {
        let atmosphere = document.querySelector('.spring-atmosphere');
        
        if (show) {
            if (!atmosphere) {
                atmosphere = document.createElement('div');
                atmosphere.className = 'spring-atmosphere';
                const catalogSection = document.querySelector('.catalog-section');
                if (catalogSection) catalogSection.appendChild(atmosphere);
                
                // Создаем лепестки
                for (let i = 0; i < 20; i++) {
                    createPetal(atmosphere);
                }
            }

            // Перезапускаем таймер на удаление через 5 секунд (всегда, если Весна активна)
            if (springAtmosphereTimeout) clearTimeout(springAtmosphereTimeout);
            springAtmosphereTimeout = setTimeout(() => {
                toggleSpringAtmosphere(false);
            }, 5000);

        } else {
            if (atmosphere) {
                atmosphere.style.opacity = '0';
                atmosphere.style.transition = 'opacity 2s ease'; // Более плавное исчезновение
                setTimeout(() => { 
                    if(atmosphere && atmosphere.parentNode) atmosphere.remove(); 
                }, 2000);
            }
        }
    }

    function createPetal(container) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 10 + 10;
        
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.left = `${left}%`;
        petal.style.animationDelay = `${delay}s`;
        petal.style.animationDuration = `${duration}s`;
        
        container.appendChild(petal);
    }

    // 5. Плавный скролл до якорей
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            // Если мы находимся не на главной странице (где есть секции), 
            // а кликаем на ссылку вида "index.html#faq", то стандартный переход сработает.
            // Этот скрипт нужен для плавного скролла только в рамках текущей страницы.
            
            // Проверяем, существует ли якорь на текущей странице
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Закрываем боковое меню при клике на ссылку
                if (sidebarMenu && sidebarMenu.classList.contains('active')) {
                    sidebarMenu.classList.remove('active');
                    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }

                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Карусель (горизонтальная прокрутка мышью)
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        let isDown = false;
        let startX;
        let scrollLeft;

        carouselContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            carouselContainer.style.cursor = 'grabbing';
            startX = e.pageX - carouselContainer.offsetLeft;
            scrollLeft = carouselContainer.scrollLeft;
        });
        carouselContainer.addEventListener('mouseleave', () => {
            isDown = false;
            carouselContainer.style.cursor = 'grab';
        });
        carouselContainer.addEventListener('mouseup', () => {
            isDown = false;
            carouselContainer.style.cursor = 'grab';
        });
        carouselContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carouselContainer.offsetLeft;
            const walk = (x - startX) * 2; // скорость прокрутки
            carouselContainer.scrollLeft = scrollLeft - walk;
        });
    }

    // --- Cookie Banner Logic ---
    if (!localStorage.getItem('cookieConsent')) {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>Мы используем обязательные технические файлы cookie для улучшения работы сайта. Продолжая использование сайта, вы даете согласие на обработку данных согласно нашей <a href="privacy.html">Политике конфиденциальности</a>.</p>
            </div>
            <button class="cookie-btn" id="acceptCookies">Принять все</button>
        `;
        document.body.appendChild(banner);

        // Small delay to trigger CSS transition
        setTimeout(() => banner.classList.add('show'), 100);

        document.getElementById('acceptCookies').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 500);
        });
    }

    // --- Look Modal Logic (Event Delegation) ---
    // productsGrid уже объявлена выше в секции 4
    const lookModal = document.getElementById('lookModal');
    const lookModalImg = document.getElementById('lookModalImg');
    const lookModalCaption = document.getElementById('lookModalCaption');
    const closeLookModal = document.getElementById('closeLookModal');

    if (productsGrid && lookModal && lookModalImg && lookModalCaption) {
        // Делегирование событий: слушаем клики на всей сетке
        productsGrid.addEventListener('click', (e) => {
            const link = e.target.closest('.look-link');
            if (link) {
                e.preventDefault();
                e.stopPropagation();
                
                const imgSrc = link.getAttribute('data-model');
                const caption = link.getAttribute('data-caption');
                
                if (imgSrc) {
                    lookModalImg.src = imgSrc;
                    lookModalCaption.textContent = caption || '';
                    lookModal.classList.add('active');
                    document.body.style.overflow = 'hidden'; 
                }
            }
        });
    }

    if (lookModal && closeLookModal) {
        const closeModal = () => {
            lookModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeLookModal.addEventListener('click', closeModal);
        lookModal.addEventListener('click', (e) => {
            if (e.target === lookModal) {
                closeModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lookModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // --- ФИНАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ---
    // Сначала проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const seasonParam = urlParams.get('season');

    if (seasonParam) {
        currentSeason = seasonParam;
        const sBtn = document.querySelector(`.season-btn[data-season="${seasonParam}"]`);
        if (sBtn) {
            seasonBtns.forEach(b => b.classList.remove('active'));
            sBtn.classList.add('active');
        }
    }

    if (categoryParam) {
        currentCategory = categoryParam;
        const cBtn = document.querySelector(`.filter-btn[data-filter="${categoryParam}"]`);
        if (cBtn) {
            filterBtns.forEach(b => b.classList.remove('active'));
            cBtn.classList.add('active');
        }
    }

    // Теперь вызываем отрисовку ОДИН РАЗ в самом конце
    renderProducts();

    console.log("Wild Rose Jewel Site Skills Initialized");
});

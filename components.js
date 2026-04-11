/* Wild Rose Jewel - UI Components */
const WRJ_COMPONENTS = {
    header: `
        <div class="container nav-container">
            <div class="header-left">
                <button class="menu-btn" id="menuToggle" aria-label="Open menu">
                    <div class="menu-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
            </div>
            <div class="header-center">
                <div class="header-nav" id="headerNav">
                    <ul>
                        <li><a href="index.html" data-i18n="nav_home">Главная</a></li>
                        <li><a href="catalog.html" data-i18n="nav_catalog">Каталог</a></li>
                        <li><a href="lookbook.html" data-i18n="nav_lookbook">Образы</a></li>
                        <li><a href="index.html#about" data-i18n="nav_about">О нас</a></li>
                        <li><a href="index.html#faq" data-i18n="nav_faq">Ответы</a></li>
                    </ul>
                </div>
                <div class="sticky-brand">
                    <span data-i18n="logo_name">Мастерская Дикая Роза</span>
                </div>
            </div>
            <div class="header-right">
                <button class="cart-toggle" id="cartToggleBtn" aria-label="Cart">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    <span class="cart-badge" id="cartBadge">0</span>
                </button>
                <a href="index.html" class="header-logo">
                    <img src="assets/WRJ.png" alt="Wild Rose Jewel Logo">
                </a>
                <div class="lang-switcher">
                    <button class="lang-btn active" data-lang="ru">RU</button>
                    <button class="lang-btn" data-lang="kk">KK</button>
                    <button class="lang-btn" data-lang="en">EN</button>
                </div>
            </div>
        </div>
    `,

    sidebar: `
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
        <div class="sidebar-menu" id="sidebarMenu">
            <button class="close-menu" id="closeMenuBtn" aria-label="Закрыть меню">&times;</button>
            <div class="sidebar-content">
                <ul class="sidebar-links">
                    <li><a href="index.html" data-i18n="nav_home">Главная</a></li>
                    <li><a href="catalog.html" data-i18n="nav_catalog">Каталог</a></li>
                    <li><a href="lookbook.html" data-i18n="nav_lookbook">Образы</a></li>
                    <li><a href="index.html#about" class="page-link" data-i18n="nav_about">О нас</a></li>
                    <li><a href="index.html#faq" class="page-link" data-i18n="nav_faq">Ответы</a></li>
                </ul>
                <div class="sidebar-footer">
                    <h4 class="sidebar-contacts-title" data-i18n="contact_us">Контакты</h4>
                    <div class="social-links-side">
                        <a href="https://www.instagram.com/wild_rose_jewel" target="_blank" rel="noopener noreferrer">Instagram</a>
                        <a href="https://t.me/levdamaksim" target="_blank" rel="noopener noreferrer">Telegram</a>
                    </div>
                </div>
            </div>
        </div>
    `,

    footer: `
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <img src="assets/WRJ.png" alt="Logo White">
                    </div>
                    <div class="consumer-corner">
                        <p><strong data-i18n="legal_title">Правовая информация:</strong></p>
                        <p data-i18n="footer_status">Статус: Самозанятый гражданин (НПД)</p>
                        <p data-i18n="footer_contractor">Исполнитель: Руденко Наталия Владимировна</p>
                        <p data-i18n="footer_inn">ИНН: 101501509497</p>
                        <p style="margin-top: 10px;"><a href="privacy.html" data-i18n="footer_privacy" style="color: var(--brand-gold); text-decoration: underline;">Политика конфиденциальности</a></p>
                    </div>
                </div>
                
                <div class="footer-links footer-links-aligned">
                    <p><strong data-i18n="contact_us">Свяжитесь с нами</strong></p>
                    <ul>
                        <li><a href="https://www.instagram.com/wild_rose_jewel" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                        <li><a href="https://t.me/levdamaksim" target="_blank" rel="noopener noreferrer">Telegram</a></li>
                    </ul>
                </div>
            </div>

            <div class="copyright">
                <p data-i18n="footer_copyright">© 2026 Мастерская Дикая Роза / Wild Rose Jewel. Все права защищены. Сделано с любовью.</p>
            </div>
        </div>
    `,

    common: `
        <!-- Карточка-подсказка хотспота -->
        <div class="hotspot-card" id="hotspotCard">
            <h4 id="hsName">Украшение</h4>
            <p id="hsPrice">По запросу</p>
            <a href="catalog.html" class="btn-mini" data-i18n="btn_details">В каталог</a>
        </div>

        <!-- Модальное окно Образы -->
        <div id="lookModal" class="look-modal">
            <span class="close-modal" id="closeLookModal">&times;</span>
            <div class="modal-content">
                <img id="lookModalImg" src="" alt="Образ модели">
                <div class="modal-caption" id="lookModalCaption"></div>
            </div>
        </div>
        
        <!-- Оверлей корзины -->
        <div class="cart-overlay" id="cartOverlay"></div>
        <!-- Боковая панель корзины -->
        <div class="cart-drawer" id="cartDrawer">
            <div class="cart-header">
                <h3 data-i18n="cart_title">Ваша корзина</h3>
                <button class="close-cart" id="closeCartBtn" aria-label="Закрыть корзину">&times;</button>
            </div>
            <div class="cart-items" id="cartItemsContainer">
                <!-- Товары будут добавлены через JS -->
            </div>
            <div class="cart-footer">
                <div class="cart-total-row">
                    <span data-i18n="cart_total">Итого</span>
                    <span class="cart-total-price" id="cartTotalPrice">0 ₽</span>
                </div>
                <button class="btn-primary cart-checkout-btn" id="cartCheckoutBtn" data-i18n="cart_checkout">Оформить в WhatsApp</button>
            </div>
        </div>
    `
};

// Самоинициализация компонентов
(function() {
    function inject() {
        const headerPlaceholder = document.getElementById('mainHeader');
        const sidebarPlaceholder = document.getElementById('sidebarComponents');
        const footerPlaceholder = document.getElementById('contacts');

        if (headerPlaceholder) headerPlaceholder.innerHTML = WRJ_COMPONENTS.header;
        if (sidebarPlaceholder) sidebarPlaceholder.innerHTML = WRJ_COMPONENTS.sidebar;
        if (footerPlaceholder) footerPlaceholder.innerHTML = WRJ_COMPONENTS.footer;

        // Впрыскиваем общие скрытые компоненты (модалки, карточки хотспотов)
        if (WRJ_COMPONENTS.common && !document.getElementById('wrjCommonComponents')) {
            const commonDiv = document.createElement('div');
            commonDiv.id = 'wrjCommonComponents';
            commonDiv.innerHTML = WRJ_COMPONENTS.common;
            document.body.appendChild(commonDiv);
        }

        // Фикс активных ссылок
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.header-nav a, .sidebar-links a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });

        // Уведомляем систему о готовности компонентов
        document.dispatchEvent(new CustomEvent('wrjComponentsReady'));
        console.log("💎 WRJ Components Hydrated");
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();

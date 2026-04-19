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
                        <a href="https://www.instagram.com/wild_rose_jewel" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324 4.162 4.162 0 010 8.324zM18.406 3.506a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>
                        </a>
                        <a href="https://t.me/levdamaksim" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 1.589 4.826c.19.527.098.737.66.737.43 0 .626-.197.864-.427l2.08-2.022 4.314 3.187c.793.438 1.364.213 1.562-.738l2.844-13.414c.29-1.16-.442-1.688-1.203-1.348z"/></svg>
                        </a>
                        <a href="https://wa.me/77000000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.1-.47-.15-.665.15-.195.3-.757.942-.927 1.137-.17.194-.339.219-.64.07-.3-.15-1.263-.465-2.403-1.485-.888-.792-1.487-1.77-1.662-2.07-.174-.3-.019-.462.13-.61.135-.133.301-.35.452-.52.15-.174.198-.298.3-.497.101-.198.05-.371-.026-.52-.075-.149-.665-1.604-.911-2.198-.239-.575-.483-.498-.665-.507-.172-.008-.368-.01-.564-.01-.196 0-.516.075-.785.371-.27.298-1.026 1.003-1.026 2.446 0 1.443 1.05 2.84 1.196 3.037.147.198 2.067 3.155 5.006 4.43.7.303 1.246.484 1.673.619.704.224 1.345.193 1.851.118.564-.084 1.767-.721 2.017-1.417.25-.694.25-1.289.175-1.416-.075-.126-.276-.198-.57-.348h-.001zm-5.437 7.02c-1.802 0-3.57-.487-5.11-1.405L2.8 21.042l1.085-3.992a9.61 9.61 0 01-1.278-4.83c0-5.304 4.316-9.617 9.632-9.617 2.578 0 5.002 1.002 6.824 2.825a9.61 9.61 0 012.822 6.827c0 5.304-4.314 9.617-9.63 9.617h-.001zM12.03 0C5.385 0 .012 5.371.012 12.013c0 2.126.552 4.197 1.604 6.02L0 24l6.143-1.61c1.766 1.025 3.774 1.566 5.86 1.566h.01C18.667 23.956 24 18.585 24 11.933c0-3.226-1.257-6.257-3.535-8.536A11.94 11.94 0 0012.03 0z"/></svg>
                        </a>
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
                    <div class="social-links">
                        <a href="https://www.instagram.com/wild_rose_jewel" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324 4.162 4.162 0 010 8.324zM18.406 3.506a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>
                        </a>
                        <a href="https://t.me/levdamaksim" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 1.589 4.826c.19.527.098.737.66.737.43 0 .626-.197.864-.427l2.08-2.022 4.314 3.187c.793.438 1.364.213 1.562-.738l2.844-13.414c.29-1.16-.442-1.688-1.203-1.348z"/></svg>
                        </a>
                        <a href="https://wa.me/77000000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.1-.47-.15-.665.15-.195.3-.757.942-.927 1.137-.17.194-.339.219-.64.07-.3-.15-1.263-.465-2.403-1.485-.888-.792-1.487-1.77-1.662-2.07-.174-.3-.019-.462.13-.61.135-.133.301-.35.452-.52.15-.174.198-.298.3-.497.101-.198.05-.371-.026-.52-.075-.149-.665-1.604-.911-2.198-.239-.575-.483-.498-.665-.507-.172-.008-.368-.01-.564-.01-.196 0-.516.075-.785.371-.27.298-1.026 1.003-1.026 2.446 0 1.443 1.05 2.84 1.196 3.037.147.198 2.067 3.155 5.006 4.43.7.303 1.246.484 1.673.619.704.224 1.345.193 1.851.118.564-.084 1.767-.721 2.017-1.417.25-.694.25-1.289.175-1.416-.075-.126-.276-.198-.57-.348h-.001zm-5.437 7.02c-1.802 0-3.57-.487-5.11-1.405L2.8 21.042l1.085-3.992a9.61 9.61 0 01-1.278-4.83c0-5.304 4.316-9.617 9.632-9.617 2.578 0 5.002 1.002 6.824 2.825a9.61 9.61 0 012.822 6.827c0 5.304-4.314 9.617-9.63 9.617h-.001zM12.03 0C5.385 0 .012 5.371.012 12.013c0 2.126.552 4.197 1.604 6.02L0 24l6.143-1.61c1.766 1.025 3.774 1.566 5.86 1.566h.01C18.667 23.956 24 18.585 24 11.933c0-3.226-1.257-6.257-3.535-8.536A11.94 11.94 0 0012.03 0z"/></svg>
                        </a>
                    </div>
                </div>

            </div>

            <div class="copyright">
                <p data-i18n="footer_copyright">© 2026 Мастерская Дикая Роза / Wild Rose Jewel. Все права защищены. Сделано с любовью.</p>
            </div>
        </div>
    `,

    common: `
        <!-- Модальное окно Образы -->

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

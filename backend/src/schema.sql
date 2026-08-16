-- Wild Rose Jewel PostgreSQL Database Schema

-- 1. Таблица товаров каталога (Products)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    capsule VARCHAR(128),
    price NUMERIC(12, 2) NOT NULL,
    old_price NUMERIC(12, 2),
    status VARCHAR(32) DEFAULT 'in_stock',
    is_new BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    metal VARCHAR(255),
    stones VARCHAR(255),
    sizes JSONB DEFAULT '["Standard"]'::jsonb,
    weight VARCHAR(64),
    lock_type VARCHAR(128),
    main_image TEXT NOT NULL,
    hover_image TEXT,
    detail_images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    story TEXT,
    style_advice TEXT,
    care TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Таблица секций конструктора главной страницы (Page Sections)
CREATE TABLE IF NOT EXISTS page_sections (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    button_text VARCHAR(128),
    button_link VARCHAR(255),
    image_url TEXT,
    text TEXT,
    extra_data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Таблица интерактивных меток лукбука (Lookbook Hotspots)
CREATE TABLE IF NOT EXISTS lookbook_hotspots (
    id VARCHAR(64) PRIMARY KEY,
    section_id VARCHAR(64) NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    top VARCHAR(32) NOT NULL,
    left_coord VARCHAR(32) NOT NULL,
    label VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Таблица заказов покупателей (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    status VARCHAR(32) DEFAULT 'new',
    items JSONB NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(64),
    customer_email VARCHAR(255),
    delivery_city VARCHAR(128),
    delivery_address TEXT,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Таблица настроек сайта и интеграций (Site Settings)
CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрой фильтрации и поиска
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_sections_order ON page_sections(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_hotspots_section ON lookbook_hotspots(section_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

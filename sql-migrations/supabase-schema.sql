-- Esquema de base de datos para Mercadillo Lima Perú
-- Ejecutar este script en Supabase SQL Editor

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (se sincroniza con Clerk)
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY, -- ID de Clerk
    email TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT,
    rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    imagen TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    imagen TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria TEXT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    items JSONB NOT NULL, -- Array de items del pedido
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    igv DECIMAL(10,2) NOT NULL CHECK (igv >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'procesando', 'enviado', 'entregado', 'cancelado', 'fallido')),
    direccion_envio TEXT NOT NULL,
    metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('mercadopago', 'transferencia', 'efectivo')),
    -- Campos específicos de MercadoPago
    mercadopago_preference_id TEXT,
    mercadopago_payment_id TEXT,
    mercadopago_status TEXT DEFAULT 'pending',
    mercadopago_status_detail TEXT,
    mercadopago_payment_type TEXT,
    mercadopago_external_reference TEXT,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS resenas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id, pedido_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at);
CREATE INDEX IF NOT EXISTS idx_resenas_producto_id ON resenas(producto_id);

-- Índices específicos para MercadoPago
CREATE INDEX IF NOT EXISTS idx_pedidos_mercadopago_preference_id ON pedidos(mercadopago_preference_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_mercadopago_payment_id ON pedidos(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_mercadopago_status ON pedidos(mercadopago_status);
CREATE INDEX IF NOT EXISTS idx_pedidos_external_reference ON pedidos(mercadopago_external_reference);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para actualizar estado del pedido basado en el estado de MercadoPago
CREATE OR REPLACE FUNCTION update_order_status_from_mercadopago()
RETURNS TRIGGER AS $$
BEGIN
    -- Mapear estados de MercadoPago a estados de pedido
    CASE NEW.mercadopago_status
        WHEN 'approved' THEN 
            NEW.estado = 'pagado';
            NEW.fecha_pago = NOW();
        WHEN 'pending' THEN 
            NEW.estado = 'pendiente';
        WHEN 'in_process' THEN 
            NEW.estado = 'pendiente';
        WHEN 'cancelled' THEN 
            NEW.estado = 'cancelado';
        WHEN 'rejected' THEN 
            NEW.estado = 'fallido';
        ELSE 
            -- Mantener estado actual si no reconocemos el estado de MP
            NULL;
    END CASE;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resenas_updated_at BEFORE UPDATE ON resenas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar estado automáticamente basado en MercadoPago
CREATE TRIGGER update_pedido_status_from_mp 
    BEFORE UPDATE ON pedidos
    FOR EACH ROW 
    WHEN (OLD.mercadopago_status IS DISTINCT FROM NEW.mercadopago_status)
    EXECUTE FUNCTION update_order_status_from_mercadopago();

-- Políticas de seguridad (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON usuarios
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Admins pueden ver todos los usuarios" ON usuarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text AND rol = 'admin'
        )
    );

-- Políticas para productos
CREATE POLICY "Todos pueden ver productos activos" ON productos
    FOR SELECT USING (activo = true);

CREATE POLICY "Admins pueden gestionar productos" ON productos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text AND rol = 'admin'
        )
    );

-- Políticas para pedidos
CREATE POLICY "Usuarios pueden ver sus propios pedidos" ON pedidos
    FOR SELECT USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden crear pedidos" ON pedidos
    FOR INSERT WITH CHECK (auth.uid()::text = usuario_id);

CREATE POLICY "Sistema puede actualizar pedidos via webhook" ON pedidos
    FOR UPDATE USING (true);  -- Para webhooks de MercadoPago

CREATE POLICY "Admins pueden ver todos los pedidos" ON pedidos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text AND rol = 'admin'
        )
    );

-- Políticas para reseñas
CREATE POLICY "Usuarios pueden ver reseñas" ON resenas
    FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden crear reseñas si compraron el producto" ON resenas
    FOR INSERT WITH CHECK (
        auth.uid()::text = usuario_id AND
        EXISTS (
            SELECT 1 FROM pedidos 
            WHERE id = pedido_id 
            AND usuario_id = auth.uid()::text 
            AND estado IN ('pagado', 'entregado')
            AND JSON_EXTRACT_PATH_TEXT(items::json, '$[*].id') LIKE '%' || producto_id::text || '%'
        )
    );

CREATE POLICY "Usuarios pueden actualizar sus propias reseñas" ON resenas
    FOR UPDATE USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus propias reseñas" ON resenas
    FOR DELETE USING (auth.uid()::text = usuario_id);

-- Insertar categorías iniciales
INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónicos', 'Dispositivos electrónicos y tecnología'),
('Ropa', 'Ropa y accesorios de moda'),
('Hogar', 'Artículos para el hogar y decoración'),
('Deportes', 'Equipos y accesorios deportivos'),
('Libros', 'Libros y material educativo'),
('Otros', 'Otros productos diversos')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, imagen, stock, categoria) VALUES
('Smartphone Samsung Galaxy A54', 'Teléfono inteligente con cámara de 50MP y pantalla AMOLED de 6.4"', 1299.00, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', 15, 'Electrónicos'),
('Laptop HP Pavilion 15', 'Laptop con procesador Intel i5, 8GB RAM y 256GB SSD', 2499.00, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', 8, 'Electrónicos'),
('Camiseta Nike Dri-FIT', 'Camiseta deportiva de secado rápido, talla M', 89.90, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 25, 'Ropa'),
('Zapatillas Adidas Ultraboost', 'Zapatillas de running con tecnología Boost', 599.90, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 12, 'Ropa'),
('Sofá 3 Plazas Gris', 'Sofá moderno de tela gris, perfecto para sala', 899.00, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', 5, 'Hogar'),
('Mesa de Centro de Madera', 'Mesa de centro de madera maciza, diseño minimalista', 299.90, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', 10, 'Hogar'),
('Pelota de Fútbol Adidas', 'Pelota oficial de fútbol, tamaño 5', 129.90, 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500', 20, 'Deportes'),
('Raqueta de Tenis Wilson', 'Raqueta de tenis profesional, peso 300g', 399.90, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', 7, 'Deportes')
ON CONFLICT DO NOTHING;



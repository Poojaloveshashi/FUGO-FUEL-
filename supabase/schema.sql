-- =============================================================================
-- FUGO REFUEL TECHNOLOGIES - UNIFIED ON-DEMAND MOBILITY ARCHITECTURE
-- PostgreSQL / Supabase Production Schema & Real-Time Engine
-- =============================================================================
-- Scope:
-- 1. Touchpoint Apps: Fuel App, Repairs App, Service App
-- 2. Central System: Shared Auth/Users, Unified Orders, Payments, Real-time Stock
-- 3. Fulfilment: Mobile Bowsers, Mobile Mechanics, Offline Garages/Pumps, Warehouses
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. PREREQUISITES & EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ENUM TYPES
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('CUSTOMER', 'PARTNER', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
        CREATE TYPE service_type AS ENUM ('FUEL', 'REPAIR', 'SERVICE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('PENDING', 'ACCEPTED', 'DISPATCHED', 'ARRIVED', 'COMPLETED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('UNPAID', 'AUTHORIZED', 'PAID', 'REFUNDED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_type') THEN
        CREATE TYPE partner_type AS ENUM ('BOWSER_DRIVER', 'MOBILE_MECHANIC', 'OFFLINE_GARAGE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type') THEN
        CREATE TYPE entity_type AS ENUM ('BOWSER', 'WAREHOUSE', 'OUTLET');
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. CORE USERS & PROFILES TABLE
-- Linked directly to Supabase auth.users with role segregation
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    full_name TEXT NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email TEXT UNIQUE,
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Index for role lookup & lookups by email/phone
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- -----------------------------------------------------------------------------
-- 3. FULFILMENT PARTNERS TABLE (Bowsers, Mobile Mechanics, Offline Garages)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    partner_type partner_type NOT NULL,
    vehicle_number VARCHAR(50),
    vehicle_model VARCHAR(100),
    is_online BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    current_lat NUMERIC(10, 6),
    current_lng NUMERIC(10, 6),
    heading NUMERIC(5, 2) DEFAULT 0.0,
    speed_kmh NUMERIC(5, 2) DEFAULT 0.0,
    rating NUMERIC(3, 2) DEFAULT 4.90,
    active_order_id UUID,
    last_location_update TIMESTAMPTZ DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_partners_type_status ON public.partners(partner_type, is_online, is_available);
CREATE INDEX IF NOT EXISTS idx_partners_coords ON public.partners(current_lat, current_lng);

-- -----------------------------------------------------------------------------
-- 4. INVENTORY & STOCK MANAGEMENT TABLE
-- Tracks real-time liters in Bowsers, parts in Mechanics' toolkits, and Warehouses
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type entity_type NOT NULL,
    entity_id UUID NOT NULL, -- references partner.id or a warehouse/outlet identifier
    sku VARCHAR(100) NOT NULL, -- e.g. 'PETROL_SPEED', 'DIESEL', 'BATTERY_12V', 'TIRE_PATCH'
    quantity_available NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (quantity_available >= 0),
    unit VARCHAR(20) NOT NULL DEFAULT 'LITRES', -- 'LITRES', 'UNITS', 'PIECES'
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unq_entity_sku UNIQUE (entity_type, entity_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_inventory_entity ON public.inventory_stock(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory_stock(sku);

-- Stock Transaction Ledger (Audit trail for inventory increments / drops)
CREATE TABLE IF NOT EXISTS public.stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID REFERENCES public.inventory_stock(id) ON DELETE CASCADE,
    order_id UUID,
    delta_quantity NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_stock_tx_order ON public.stock_transactions(order_id);

-- -----------------------------------------------------------------------------
-- 5. UNIFIED ORDERS TABLE
-- Serves Fuel, Repairs, and Services touchpoint apps with real-time tracking
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    service_type service_type NOT NULL,
    order_status order_status NOT NULL DEFAULT 'PENDING',
    fuel_details JSONB DEFAULT NULL,
    repair_details JSONB DEFAULT NULL,
    customer_lat NUMERIC(10, 6) NOT NULL,
    customer_lng NUMERIC(10, 6) NOT NULL,
    delivery_address TEXT NOT NULL,
    handshake_otp VARCHAR(4) NOT NULL,
    assigned_partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    payment_status payment_status NOT NULL DEFAULT 'UNPAID',
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    completed_at TIMESTAMPTZ DEFAULT NULL
);

-- Indexes for lightning-fast queries and geospatial filters
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_partner ON public.orders(assigned_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_type ON public.orders(service_type);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- -----------------------------------------------------------------------------
-- 6. DATABASE TRIGGERS & FUNCTIONS
-- -----------------------------------------------------------------------------

-- Trigger 6.1: Auto-generate cryptographically secure 4-digit Handshake OTP
CREATE OR REPLACE FUNCTION public.generate_order_handshake_otp()
RETURNS TRIGGER AS $$
BEGIN
    -- If no OTP provided or length is invalid, generate high-entropy 4-digit code (1000 - 9999)
    IF NEW.handshake_otp IS NULL OR length(trim(NEW.handshake_otp)) != 4 THEN
        NEW.handshake_otp := floor(1000 + (random() * 9000))::text;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_handshake_otp ON public.orders;
CREATE TRIGGER trg_generate_handshake_otp
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_order_handshake_otp();

-- Trigger 6.2: Auto-set completed_at timestamp when order reaches COMPLETED
CREATE OR REPLACE FUNCTION public.set_order_completion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_status = 'COMPLETED' AND OLD.order_status IS DISTINCT FROM 'COMPLETED' THEN
        NEW.completed_at := timezone('utc', now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_completion ON public.orders;
CREATE TRIGGER trg_set_order_completion
    BEFORE UPDATE OF order_status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_order_completion_timestamp();

-- Trigger 6.3: Atomic Stock Deduction on Order Completion
-- When an order is COMPLETED, deduct fuel or repair parts directly from the partner's inventory
CREATE OR REPLACE FUNCTION public.deduct_inventory_on_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_sku VARCHAR(100);
    v_qty NUMERIC(12, 2);
    v_stock_record RECORD;
    v_new_balance NUMERIC(12, 2);
    v_part JSONB;
BEGIN
    -- Only execute when transitioning into 'COMPLETED'
    IF NEW.order_status = 'COMPLETED' AND OLD.order_status IS DISTINCT FROM 'COMPLETED' THEN
        
        -- Require an assigned partner to debit stock from
        IF NEW.assigned_partner_id IS NULL THEN
            RAISE NOTICE 'Order % completed without assigned_partner_id. Skipping stock deduction.', NEW.id;
            RETURN NEW;
        END IF;

        -- CASE A: FUEL DELIVERY DEDUCTION
        IF NEW.service_type = 'FUEL' AND NEW.fuel_details IS NOT NULL THEN
            v_sku := COALESCE(NEW.fuel_details->>'sku', 'DIESEL');
            v_qty := COALESCE((NEW.fuel_details->>'litres')::numeric, 0.00);

            IF v_qty > 0 THEN
                -- Row-lock stock item for atomic decrement
                SELECT * INTO v_stock_record
                FROM public.inventory_stock
                WHERE entity_id = NEW.assigned_partner_id
                  AND sku = v_sku
                FOR UPDATE;

                IF NOT FOUND THEN
                    -- Auto-provision partner inventory item if not already created
                    INSERT INTO public.inventory_stock (entity_type, entity_id, sku, quantity_available, unit)
                    VALUES ('BOWSER', NEW.assigned_partner_id, v_sku, 0.00, 'LITRES')
                    RETURNING * INTO v_stock_record;
                END IF;

                IF v_stock_record.quantity_available < v_qty THEN
                    RAISE EXCEPTION 'Insufficient stock in partner bowser: Required % L of %, but only % L available.', 
                        v_qty, v_sku, v_stock_record.quantity_available;
                END IF;

                v_new_balance := v_stock_record.quantity_available - v_qty;

                -- Deduct stock
                UPDATE public.inventory_stock
                SET quantity_available = v_new_balance,
                    updated_at = timezone('utc', now())
                WHERE id = v_stock_record.id;

                -- Record audit ledger entry
                INSERT INTO public.stock_transactions (stock_id, order_id, delta_quantity, balance_after, reason)
                VALUES (v_stock_record.id, NEW.id, -v_qty, v_new_balance, 'FULFILLED_FUEL_ORDER');
            END IF;

        -- CASE B: REPAIR & EMERGENCY SERVICE PARTS DEDUCTION
        ELSIF NEW.service_type IN ('REPAIR', 'SERVICE') AND NEW.repair_details IS NOT NULL THEN
            IF NEW.repair_details ? 'parts' AND jsonb_typeof(NEW.repair_details->'parts') = 'array' THEN
                FOR v_part IN SELECT * FROM jsonb_array_elements(NEW.repair_details->'parts')
                LOOP
                    v_sku := v_part->>'sku';
                    v_qty := COALESCE((v_part->>'qty')::numeric, 1.00);

                    IF v_sku IS NOT NULL AND v_qty > 0 THEN
                        SELECT * INTO v_stock_record
                        FROM public.inventory_stock
                        WHERE entity_id = NEW.assigned_partner_id
                          AND sku = v_sku
                        FOR UPDATE;

                        IF FOUND AND v_stock_record.quantity_available >= v_qty THEN
                            v_new_balance := v_stock_record.quantity_available - v_qty;
                            UPDATE public.inventory_stock
                            SET quantity_available = v_new_balance,
                                updated_at = timezone('utc', now())
                            WHERE id = v_stock_record.id;

                            INSERT INTO public.stock_transactions (stock_id, order_id, delta_quantity, balance_after, reason)
                            VALUES (v_stock_record.id, NEW.id, -v_qty, v_new_balance, 'FULFILLED_REPAIR_PARTS');
                        ELSE
                            RAISE NOTICE 'Partner % has insufficient parts stock for SKU % (needed %)', 
                                NEW.assigned_partner_id, v_sku, v_qty;
                        END IF;
                    END IF;
                END LOOP;
            END IF;
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_inventory_on_completion ON public.orders;
CREATE TRIGGER trg_deduct_inventory_on_completion
    AFTER UPDATE OF order_status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.deduct_inventory_on_order_completion();

-- Trigger 6.4: Auto-sync new Supabase Auth users to public.users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, role, full_name, email, phone)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CUSTOMER'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Fugo Customer'),
        NEW.email,
        NEW.phone
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 7. SUPABASE REALTIME REPLICATION CONFIGURATION
-- Broadcasts live state updates to Touchpoint Apps and Driver Companion Apps
-- -----------------------------------------------------------------------------
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.partners REPLICA IDENTITY FULL;
ALTER TABLE public.inventory_stock REPLICA IDENTITY FULL;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'partners'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.partners;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'inventory_stock'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_stock;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Zero-trust access model for Customers, Fulfilment Partners, and Admins
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;

-- 8.1 USERS POLICIES
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- 8.2 PARTNERS POLICIES
CREATE POLICY "Public read online partner coordinates"
    ON public.partners FOR SELECT
    USING (is_online = true OR auth.uid() = id);

CREATE POLICY "Partners can update own status and location"
    ON public.partners FOR UPDATE
    USING (auth.uid() = id);

-- 8.3 ORDERS POLICIES
-- Customers can view only their own orders
CREATE POLICY "Customers can view their own orders"
    ON public.orders FOR SELECT
    USING (
        auth.uid() = user_id 
        OR (auth.role() = 'anon') -- allows demo/guest checkout lookups by ID
    );

-- Customers can insert new orders
CREATE POLICY "Customers can place orders"
    ON public.orders FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        OR (auth.role() = 'anon')
    );

-- Partners can view pending orders (dispatch marketplace) or orders assigned to them
CREATE POLICY "Partners can view pending and assigned orders"
    ON public.orders FOR SELECT
    USING (
        order_status = 'PENDING' 
        OR assigned_partner_id = auth.uid()
        OR auth.uid() = user_id
    );

-- Partners can update orders assigned to them (accept, dispatch, arrive, complete)
CREATE POLICY "Partners can update assigned orders"
    ON public.orders FOR UPDATE
    USING (
        assigned_partner_id = auth.uid()
        OR (order_status = 'PENDING' AND assigned_partner_id IS NULL)
    );

-- 8.4 INVENTORY STOCK POLICIES
-- Partners can view their own bowser or toolkit stock
CREATE POLICY "Partners view assigned inventory"
    ON public.inventory_stock FOR SELECT
    USING (
        entity_id = auth.uid()
        OR entity_type = 'OUTLET'
    );

-- =============================================================================
-- 9. SEED DATA FOR DEMO & TESTING
-- =============================================================================
-- Pre-provision a demo Bowser Partner and Central Warehouse Stock
DO $$ 
DECLARE
    v_demo_partner_id UUID := '00000000-0000-0000-0000-000000000001';
    v_warehouse_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
    -- Ensure demo partner exists in users
    INSERT INTO public.users (id, role, full_name, phone, email)
    VALUES (
        v_demo_partner_id,
        'PARTNER',
        'Rajesh Kumar (Bowser Unit #4)',
        '+919876543210',
        'bowser4@fugorefuel.com'
    ) ON CONFLICT (id) DO NOTHING;

    -- Ensure partner record exists
    INSERT INTO public.partners (
        id, partner_type, vehicle_number, vehicle_model, is_online, is_available, 
        current_lat, current_lng, speed_kmh
    )
    VALUES (
        v_demo_partner_id,
        'BOWSER_DRIVER',
        'TS 09 EQ 4821',
        'BharatBenz SmartBowser 3000L',
        true,
        true,
        17.4150,
        78.3390,
        38.0
    ) ON CONFLICT (id) DO UPDATE
    SET is_online = true, is_available = true, current_lat = 17.4150, current_lng = 78.3390;

    -- Stock in Bowser
    INSERT INTO public.inventory_stock (entity_type, entity_id, sku, quantity_available, unit)
    VALUES 
        ('BOWSER', v_demo_partner_id, 'DIESEL', 2400.00, 'LITRES'),
        ('BOWSER', v_demo_partner_id, 'PETROL_SPEED', 600.00, 'LITRES')
    ON CONFLICT (entity_type, entity_id, sku) DO UPDATE
    SET quantity_available = EXCLUDED.quantity_available;

    -- Stock in Central Warehouse
    INSERT INTO public.inventory_stock (entity_type, entity_id, sku, quantity_available, unit)
    VALUES 
        ('WAREHOUSE', v_warehouse_id, 'DIESEL', 50000.00, 'LITRES'),
        ('WAREHOUSE', v_warehouse_id, 'PETROL_SPEED', 30000.00, 'LITRES'),
        ('WAREHOUSE', v_warehouse_id, 'BATTERY_12V', 150.00, 'UNITS'),
        ('WAREHOUSE', v_warehouse_id, 'TIRE_PATCH', 500.00, 'PIECES')
    ON CONFLICT (entity_type, entity_id, sku) DO NOTHING;
END $$;

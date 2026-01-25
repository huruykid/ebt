-- =============================================
-- SAVED LISTS FEATURE
-- =============================================

-- Create user_lists table for custom store collections
CREATE TABLE public.user_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  icon text DEFAULT 'folder',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create list_stores junction table
CREATE TABLE public.list_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.user_lists(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.snap_stores(id) ON DELETE CASCADE,
  notes text,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(list_id, store_id)
);

-- Enable RLS
ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_stores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_lists
CREATE POLICY "Users can view their own lists"
ON public.user_lists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public lists"
ON public.user_lists FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can create their own lists"
ON public.user_lists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
ON public.user_lists FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
ON public.user_lists FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for list_stores
CREATE POLICY "Users can view their list stores"
ON public.list_stores FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_lists 
  WHERE id = list_id AND user_id = auth.uid()
));

CREATE POLICY "Users can add to their lists"
ON public.list_stores FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_lists 
  WHERE id = list_id AND user_id = auth.uid()
));

CREATE POLICY "Users can remove from their lists"
ON public.list_stores FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.user_lists 
  WHERE id = list_id AND user_id = auth.uid()
));

-- =============================================
-- STORE UPDATES FEED FEATURE
-- =============================================

-- Create store_updates table for activity feed
CREATE TABLE public.store_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.snap_stores(id) ON DELETE CASCADE,
  user_id uuid,
  update_type text NOT NULL CHECK (update_type IN ('review', 'photo', 'price', 'tip', 'hours')),
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_updates ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can view updates (community feed)
CREATE POLICY "Anyone can view store updates"
ON public.store_updates FOR SELECT
USING (true);

-- RLS: Authenticated users can create updates
CREATE POLICY "Authenticated users can create updates"
ON public.store_updates FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for feed queries
CREATE INDEX idx_store_updates_created ON public.store_updates(created_at DESC);
CREATE INDEX idx_store_updates_store ON public.store_updates(store_id);

-- =============================================
-- PRICE REPORTING FEATURE
-- =============================================

-- Create store_prices table
CREATE TABLE public.store_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.snap_stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  product_name text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price > 0),
  unit text DEFAULT 'each',
  is_sale boolean DEFAULT false,
  verified_count integer DEFAULT 0,
  reported_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Create price_verifications for crowdsourced accuracy
CREATE TABLE public.price_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_id uuid NOT NULL REFERENCES public.store_prices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  is_accurate boolean NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(price_id, user_id)
);

-- Enable RLS
ALTER TABLE public.store_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_verifications ENABLE ROW LEVEL SECURITY;

-- RLS for store_prices
CREATE POLICY "Anyone can view prices"
ON public.store_prices FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can report prices"
ON public.store_prices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prices"
ON public.store_prices FOR UPDATE
USING (auth.uid() = user_id);

-- RLS for price_verifications
CREATE POLICY "Anyone can view verifications"
ON public.price_verifications FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can verify prices"
ON public.price_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for price queries (without time-based predicate)
CREATE INDEX idx_store_prices_store ON public.store_prices(store_id);
CREATE INDEX idx_store_prices_expires ON public.store_prices(expires_at);

-- Trigger to update verified_count
CREATE OR REPLACE FUNCTION public.update_price_verified_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.store_prices
  SET verified_count = (
    SELECT COUNT(*) FROM public.price_verifications 
    WHERE price_id = NEW.price_id AND is_accurate = true
  )
  WHERE id = NEW.price_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_verified_count
AFTER INSERT ON public.price_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_price_verified_count();

-- Function to auto-create store update on new price report
CREATE OR REPLACE FUNCTION public.create_price_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.store_updates (store_id, user_id, update_type, title, description, metadata)
  VALUES (
    NEW.store_id,
    NEW.user_id,
    'price',
    NEW.product_name || ' - $' || NEW.price::text,
    CASE WHEN NEW.is_sale THEN 'Sale price reported' ELSE 'Price reported' END,
    jsonb_build_object('price_id', NEW.id, 'price', NEW.price, 'unit', NEW.unit)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_price_update
AFTER INSERT ON public.store_prices
FOR EACH ROW
EXECUTE FUNCTION public.create_price_update();
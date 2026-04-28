-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  country TEXT DEFAULT 'IE',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'lapsed', 'trialing')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'eur',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- GOLF SCORES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.golf_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, score_date)
);

ALTER TABLE public.golf_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scores" ON public.golf_scores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all scores" ON public.golf_scores
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function: enforce max 5 scores per user (FIFO - oldest removed)
CREATE OR REPLACE FUNCTION enforce_max_scores()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.golf_scores
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM public.golf_scores
      WHERE user_id = NEW.user_id
      ORDER BY score_date DESC
      LIMIT 4
    )
    AND id != NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_max_scores_trigger
  AFTER INSERT ON public.golf_scores
  FOR EACH ROW EXECUTE FUNCTION enforce_max_scores();

-- ============================================================
-- CHARITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.charities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  logo_url TEXT,
  images TEXT[] DEFAULT '{}',
  website_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  upcoming_events JSONB DEFAULT '[]',
  total_raised NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active charities" ON public.charities
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage charities" ON public.charities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- CHARITY SELECTIONS (user -> charity mapping)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.charity_selections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
  contribution_percentage INTEGER NOT NULL DEFAULT 10 CHECK (contribution_percentage >= 10 AND contribution_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.charity_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own charity selection" ON public.charity_selections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all charity selections" ON public.charity_selections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- INDEPENDENT DONATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.independent_donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.independent_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own donations" ON public.independent_donations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all donations" ON public.independent_donations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- DRAWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.draws (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_month INTEGER NOT NULL CHECK (draw_month >= 1 AND draw_month <= 12),
  draw_year INTEGER NOT NULL,
  draw_type TEXT NOT NULL DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  winning_numbers INTEGER[] DEFAULT '{}',
  total_pool_cents INTEGER DEFAULT 0,
  jackpot_pool_cents INTEGER DEFAULT 0,
  four_match_pool_cents INTEGER DEFAULT 0,
  three_match_pool_cents INTEGER DEFAULT 0,
  rollover_cents INTEGER DEFAULT 0,
  active_subscribers INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  simulation_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (draw_month, draw_year)
);

ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published draws" ON public.draws
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all draws" ON public.draws
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- DRAW ENTRIES (user score snapshots for each draw)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.draw_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scores INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (draw_id, user_id)
);

ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own draw entries" ON public.draw_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all draw entries" ON public.draw_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- DRAW RESULTS (winners)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.draw_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_count INTEGER NOT NULL CHECK (match_count IN (3, 4, 5)),
  matched_numbers INTEGER[] DEFAULT '{}',
  prize_amount_cents INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own results" ON public.draw_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all results" ON public.draw_results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- WINNER VERIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.winner_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_result_id UUID REFERENCES public.draw_results(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  proof_url TEXT NOT NULL,
  admin_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.winner_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own verifications" ON public.winner_verifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all verifications" ON public.winner_verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- JACKPOT ROLLOVERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jackpot_rollovers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_draw_id UUID REFERENCES public.draws(id),
  to_draw_id UUID REFERENCES public.draws(id),
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.jackpot_rollovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rollovers" ON public.jackpot_rollovers
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage rollovers" ON public.jackpot_rollovers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_golf_scores_updated_at BEFORE UPDATE ON public.golf_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON public.charities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_charity_selections_updated_at BEFORE UPDATE ON public.charity_selections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_draws_updated_at BEFORE UPDATE ON public.draws FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_draw_results_updated_at BEFORE UPDATE ON public.draw_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_winner_verifications_updated_at BEFORE UPDATE ON public.winner_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCTION: auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED: Sample charities
-- ============================================================
INSERT INTO public.charities (name, description, short_description, is_featured, is_active, upcoming_events) VALUES
(
  'The Golf Foundation',
  'The Golf Foundation supports young people through golf, helping them develop life skills and confidence. We work with schools, communities, and clubs to make golf accessible to all.',
  'Supporting young people through golf',
  TRUE,
  TRUE,
  '[{"name": "Junior Golf Day", "date": "2026-05-15", "location": "Dublin, Ireland"}, {"name": "Charity Tournament", "date": "2026-06-20", "location": "Cork, Ireland"}]'
),
(
  'Irish Cancer Society',
  'The Irish Cancer Society funds cancer research, provides support services and campaigns for a better life for those affected by cancer in Ireland.',
  'Fighting cancer in Ireland',
  FALSE,
  TRUE,
  '[{"name": "Golf for Life", "date": "2026-05-28", "location": "Galway, Ireland"}]'
),
(
  'Pieta House',
  'Pieta House provides a range of free professional therapeutic services to people who are in suicidal distress and those who engage in self-harm.',
  'Suicide prevention and mental health support',
  FALSE,
  TRUE,
  '[{"name": "Darkness into Light Golf Classic", "date": "2026-06-05", "location": "Nationwide"}]'
),
(
  'ISPCA',
  'The Irish Society for the Prevention of Cruelty to Animals is Ireland''s leading animal welfare charity, working to prevent animal cruelty and promote animal welfare.',
  'Ireland''s leading animal welfare charity',
  FALSE,
  TRUE,
  '[]'
);

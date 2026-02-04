-- Enable RLS on scout_watchlist
ALTER TABLE public.scout_watchlist ENABLE ROW LEVEL SECURITY;

-- 1. Allow authenticated users to INSERT their own rows
CREATE POLICY "Users can add to watchlist"
ON public.scout_watchlist
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = scout_id);

-- 2. Allow authenticated users to SELECT their own rows
CREATE POLICY "Users can view their watchlist"
ON public.scout_watchlist
FOR SELECT
TO authenticated
USING (auth.uid() = scout_id);

-- 3. Allow authenticated users to DELETE their own rows
CREATE POLICY "Users can remove from watchlist"
ON public.scout_watchlist
FOR DELETE
TO authenticated
USING (auth.uid() = scout_id);

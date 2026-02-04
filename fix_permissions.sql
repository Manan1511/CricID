-- Enable Row Level Security (good practice)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_performances ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including unauthenticated users) to READ matches
CREATE POLICY "Public read access for matches"
ON public.matches
FOR SELECT
USING (true);

-- Allow anyone (including unauthenticated users) to READ match_performances
CREATE POLICY "Public read access for performances"
ON public.match_performances
FOR SELECT
USING (true);

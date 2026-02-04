
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxxzbisixejononnerno.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eHpiaXNpeGVqb25vbm5lcm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDIxMDUsImV4cCI6MjA4NTc3ODEwNX0.M0xNRmawmWwm5anXyp9fIb_SKylFEfoIdN0Gz7wkye8';

export const supabase = createClient(supabaseUrl, supabaseKey);

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cthlrtkgdbfosjjkyujh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_WQizGTucteJsYvJycjhOjg_AtKXtLRg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

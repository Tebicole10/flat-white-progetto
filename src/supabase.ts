import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://cthlrtkgdbfosjjkyujh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aGxydGtnZGJmb3Nqamt5dWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODI2MDcsImV4cCI6MjA5ODQ1ODYwN30.eelgCr053YyWXwn6_Q214q2SUxeB5sYiA8LNmG9j3qY'
);

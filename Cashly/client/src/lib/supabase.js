
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vewyrnalcsnuldqvueqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZld3lybmFsY3NudWxkcXZ1ZXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1OTY1ODUsImV4cCI6MjA4MjE3MjU4NX0.s-cUvQSbyW358oXy9PQ8ma7hQtmsNOyxgm9hn1n59Cs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

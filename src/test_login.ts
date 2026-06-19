import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing sign-in for newly registered user...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'thu3@phongkhamthunghiem.vn',
    password: 'Password@2026'
  });

  if (error) {
    console.error("SIGN-IN ERROR:", error.message, "status:", error.status);
  } else {
    console.log("SIGN-IN SUCCESS:", data.user.id);
  }
}

test();

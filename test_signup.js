const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

// Test signup with Supabase client
async function testSignup() {
  // Use hardcoded values from app.json
  const supabaseUrl = "https://qlvhqgtjqfdfpjordits.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdmhxZ3RqcWZkZnBqb3JkaXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDg4MDEsImV4cCI6MjA3ODI4NDgwMX0.b38JGnWhyuYM5zHtYElpdihiBUFhMYqaqLLemNSHdCk";

  console.log("🔗 Connecting to Supabase...");
  console.log("URL:", supabaseUrl);
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log("🚀 Testing signup...");
  
  try {
    const timestamp = Date.now();
    const { data, error } = await supabase.auth.signUp({
      email: `test${timestamp}@different-domain.test`,
      password: "Test1234!",
      options: {
        data: {
          full_name: "Terminal Test User"
        }
      }
    });
    
    if (error) {
      console.error("❌ Signup error:", error.message);
      return;
    }
    
    if (data.user) {
      console.log("✅ Signup successful!");
      console.log("User ID:", data.user.id);
      console.log("Email:", data.user.email);

      // Note: Role assignment happens in the background
      // The signup process should have assigned a cashier role
      console.log("ℹ️  Role assignment handled by signup process");
      console.log("ℹ️  Check user_roles table manually if needed");
    }
    
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
  }
}

testSignup();

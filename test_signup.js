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
      email: `test${timestamp}@brewly.app`,
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
      
      // Wait a moment for role assignment
      console.log("⏳ Waiting for role assignment...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if role was assigned
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", data.user.id);
      
      if (roleError) {
        console.error("❌ Error checking roles:", roleError.message);
      } else if (roles && roles.length > 0) {
        console.log("✅ Role assigned:", roles[0].role);
        console.log("Org ID:", roles[0].org_id);
        console.log("Store ID:", roles[0].store_id);
      } else {
        console.log("⚠️ No roles found - manual assignment needed");
      }
    }
    
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
  }
}

testSignup();

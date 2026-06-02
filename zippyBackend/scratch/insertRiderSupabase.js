import supabase from '../supabase.js';

async function main() {
  try {
    const mobile = "8439993033";
    const password = "12345678";
    
    console.log("Inserting user...");
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          name: "Test Rider",
          email: `${mobile}@example.com`,
          mobile: mobile,
          password: password,
          type: "RIDER"
        }
      ])
      .select()
      .single();
      
    if (userError) {
      console.error("User insert error:", userError);
      return;
    }
    
    console.log("Inserted user:", user.id);
    
    console.log("Inserting rider...");
    const { data: rider, error: riderError } = await supabase
      .from('rider')
      .insert([
        {
          level: "Beginner",
          user_id: user.id,
          code: `RIDER-${mobile}`
        }
      ])
      .select()
      .single();
      
    if (riderError) {
      console.error("Rider insert error:", riderError);
      return;
    }
    
    console.log("Inserted rider:", rider.id);
    console.log("Successfully created user and rider via Supabase.");
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    process.exit(0);
  }
}

main();

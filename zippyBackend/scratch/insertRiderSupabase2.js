import supabase from '../supabase.js';

async function main() {
  try {
    const userId = "6b40e54d-a456-4225-b298-c78ac0e8803a";
    
    console.log("Inserting rider for user:", userId);
    const { data: rider, error: riderError } = await supabase
      .from('rider')
      .insert([
        {
          level: "Beginner",
          user_id: userId
        }
      ])
      .select()
      .single();
      
    if (riderError) {
      console.error("Rider insert error:", riderError);
      return;
    }
    
    console.log("Inserted rider:", rider.id);
    console.log("Successfully created rider via Supabase.");
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    process.exit(0);
  }
}

main();

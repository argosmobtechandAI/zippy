import { supabase } from './supabaseClient.js';
async function test() {
    const { data: users } = await supabase.from('users').select('id, name, type');
    console.log("Users:", users.filter(u => u.type === 'center' || u.type === 'stable' || u.name === 'wewewe'));
    
    const { data: horses } = await supabase.from('horse').select('id, name, stable_id');
    console.log("Horses in DB:", horses);
}
test();

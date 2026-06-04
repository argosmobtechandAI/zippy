import { supabase } from './supabaseClient.js';

async function run() {
    const { data: trainers } = await supabase.from('trainers').select('id, user_id').limit(1);
    if (trainers.length === 0) { console.log('no trainers'); return; }
    
    console.log('Trainer ID:', trainers[0].id);
    console.log('User ID:', trainers[0].user_id);
    
    const res1 = await supabase.from('horse').insert({name:'test1', weight:1, speed:1, shoe_status:'1', diet:'1', location:'1', title:'1', trainer_id: trainers[0].user_id});
    console.log('Insert with User ID:', res1.error ? res1.error.message : 'SUCCESS');
    
    const res2 = await supabase.from('horse').insert({name:'test2', weight:1, speed:1, shoe_status:'1', diet:'1', location:'1', title:'1', trainer_id: trainers[0].id});
    console.log('Insert with Trainer ID:', res2.error ? res2.error.message : 'SUCCESS');
}
run();

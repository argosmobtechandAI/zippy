import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './supabaseClient.js';

async function run() {
  try {
    const { data } = await supabase.from('users').select('id, name, email').eq('type', 'vet').limit(1);
    const id = data[0].id;
    console.log("VET USER ID:", id);

    const { data: existingVet, error: vetErr1 } = await supabase.from('vet').select('id').eq('user_id', id).limit(1);
    console.log("EXISTING VET:", existingVet, "ERR:", vetErr1);

    let vetId;
    if (!existingVet || existingVet.length === 0) {
        const { data: newVet, error: vetErr2 } = await supabase.from('vet').insert({ user_id: id }).select();
        console.log("NEW VET:", newVet, "ERR:", vetErr2);
        vetId = newVet && newVet.length > 0 ? newVet[0].id : null;
    } else {
        vetId = existingVet[0].id;
    }
    console.log("FINAL VET ID:", vetId);

    if (vetId) {
        const horseId = '7163f880-de30-468f-be99-338d44ff1eb3';
        const { error: assignErr } = await supabase.from('horse').update({ vat_id: vetId }).eq('id', horseId);
        console.log("ASSIGN ERR:", assignErr);
        
        const { data: updatedHorse } = await supabase.from('horse').select('id, vat_id').eq('id', horseId);
        console.log("UPDATED HORSE:", updatedHorse);
    }
  } catch (err) {
    console.error(err);
  }
}
run();

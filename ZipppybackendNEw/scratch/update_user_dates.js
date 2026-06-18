import dotenv from 'dotenv';
dotenv.config();

async function updateDates() {
    try {
        const { supabase } = await import('../supabaseClient.js');
        console.log('Fetching users...');
        const { data: users, error } = await supabase.from('users').select('id, name');
        if (error) throw error;
        console.log(`Found ${users.length} users. Updating created_at dates to random June 12-17 dates...`);

        const start = new Date('2026-06-12T00:00:00.000Z').getTime();
        const end = new Date('2026-06-17T23:59:59.000Z').getTime();

        for (const user of users) {
            const randomTime = start + Math.random() * (end - start);
            const randomDateStr = new Date(randomTime).toISOString();
            
            const { error: updateError } = await supabase
                .from('users')
                .update({ created_at: randomDateStr })
                .eq('id', user.id);

            if (updateError) {
                console.error(`Failed to update ${user.name}:`, updateError.message);
            } else {
                console.log(`Updated ${user.name} to ${randomDateStr}`);
            }
        }
        console.log('Done updating user dates!');
    } catch (e) {
        console.error('Error running update script:', e);
    }
}

updateDates();

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://db.zippyapp.online';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const randomMobile = '9' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  
  const adminData = {
    name: 'Admin User',
    email: 'admin@zippy.com',
    mobile: randomMobile,
    password: hashedPassword,
    type: 'admin',
    status: 'ACTIVE'
  };

  try {
    const { data, error } = await supabase.from('users').insert([adminData]).select();
    
    if (error) {
      console.error('Supabase Error:', error);
      process.exit(1);
    }
    
    console.log('Created new admin user via Supabase JS:', data);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

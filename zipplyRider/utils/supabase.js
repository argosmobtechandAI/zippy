import { createClient } from '@supabase/supabase-js';


export const supabase = createClient(
  "https://zlhpxehbcygykwqouwzb.supabase.co",
  "sb_publishable_-fArPjFAdPAheBjpMuflpA_xjQmdYpn",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    realtime: {
      enabled: false, 
    },
  }
);

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.VITE_SUPABASE_URL, "url", process.env.SERVICE_ROLE_KEY, "key")

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SERVICE_ROLE_KEY
);


export default supabase;
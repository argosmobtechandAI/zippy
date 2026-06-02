
import dotenv from 'dotenv';
dotenv.config();

export default {
  schema: "./schema.js",   
  out: "./drizzle",               
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SUPABASE_URL,
  },
};
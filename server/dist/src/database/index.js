"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabaseClient = createSupabaseClient;
require("dotenv/config");
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables in server/.env');
}
function createSupabaseClient(token) {
    const options = {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    };
    if (token) {
        options.accessToken = async () => token;
    }
    const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, options);
    return supabase;
}

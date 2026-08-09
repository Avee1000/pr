"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSupabaseAuth = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables in auth.ts");
}
else {
    console.log("Supabase environment variables loaded successfully");
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
// export const requireSupabaseAuth = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers.authorization;
//   // 1. Validate Bearer Token format
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized: Missing or invalid token header" });
//   }
//   const token = authHeader.split(" ")[1];
//   // 2. Verify JWT directly with Supabase
//   const { data: { user }, error } = await supabase.auth.getUser(token);
//   if (error || !user) {
//     return res.status(401).json({ error: "Unauthorized: Invalid or expired session" });
//   }
//   // 3. Attach user payload to Express request
//   req.user = user;
//   next();
// };
const requireSupabaseAuth = async (req, res, next) => {
    let token;
    // 1. Check HttpOnly Cookie (for browser address bar & fetch)
    if (req.cookies && req.cookies.sb_access_token) {
        token = req.cookies.sb_access_token;
    }
    // 2. Fallback to Authorization Header (for Postman, Thunder Client, Mobile Apps)
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    console.log("Cookies received by Express:", req.cookies);
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    // Verify the token with Supabase
    const { data: { user }, error } = await exports.supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ error: "Invalid or expired session" });
    }
    req.user = user;
    next();
};
exports.requireSupabaseAuth = requireSupabaseAuth;

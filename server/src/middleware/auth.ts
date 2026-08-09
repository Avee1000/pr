//server/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { createClient, User } from "@supabase/supabase-js";

// Extend the Express Request type to include a 'user' property
declare global {
    namespace Express {
        interface Request {
            user?: User; // Supabase User object
        }
    }
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables in auth.ts");
} else {
    console.log("Supabase environment variables loaded successfully"); 
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

export const requireSupabaseAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

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
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  req.user = user;
  next();
};
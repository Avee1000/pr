import "dotenv/config";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import receiptRoutes from "./src/routes/pdf-route";
import { requireSupabaseAuth } from "./src/middleware/auth";

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Enable CORS with credentials (allows cookies across ports)
app.use(cors({ 
  origin: "http://localhost:3000",
  credentials: true 
})); 

app.use(express.json());
app.use(cookieParser()); // Enables req.cookies

// 2. Public Route: Endpoint for frontend to sync Supabase token into an HttpOnly cookie
app.post('/api/auth/set-session', (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: "access_token is required" });
  }

  // Set the HttpOnly cookie in the user's browser
  res.cookie("sb_access_token", access_token, {
    httpOnly: true, // Prevents XSS script access
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax",
    maxAge: 3600 * 1000, // 1 hour
    path: "/",
  });

  return res.json({ message: "Session cookie stored successfully" });
});

// Clear cookie on logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie("sb_access_token", { path: "/" });
  return res.json({ message: "Logged out successfully" });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Express running on port ' + PORT });
});

// 3. Protected Routes Gatekeeper
app.use("/api", requireSupabaseAuth);

app.use('/api', receiptRoutes);

app.get("/api/protected", (req, res) => {
  res.json({
    message: "Authenticated via Supabase Cookies!",
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
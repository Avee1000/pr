"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const pdf_route_1 = __importDefault(require("./src/routes/pdf-route"));
const auth_1 = require("./src/middleware/auth");
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
const PORT = process.env.PORT || 5000;
// 1. Enable CORS with credentials (allows cookies across ports)
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)()); // Enables req.cookies
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
// app.get('/preview-pdf/:quoteId', generateReceipt
// );
// 3. Protected Routes Gatekeeper
app.use("/api", auth_1.requireSupabaseAuth);
app.use('/api/downloads', pdf_route_1.default);
app.get("/api/protected", (req, res) => {
    res.json({
        message: "Authenticated via Supabase Cookies!",
        user: req.user,
    });
});
app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});

// server/index.ts
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Sample health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'Express running on port ' + PORT });
});

// Add your custom Express routes here
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // API endpoint to get Maps API key
  app.get('/api/config/maps-key', (req, res) => {
    const mapsApiKey = process.env.MAPS_API_KEY;
    if (!mapsApiKey) {
      // For demo purposes, return a fallback response
      // In production, you would want to configure a real API key
      return res.json({ 
        apiKey: null, 
        demoMode: true,
        message: 'Demo mode: Using static map data. Configure MAPS_API_KEY environment variable for full functionality.'
      });
    }
    res.json({ apiKey: mapsApiKey, demoMode: false });
  });

  // API endpoint to get screen data
  app.get('/api/screens', async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const screensPath = path.join(__dirname, '..', 'client', 'src', 'data', 'screens.json');
      const screensData = JSON.parse(fs.readFileSync(screensPath, 'utf8'));
      res.json(screensData);
    } catch (error) {
      console.error('Error loading screens data:', error);
      res.status(500).json({ error: 'Failed to load screens data' });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

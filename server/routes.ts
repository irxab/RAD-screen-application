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
      return res.status(500).json({ error: 'Maps API key not configured' });
    }
    res.json({ apiKey: mapsApiKey });
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

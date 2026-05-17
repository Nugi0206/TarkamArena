import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { readFileSync } from "fs";

// Initialize Firebase Admin
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(readFileSync(firebaseConfigPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to check if user is admin
  const authenticateAdmin = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    
    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(token);
      // Hardcoded bootstrap admin or check role in DB
      const isBootstrapAdmin = decodedToken.email === 'muhamadnugiandri@gmail.com';
      
      if (isBootstrapAdmin) {
        req.user = decodedToken;
        next();
      } else {
        const userDoc = await db.collection("users").doc(decodedToken.uid).get();
        if (userDoc.exists && userDoc.data()?.role === "ADMIN") {
          req.user = decodedToken;
          next();
        } else {
          res.status(403).json({ error: "Forbidden: Admin access only" });
        }
      }
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Create User Endpoint
  app.post("/api/admin/create-user", authenticateAdmin, async (req, res) => {
    const { email, password, fullName, role, region } = req.body;
    
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // 1. Create User in Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: fullName,
      });

      // 2. Create Profile in Firestore
      await db.collection("users").doc(userRecord.uid).set({
        fullName,
        email,
        role,
        region: region || "Cirebon",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ success: true, uid: userRecord.uid });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

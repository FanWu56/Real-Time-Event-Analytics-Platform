import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import eventRoutes from "./routes/eventRoutes";
import projectRoutes from "./routes/projectRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { initSocketServer } from "./websocket/liveSocket";

// Read env
dotenv.config()                      
const PORT = process.env.PORT || 4000

const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Event analytics backend is running"
    })
})

app.use("/api/events", eventRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects", analyticsRoutes);
const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
})


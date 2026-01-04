import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
const corsOriginRaw = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const corsOrigins = corsOriginRaw
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.post("/webhook", (req, res) => {
  console.log("Webhook received:", JSON.stringify(req.body));

  // Emit webhook data to all connected clients
  io.emit("webhook-data", req.body);

  res.sendStatus(200);
});

httpServer.listen(Number.isFinite(port) ? port : 3001, () => {
  console.log(`Webhook server listening on port ${Number.isFinite(port) ? port : 3000}`);
  console.log(`Socket.io enabled with CORS for ${corsOrigins.join(", ")}`);
});

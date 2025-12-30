import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3001",
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

httpServer.listen(3000, () => {
  console.log("Webhook server listening on port 3000");
  console.log("Socket.io enabled with CORS for http://localhost:3001");
});

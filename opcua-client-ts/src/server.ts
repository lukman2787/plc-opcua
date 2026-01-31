import express from "express";
import http from "http";
import { initSocket } from "./socket";
import { startOPCUASubscription } from "./opcua/client";

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

const PORT = 3000;

app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  // 🔥 START OPC UA SUBSCRIPTION
  await startOPCUASubscription((data) => {
    console.log("📊 OPC UA DATA:", data);

    // kirim ke semua frontend
    io.emit("opcua:data", data);
  });
});

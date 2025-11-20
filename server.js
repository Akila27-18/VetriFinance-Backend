import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import expensesRoutes from "./routes/expenses.js";
import authRoutes from "./routes/auth.js";
import { WebSocketServer } from "ws";
import sequelize from "./config/db.js"; // Sequelize instance
import Expense from "./models/Expense.js";
import User from "./models/User.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------
// AUTH + EXPENSES ROUTES
// -------------------------------
app.use("/auth", authRoutes);
app.use("/expenses", expensesRoutes);

// -------------------------------
// MOCK STOCK ENDPOINT
// -------------------------------
app.get("/api/stock/:symbol", (req, res) => {
  const symbol = req.params.symbol;
  const price = +(Math.random() * 500 + 100).toFixed(2);
  const change = +(Math.random() * 10 - 5).toFixed(2);

  res.json({
    symbol,
    price,
    change,
    percent: +((change / price) * 100).toFixed(2),
    spark: Array.from({ length: 20 }, () =>
      +(price + Math.random() * 5 - 2).toFixed(2)
    ),
  });
});

// -------------------------------
// MYSQL / SEQUELIZE CONNECTION
// -------------------------------
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected via Sequelize");

    // Sync models (create tables if not exist)
    await User.sync();
    await Expense.sync();

    console.log("Models synced");
  } catch (err) {
    console.error("Sequelize connection error:", err);
    process.exit(1);
  }
}

connectDB();

const PORT = process.env.PORT || 5000;

// Start HTTP server
const server = app.listen(PORT, () =>
  console.log(`API running on port ${PORT}`)
);

// -------------------------------
// WEBSOCKET SERVER
// -------------------------------
const wss = new WebSocketServer({ server, path: "/ws/chat" });
console.log("WebSocket server running at ws://localhost:" + PORT + "/ws/chat");

wss.on("connection", (ws) => {
  console.log("WS client connected");

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (error) {
      console.error("Invalid JSON from WS:", error);
      return;
    }

    // Broadcast message to all clients except sender
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    });
  });

  ws.on("close", () => console.log("WS client disconnected"));
});

// -------------------------------
// AUTO STOCK BROADCAST
// -------------------------------
const symbols = ["AAPL", "TSLA", "MSFT", "BTC-USD", "ETH-USD", "RELIANCE.NS"];

setInterval(() => {
  symbols.forEach((sym) => {
    const price = +(Math.random() * 500 + 100).toFixed(2);
    const change = +(Math.random() * 10 - 5).toFixed(2);

    const stockUpdate = {
      type: "stock",
      payload: {
        symbol: sym,
        price,
        change,
        percent: +((change / price) * 100).toFixed(2),
        spark: Array.from({ length: 20 }, () =>
          +(price + Math.random() * 5 - 2).toFixed(2)
        ),
      },
    };

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(stockUpdate));
      }
    });
  });
}, 10000);

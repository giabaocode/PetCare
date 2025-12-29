// /index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// backend/src/index.ts
app.use(
  cors({
    origin: "*", // Cho phép mọi nguồn (hoặc điền "http://localhost:5173")
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Mount all routes under the /api path
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("PetCare API Ready!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

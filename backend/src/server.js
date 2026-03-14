require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const caseRoutes = require("./routes/caseRoutes");
const documentRoutes = require("./routes/documentRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();
const adminRoutes = require("./routes/adminRoutes");
const caseIntelligenceRoutes = require("./routes/caseIntelligenceRoutes");
const precedentRoutes = require("./routes/precedentRoutes");
const hearingRoutes = require("./routes/hearingRoutes");
const legalResearchRoutes = require("./routes/legalResearchRoutes");
const draftRoutes = require("./routes/draftRoutes");
const riskRoutes = require("./routes/riskRoutes");
const translationRoutes = require("./routes/translationRoutes");
const legalChatRoutes = require("./routes/legalChatRoutes");
const deadlineRoutes = require("./routes/deadlineRoutes");


// ================= Security Middlewares =================

app.use(helmet());

app.use(express.json({ limit: "10kb" }));

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],  
    credentials: true
   }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 100 : 10000,
    message: "Too many requests from this IP",
    skip: (req) => process.env.NODE_ENV !== "production"
});




app.use(limiter);

// ================= Routes =================

app.get("/", (req, res) => {
    res.json({ message: "Secure Legal AI Backend Running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/case-intelligence", caseIntelligenceRoutes);
app.use("/api/precedents", precedentRoutes);
app.use("/api/hearings", hearingRoutes);
app.use("/api/legal-research", legalResearchRoutes);
app.use("/api/ai/draft", draftRoutes);
app.use("/api/ai/risk-analysis", riskRoutes);
app.use("/api/ai/translate", translationRoutes);
app.use("/api/ai",legalChatRoutes);
app.use("/api/deadlines", deadlineRoutes);

// ================= Error Handler =================

app.use(errorHandler);

// ================= Start Server =================

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
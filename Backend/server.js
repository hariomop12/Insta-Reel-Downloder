require('dotenv').config();
const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const { uploadToR2 } = require('./r2Upload');
const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    process.env.FRONTEND_URL,
    process.env.RAILWAY_STATIC_URL,
    process.env.RAILWAY_PUBLIC_DOMAIN
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Parse JSON payloads

app.get("/", (req, res) => {
  res.send("Hello, World!");
});


app.post("/download-reel", (req, res) => {
  const { reelUrl } = req.body;

  console.log("Received POST request with reelUrl:", reelUrl); // Log the URL received

  if (!reelUrl) {
    console.error("No Reel URL provided");
    return res.status(400).json({ error: "Reel URL is required." });
  }

  const pythonProcess = spawn(path.join(__dirname, "venv_linux", "bin", "python"), [
    path.join(__dirname, "reel_download.py"),
    reelUrl,
  ]);

  let output = "";
  let errorOutput = "";

  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
    console.log("Python Script Output:", output); // Log Python script output
  });

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error("Python Script Error:", errorOutput); // Log Python script error
  });

  pythonProcess.on("close", async (code) => {
    // Log warnings but don't treat them as errors
    if (errorOutput) {
      console.warn(`Python script warnings: ${errorOutput}`);
    }

    try {
      // Try to parse the last line of output as JSON
      const lines = output.trim().split("\n");
      const lastLine = lines[lines.length - 1];
      const result = JSON.parse(lastLine);
      
      console.log("Python Script Final Output:", result);

      if (result.error) {
        return res.status(400).json(result);
      }

      // Upload to R2 instead of serving locally
      // Fix path - the Python script saves to Backend/media/reels/ from app root
      const localFilePath = path.join('/app', result.file_path);
      const fileName = path.basename(result.file_path);
      
      console.log("Expected file path:", localFilePath);
      
      console.log("📤 Uploading to R2...");
      const r2Url = await uploadToR2(localFilePath, fileName);
      
      res.status(200).json({
        success: true,
        download_url: r2Url,
        message: "Reel ready for download! Link expires in 10 minutes.",
        expires_in: "10 minutes"
      });
    } catch (error) {
      console.error("Error parsing Python script output:", error.message);
      console.error("Raw output:", output);
      
      // If we can't parse JSON but process exited successfully, it might still be an error
      if (code !== 0) {
        return res.status(500).json({ 
          error: "Python script failed.",
          details: errorOutput || "Unknown error"
        });
      }
      
      res.status(500).json({ error: "Failed to parse script output." });
    }
  });
});

app.use(morgan("dev"));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Instagram Reel Downloader'
  });
});

// Start the server - Railway provides PORT dynamically
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Ready to download Instagram reels!`);
});

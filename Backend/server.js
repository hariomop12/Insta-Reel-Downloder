const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.json());

 
app.post("/download-reel", (req, res) => {
  const { reelUrl } = req.body;

  if (!reelUrl) {
    return res.status(400).json({ error: "Reel URL is required." });
  }

  const pythonProcess = spawn("python3", [
    path.join(__dirname, "reel_download.py"),
    reelUrl,
  ]);

  let output = "";
  let errorOutput = "";

  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on("close", (code) => {
    if (errorOutput) {
      console.error(`Python script error: ${errorOutput}`);
      return res
        .status(500)
        .json({ error: "Python script encountered an error." });
    }

    try {
      // Filter only the last JSON line
      const lines = output.trim().split("\n");
      const lastLine = lines[lines.length - 1];
      console.log(`Parsed output: ${lastLine}`);

      const result = JSON.parse(lastLine);

      if (result.error) {
        return res.status(400).json(result);
      }

      // Convert Windows-style paths to URL-friendly paths
      const filePath = result.file_path.replace(/\\/g, "/");
      return res.status(200).json({
        file_path: `http://localhost:3000/${filePath}`,
      });
    } catch (error) {
      console.error(`Failed to parse output: ${output}`);
      console.error(`Parsing error: ${error.message}`);
      return res.status(500).json({ error: "Failed to parse script output." });
    }
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'media', 'reels')));


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

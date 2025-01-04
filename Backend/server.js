const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON payloads

// Define the endpoint to download Instagram reels
// app.post("/download-reel", (req, res) => {
//   const { reelUrl } = req.body;
//   console.log("Received POST request with reelUrl:", reelUrl); 
//   if (!reelUrl) {
//     return res.status(400).json({ error: "Reel URL is required." });
//   }

//   // Path to the Python interpreter in the virtual environment
//   const pythonPath = path.join(
//     __dirname,
//     "venv",
//     "Scripts",
//     process.platform === "win32" ? "python.exe" : "python3"
//   );

//   // Spawn a new process to run the Python script
//   const pythonProcess = spawn(pythonPath, [
//     path.join(__dirname, "reel_download.py"), // Path to the Python script
//     reelUrl, // Pass the Instagram reel URL
//   ]);

//   let output = "";
//   let errorOutput = "";

//   // Collect stdout data from the Python script
//   pythonProcess.stdout.on("data", (data) => {
//     output += data.toString();
//   });

//   // Collect stderr data from the Python script
//   pythonProcess.stderr.on("data", (data) => {
//     errorOutput += data.toString();
//   });

//   // Handle the completion of the Python script
//   pythonProcess.on("close", (code) => {
//     if (errorOutput) {
//       console.error(`Python script error: ${errorOutput}`);
//       return res.status(500).json({
//         error: "Python script encountered an error.",
//         details: errorOutput.trim(),
//       });
//     }

//     try {
//       // Parse the JSON output from the Python script
//       const lines = output.trim().split("\n");
//       const lastLine = lines[lines.length - 1]; // Use the last line as JSON
//       console.log(`Parsed output: ${lastLine}`);

//       const result = JSON.parse(lastLine);

//       if (result.error) {
//         return res.status(400).json(result); // Return Python error as response
//       }

//       // Convert Windows-style paths to URL-friendly paths
//       const filePath = result.file_path.replace(/\\/g, "/");
//       return res.status(200).json({
//         file_path: `http://localhost:3000/${filePath}`,
//       });
//     } catch (error) {
//       console.error(`Failed to parse output: ${output}`);
//       console.error(`Parsing error: ${error.message}`);
//       return res.status(500).json({ error: "Failed to parse script output." });
//     }
//   });
// });


app.post("/download-reel", (req, res) => {
  const { reelUrl } = req.body;

  console.log("Received POST request with reelUrl:", reelUrl); // Log the URL received

  if (!reelUrl) {
    console.error("No Reel URL provided");
    return res.status(400).json({ error: "Reel URL is required." });
  }

  const pythonProcess = spawn("python", [
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

  pythonProcess.on("close", (code) => {
    if (errorOutput) {
      console.error(`Python script exited with error: ${errorOutput}`);
      return res.status(500).json({ error: "Python script encountered an error." });
    }

    try {
      const result = JSON.parse(output.trim());
      console.log("Python Script Final Output:", result); // Log final parsed result

      if (result.error) {
        return res.status(400).json(result);
      }

      const filePath = result.file_path.replace(/\\/g, "/");
      res.status(200).json({
        file_path: `http://localhost:3000/${filePath}`,
      });
    } catch (error) {
      console.error("Error parsing Python script output:", error.message);
      res.status(500).json({ error: "Failed to parse script output." });
    }
  });
});


app.use(morgan("dev"));

// Serve static files (e.g., downloaded reels) from the 'media/reels' directory
// Serve static files from "Backend/media/reels"
app.use('/Backend/media/reels', express.static(path.join(__dirname, 'Backend', 'media', 'reels')));


// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

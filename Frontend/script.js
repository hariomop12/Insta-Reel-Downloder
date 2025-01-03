// document.addEventListener("DOMContentLoaded", () => {
//   console.log("DOM fully loaded and parsed"); // Log when the DOM is fully loaded

//   document.getElementById("reel-form").addEventListener("submit", async (e) => {
//     e.preventDefault(); // Prevent form from reloading the page

//     const urlInput = document.getElementById("url").value.trim();
//     const resultDiv = document.getElementById("result");

//     // Clear previous result
//     resultDiv.innerHTML = "Processing...";

//     try {
//       console.log("Sending request to backend..."); // Debug log
//       const response = await fetch("http://localhost:3000/download-reel", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ reelUrl: urlInput }),
//       });

//       console.log("Response from backend:", response); // Log full response object

//       if (!response.ok) {
//         // If response is not OK, log the status
//         console.error("Response not OK. Status:", response.status);
//         resultDiv.innerHTML = `<p style="color: red;">Error: Something went wrong on the server.</p>`;
//         return;
//       }

//       const data = await response.json();

//       console.log("Parsed JSON data:", data); // Debug JSON data

//       if (data.file_path) {
//         resultDiv.innerHTML = `
//           <p>Reel successfully downloaded! 🎉</p>
//           <a href="${data.file_path}" download>Click here to download the file</a>
//         `;
//       } else {
//         resultDiv.innerHTML = `<p style="color: red;">Error: ${data.error || "Unknown error"}</p>`;
//       }
//     } catch (err) {
//       console.error("Fetch error:", err); // Debug the error object
//       resultDiv.innerHTML = `<p style="color: red;">Something went wrong. Please try again.</p>`;
//     }
//   });
// });
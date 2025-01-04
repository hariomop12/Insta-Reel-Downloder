// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById("download-form");
//   const reelUrlInput = document.getElementById("reel-url");
//   const resultDiv = document.getElementById("result");
//   const errorMessageDiv = document.getElementById("error-message");
//   const errorText = document.getElementById("error-text");
//   const successMessage = document.getElementById("success-message");
//   const videoElement = document.getElementById("download-video");

//   form.addEventListener("submit", async (event) => {
//     event.preventDefault();

//     const reelUrl = reelUrlInput.value.trim();
//     console.log("Form submitted with URL:", reelUrl);

//     if (!reelUrl) {
//       console.error("No URL entered");
//       errorMessageDiv.classList.remove("hidden");
//       errorText.textContent = "Please provide a valid URL.";
//       return;
//     }

//     try {
//       errorMessageDiv.classList.add("hidden");
//       resultDiv.classList.add("hidden");

//       console.log("Sending POST request to backend...");
//       const response = await fetch("http://localhost:3000/download-reel", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ reelUrl }),
//       });

//       const data = await response.json();
//       console.log("Response data:", data);

//       if (response.ok) {
//         successMessage.textContent = "Reel downloaded successfully!";
//         videoElement.src = data.file_path; // Set video source
//         videoElement.classList.remove("hidden");
//         resultDiv.classList.remove("hidden");
//       } else {
//         console.error("Backend returned an error:", data.error);
//         throw new Error(data.error || "Failed to download the reel.");
//       }
//     } catch (error) {
//       console.error("Frontend Error:", error.message);
//       errorMessageDiv.classList.remove("hidden");
//       errorText.textContent = error.message;
//     }
//   });
// });

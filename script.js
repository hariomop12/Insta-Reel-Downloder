// document.addEventListen      console.log("Sending POST request to backend...");
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("download-form");
  const reelUrlInput = document.getElementById("reel-url");
  const resultDiv = document.getElementById("result");
  const errorMessageDiv = document.getElementById("error-message");
  const errorText = document.getElementById("error-text");
  const successMessage = document.getElementById("success-message");
  const videoElement = document.getElementById("download-video");

  // URL validation regex for Instagram reels
  const instagramReelRegex = /^https?:\/\/(www\.)?instagram\.com\/(reel|p)\/[A-Za-z0-9_-]+\/?(\?.*)?$/;

  // Real-time URL validation
  reelUrlInput.addEventListener("input", (e) => {
    const url = e.target.value.trim();
    const isValid = url === "" || instagramReelRegex.test(url);
    
    if (url && !isValid) {
      reelUrlInput.style.borderColor = "#ef4444";
      reelUrlInput.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.1)";
    } else {
      reelUrlInput.style.borderColor = "#e2e8f0";
      reelUrlInput.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)";
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const reelUrl = reelUrlInput.value.trim();
    console.log("Form submitted with URL:", reelUrl);

    // Validate URL
    if (!reelUrl || !instagramReelRegex.test(reelUrl)) {
      console.error("Invalid Instagram URL");
      errorMessageDiv.classList.remove("hidden");
      errorText.textContent = "Please provide a valid Instagram reel URL (e.g., https://www.instagram.com/reel/ABC123/)";
      return;
    }

    try {
      // Hide previous messages
      errorMessageDiv.classList.add("hidden");
      resultDiv.classList.add("hidden");

      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
      submitBtn.disabled = true;

      console.log("Sending POST request to backend...");
      const response = await fetch("/download-reel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reelUrl }),
      });

      const data = await response.json();
      console.log("Response data:", data);

      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      if (response.ok) {
        successMessage.textContent = "Reel downloaded successfully!";
        if (data.downloadUrl) {
          // Create download link
          const downloadLink = document.createElement('a');
          downloadLink.href = data.downloadUrl;
          downloadLink.download = data.filename || 'instagram_reel.mp4';
          downloadLink.textContent = 'Download Video';
          downloadLink.className = 'download-btn';
          downloadLink.style.cssText = `
            display: inline-block;
            margin-top: 15px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
          `;
          
          resultDiv.innerHTML = '';
          resultDiv.appendChild(successMessage);
          resultDiv.appendChild(downloadLink);
          resultDiv.classList.remove("hidden");
        } else if (data.file_path) {
          // Fallback for local file path
          videoElement.src = data.file_path;
          videoElement.classList.remove("hidden");
          resultDiv.classList.remove("hidden");
        }
      } else {
        console.error("Backend returned an error:", data.error);
        throw new Error(data.error || "Failed to download the reel.");
      }
    } catch (error) {
      console.error("Download Error:", error.message);
      
      // Reset button
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.innerHTML = '<i class="fas fa-download"></i> Download Reel';
      submitBtn.disabled = false;
      
      errorMessageDiv.classList.remove("hidden");
      errorText.textContent = error.message || "An error occurred while downloading the reel. Please try again.";
    }
  });
});

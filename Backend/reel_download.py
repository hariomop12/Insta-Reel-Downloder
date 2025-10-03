import instaloader
import time
import random
import os
import shutil
from fake_useragent import UserAgent
import sys
import json

def fetchReelVideo(reelUrl):
    try:
        if not reelUrl:
            return {"error": "Reel URL is required"}

        ua = UserAgent()
        L = instaloader.Instaloader()

        # Suppress instaloader outputs
        L.interactive = False
        L.download_pictures = False
        L.save_metadata = False
        L.post_metadata_txt_pattern = ""

        # Mimic human behavior
        time.sleep(random.uniform(2, 5))

        # Extract shortcode from the reel URL
        shortcode = reelUrl.split("/")[-2]

        # Define directories
        download_dir = os.path.join('Backend','media', 'reels')
        os.makedirs(download_dir, exist_ok=True)
        reel_file_path = os.path.join(download_dir, f'{shortcode}.mp4')

        # Temporary download directory
        temp_download_path = shortcode
        os.makedirs(temp_download_path, exist_ok=True)

        # Download post
        post = instaloader.Post.from_shortcode(L.context, shortcode)
        L.download_post(post, target=temp_download_path)

        # Move the .mp4 file to the download directory
        for root, dirs, files in os.walk(temp_download_path):
            for file in files:
                if file.endswith('.mp4'):
                    shutil.move(os.path.join(root, file), reel_file_path)
                    break

        # Cleanup
        shutil.rmtree(temp_download_path)

        # Return JSON response
        return {
            "message": "Reel downloaded successfully!",
            "file_path": reel_file_path.replace("\\", "/"),
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    reelUrl = sys.argv[1]
    result = fetchReelVideo(reelUrl)

    # Clear stdout and ensure only JSON is printed
    print(json.dumps(result))

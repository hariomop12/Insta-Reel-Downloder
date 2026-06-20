const INSTAGRAM_URL_REGEX = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv)\/[A-Za-z0-9_-]+/;

function extractShortcode(reelUrl) {
  const match = reelUrl.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[2] : null;
}

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429) {
        const wait = Math.pow(2, i) * 1000;
        console.log(`429 rate limited, waiting ${wait}ms (attempt ${i + 1}/${retries})`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      return res;
    } catch (err) {
      console.log(`Fetch attempt ${i + 1} failed: ${err.message}`);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

function buildCookieHeader(env) {
  const cookies = [];
  if (env.IG_SESSION_ID) cookies.push(`sessionid=${env.IG_SESSION_ID}`);
  if (env.IG_CSRF_TOKEN) cookies.push(`csrftoken=${env.IG_CSRF_TOKEN}`);
  if (env.IG_DS_USER_ID) cookies.push(`ds_user_id=${env.IG_DS_USER_ID}`);
  return cookies.join("; ");
}

// Strategy: fetch page with session cookie, extract video URL from embedded API data
async function strategyPageWithSession(shortcode, cookie) {
  console.log("Fetching Instagram page with session cookie");
  const url = `https://www.instagram.com/p/${shortcode}/`;
  const res = await fetchWithRetry(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Origin": "https://www.instagram.com",
      "Referer": "https://www.instagram.com/",
      "Cookie": cookie,
    },
  });
  console.log(`Page status: ${res.status}, size header: ${res.headers.get("content-length")}`);
  const html = await res.text();
  console.log(`Page size: ${html.length} bytes`);

  const title = (html.match(/<title>(.*?)<\/title>/) || ["", "not found"])[1];
  console.log(`Page title: ${title}`);

  // Strategy: extract the video URL directly using regex
  console.log("Extracting video URL from embedded page data...");

  // Debug: check if the key data markers exist in the page
  console.log(`Has "video_url": ${html.includes('video_url')}`);
  console.log(`Has video_versions: ${html.includes('video_versions')}`);
  console.log(`Has "url":"https:\\\\/\\\\/instagram: ${html.includes('"url":"https:\\/\\/instagram')}`);

  // Instagram embeds the video URL as: "url":"https:\/\/instagram...mp4?..."
  // Using String.raw to avoid escape-hell with regex patterns
  const patterns = [
    // Pattern 1: escaped \/ URLs from xdt_api response
    { name: "escaped Instagram", regex: String.raw`"url"\s*:\s*"(https:\\/\\/instagram[^"]+\.mp4[^"]*)"`, 
      clean: (s) => s.replace(/\\\//g, "/") },
    // Pattern 2: escaped \/ URLs from any source
    { name: "escaped any mp4", regex: String.raw`"url"\s*:\s*"(https:\\/\\/[^"]+\.mp4[^"]*)"`,
      clean: (s) => s.replace(/\\\//g, "/") },
    // Pattern 3: non-escaped URLs
    { name: "direct mp4", regex: String.raw`"url"\s*:\s*"(https://[^"]+\.mp4[^"]*)"`,
      clean: (s) => s },
    // Pattern 4: any instagram CDN mp4 URL
    { name: "IG CDN mp4", regex: /https?:\/\/[^"\s]*instagram[^"\s]*\.mp4[^"\s]*/,
      clean: (s) => s },
  ];

  for (const { name, regex, clean } of patterns) {
    console.log(`Trying pattern: ${name}`);
    const match = html.match(regex);
    if (match) {
      const url = clean(match[1] || match[0]);
      console.log(`SUCCESS via "${name}": ${url.slice(0, 100)}...`);
      return url;
    }
  }

  console.log("All regex patterns failed");
  return null;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const ts = (msg) => `[${new Date().toISOString()}] ${msg}`;

  try {
    const body = await request.json();
    const reelUrl = body?.reelUrl?.trim();
    console.log(ts(`POST /download-reel called`));

    if (!reelUrl) {
      return new Response(JSON.stringify({ error: "Reel URL is required." }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!INSTAGRAM_URL_REGEX.test(reelUrl)) {
      return new Response(JSON.stringify({ error: "Please enter a valid Instagram reel or post URL." }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const shortcode = extractShortcode(reelUrl);
    const cookie = buildCookieHeader(env);
    console.log(ts(`shortcode: ${shortcode}`));
    console.log(ts(`cookie present: ${!!env.IG_SESSION_ID}`));

    if (!cookie) {
      return new Response(JSON.stringify({
        error: "Instagram session cookie is required. Add IG_SESSION_ID to .env (see .env.sample).",
      }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const videoUrl = await strategyPageWithSession(shortcode, cookie);

    if (!videoUrl) {
      return new Response(JSON.stringify({
        error: "Could not extract video. Your session cookie may be expired. Try logging into Instagram again and updating IG_SESSION_ID in .env",
      }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(ts(`Downloading video...`));
    const videoResponse = await fetchWithRetry(videoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        "Referer": "https://www.instagram.com/",
      },
    });

    if (!videoResponse.ok) {
      console.log(ts(`Video download failed: status ${videoResponse.status}`));
      return new Response(JSON.stringify({
        error: `Failed to download video (HTTP ${videoResponse.status}).`,
      }), {
        status: 502, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    console.log(ts(`Video downloaded: ${(videoBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`));

    const timestamp = Date.now();
    const fileName = `${timestamp}_${shortcode}.mp4`;
    console.log(ts(`Uploading to R2: ${fileName}`));

    await env.REELS_BUCKET.put(fileName, videoBuffer, {
      httpMetadata: { contentType: "video/mp4" },
      customMetadata: { uploadTime: String(timestamp) },
    });

    console.log(ts(`Done! File: ${fileName}`));
    return new Response(JSON.stringify({
      success: true,
      download_url: `/media/${fileName}`,
      message: "Reel ready for download! Link expires in 10 minutes.",
      expires_in: "10 minutes",
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error(ts(`UNHANDLED ERROR: ${error.stack || error.message}`));
    return new Response(JSON.stringify({
      error: error.message.includes("fetch") ? "Network error. Please try again." : error.message,
    }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

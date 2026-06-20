function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function onRequestGet(context) {
  const { env, params, request } = context;
  const filename = params.filename;
  const origin = request.headers.get("Origin") || "*";

  if (!filename || !filename.endsWith(".mp4")) {
    return new Response("Invalid file", { status: 400 });
  }

  const object = await env.REELS_BUCKET.get(filename);

  if (!object) {
    return new Response("File not found or has expired.", { status: 404 });
  }

  const uploadTime = parseInt(object.customMetadata?.uploadTime || "0");
  const age = Date.now() - uploadTime;
  const TEN_MINUTES = 10 * 60 * 1000;

  if (age > TEN_MINUTES) {
    await env.REELS_BUCKET.delete(filename).catch(() => {});
    return new Response("File has expired (10 minute limit).", {
      status: 410,
      headers: corsHeaders(origin),
    });
  }

  const remainingSeconds = Math.floor((TEN_MINUTES - age) / 1000);
  const cacheMaxAge = Math.min(remainingSeconds, 600);

  return new Response(object.body, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": `private, max-age=${cacheMaxAge}`,
      "Accept-Ranges": "bytes",
      ...corsHeaders(origin),
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

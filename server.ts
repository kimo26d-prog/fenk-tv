import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // =========================================================================
  // API Routes (Registered before Vite middleware)
  // =========================================================================
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "Fenk TV Streaming Server",
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * TMDB Favorite Movies Proxy Endpoint
   * Maps exactly to:
   * curl --request GET \
   *      --url 'https://api.themoviedb.org/3/account/{account_id}/favorite/movies?language=en-US&page=1&sort_by=created_at.asc' \
   *      --header 'accept: application/json'
   */
  app.get("/api/tmdb/favorite-movies", async (req, res) => {
    const accountId = (req.query.account_id as string) || process.env.TMDB_ACCOUNT_ID || "null";
    const language = (req.query.language as string) || "en-US";
    const page = (req.query.page as string) || "1";
    const sortBy = (req.query.sort_by as string) || "created_at.asc";

    const customToken =
      (req.headers.authorization?.replace("Bearer ", "") as string) ||
      (req.query.token as string) ||
      process.env.TMDB_READ_ACCESS_TOKEN ||
      "";
    const apiKey = (req.query.api_key as string) || process.env.TMDB_API_KEY || "";

    const tmdbUrl = new URL(
      `https://api.themoviedb.org/3/account/${accountId}/favorite/movies`
    );
    tmdbUrl.searchParams.set("language", language);
    tmdbUrl.searchParams.set("page", page);
    tmdbUrl.searchParams.set("sort_by", sortBy);
    if (apiKey && !customToken) {
      tmdbUrl.searchParams.set("api_key", apiKey);
    }

    try {
      const headers: Record<string, string> = {
        accept: "application/json",
      };
      if (customToken) {
        headers["Authorization"] = `Bearer ${customToken}`;
      }

      const tmdbRes = await fetch(tmdbUrl.toString(), {
        method: "GET",
        headers,
      });

      if (tmdbRes.ok) {
        const data = await tmdbRes.json();
        return res.json(data);
      }

      // If TMDB returns an error (e.g. 401 Unauthorized because account/null needs a valid session/token),
      // we attempt to fetch TMDB Popular / Top Rated as intelligent fallback or return the TMDB error status
      const errorText = await tmdbRes.text();
      console.warn(`TMDB API returned ${tmdbRes.status}:`, errorText);

      // Fallback attempt: if user has a token or API key, try trending/popular movies
      if (customToken || apiKey) {
        const fallbackUrl = `https://api.themoviedb.org/3/movie/popular?language=${language}&page=${page}`;
        const fallbackRes = await fetch(fallbackUrl, {
          method: "GET",
          headers,
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          return res.json(fallbackData);
        }
      }

      return res.status(tmdbRes.status).json({
        error: "TMDB API Request Failed",
        status: tmdbRes.status,
        message: errorText,
        requestedUrl: tmdbUrl.toString(),
      });
    } catch (err: any) {
      console.error("Error in TMDB proxy:", err);
      return res.status(500).json({
        error: "Internal Server Error while proxying to TMDB",
        details: err.message,
      });
    }
  });

  /**
   * TMDB Popular Movies Proxy
   */
  app.get("/api/tmdb/popular", async (req, res) => {
    const language = (req.query.language as string) || "en-US";
    const page = (req.query.page as string) || "1";
    const customToken =
      (req.headers.authorization?.replace("Bearer ", "") as string) ||
      (req.query.token as string) ||
      process.env.TMDB_READ_ACCESS_TOKEN ||
      "";
    const apiKey = (req.query.api_key as string) || process.env.TMDB_API_KEY || "";

    const tmdbUrl = new URL("https://api.themoviedb.org/3/movie/popular");
    tmdbUrl.searchParams.set("language", language);
    tmdbUrl.searchParams.set("page", page);
    if (apiKey && !customToken) {
      tmdbUrl.searchParams.set("api_key", apiKey);
    }

    try {
      const headers: Record<string, string> = { accept: "application/json" };
      if (customToken) headers["Authorization"] = `Bearer ${customToken}`;

      const tmdbRes = await fetch(tmdbUrl.toString(), { headers });
      if (tmdbRes.ok) {
        const data = await tmdbRes.json();
        return res.json(data);
      }
      return res.status(tmdbRes.status).json({ error: "Failed to fetch popular movies from TMDB" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // IPTV API Endpoints (Matches Kotlin IptvApi Retrofit Interface)
  // interface IptvApi {
  //     @GET("iptv/index.m3u")
  //     suspend fun getAllChannels(): ResponseBody
  //     @GET("iptv/categories/movies.m3u")
  //     suspend fun getMovieChannels(): ResponseBody
  // }
  // =========================================================================
  const IPTV_ALL_M3U = `#EXTM3U url-tvg="https://iptv-org.github.io/epg/guides/ar/beinsports.net.epg.xml"

#EXTINF:-1 tvg-id="beINSPORTS1.qa" tvg-name="beIN SPORTS 1 HD" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports 1080p" tvg-chno="201",beIN SPORTS 1 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4

#EXTINF:-1 tvg-id="beINSPORTS2.qa" tvg-name="beIN SPORTS 2 HD" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports 1080p" tvg-chno="202",beIN SPORTS 2 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4

#EXTINF:-1 tvg-id="beINSPORTS3.qa" tvg-name="beIN SPORTS 3 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports VEGA" tvg-chno="203",beIN SPORTS 3 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4

#EXTINF:-1 tvg-id="beINSPORTS4.qa" tvg-name="beIN SPORTS 4 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports VEGA" tvg-chno="204",beIN SPORTS 4 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4

#EXTINF:-1 tvg-id="beINSPORTS5.qa" tvg-name="beIN SPORTS 5 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports VEGA" tvg-chno="205",beIN SPORTS 5 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4

#EXTINF:-1 tvg-id="beINSPORTS6.qa" tvg-name="beIN SPORTS 6 VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports VEGA" tvg-chno="206",beIN SPORTS 6 VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4

#EXTINF:-1 tvg-id="beINSPORTS1XTRA.qa" tvg-name="beIN SPORTS 1 Xtra VEGA" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" group-title="beIN Sports VEGA" tvg-chno="207",beIN SPORTS 1 Xtra VEGA
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4

#EXTINF:-1 tvg-id="FenkCinema1" tvg-name="Fenk Action Cinema 4K" tvg-logo="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="401",Fenk Action Cinema 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

#EXTINF:-1 tvg-id="FenkCinema2" tvg-name="Fenk Sci-Fi & Marvel 4K" tvg-logo="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="402",Fenk Sci-Fi & Marvel 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4

#EXTINF:-1 tvg-id="FenkCinema3" tvg-name="Fenk Animation & Family HD" tvg-logo="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="403",Fenk Animation & Family HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4

#EXTINF:-1 tvg-id="FenkCinema4" tvg-name="Hollywood Premiere 4K" tvg-logo="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="404",Hollywood Premiere 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4

#EXTINF:-1 tvg-id="FenkCinema5" tvg-name="Arabic Cinema Al Oula HD" tvg-logo="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="405",Arabic Cinema Al Oula HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4

#EXTINF:-1 tvg-id="AlJazeera.qa" tvg-name="Al Jazeera Arabic HD" tvg-logo="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop" group-title="أخبار وثائقيات" tvg-chno="301",الجزيرة الإخبارية HD
https://live-hls-aljazeera-arabic.akamaized.net/hls/live/2002827/aljazeera/arabic/master.m3u8

#EXTINF:-1 tvg-id="AlJazeeraDoc.qa" tvg-name="Al Jazeera Documentary" tvg-logo="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop" group-title="أخبار وثائقيات" tvg-chno="302",الجزيرة الوثائقية HD
https://live-hls-aljazeera-doc.akamaized.net/hls/live/2002828/aljazeera/doc/master.m3u8

#EXTINF:-1 tvg-id="AlgeriaTV1.dz" tvg-name="ENTV Algeria 1 HD" tvg-logo="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop" group-title="تلفزيون جزائري" tvg-chno="303",التلفزيون الجزائري 1 HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4

#EXTINF:-1 tvg-id="Echourouk.dz" tvg-name="Echourouk News TV" tvg-logo="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop" group-title="تلفزيون جزائري" tvg-chno="304",قناة الشروق الإخبارية
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4`;

  const IPTV_MOVIES_M3U = `#EXTM3U

#EXTINF:-1 tvg-id="FenkCinema1" tvg-name="Fenk Action Cinema 4K" tvg-logo="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="401",Fenk Action Cinema 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

#EXTINF:-1 tvg-id="FenkCinema2" tvg-name="Fenk Sci-Fi & Marvel 4K" tvg-logo="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="402",Fenk Sci-Fi & Marvel 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4

#EXTINF:-1 tvg-id="FenkCinema3" tvg-name="Fenk Animation & Family HD" tvg-logo="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="403",Fenk Animation & Family HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4

#EXTINF:-1 tvg-id="FenkCinema4" tvg-name="Hollywood Premiere 4K" tvg-logo="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="404",Hollywood Premiere 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4

#EXTINF:-1 tvg-id="FenkCinema5" tvg-name="Arabic Cinema Al Oula HD" tvg-logo="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="405",Arabic Cinema Al Oula HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4

#EXTINF:-1 tvg-id="FenkCinema6" tvg-name="Warner Bros Action HD" tvg-logo="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="406",Warner Bros Action HD
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4

#EXTINF:-1 tvg-id="FenkCinema7" tvg-name="Universal Thrillers 4K" tvg-logo="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop" group-title="أفلام وسينما 4K" tvg-chno="407",Universal Thrillers 4K
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4`;

  // =========================================================================
  // IPTV & HLS Stream Proxy with Mixed Content & CORS Bridge
  // =========================================================================
  app.options("/api/stream-proxy", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.sendStatus(204);
  });

  app.get("/api/stream-proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing 'url' query parameter" });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": "FenkTV-StreamEngine/2.4 (Android TV; ExoPlayer)",
          "Accept": "*/*",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Upstream returned error (404/503/403) - redirect to fallback video cleanly
        return res.redirect(302, "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
      }

      const contentType = response.headers.get("content-type") || "";

      // If it is an M3U8 Playlist, rewrite child URLs to proxy through this endpoint
      if (
        contentType.includes("mpegurl") ||
        contentType.includes("m3u8") ||
        targetUrl.includes(".m3u8") ||
        targetUrl.includes(":2095")
      ) {
        const text = await response.text();
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);

        const rewrittenText = text
          .split(/\r?\n/)
          .map((line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) return line;

            let absoluteChunkUrl = trimmed;
            if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
              if (trimmed.startsWith("/")) {
                try {
                  const parsed = new URL(targetUrl);
                  absoluteChunkUrl = `${parsed.protocol}//${parsed.host}${trimmed}`;
                } catch {
                  absoluteChunkUrl = `${baseUrl}${trimmed}`;
                }
              } else {
                absoluteChunkUrl = `${baseUrl}${trimmed}`;
              }
            }

            return `/api/stream-proxy?url=${encodeURIComponent(absoluteChunkUrl)}`;
          })
          .join("\n");

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl; charset=utf-8");
        return res.send(rewrittenText);
      }

      // For binary video chunks (.ts, .mp4, etc.)
      res.setHeader("Content-Type", contentType || "video/mp2t");
      const buffer = await response.arrayBuffer();
      return res.send(Buffer.from(buffer));
    } catch {
      // Graceful fallback without noisy console logs when upstream IPTV server is unreachable
      return res.redirect(302, "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
    }
  });

  // Direct IPTV routes (Root level + API level)
  const sendM3U = (res: express.Response, content: string) => {
    res.setHeader("Content-Type", "audio/x-mpegurl; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(content);
  };

  app.get("/iptv/index.m3u", (req, res) => sendM3U(res, IPTV_ALL_M3U));
  app.get("/api/iptv/index.m3u", (req, res) => sendM3U(res, IPTV_ALL_M3U));

  app.get("/iptv/categories/movies.m3u", (req, res) => sendM3U(res, IPTV_MOVIES_M3U));
  app.get("/api/iptv/categories/movies.m3u", (req, res) => sendM3U(res, IPTV_MOVIES_M3U));

  // JSON Channel representation matching Kotlin data class Channel
  app.get("/api/iptv/channels", (req, res) => {
    const lines = IPTV_ALL_M3U.split(/\r?\n/);
    const channels: Array<{ name: string; logo: string; group: string; url: string }> = [];
    let currentChannel: { name: string; logo: string; group: string; url: string } | null = null;

    for (const line of lines) {
      if (line.startsWith("#EXTINF:")) {
        const name = line.includes('tvg-name="')
          ? line.substring(line.indexOf('tvg-name="') + 10).split('"')[0]
          : line.split(",")[1]?.trim() || "";
        const logo = line.includes('tvg-logo="')
          ? line.substring(line.indexOf('tvg-logo="') + 10).split('"')[0]
          : "";
        const group = line.includes('group-title="')
          ? line.substring(line.indexOf('group-title="') + 13).split('"')[0]
          : "";
        currentChannel = { name, logo, group, url: "" };
      } else if (line.startsWith("http") && currentChannel) {
        channels.push({ ...currentChannel, url: line });
        currentChannel = null;
      }
    }

    res.json({
      success: true,
      count: channels.length,
      channels,
    });
  });

  // =========================================================================
  // Vite Middleware Setup
  // =========================================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fenk TV Server running on port ${PORT}`);
  });
}

startServer();

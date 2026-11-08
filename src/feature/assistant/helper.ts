import { Linking, Platform } from "react-native";

type YouTubeVideo = {
    videoId: string;
    title: string;
};

type ActionResponse = Promise<{
    success: boolean;
    message: string;
}>

const YOUTUBE_SEARCH_API =
    "https://www.youtube.com/youtubei/v1/search?prettyPrint=false";


function findVideos(data: any): YouTubeVideo[] {
    const results: YouTubeVideo[] = [];

    function walk(value: any) {
        if (!value || typeof value !== "object") return;

        if (value.videoRenderer?.videoId) {
            const video = value.videoRenderer;

            results.push({
                videoId: video.videoId,
                title:
                    video.title?.runs?.map((r: any) => r.text).join("") ??
                    video.title?.simpleText ??
                    "",
            });
        }

        if (Array.isArray(value)) {
            value.forEach(walk);
        } else {
            Object.values(value).forEach(walk);
        }
    }

    walk(data);

    return results;
}

async function getFirstYoutubeVideo(query: string) {

    try {
        const response = await fetch(YOUTUBE_SEARCH_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-YouTube-Client-Name": "1",
                "X-YouTube-Client-Version": "2.20261001.00.00",
            },
            body: JSON.stringify({
                context: {
                    client: {
                        clientName: "WEB",
                        clientVersion: "2.20261001.00.00",
                        hl: "en",
                        gl: "IN",
                    },
                },
                query: query,
                params: "EgIQAQ==",
            }),
        });
        if (!response.ok) {
            return null
        }
        const data = await response.json();
        const videos = findVideos(data);
        if (!videos.length) {
            throw new Error("No matching videos found");
        }
        const firstVideo = videos[0];
        return firstVideo
    } catch (error) {
        console.error("Music playback error:", error)
        return null
    }
}


export async function playYoutubeMusic(query: string): ActionResponse {
    if (!query) {
        return {
            success: true,
            message: "Please tell me the song name."
        }
    }
    try {
        let video = await getFirstYoutubeVideo(query)
        if (video) {
            const musicUrl =
                `https://music.youtube.com/watch?v=${video.videoId}`;
            await Linking.openURL(musicUrl);
            return {
                success: true,
                message: `Playing ${video.title} on YouTube Music.`
            }
        } else {
            const searchUrl = `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
            await Linking.openURL(searchUrl);
            return {
                success: true,
                message: `Searching ${query} on YouTube Music.`
            }
        }
    } catch (error) {
        console.error("Music playback error:", error);
        return {
            success: false,
            message: `Couldn't find or open ${query}.`
        }
    }
}


export async function playYoutube(query: string): ActionResponse{
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    return {
      success: false,
      message: "Please tell me the video title.",
    };
  }

  try {
    const video = await getFirstYoutubeVideo(cleanQuery);

    if (!video?.videoId) {
      await Linking.openURL(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`,
      );

      return {
        success: false,
        message: `No video found. Searching YouTube for ${cleanQuery}.`,
      };
    }

    const videoId = video.videoId;

    if (Platform.OS === "android") {
      try {
        // Open the video in the YouTube Android app.
        await Linking.openURL(`vnd.youtube:${videoId}`);

        return {
          success: true,
          message: `Opening ${video.title} on YouTube.`,
        };
      } catch (error) {
        console.log("YouTube app unavailable:", error);
      }
    }

    await Linking.openURL(
      `https://www.youtube.com/watch?v=${videoId}`,
    );

    return {
      success: true,
      message: `Opening ${video.title} on YouTube.`,
    };
  } catch (error) {
    console.error("Video playback error:", error);

    try {
      await Linking.openURL(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`,
      );

      return {
        success: false,
        message: `Searching YouTube for ${cleanQuery}.`,
      };
    } catch {
      return {
        success: false,
        message: `Couldn't find or open ${cleanQuery}.`,
      };
    }
  }
}

export async function playMusic(cleanQuery: string): ActionResponse {
    if (!cleanQuery) {
        return {
            success: false,
            message: "Please tell me the song name."
        }
    }
    if (Platform.OS === "android") {
        try {
            await Linking.sendIntent(
                "android.media.action.MEDIA_PLAY_FROM_SEARCH",
                [
                    {
                        key: "android.intent.extra.focus",
                        value: "vnd.android.cursor.item/audio",
                    },
                    {
                        key: "query",
                        value: cleanQuery,
                    },
                    {
                        key: "android.intent.extra.title",
                        value: cleanQuery,
                    },
                ],
            );
            return {
                success: false,
                message: `Playing ${cleanQuery}`
            }
        } catch (error) {
            console.log("Direct playback unavailable:", error);
            return {
                success: false,
                message: `Couldn't find or open ${cleanQuery}.`
            }
        }

    }
    return {
        success: false,
        message: `Couldn't find or open ${cleanQuery}.`
    }
}
import * as WebBrowser from "expo-web-browser";
import * as Contacts from "expo-contacts/legacy";
import { Linking, Platform } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";

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


export type ContactMatch = {
    id: string;
    name: string;
    phoneNumbers: string[];
};

export async function findContact(
    query: string,
): ActionResponse {
    if (!query?.trim()) {
        return {
            success: false,
            message: "Please tell me the contact name.",
        };
    }

    try {
        // 1. Request permission
        const { status } = await Contacts.requestPermissionsAsync();

        if (status !== "granted") {
            return {
                success: false,
                message: "I need permission to access your contacts.",
            };
        }

        // 2. Search contacts by name
        const response = await Contacts.getContactsAsync({
            name: query.trim(),
            fields: [
                Contacts.Fields.Name,
                Contacts.Fields.PhoneNumbers,
            ],
            pageSize: 50,
            pageOffset: 0,
            sort: Contacts.SortTypes.FirstName,
        });

        // 3. Extract matching contacts
        const matches: ContactMatch[] = response.data
            .filter(contact => contact.phoneNumbers?.length)
            .map(contact => ({
                id: contact.id,
                name: contact.name || "Unknown",
                phoneNumbers: [
                    ...new Set(
                        contact.phoneNumbers!
                            .map(phone => phone.number?.trim().replaceAll(" ",''))
                            .filter((number): number is string => !!number),
                    ),
                ],
            }))
            .filter(contact => contact.phoneNumbers.length > 0);
console.log({matches});

if (matches.length === 1) {
    const contact = matches[0];

    return {
        success: true,
        message: `Found ${contact.name}. Phone number: ${contact.phoneNumbers.join(", ")}. Contact index: 1.`,
    };
}

const contactList = matches
    .map((contact, index) =>
        `${index + 1}. ${contact.name}, phone: ${contact.phoneNumbers.join(", ")}`
    )
    .join("\n");

return {
    success: true,
    message: `I found ${matches.length} matching contacts:
    \n${contactList}
    \n Do select a contact by number from 1 to ${matches.length}.`,
};
    } catch (error) {
        console.error("Find contact error:", error);

        return {
            success: false,
            message: "Something went wrong while searching contacts.",
        };
    }
}

export async function callNumber(phoneNumber: string) {
  const cleanedNumber = phoneNumber.replace(/[^\d+]/g, "");
  return {
    success: true,
    message: `are you sure? calling ${phoneNumber}.`,
  };
}

export async function callNumberConfirm(phoneNumber: string) {
  const cleanedNumber = phoneNumber.replace(/[^\d+]/g, "");
  if (Platform.OS === "android") {
    await IntentLauncher.startActivityAsync(
      // IntentLauncher.ActivityAction.c,
      "android.intent.action.CALL",
      {
        data: `tel:${cleanedNumber}`,
      },
    );
  } else {
    await Linking.openURL(`tel:${cleanedNumber}`);
  }
  return {
    success: true,
    message: `Calling ${phoneNumber}.`,
  };
}

export async function callNumberReject(phoneNumber: string) {
  const cleanedNumber = phoneNumber.replace(/[^\d+]/g, "");
  return {
    success: true,
    message: `not calling ${phoneNumber}.`,
  };
}


export async function searchWeb(query: string) {
  const url =
    `https://www.google.com/search?q=` +
    encodeURIComponent(query);

  await WebBrowser.openBrowserAsync(url);

  return {
    success: true,
    message: `Searching for "${query}".`,
  };
}


export function calculate(expression: string) {
  const cleaned = expression
    .replace(/[^0-9+\-*/().% ]/g, "")
    .trim();

  if (!cleaned) {
    return {
      success: false,
      message: "I couldn't understand that calculation.",
    };
  }

  try {
    // Basic arithmetic only.
    const result = Function(
      `"use strict"; return (${cleaned})`,
    )();

    if (typeof result !== "number" || !Number.isFinite(result)) {
      throw new Error("Invalid result");
    }

    return {
      success: true,
      message: String(result),
    };
  } catch {
    return {
      success: false,
      message: "I couldn't calculate that.",
    };
  }
}


export function parseContactSelectionIndex(reply: string): number | undefined {
  const value = reply
    .trim()
    .toLowerCase()
    .replace(/[.!?,]/g, "")
    .replace(/\s+/g, " ");

  const numericMatch = value.match(
    /^(?:(?:select|choose|call|dial)\s+)?(?:(?:the\s+)?(?:number|option|contact)\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:\s+(?:one|contact))?$/i
  );

  if (numericMatch?.[1]) {
    return Number(numericMatch[1]);
  }

  const numberWords: Record<string, number> = {
    first: 1,
    one: 1,
    second: 2,
    two: 2,
    third: 3,
    three: 3,
    fourth: 4,
    four: 4,
    fifth: 5,
    five: 5,
    sixth: 6,
    six: 6,
    seventh: 7,
    seven: 7,
    eighth: 8,
    eight: 8,
    ninth: 9,
    nine: 9,
    tenth: 10,
    ten: 10,
  };

  const wordMatch = value.match(
    /^(?:(?:select|choose|call|dial)\s+)?(?:the\s+)?(first|one|second|two|third|three|fourth|four|fifth|five|sixth|six|seventh|seven|eighth|eight|ninth|nine|tenth|ten)(?:\s+(?:one|contact))?$/i
  );

  if (wordMatch?.[1]) {
    return numberWords[wordMatch[1]];
  }

  return undefined;
}

// function getFirstPhoneNumber(value: string): string | undefined {
//   const numbers = extractPhoneNumbers(value);

//   if (numbers?.length) {
//     return numbers[0];
//   }

//   return value.match(/\+?\d[\d\s()-]{4,}\d/)?.[0]?.trim();
// }

export function getFirstPhoneNumber(value: string): string | undefined {
  const match = value.match(/\+?\d[\d\s()-]*\d|\d/);

  return match?.[0]?.replace(/[^\d+]/g, "");
}

// function getContactPhoneNumber(
//   contactContext: string,
//   contactIndex: number
// ): string | undefined {

//   // Multiple contacts:
//   // 1. John, phone: 9876543210
//   // 2. Alex, phone: 9123456780

//   const numberedLine = contactContext.match(
//     new RegExp(
//       `^[\\t ]*${contactIndex}\\.[\\t ]*.*?\\bphone:\\s*([^\\r\\n]+)`,
//       "im"
//     )
//   );

//   if (numberedLine?.[1]) {
//     return getFirstPhoneNumber(numberedLine[1]);
//   }

//   // Single contact:
//   // Found John. Phone number: 9876543210. Contact index: 1.

//   const singleContactIndex = contactContext.match(
//     /Contact index:\s*(\d+)/i
//   );

//   if (Number(singleContactIndex?.[1]) === contactIndex) {
//     const phoneMatch = contactContext.match(
//       /Phone number:\s*([^\r\n]*?)(?:\s*Contact index:\s*\d+\.?)?\s*$/im
//     );

//     if (phoneMatch?.[1]) {
//       return getFirstPhoneNumber(phoneMatch[1]);
//     }
//   }

//   return undefined;
// }


export function extractPhoneNumbers(text: string): string[] {
    const matches = text.match(
        /(?:\+?\d[\d\s()-]{5,}\d)/g
    ) || [];

    return [
        ...new Set(
            matches.map(number =>
                number.replace(/[\s()-]/g, "").trim()
            )
        ),
    ];
}

export function getContactPhoneNumber(
  contactContext: string,
  contactIndex: number
): string | undefined {

  const lines = contactContext.split(/\r?\n/);

  // Find the exact numbered contact line.
  const selectedLine = lines.find(line =>
    new RegExp(`^\\s*${contactIndex}\\.\\s*`).test(line)
  );

  console.log("[Selected Contact Line]", selectedLine);

  if (selectedLine) {
    const phoneMatch = selectedLine.match(
      /\bphone:\s*(.+)$/i
    );

    if (phoneMatch?.[1]) {
      return getFirstPhoneNumber(phoneMatch[1]);
    }
  }

  // Single contact fallback.
  const singleContactIndex = contactContext.match(
    /Contact index:\s*(\d+)/i
  );

  if (Number(singleContactIndex?.[1]) === contactIndex) {
    const phoneMatch = contactContext.match(
      /Phone number:\s*(.+?)(?=\s*Contact index:|$)/i
    );

    if (phoneMatch?.[1]) {
      return getFirstPhoneNumber(phoneMatch[1]);
    }
  }

  return undefined;
}

// Normalize text
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[?!,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Remove polite introductory phrases
export function removePolitePrefix(text: string): string {
  return text.replace(
    /^(please\s+|can you\s+|could you\s+|would you\s+|hey\s+assistant\s+|assistant\s+|hey\s+)+/i,
    "",
  ).trim();
}
import { AssistantIntent, SupportedApp } from "@/feature/assistant/types";
import { Linking, Platform } from "react-native";
import { parseIntentWithAI } from "./ai/service/ai-intent.service";
import { calculate, callNumber, callNumberConfirm, callNumberReject, findContact, getContactPhoneNumber, getFirstPhoneNumber, normalizeText, parseContactSelectionIndex, playYoutube, playYoutubeMusic, removePolitePrefix, searchWeb } from "./helper";
import { getBrightness, setBrightness } from "./service/device-control";

export const appAliases: Record<string, SupportedApp> = {
  // YouTube
  // youtube: "youtube",
  // "you tube": "youtube",

  // Chrome
  chrome: "chrome",
  browser: "chrome",
  google: "chrome",

  // WhatsApp
  whatsapp: "whatsapp",
  "what's app": "whatsapp",
  "whats app": "whatsapp",

  // Spotify
  spotify: "spotify",
  "spotify music": "spotify",

  // Maps
  maps: "maps",
  "google maps": "maps",

  // Settings
  settings: "settings",
};


const appUrls: Record<SupportedApp, string> = {
  youtube: "vnd.youtube://",
  chrome: "googlechrome://",
  whatsapp: "whatsapp://",
  spotify: "spotify://",
  maps: "geo:0,0?q=",
  settings: "app-settings:",
};

// const appUrls: Record<SupportedApp, string> = {
//   // youtube: "youtube://results?search_query=cocomelon",
//   youtube: "vnd.youtube://results?search_query=cocomelon",
//   chrome: "googlechrome:///search?q=cocomelon",
//   whatsapp: "whatsapp://",
//   spotify: "spotify://search/cocomelon",
//   maps: "geo:0,0?q=kolkata",
//   settings: "app-settings:",
// };

const webFallbacks: Partial<Record<SupportedApp, string>> = {
  youtube: "https://www.youtube.com",
  chrome: "https://www.google.com",
  whatsapp: "https://www.whatsapp.com",
  spotify: "https://open.spotify.com",
  maps: "https://maps.google.com",
};



export async function openApp(app: SupportedApp) {
  const url = appUrls[app];

  try {
    await Linking.openURL(url);

    return {
      success: true,
      message: `Opening ${getAppName(app)}.`,
    };
  } catch {
    const fallback = webFallbacks[app];

    if (fallback) {
      try {
        await Linking.openURL(fallback);

        return {
          success: true,
          message: `I couldn't open the app, so I opened ${getAppName(app)} in the browser.`,
        };
      } catch {
        // Browser fallback also failed.
      }
    }

    return {
      success: false,
      message: `I couldn't open ${getAppName(app)}.`,
    };
  }
}

function getAppName(app: SupportedApp) {
  switch (app) {
    case "youtube":
      return "YouTube";

    case "chrome":
      return "Chrome";

    case "whatsapp":
      return "WhatsApp";

    case "spotify":
      return "Spotify";

    case "maps":
      return "Maps";

    case "settings":
      return "Settings";

    default:
      return app;
  }
}




// export async function callNumber(phoneNumber: string) {
//   const url = `tel:${phoneNumber}`;

//   const supported = await Linking.canOpenURL(url);

//   if (!supported) {
//     return {
//       success: false,
//       message: "Calling isn't available on this device.",
//     };
//   }

//   await Linking.openURL(url);

//   return {
//     success: true,
//     message: `Calling ${phoneNumber}.`,
//   };
// }


// export async function findContact(name: string) {
//   const { status } = await Contacts.requestPermissionsAsync();

//   if (status !== "granted") {
//     throw new Error("Contacts permission denied");
//   }

//   const { data } = await Contacts.getContactsAsync({
//     fields: [Contacts.Fields.PhoneNumbers],
//   });

//   const contact = data.find((item) =>
//     item.name?.toLowerCase().includes(name.toLowerCase())
//   );

//   if (!contact?.phoneNumbers?.length) {
//     return null;
//   }
//   return contact.phoneNumbers[0].number;
// }



// export async function handleAssistantMessage(
//   text: string,
// ): Promise<string> {
//   const intent = parseIntent(text);

//   switch (intent.type) {
//     case "open_app": {
//       const result = await openApp(intent.app);

//       return result.message;
//     }

//     case "web_search": {
//       const result = await searchWeb(intent.query);

//       return result.message;
//     }

//     case "calculate": {
//       const result = calculate(intent.expression);

//       return result.message;
//     }

//     case "call": {
//       const result = await callNumber(
//         intent.phoneNumber,
//       );

//       return result.message;
//     }

//     case "whatsapp": {
//       return "WhatsApp actions aren't implemented yet.";
//     }

//     case "unknown":
//     default:
//       return (
//         "I don't know how to do that yet.\n\n" +
//         "Try:\n" +
//         "• Open YouTube\n" +
//         "• Search for React Native\n" +
//         "• Calculate 25 * 18\n" +
//         "• Call 9876543210"
//       );
//   }
// }

const DEAFAULT_UNKNOWN = (

  "I don't know how to do that yet.\n\n" +
  "Try:\n" +
  "• Open YouTube\n" +
  "• Search for React Native\n" +
  "• Calculate 25 * 18\n" +
  "• Call 9876543210"
);

const AI_UNKNOWN = (
  " 🤖 I don't know how to do that yet.\n\n" +
  "Try:\n" +
  "• Open YouTube\n" +
  "• Search for React Js\n" +
  "• Calculate 25 * 18\n" +
  "• Call 9876543210"
);


const appNames = Object.keys(appAliases).sort(
  (a, b) => b.length - a.length,
);



// Find supported application
function detectApp(text: string): SupportedApp | null {
  for (const alias of appNames) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const pattern = new RegExp(
      `(?:^|\\s)${escaped}(?=\\s|$)`,
      "i",
    );

    if (pattern.test(text)) {
      return appAliases[alias];
    }
  }

  return null;
}

// Extract calculator expression
// function extractExpression(text: string): string | null {
//   let expression = text
//     .replace(/^(calculate|compute|solve|what is|what's|how much is)\s+/i, "")
//     .trim();

//   // Convert spoken mathematical operators
//   const replacements: [RegExp, string][] = [
//     [/\bmultiplied by\b|\btimes\b|\binto\b|\bmultiplied\b|\bby\b/gi, "*"],
//     [/\bdivided by\b|\bdivide\b/gi, "/"],
//     [/\bplus\b|\badded to\b/gi, "+"],
//     [/\bminus\b|\bsubtract\b/gi, "-"],
//     [/\bmodulo\b|\bmod\b/gi, "%"],
//   ];

//   for (const [pattern, replacement] of replacements) {
//     expression = expression.replace(pattern, replacement);
//   }

//   expression = expression.replace(/,/g, "");

//   // Only allow arithmetic characters
//   if (!/[0-9]/.test(expression)) return null;

//   if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
//     return null;
//   }

//   return expression.trim();
// }


function extractExpression(text: string): string | null {
  let expression = text
    .replace(
      /^(calculate|compute|solve|what is|what's|how much is)\s+/i,
      "",
    )
    .trim();

  // Spoken arithmetic patterns
  const spokenPatterns: [RegExp, string][] = [
    [/^multiply\s+(.+?)\s+by\s+(.+)$/i, "$1 * $2"],
    [/^divide\s+(.+?)\s+by\s+(.+)$/i, "$1 / $2"],
    [/^add\s+(.+?)\s+and\s+(.+)$/i, "$1 + $2"],
    [/^subtract\s+(.+?)\s+from\s+(.+)$/i, "$2 - $1"],
  ];

  for (const [pattern, replacement] of spokenPatterns) {
    if (pattern.test(expression)) {
      expression = expression.replace(pattern, replacement);
      break;
    }
  }

  const replacements: [RegExp, string][] = [
    [/\bmultiplied by\b|\btimes\b|\binto\b/gi, "*"],
    [/\bdivided by\b/gi, "/"],
    [/\bplus\b/gi, "+"],
    [/\bminus\b/gi, "-"],
    [/\bmodulo\b|\bmod\b/gi, "%"],
  ];

  for (const [pattern, replacement] of replacements) {
    expression = expression.replace(pattern, replacement);
  }

  expression = expression.replace(/,/g, "");

  if (!/[0-9]/.test(expression)) return null;

  if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
    return null;
  }

  return expression.trim();
}



export function parseIntent(text: string): AssistantIntent {
  const rawText = text.trim();

  if (!rawText) {
    return { type: "unknown" };
  }

  // =====================================================
  // 1. CONTACT SELECTION FROM PREVIOUS RESPONSE
  // =====================================================

const findContactContext = rawText.match(
  /find_contact confirmation:\s*([\s\S]*?)\n\s*User reply:\s*([\s\S]*)$/i
);

if (findContactContext) {
 const findContactContext = rawText.match(
  /find_contact confirmation:\s*([\s\S]*?)\n\s*User reply:\s*([\s\S]*)$/i
);

if (findContactContext) {
  const previousResponse = findContactContext[1];
  const userReply = findContactContext[2].trim();

  // Explicit call command takes priority over contact selection.
  const directDialMatch = userReply.match(
    /^(?:please\s+)?(?:call|phone|dial|ring)\s+(.+)$/i
  );

  if (directDialMatch?.[1]) {
    const target = directDialMatch[1]
      .trim()
      .replace(/[.!?,]+$/, "");

    const isPhoneNumber = /^[+\d\s()-]+$/.test(target);
    const digitCount = target.replace(/\D/g, "").length;

    if (isPhoneNumber && digitCount >= 3) {
      return {
        type: "call",
        phoneNumber: target.replace(/[^\d+]/g, ""),
      };
    }
  }

  // Otherwise, select a contact by index.
  const contactIndex = parseContactSelectionIndex(userReply);

  if (!contactIndex || contactIndex < 1) {
    return { type: "unknown" };
  }

  const phoneNumber = getContactPhoneNumber(
    previousResponse,
    contactIndex
  );

  console.log("[Contact Selection]", {
    contactIndex,
    phoneNumber,
  });

  if (phoneNumber) {
    return {
      type: "call",
      phoneNumber,
    };
  }

  return { type: "unknown" };
}
}
  // =====================================================
  // 2. CALL CONFIRMATION / REJECTION
  // =====================================================

  const callContext = rawText.match(
    /call confirmation:\s*([\s\S]*?)\n\s*User reply:\s*([\s\S]*)$/i
  );

  if (callContext) {
    const previousResponse = callContext[1];
    const userReply = callContext[2]
      .trim()
      .toLowerCase()
      .replace(/[.!?,]/g, "")
      .replace(/\s+/g, " ");

    const phoneNumber = getFirstPhoneNumber(previousResponse);

    const confirmationMatch =
      /^(?:yes|yeah|yep|yea|y|confirm|confirmed|proceed|sure|sure thing|go ahead|do it|please do|call)(?: please)?$/i.test(
        userReply
      );

    const rejectionMatch =
      /^(?:no|nope|nah|n|cancel|reject|stop|dont call|do not call|no thanks)$/i.test(
        userReply
      );

    console.log("[Call Confirmation]", {
      userReply,
      phoneNumber,
      confirmationMatch,
      rejectionMatch,
    });

    if (phoneNumber && confirmationMatch) {
      return {
        type: "confirm_call",
        phoneNumber,
      };
    }

    if (phoneNumber && rejectionMatch) {
      return {
        type: "reject_call",
        phoneNumber,
      };
    }

    return { type: "unknown" };
  }

  // =====================================================
  // 3. NORMAL INTENT PARSING
  // =====================================================

  const normalized = normalizeText(rawText);
  const command = removePolitePrefix(normalized);

  if (!command) {
    return { type: "unknown" };
  }

  console.log("[Intent Parser]", {
    normalized,
    command,
  });

  // =====================================================
  // 4. FIND CONTACT BY EXPLICIT CONTACT / NUMBER REQUEST
  // =====================================================

  const explicitContactMatch = command.match(
    /^(?:find|search(?:\s+for)?|look\s+for|look\s+up|get|show(?:\s+me)?|google)\s+(?:(?:the\s+)?contact(?:\s+(?:named|called))?\s+|(?:the\s+)?(?:phone\s+)?number\s+(?:of|for)\s+)(.+)$/i
  );

  if (explicitContactMatch?.[1]) {
    return {
      type: "find_contact",
      phoneNumber: explicitContactMatch[1]
        .trim()
        .replace(/[?.!,]+$/, ""),
    };
  }

  // Examples:
  // What's John's number?
  // What is John's phone number?
  // Tell me John's contact.

  const contactSuffixMatch = command.match(
    /^(?:who\s+is|what\s+is|what's|tell\s+me)\s+(.+?)(?:'s)?\s+(?:contact|phone\s+number|number)$/i
  );

  if (contactSuffixMatch?.[1]) {
    return {
      type: "find_contact",
      phoneNumber: contactSuffixMatch[1].trim(),
    };
  }


// GET CURRENT BRIGHTNESS
const brightnessInfoMatch = command.match(
  /^(?:what(?:'s| is)|tell me|check|show|get|read)\s+(?:my\s+)?(?:screen\s+)?brightness(?:\s+level)?[?.!]*$/i
);

if (brightnessInfoMatch) {
  return {
    type: "brightness_info",
  };
}

// SET BRIGHTNESS
// const brightnessMatch = command.match(
//   /^(?:set|change|adjust|make)\s+(?:my\s+)?(?:screen\s+)?brightness\s+(?:to\s+)?(\d{1,3})\s*(?:%|percent)?[?.!]*$/i
// );
const brightnessMatch = command.match(
  /^(?:(?:please|can you|could you)\s+)?(?:(?:set|change|adjust|make|turn)\s+)?(?:my\s+)?(?:(?:screen|display)\s+)?brightness\s+(?:(?:to|at|level)\s+)?(\d{1,3})\s*(?:%|percent)?[?.!]*$/i
);
if (brightnessMatch?.[1]) {
  const percentage = Number(brightnessMatch[1]);

  if (percentage >= 1 && percentage <= 100) {
    return {
      type: "set_brightness",
      percentage,
    };
  }

  return {
    type: "unknown",
  };
}

  // =====================================================
  // 5. WEB SEARCH
  // =====================================================

  const searchMatch = command.match(
    /^(?:search(?:\s+for)?|google|look\s+up|find\s+information\s+about)\s+(.+)$/i
  );

  if (searchMatch?.[1]) {
    return {
      type: "web_search",
      query: searchMatch[1].trim(),
    };
  }

  // =====================================================
// 6. CALL: NUMBER OR CONTACT NAME
// =====================================================

const callMatch = command.match(
  /^(?:please\s+)?(?:call|phone|dial|ring)\s+(.+)$/i
);

if (callMatch?.[1]) {
  const target = callMatch[1]
    .trim()
    .replace(/[.!?,]+$/, "");

  const isPhoneNumber = /^[+\d\s()-]+$/.test(target);
  const digitCount = target.replace(/\D/g, "").length;

  if (isPhoneNumber && digitCount >= 3) {
    return {
      type: "call",
      phoneNumber: target.replace(/[^\d+]/g, ""),
    };
  }

  // It's a contact name, not a phone number.
  return {
    type: "find_contact",
    phoneNumber: target,
  };
}

  // =====================================================
  // 6. CALL DIRECT PHONE NUMBER
  // =====================================================

  // const dialMatch = command.match(
  //   /^(?:please\s+)?(?:call|phone|dial|ring)\s+(\+?[\d][\d\s()-]*[\d])$/i
  // );

  // if (dialMatch?.[1]) {
  //   const phoneNumber = dialMatch[1].trim();

  //   if ((phoneNumber.match(/\d/g) || []).length >= 5) {
  //     return {
  //       type: "call",
  //       phoneNumber,
  //     };
  //   }
  // }

  // =====================================================
  // 7. CALL CONTACT BY NAME
  // =====================================================

  // const callContactMatch = command.match(
  //   /^(?:please\s+)?(?:call|phone|dial|ring)\s+(.+)$/i
  // );

  // if (callContactMatch?.[1]) {
  //   return {
  //     type: "find_contact",
  //     phoneNumber: callContactMatch[1].trim(),
  //   };
  // }

  // =====================================================
  // 8. FIND CONTACT BY NAME
  // =====================================================

  const findContactMatch = command.match(
    /^(?:find|look\s+for|get|show(?:\s+me)?|who\s+is)\s+(.+)$/i
  );

  if (findContactMatch?.[1]) {
    const contactQuery = findContactMatch[1]
      .trim()
      .replace(/[?.!,]+$/, "")
      .replace(/'s\s+(?:phone\s+number|number|contact)$/i, "")
      .replace(/\s+(?:phone\s+number|number|contact)$/i, "")
      .trim();

    if (contactQuery) {
      return {
        type: "find_contact",
        phoneNumber: contactQuery,
      };
    }
  }

  // =====================================================
  // 9. YOUTUBE VIDEO
  // =====================================================

  const youtubeVideoMatch = command.match(
    /^(?:play|watch)\s+(?:a\s+)?(?:(?:youtube)\s+)?video(?:\s+of|\s+about)?\s+(.+)$/i
  );

  if (youtubeVideoMatch?.[1]) {
    return {
      type: "play_youtube_video",
      query: youtubeVideoMatch[1].trim(),
    };
  }

  const watchYoutubeMatch = command.match(
    /^(?:watch|play)\s+(.+?)\s+on\s+youtube$/i
  );

  if (watchYoutubeMatch?.[1]) {
    return {
      type: "play_youtube_video",
      query: watchYoutubeMatch[1].trim(),
    };
  }

  // =====================================================
  // 10. YOUTUBE MUSIC
  // =====================================================

  const youtubeMusicMatch = command.match(
    /^(?:play|listen\s+to|put\s+on)\s+(?:(?:youtube\s+)?music|song)\s+(?:for\s+)?(.+)$/i
  );

  if (youtubeMusicMatch?.[1]) {
    return {
      type: "play_youtube_music",
      query: youtubeMusicMatch[1].trim(),
    };
  }

  const musicSuffixMatch = command.match(
    /^(?:play|listen\s+to|put\s+on)\s+(.+?)\s+on\s+(?:youtube\s+)?music$/i
  );

  if (musicSuffixMatch?.[1]) {
    return {
      type: "play_youtube_music",
      query: musicSuffixMatch[1].trim(),
    };
  }

  // =====================================================
  // 11. CALCULATOR
  // =====================================================

  if (
    /^(calculate|compute|solve|what is|what's|how much is|multiply|divide|add|subtract)\s+/i.test(
      command
    )
  ) {
    const expression = extractExpression(command);

    if (expression) {
      return {
        type: "calculate",
        expression,
      };
    }
  }

  // =====================================================
  // 12. OPEN APPLICATION
  // =====================================================

  const openMatch = command.match(
    /^(?:open|launch|start|run|go to)\s+(.+)$/i
  );

  if (openMatch?.[1]) {
    const app = detectApp(openMatch[1].trim());

    if (app) {
      return {
        type: "open_app",
        app,
      };
    }
  }

  // =====================================================
  // 13. DEFAULT: PLAY MUSIC
  // =====================================================

  const playMusicMatch = command.match(
    /^(?:play|listen\s+to|put\s+on)\s+(.+)$/i
  );

  if (playMusicMatch?.[1]) {
    return {
      type: "play_youtube_music",
      query: playMusicMatch[1].trim(),
    };
  }

  return { type: "unknown" };
}

// export function parseIntent(text: string): AssistantIntent {
//   const normalized = normalizeText(text);
//   const command = removePolitePrefix(normalized);

//   if (!command) {
//     return { type: "unknown" };
//   }
// console.log({
//   normalized,
//   command
// });

//   // 1. Web search (check before app detection)
//   const searchMatch = command.match(
//     /^(?:search(?:\s+for)?|google|look\s+up|find\s+information\s+about)\s+(.+)$/i,
//   );

//   if (searchMatch?.[1]) {
//     return {
//       type: "web_search",
//       query: searchMatch[1].trim(),
//     };
//   }


//   // // const confirmationMatch = /^(?:yes|yeah|yep|confirm|confirm call|proceed)\s+/i.test(command);//check at first
//   // const confirmationMatch =
//   //   /\b(?:yes|yeah|yep|yea|confirm|proceed)\b/i.test(command);

//   // const rejectCallMatch =
//   //   /\b(?:no|nope|cancel|reject|stop calling|cancel call|don't call|do not call)\b/i.test(command);

//   // const dialMatch = command.match(
//   //   /(?:call|phone|dial|ring)\s+(\+?[\d\s()-]+)/i,
//   // );

//   // if (dialMatch?.[1]) {
//   //   const phoneNumber = dialMatch[1].trim();

//   //   if (/\d{5,}/.test(phoneNumber)) {
//   //     return {
//   //       type: rejectCallMatch
//   //         ? "reject_call"
//   //         : confirmationMatch
//   //           ? "confirm_call"
//   //           : "call",
//   //       phoneNumber,
//   //     };
//   //   }
//   // }
//   // // Find contact
//   // const findContactMatch = command.match(
//   //   /^(?:find|search|look\s+for|get|show)\s+(?:the\s+)?(?:contact|contacts|phone\s+number|number)\s+(?:of\s+)?(.+)$/i,
//   // );

//   // if (findContactMatch?.[1]) {
//   //   return {
//   //     type: "find_contact",
//   //     phoneNumber: findContactMatch[1].trim(),
//   //   };
//   // }

//     // 2. Confirmation / rejection
//   const confirmationMatch =
//     /\b(?:yes|yeah|yep|yea|confirm|proceed)\b/i.test(command);

//   const rejectCallMatch =
//     /\b(?:no|nope|cancel|reject|stop calling|cancel call|don't call|do not call)\b/i.test(command);

//   // 3. Find contact by name or phone number
//   const findContactMatch = command.match(
//     /^(?:find|search(?:\s+for)?|look\s+for|look\s+up|get|show|who\s+is|what\s+is|what's|tell\s+me)\s+(?:(?:the\s+)?contact\s+(?:named\s+)?|(?:the\s+)?(?:phone\s+)?number\s+(?:of|for)\s+|)(.+?)(?:'s)?(?:\s+(?:contact|phone\s+number|number))?$/i
//   );

//   if (findContactMatch?.[1]) {
//     const contactQuery = findContactMatch[1]
//       .trim()
//       .replace(/[?.!,]+$/, "")
//       .trim();

//     if (contactQuery) {
//       return {
//         type: "find_contact",
//         phoneNumber: contactQuery,
//       };
//     }
//   }

//   // 4. Call by phone number
//   const dialMatch = command.match(
//     /^(?:please\s+)?(?:call|phone|dial|ring)\s+(\+?[\d\s()-]+)$/i
//   );

//   // Select contact from previous assistant response
// if (
//     /matching contacts:/i.test(command)
// ) {
//     const selectionMatch = command.match(
//         /^(?:(?:number|option|contact)\s*)?(\d{1,2})(?:st|nd|rd|th)?$|^(?:number|option|contact)\s+(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)$/i
//     );

//     const numberWords: Record<string, number> = {
//         first: 1,
//         second: 2,
//         third: 3,
//         fourth: 4,
//         fifth: 5,
//         sixth: 6,
//         seventh: 7,
//         eighth: 8,
//         ninth: 9,
//         tenth: 10,
//     };

//     if (selectionMatch) {
//         const index =
//             Number(selectionMatch[1]) ||
//             numberWords[selectionMatch[2]?.toLowerCase()];

//         const contactLines = command.match(
//             /^\d+\.\s+.+$/gm
//         ) || [];
//         let n = extractPhoneNumbers(command)?.[index]
// console.log({n});

//         if (index >= 1 && index <= contactLines.length) {
//             return {
//                 type: "call",
//                phoneNumber: n
//             };
//         }
//     }
// }

//   if (dialMatch?.[1]) {
//     const phoneNumber = dialMatch[1].trim();

//     if (/\d{5,}/.test(phoneNumber)) {
//       return {
//         type: rejectCallMatch
//           ? "reject_call"
//           : confirmationMatch
//             ? "confirm_call"
//             : "call",
//         phoneNumber,
//       };
//     }
//   }

//   // 5. Call contact by name
//   const callContactMatch = command.match(
//     /^(?:please\s+)?(?:call|phone|dial|ring)\s+(.+)$/i
//   );

//   if (callContactMatch?.[1]) {
//     return {
//       type: "find_contact",
//       phoneNumber: callContactMatch[1].trim(),
//     };
//   }


//   const youtubeVideoMatch = command.match(
//     /^(?:play|watch)\s+(?:a\s+)?(?:(?:youtube)\s+)?video(?:\s+of|\s+about)?\s+(.+)$/i,
//   );

//   if (youtubeVideoMatch?.[1]) {
//     return {
//       type: "play_youtube_video",
//       query: youtubeVideoMatch[1].trim(),
//     };
//   }

//   // Example: watch Believer on YouTube
//   const watchYoutubeMatch = command.match(
//     /^(?:watch|play)\s+(.+?)\s+on\s+youtube$/i,
//   );

//   if (watchYoutubeMatch?.[1]) {
//     return {
//       type: "play_youtube_video",
//       query: watchYoutubeMatch[1].trim(),
//     };
//   }

//   // 4. YouTube Music
//   const youtubeMusicMatch = command.match(
//     /^(?:play|listen\s+to|put\s+on)\s+(?:(?:youtube\s+)?music|song)\s+(?:for\s+)?(.+)$/i,
//   );

//   if (youtubeMusicMatch?.[1]) {
//     return {
//       type: "play_youtube_music",
//       query: youtubeMusicMatch[1].trim(),
//     };
//   }

//   // Example: play Believer on YouTube Music
//   const musicSuffixMatch = command.match(
//     /^(?:play|listen\s+to|put\s+on)\s+(.+?)\s+on\s+(?:youtube\s+)?music$/i,
//   );

//   if (musicSuffixMatch?.[1]) {
//     return {
//       type: "play_youtube_music",
//       query: musicSuffixMatch[1].trim(),
//     };
//   }

//   // Default: play <song name> means YouTube Music
//   const playMusicMatch = command.match(
//     /^(?:play|listen\s+to|put\s+on)\s+(.+)$/i,
//   );

//   if (playMusicMatch?.[1]) {
//     return {
//       type: "play_youtube_music",
//       query: playMusicMatch[1].trim(),
//     };
//   }

//   // 3. Calculator
//   if (
//     // /^(calculate|compute|solve|what is|what's|how much is)\s+/i.test(command)
//     /^(calculate|compute|solve|what is|what's|how much is|multiply|divide|add|subtract)\s+/i.test(command)
//   ) {
//     const expression = extractExpression(command);

//     if (expression) {
//       return {
//         type: "calculate",
//         expression,
//       };
//     }
//   }

//   // 4. Open application
//   const openMatch = command.match(
//     /^(?:open|launch|start|run|go to)\s+(.+)$/i,
//   );

//   if (openMatch?.[1]) {
//     const app = detectApp(openMatch[1].trim());

//     if (app) {
//       return {
//         type: "open_app",
//         app,
//       };
//     }
//   }

//   return { type: "unknown" };
// }

export async function handleAssistantMessage(
  text: string,
  // confirmation: boolean
): Promise<
  {
    response: string;
    confirmation?: string
  }> {
  let intent = parseIntent(text);
  let UNKNOWN_INTENT: string = DEAFAULT_UNKNOWN;

  // Use Qwen3 only when the rule-based parser cannot understand.
  if (intent.type === "unknown") {
    console.log('🤖 Using AI');
    try {
      console.log("[Assistant] Trying AI intent recognition...");
      intent = await parseIntentWithAI(text);
      console.log("[Assistant] AI intent:", intent);
      UNKNOWN_INTENT = AI_UNKNOWN;

    } catch (error) {
      console.error("[Assistant] AI recognition failed:", error);

      return {
        response: "I couldn't understand that request. Please try again.",
        // confirmation: false,
      }
    }
  }

  switch (intent.type) {
    case "open_app":
      return {
        response: (await openApp(intent.app)).message,
        // confirmation: false,
      }

    case "web_search":
      return {
        response: (await searchWeb(intent.query)).message,
        // confirmation: false,
      }

    case "play_youtube_music":
      return {
        response: (await playYoutubeMusic(intent.query)).message,
        // confirmation: false,
      }


    case "play_youtube_video": {
      return {
        response: (await playYoutube(intent.query)).message,
        // confirmation: false,
      }
    }
case "set_brightness": {
  const result = await setBrightness(intent.percentage);

  return {
    response: "result.message",
  };
}

case "brightness_info": {
  const result = await getBrightness();

  return {
    response: result.message,
  };
}
    case "calculate":
      return {
        response: calculate(intent.expression).message,
        // confirmation: false,
      }

    case "call":
      return {
        response: (await callNumber(intent.phoneNumber)).message,
        confirmation: 'call confirmation:',
      }
      //     case "find_contact":
      // return {
      //   response: (await findContact(intent.phoneNumber)).message,
      //   confirmation: 'find_contact selection:',
      // }
      case "find_contact": {
  const result = await findContact(intent.phoneNumber);

  const hasSelectableContacts =
    result.success &&
    (
      /Contact index:\s*\d+/i.test(result.message) ||
      /I found\s+[1-9]\d*\s+matching contacts:/i.test(result.message)
    );

  return {
    response: result.message,
    confirmation: hasSelectableContacts
      ? "find_contact confirmation:"
      : undefined,
  };
}
    case "confirm_call":
      return {
        response: (await callNumberConfirm(intent.phoneNumber)).message,
        // confirmation: false,
      }
    case "reject_call":
      return {
        response: (await callNumberReject(intent.phoneNumber)).message,
        // confirmation: false,
      }

    case "whatsapp":
      return {
        response: "WhatsApp actions aren't implemented yet.",
        // confirmation: false,
      }

    case "unknown":
    default: return {
      response: UNKNOWN_INTENT,
      // confirmation: false,
    }

  }
}



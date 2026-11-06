Your current architecture is already suitable for adding more apps. We can extend it without changing your AI intent recognition system.

I recommend keeping rule-based app detection first, with Qwen3 as fallback, exactly as you have it now.

Let's add:

1. WhatsApp – open WhatsApp directly.
2. Spotify – open Spotify directly.
3. Browser fallback when the app isn't installed.
4. A reusable approach for adding YouTube, Instagram, Telegram, Gmail, Facebook, and other apps later.

## 1. Update app aliases

Replace your `appAliases` with:

```
export const appAliases: Record<string, SupportedApp> = {
  // YouTube
  youtube: "youtube",
  "you tube": "youtube",

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
```

## 2. Update SupportedApp type

Go to:

`src/feature/assistant/types`

Find your `SupportedApp` type and add Spotify.

For example:

```
export type SupportedApp =
  | "youtube"
  | "chrome"
  | "whatsapp"
  | "spotify"
  | "maps"
  | "settings";
```

## 3. Update app URLs

Replace your `appUrls` and `webFallbacks`:

```
const appUrls: Record<SupportedApp, string> = {
  youtube: "youtube://",
  chrome: "googlechrome://",
  whatsapp: "whatsapp://",
  spotify: "spotify://",
  maps: "geo:0,0?q=",
  settings: "app-settings:",
};

const webFallbacks: Partial<Record<SupportedApp, string>> = {
  youtube: "https://www.youtube.com",
  chrome: "https://www.google.com",
  whatsapp: "https://www.whatsapp.com",
  spotify: "https://open.spotify.com",
  maps: "https://maps.google.com",
};
```

## 4. Improve openApp()

One improvement: instead of depending on `canOpenURL()` first, attempt `openURL()` directly and catch failures.

This avoids some Android package-visibility problems associated with `canOpenURL()`.

Replace your function:

```
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
```

This attempts the native app first and then tries the browser.

## 5. Update getAppName()

Add Spotify:

```
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
```

## 6. Fix app detection

Your existing `detectApp()` approach is good, but use this correctly escaped regex:

```
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
```

This supports multi-word aliases such as `google maps` and `spotify music`.

## 7. Expected behavior

Your assistant should now understand:

| User says            | Expected action |
| -------------------- | --------------- |
| Open WhatsApp        | Launch WhatsApp |
| Launch Spotify       | Launch Spotify  |
| Open Spotify music   | Launch Spotify  |
| Open YouTube         | Launch YouTube  |
| Open Chrome          | Launch Chrome   |
| Open Google Maps     | Launch Maps     |
| Open WhatsApp please | Launch WhatsApp |
| Open Spotify please  | Launch Spotify  |

Your existing `handleAssistantMessage()` doesn't need modification for these app-opening commands.

Important: This implements app launching, not WhatsApp messaging or Spotify playback control. Those need separate intents and functionality.

## 8. How to research support for more apps

This is the most important part if you want to grow your personal assistant.

Every Android app has some combination of:

- Package name: identifies the installed Android application.
- URL scheme: opens the application through a link.
- Deep links: open a particular screen, page, chat, or content.
- Web fallback: opens the service in a browser if the app isn't installed.

For example:

| App         | Android package                | URL scheme       |
| ----------- | ------------------------------ | ---------------- |
| WhatsApp    | `com.whatsapp`                 | `whatsapp://`    |
| Spotify     | `com.spotify.music`            | `spotify://`     |
| YouTube     | `com.google.android.youtube`   | `youtube://`     |
| Instagram   | `com.instagram.android`        | `instagram://`   |
| Telegram    | `org.telegram.messenger`       | `tg://`          |
| Facebook    | `com.facebook.katana`          | `fb://`          |
| Gmail       | `com.google.android.gm`        | `googlegmail://` |
| Google Maps | `com.google.android.apps.maps` | `geo:`           |

These are common Android package identifiers and URI schemes. Verify compatibility on your target device; not every app accepts every generic URI.

### Where to research

1\. Official developer documentation

- [Android Intents and Intent Filters](https://developer.android.com/guide/components/intents-filters?utm_source=chatgpt.com)
- [Android App Links](https://developer.android.com/training/app-links?utm_source=chatgpt.com)
- [Spotify URL Schemes](https://developer.spotify.com/documentation/ios/concepts/spotify-url-schemes?utm_source=chatgpt.com)
- [WhatsApp Developer Documentation](https://developers.facebook.com/docs/whatsapp/?utm_source=chatgpt.com)

2\. Find installed package names using ADB

Connect your Android phone and run:

```
adb shell pm list packages
```

Search for Spotify:

```
adb shell pm list packages | findstr spotify
```

Search for WhatsApp:

```
adb shell pm list packages | findstr whatsapp
```

3\. Test a URL scheme before integrating it

For Spotify:

```
adb shell am start -a android.intent.action.VIEW -d "spotify://"
```

For WhatsApp:

```
adb shell am start -a android.intent.action.VIEW -d "whatsapp://"
```

If the installed app opens, you have a working starting point.

### My recommendation for your assistant architecture

As your assistant grows, maintain a central app registry rather than scattering app details across multiple files.

For example:

```
interface AppConfig {
  name: string;
  aliases: string[];
  url: string;
  fallback?: string;
}

export const supportedApps: Record<string, AppConfig> = {
  spotify: {
    name: "Spotify",
    aliases: ["spotify", "spotify music"],
    url: "spotify://",
    fallback: "https://open.spotify.com",
  },

  whatsapp: {
    name: "WhatsApp",
    aliases: ["whatsapp", "what's app"],
    url: "whatsapp://",
    fallback: "https://www.whatsapp.com",
  },
};
```

Later, this registry can support:

- Opening applications.
- Opening specific screens.
- Searching inside applications.
- Sending WhatsApp messages.
- Playing Spotify music.
- Checking whether an application is installed.

One architectural distinction: opening an app, performing an action inside an app, and controlling an app are three different capabilities. Keep them as separate assistant intents.

I would build the next phase around a reusable Android app launcher and a separate action-handler system, so adding 50+ applications doesn't make your `handleAssistantMessage()` unnecessarily complicated.

I can help build that extensible app-integration registry next, including deep links and app-specific actions.

📱Review assistant app integrations monthlyTap to set up

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
};

export type AssistantIntent =
  | {
    type: "open_app";
    app: SupportedApp;
  }
  | {
    type: "web_search";
    query: string;
  }
  | {
    type: "calculate";
    expression: string;
  }
  | {
    type: "call";
    phoneNumber: string;
  }
  | {
    type: 'confirm_call'
    phoneNumber: string;
  }
  | {
    type: 'reject_call'
    phoneNumber: string;
  }
  | {
    type: "whatsapp";
    phoneNumber?: string;
    message?: string;
  }
      | {
    type: "play_youtube_music";
    query: string;
  }
      | {
    type: "play_youtube_video";
    query: string;
  }
  | {
    type: "unknown";
  };

export type SupportedApp =
  | "youtube"
  | "chrome"
  | "whatsapp"
  | "spotify"
  | "maps"
  | "settings";
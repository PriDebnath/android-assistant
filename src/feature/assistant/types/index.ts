
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
    type: "find_contact";
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
    type: "set_brightness";
    percentage: number;
  }
  | {
    type: "brightness_info";
  }
  | {
    type: "battery_info";
  } |
  {
    type: "volume_info";
  } |
  {
    type: "set_volume";
    percentage: number;
  }
  | {
    type: "set_flashlight";
    enabled: boolean;
  }
  | {
    type: "set_alarm";
    hour: number;
    minute: number;
  } | {
    type: "set_timer";
    durationSeconds: number;
  } | {
    type: 'unmute_volume'
  }| {
    type: 'mute_volume'
  } | {
    type: 'increase_volume'
  } | {
    type: 'decrease_volume'
  } | {
    type: "unknown";
  };

export type SupportedApp =
  | "youtube"
  | "chrome"
  | "whatsapp"
  | "spotify"
  | "maps"
  | "settings";
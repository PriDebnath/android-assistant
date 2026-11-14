
import * as Battery from "expo-battery";

export interface BatteryInfo {
  level: number;
  percentage: number;
  state: string;
  isCharging: boolean;
  isBatteryLow: boolean;
}

export async function getBatteryInfo(): Promise<BatteryInfo> {
  const [level, state] = await Promise.all([
    Battery.getBatteryLevelAsync(),
    Battery.getBatteryStateAsync(),
  ]);

  const percentage = level >= 0 ? Math.round(level * 100) : -1;

  const stateLabels: Record<number, string> = {
    [Battery.BatteryState.UNKNOWN]: "Unknown",
    [Battery.BatteryState.UNPLUGGED]: "Not charging",
    [Battery.BatteryState.CHARGING]: "Charging",
    [Battery.BatteryState.FULL]: "Fully charged",
  };

  return {
    level,
    percentage,
    state: stateLabels[state] ?? "Unknown",
    isCharging:
      state === Battery.BatteryState.CHARGING ||
      state === Battery.BatteryState.FULL,
    isBatteryLow: percentage >= 0 && percentage <= 20,
  };
}

export async function getBatteryInfoResponse() {
  try {
    const battery = await getBatteryInfo();

    if (battery.percentage < 0) {
      return {
        success: false,
        message: "Sorry, I couldn't read your battery level.",
      };
    }

    let message = `Your battery is at ${battery.percentage}%. `;
    message += `${battery.state}. `;

    if (battery.isBatteryLow) {
      message +=
        "Your battery is running low. Consider charging your phone.";
    }

    return {
      success: true,
      percentage: battery.percentage,
      level: battery.level,
      state: battery.state,
      isCharging: battery.isCharging,
      isBatteryLow: battery.isBatteryLow,
      message: message.trim(),
    };
  } catch (error) {
    console.error("[Battery] Read error:", error);

    return {
      success: false,
      message: "Sorry, I couldn't retrieve your battery information.",
    };
  }
}

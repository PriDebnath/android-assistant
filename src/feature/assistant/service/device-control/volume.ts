
import { VolumeManager } from "react-native-volume-manager";

const VOLUME_STEP = 0.1;
const DEFAULT_UNMUTE_VOLUME = 30;

function clampVolume(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export async function getVolume(): Promise<number> {
  const result = await VolumeManager.getVolume();

  return Math.round(result.volume * 100);
}

export async function setVolume(percentage: number) {
  try {
    if (
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      return {
        success: false,
        message: "Please provide a volume between 0 and 100.",
      };
    }

    const safePercentage = Math.round(percentage);
    const volume = safePercentage / 100;

    await VolumeManager.setVolume(volume, {
      type: "music",
      showUI: true,
      playSound: false,
    });

    return {
      success: true,
      percentage: safePercentage,
      message: `Media volume set to ${safePercentage}%.`,
    };
  } catch (error) {
    console.error("[Volume] Set error:", error);

    return {
      success: false,
      message: "Sorry, I couldn't change your media volume.",
    };
  }
}

export async function increaseVolume() {
  try {
    const current = await getVolume();
    const next = Math.round(
      clampVolume(current / 100 + VOLUME_STEP) * 100
    );

    const result = await setVolume(next);

    if (!result.success) return result;

    return {
      ...result,
      message: `Volume increased to ${next}%.`,
    };
  } catch (error) {
    console.error("[Volume] Increase error:", error);

    return {
      success: false,
      message: "Sorry, I couldn't increase your volume.",
    };
  }
}

export async function decreaseVolume() {
  try {
    const current = await getVolume();
    const next = Math.round(
      clampVolume(current / 100 - VOLUME_STEP) * 100
    );

    const result = await setVolume(next);

    if (!result.success) return result;

    return {
      ...result,
      message: `Volume decreased to ${next}%.`,
    };
  } catch (error) {
    console.error("[Volume] Decrease error:", error);

    return {
      success: false,
      message: "Sorry, I couldn't decrease your volume.",
    };
  }
}

export async function muteVolume() {
  const result = await setVolume(0);

  if (!result.success) return result;

  return {
    ...result,
    message: "Media volume muted.",
  };
}

export async function unmuteVolume() {
  try {
    const current = await getVolume();

    if (current > 0) {
      return {
        success: true,
        percentage: current,
        message: "Your media volume is already on.",
      };
    }

    const result = await setVolume(DEFAULT_UNMUTE_VOLUME);

    if (!result.success) return result;

    return {
      ...result,
      message: `Media volume restored to ${DEFAULT_UNMUTE_VOLUME}%.`,
    };
  } catch (error) {
    console.error("[Volume] Unmute error:", error);

    return {
      success: false,
      message: "Sorry, I couldn't restore your media volume.",
    };
  }
}

export async function getVolumeResponse() {
  try {
    const volume = await getVolume();

    return {
      success: true,
      percentage: volume,
      message: `Your current media volume is ${volume}%.`,
    };
  } catch (error) {
    console.error("[Volume] Read error:", error);

    return {
      success: false,
      message: "Sorry, I couldn't retrieve your volume.",
    };
  }
}

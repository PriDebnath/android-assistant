
type FlashlightHandler = (enabled: boolean) => Promise<void>;

let flashlightHandler: FlashlightHandler | null = null;

export function registerFlashlightHandler(
  handler: FlashlightHandler
) {
  flashlightHandler = handler;

  return () => {
    if (flashlightHandler === handler) {
      flashlightHandler = null;
    }
  };
}

export async function setFlashlight(enabled: boolean) {
  try {
    if (!flashlightHandler) {
      return {
        success: false,
        message: "Flashlight controller is not initialized.",
      };
    }

    await flashlightHandler(enabled);

    return {
      success: true,
      enabled,
      message: enabled
        ? "Flashlight turned on."
        : "Flashlight turned off.",
    };
  } catch (error) {
    console.error("[Flashlight] Error:", error);

    return {
      success: false,
      message: enabled
        ? "Sorry, I couldn't turn on the flashlight. Please check camera permission and device support."
        : "Sorry, I couldn't turn off the flashlight.",
    };
  }
}

export async function turnOnFlashlight() {
  return setFlashlight(true);
}

export async function turnOffFlashlight() {
  return setFlashlight(false);
}

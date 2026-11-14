
import * as Brightness from "expo-brightness";

async function ensureBrightnessPermission(): Promise<boolean> {
  try {
    let permission = await Brightness.getPermissionsAsync();

    if (!permission.granted) {
      permission = await Brightness.requestPermissionsAsync();
    }

    return permission.granted;
  } catch (error) {
    console.error("[Brightness] Permission error:", error);
    return false;
  }
}

export async function getBrightness() {
  try {
    const allowed = await ensureBrightnessPermission();

    if (!allowed) {
      return {
        success: false,
        message:
          'Please allow Pri Assistant to "Modify system settings" in Android settings.',
      };
    }

    const value = await Brightness.getSystemBrightnessAsync();
    const percentage = Math.round(value * 100);

    return {
      success: true,
      percentage,
      message: `Your screen brightness is ${percentage}%.`,
    };
  } catch (error) {
    console.error("[Brightness] Read error:", error);

    return {
      success: false,
      message: "I couldn't read the screen brightness.",
    };
  }
}

export async function setBrightness(percentage: number) {
  try {
    if (!Number.isFinite(percentage)) {
      return {
        success: false,
        message: "Please provide a valid brightness percentage.",
      };
    }

    const safePercentage = Math.max(1, Math.min(100, Math.round(percentage)));
    const allowed = await ensureBrightnessPermission();

    if (!allowed) {
      return {
        success: false,
        message:
          'Please allow Pri Assistant to "Modify system settings" and try again.',
      };
    }
let v= safePercentage / 100
console.log({ v});

    await Brightness.setSystemBrightnessAsync(v);

    return {
      success: true,
      percentage: safePercentage,
      message: `Screen brightness set to ${safePercentage}%.`,
    };
  } catch (error) {
    console.error("[Brightness] Set error:", error);

    return {
      success: false,
      message: "I couldn't change the screen brightness.",
    };
  }
}
export const setBrightnessManual = async (value: number) => {
  try {
    // Check permission
    const { status } =
      await Brightness.getPermissionsAsync();

    if (status !== "granted") {
      const permission =
        await Brightness.requestPermissionsAsync();

      if (permission.status !== "granted") {
        console.log("Brightness permission denied");
        return;
      }
    }

    // Set system brightness
    await Brightness.setSystemBrightnessAsync(
      // value
      Math.max(0, Math.min(1, value))
    );

    console.log("Brightness changed:", value);
  } catch (error) {
    console.error("Brightness error:", error);
  }
};


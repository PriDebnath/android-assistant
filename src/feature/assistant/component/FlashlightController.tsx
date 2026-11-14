
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useEffect, useState } from "react";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import { registerFlashlightHandler } from "../service/device-control/flashlight";

export default function FlashlightController() {
  const [permission, requestPermission] = useCameraPermissions();
  const [enabled, setEnabled] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const unregister = registerFlashlightHandler(async (value) => {
      try {
        let granted = permission?.granted ?? false;

        if (!granted) {
          const result = await requestPermission();
          granted = result.granted;
        }

        if (!granted) {
          setEnabled(false);
          throw new Error("Camera permission was denied.");
        }

        setEnabled(value);
      } catch (error) {
        console.error("[Flashlight Controller]", error);
        throw error;
      }
    });

    return unregister;
  }, [permission?.granted, requestPermission]);

  const handleRequestPermission = async () => {
    try {
      setRequesting(true);

      const result = await requestPermission();

      if (!result.granted) {
        console.warn("[Flashlight Controller] Permission not granted.");
      }
    } catch (error) {
      console.error("[Flashlight Controller] Permission error:", error);
    } finally {
      setRequesting(false);
    }
  };

  if (!permission?.granted) {
    return (
  
       <Pressable
          style={[
            styles.button,
            requesting && styles.buttonDisabled,
          ]}
          onPress={handleRequestPermission}
          disabled={requesting}
        >
          <Text 
          // style={styles.buttonText}
            style={{
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "bold",
      includeFontPadding: false,
    }}>
            {requesting ? "Requesting..." : "Grant 📷"}
          </Text>
        </Pressable> 
    );
  }

  return (
    <CameraView
      style={styles.camera}
      facing="back"
      enableTorch={enabled}
      active={true}
    />
  );
}

const styles = StyleSheet.create({
  camera: {
    width: 1,
    height: 1,
  },

  permissionContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    // color: "#FFFFFF",
  },

  description: {
    fontSize: 13,
    // color: "#AAAAAA",
    textAlign: "center",
  },

  // button: {
  //   marginTop: 8,
  //   paddingVertical: 12,
  //   paddingHorizontal: 24,
  //   borderRadius: 8,
  //   // color: "#003663",
  //   backgroundColor: "#2196F3",
  //   // backgc
  //   // color: "#ffffff"
  // },

  buttonDisabled: {
    opacity: 0.5,
  },

  // buttonText: {
  //   // color: ,
  //   fontWeight: "600",
  //   // backgroundColor: "#2196F3",
  //   color: "#003663",
  // },
  button: {
  marginTop: 8,
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderRadius: 8,
  backgroundColor: "#2196F3",
  alignItems: "center",
  justifyContent: "center",
},

buttonText: {
  fontWeight: "600",
  color: "#FFFFFF",
  fontSize: 14,
},
});

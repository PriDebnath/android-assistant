import { useState } from "react";
import { Alert, Button ,Text,Image} from "react-native";

import { downloadModel, isModelDownloaded } from "@/feature/assistant/ai/service/model-download.service";
import { generateResponse } from "@/feature/assistant/ai/service/model-inference.service";

export default function ModelTest() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    try {
      setLoading(true);
      await downloadModel(setProgress);
      const response = await generateResponse(
        "Reply exactly: Pri Assistant is working."
      );
      Alert.alert("AI Response", response);
    } catch (error) {
      Alert.alert(
        "Model Error",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

    {
      isModelDownloaded()? (
        <Text>
 {/* 🤖  */}
    <Image
            source={require("@/assets/images/pri.png")}
          style={{ 
            width: 32,
             height: 32,
             borderRadius:32

             }}
          />
 {/* Using AI */}
        </Text>
      )
      :(
          <Button
      title={
        loading
          ? `Downloading / Loading: ${progress}%`
          : "Download and Test AI Model"
      }
      disabled={loading}
      onPress={handleTest}
    />
      )
    }
    
    </>
  
  );
}
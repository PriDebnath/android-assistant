import { useRef, useEffect } from "react";
import { StyleSheet, Text, View, Image, Animated, Easing } from "react-native";

const messages = [
  "Thinking",
  "Cooking",
  "Working",
  "Creating",
  "Exploring",
  "Thinking hard",
  "Almost there",
  "Processing",
  "Brewing",
  "Figuring it out",
];

export function TypingIndicator() {
  const message = messages[Math.floor(Math.random() * messages.length)];
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Animated.View style={{
          alignItems: "center",
          justifyContent: "center",
          transform: [{ rotate }]
        }}>
          <Image
            source={require("@/assets/images/tabIcons/networking.png")}
          // style={{ width: 16, height: 16 }}
          />
        </Animated.View>
        <Text style={styles.text}>

          {message}...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    marginBottom: 12,
  },

  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    backgroundColor: "#F3F4F6",
    display: 'flex',
    gap: 8,
    flexDirection: 'row'
  },

  text: {
    color: "#6B7280",
    fontSize: 15,
  },
});
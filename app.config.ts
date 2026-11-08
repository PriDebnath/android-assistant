const isWindows = process.platform === 'win32';


export default ({ }) => ({
  "expo": {
    "name": "my-mobile-app",
    "slug": "my-mobile-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/pri.cropped.2.png",
    "scheme": "mymobileapp",
    "userInterfaceStyle": "automatic",
    "ios": {
      "icon": "./assets/expo.icon"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/pri.cropped.2.png",
        // "backgroundImage": "./assets/images/android-icon-background.png",
        // "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false,
      "softwareKeyboardLayoutMode": "resize",
      "package": "com.pri.assistant",
      "permissions": [
        "CALL_PHONE"
      ]
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/pri.cropped.2.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#208AEF",
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 76
        }
      ],
      "expo-web-browser",
      "expo-speech-recognition",
      [
        "llama.rn",
        {
          "enableEntitlements": true,
          "entitlementsProfile": "production",
          "forceCxx20": true,
          "enableOpenCLAndHexagon": true
        }
      ],
      "expo-build-properties",
      [
        "expo-asset",
        {
          "assets": [
            "./assets/wakeword"
          ]
        }
      ],
      [
        "react-native-audio-api",
        {
          "androidPermissions": [
            "android.permission.RECORD_AUDIO"
          ],
          "iosMicrophonePermission": "My Mobile App needs microphone access to detect the wake word."
        }
      ],
      "expo-font",
      "expo-image",
      "expo-status-bar",
      ['expo-build-properties', { android: isWindows ? { cmakeVersion: '3.31.6' } : {} }],
      [
        "expo-widgets",
        {
          "enableAndroid": true,
          "widgets": [
            {
              "name": "MyWidget",
              "displayName": "My Widget",
              "description": "A sample home screen widget",
              "android": {
                "targetCellWidth": 2,
                "targetCellHeight": 2,
                "initialLayout": "./src/widgets/my-widgets.tsx"
              }
            }
          ]
        }
      ],
        './plugins/withWidgetImage',
      [
        "expo-contacts",
        {
          "contactsPermission": "Allow $(PRODUCT_NAME) to access your contacts."
        }
      ],
            [
        "expo-splash-screen",
        {
          // "backgroundColor": "#232323",
          "image": "./assets/images/pri.cropped.2.png",
             imageWidth: 360,
          resizeMode: "cover",
          // "dark": {
          //   "image": "./assets/images/pri.cropped.2.png"
          //   // "backgroundColor": "#000000"
          // },
          // "imageWidth": 200
        }
      ]
      
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
})

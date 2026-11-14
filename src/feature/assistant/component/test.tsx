import { useState } from "react";
import { Alert, Button, Linking, Platform, Text } from "react-native";
import { playYoutube } from "../helper";
import { setBrightness } from "../service/device-control";

export default function Test() {

 
let [c,setC] =useState(0)
    return (
        <>
            <Text>
                ---
            </Text>
            <Button
                title="test"
                onPress={()=> {
                    setC(c+0.10)
                    setBrightness(c)
                }
            }
            />
        </>
    );
}
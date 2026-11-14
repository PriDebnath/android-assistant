import { useState } from "react";
import { Button, Text } from "react-native";
import { setBrightness } from "../service/device-control/brightness";
import { getBatteryInfo } from "../service/device-control/battery";

export default function Test() {

 
let [c,setC] =useState(0)
    return (
        <>
            <Text>
                ---
            </Text>
            <Button
                title="test"
                onPress={ async ()=> {
                    setC(c+0.10)
                    setBrightness(c)
                   let a = await getBatteryInfo()
                   console.log({a});
                   
                }
            }
            />
        </>
    );
}
import { useState } from "react";
import { Alert, Button, Linking, Platform, Text } from "react-native";
import { playYoutube } from "../helper";

export default function Test() {

    return (
        <>
            <Text>
                ---
            </Text>
            <Button
                title="test"
                onPress={()=>playYoutube('cocomelon')}
            />
        </>
    );
}
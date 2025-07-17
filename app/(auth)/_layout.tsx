
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

export default function Layout() {

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
     <Stack.Screen name="signin" options={{ headerShown: false}} />
      <Stack.Screen name="otpverification" options={{ headerShown: false, title: "OTP Verification",  }}  />
       <Stack.Screen name="forgetpassword" options={{ headerShown: false }} /> 
   <Stack.Screen name="fogetpasswordotpverification" options={{ headerShown: false }} /> 
     <Stack.Screen name="createnewpassword" options={{ headerShown: false }} /> 
    </Stack>
  );
}


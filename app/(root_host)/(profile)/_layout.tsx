
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, Stack } from "expo-router";
import { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";

export default function Layout() {

  return (
    <Stack>
      <Stack.Screen name="appsettings" options={{ headerShown: true,title:'App Settings',
         
          headerTintColor: '#333', 
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerTitleAlign: 'center',
       }} />
       <Stack.Screen name="propertymanager" options={{ headerShown: true,title:'Manage Property',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
       <Stack.Screen name="payment" options={{ headerShown: true,title:"Payment",headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
        
      <Stack.Screen 
  name="connecttocleaners" 
  options={{
    headerShown: true,
    title: 'Connect to Cleaners',
    headerShadowVisible: false,
    headerTintColor: '#333',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 20,
    },
    headerTitleAlign: 'center',
  
  }} 
/>
 <Stack.Screen 
  name="propertyintegration" 
  options={{
    headerShown: true,
    title: 'Property Integration',
    headerShadowVisible: false,
    headerTintColor: '#333',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 20,
    },
    headerTitleAlign: 'center',
  
  }} 
/>
    </Stack>
  );
}


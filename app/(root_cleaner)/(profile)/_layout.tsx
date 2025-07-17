
import { Stack } from "expo-router";
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
       

<Stack.Screen 
  name="connecttohost" 
  options={{
    headerShown: true,
    title: 'Connect to Host',
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
  name="payment" 
  options={{
    headerShown: true,
    title: 'Payment History',
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
  name="jobhistory" 
  options={{
    headerShown: true,
    title: 'Job History',
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


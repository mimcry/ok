
import { Stack } from "expo-router";

export default function Layout() {

  return (
    <Stack>
      <Stack.Screen name="jobdetails" options={{ headerShown: true,title:'Job Details',
         
          headerTintColor: '#333', 
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerTitleAlign: 'center',
       }} />
       <Stack.Screen name="precleaning" options={{ headerShown: true,title:'Pre Cleaning',
         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
       <Stack.Screen name="chatroom" options={{ headerShown: false,title:'',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
       <Stack.Screen name="postcleaning" options={{ headerShown: true,title:'Post Cleaning',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
      <Stack.Screen name="propertybycleaner" options={{ headerShown: true,title:'',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
         <Stack.Screen name="propertydescription" options={{ headerShown: false,title:'Property Deatils',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
       <Stack.Screen name="assigncleaner" options={{ headerShown: true,title:'Assign Cleaner',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
       <Stack.Screen name="cleanermarketplace" options={{ headerShown: true,title:'Cleaners Marketplace',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
       <Stack.Screen name="hostreuestpage" options={{ headerShown: true,title:'Hosts Request',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
       <Stack.Screen name="help&support" options={{ headerShown: true,title:'Help & Support',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
       <Stack.Screen name="security&privacy" options={{ headerShown: true,title:'Security & Privacy',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
       <Stack.Screen name="jobdetailshost" options={{ headerShown: true,title:'Cleaning Status',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
       <Stack.Screen name="cleanerchecklist" options={{ headerShown: false ,title:'Cleaner Checklist',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
        <Stack.Screen name="propertyform" options={{ headerShown: true ,title:'Property Form',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
      <Stack.Screen name="jobform" options={{ headerShown: true ,title:'Job Form',headerShadowVisible:false,         
         headerTintColor: '#333', 
         headerTitleStyle: {
           fontWeight: 'bold',
           fontSize: 20,
         },
         headerTitleAlign: 'center',
      }} />
    </Stack>
  );
}


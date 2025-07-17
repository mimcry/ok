import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { Image, TouchableOpacity, View, Text, Linking, Alert } from "react-native";
import { ChevronLeft, PhoneCall } from "lucide-react-native";
import { toCamelCase } from "@/constants/camel";
import useChatStore from "@/store/chatStore";
import CustomAlert from "@/hooks/customAlert";
export default function ChatRoomHeader({ user }: any) {
  const router = useRouter();
  const selectedUser = useChatStore((state) => state.selectedUser);

  console.log("selected user for chats", selectedUser)
  const [showAlert, setShowAlert]=useState(false);
  const handelPressBack = ()=>{
    router.back()
  }
  const handlePhonePress = () =>{
    const phoneNumber =selectedUser?.parther?.phone_number;
    if (phoneNumber){
      Linking.openURL(`tel:${phoneNumber}`)
    }
    else{
      setShowAlert(true)
    }
  }
  return (<>
    <Stack.Screen
      options={{
        title: "",
        headerShadowVisible: false,
        headerLeft: () => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={handelPressBack}  activeOpacity={0.7}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  style={{ padding: 8 }}
 >
              <ChevronLeft size={24} color="black" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-4 ml-4">
              <Image
                source={
                  selectedUser.profile_picture
                    ? { uri: selectedUser.profile_picture }
                    : require('@/assets/images/profile.png')
                }
                className="w-14 h-14 rounded-full"
              />
              <View>
              <Text className="text-lg font-medium">
  {toCamelCase(
    selectedUser?.partner?.full_name
      ? selectedUser.partner.full_name
      : selectedUser?.username || ''
  )}
</Text>


              </View>
            </View>
          </View>
        ),
      // Just replace the hardcoded number - minimal change
headerRight: () => (
  <TouchableOpacity 
    onPress={handlePhonePress}
    className="mr-4"
    activeOpacity={0.7}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  style={{ padding: 8 }} 

  >
    <PhoneCall size={20} color="#4925E9" />
  </TouchableOpacity>
),
      }}
    />
      <CustomAlert
        visible={showAlert}
        type="Warning"
        title="Error"
        message="Phone number not available"
        onCancel={() => setShowAlert(false)}
        onConfirm={() => setShowAlert(false)}
        hideCancel={true}
      />
      </>
  );

}

      
import React from 'react';
import { Text, View } from 'react-native';
export default function MessageList({ message, currentUser }:any) {
  if (currentUser?.userId === message?.userId) {
    return (
      <View className='flex-row justify-end mb-3 mr-3'>
        <View>
          <View className='flex self-end p-3 rounded bg-white border border-neutral-200'>
            <Text>{message?.text}</Text>
          </View>
        </View>
      </View>
    );
  }
  return null; // explicitly render nothing
}

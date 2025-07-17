import { View } from "react-native";

export const SkeletonCard = () => (
  <View className="rounded-lg shadow-sm border border-gray-200 p-4 m-3 py-2 mt-2 bg-white animate-pulse">
    <View className="flex-row items-start mb-1">
      <View className="w-14 h-14 bg-gray-300 rounded-full mr-3" />
      <View className="flex-1">
        <View className="flex-row justify-between mb-2">
          <View className="w-32 h-5 bg-gray-300 rounded" />
          <View className="w-12 h-4 bg-gray-300 rounded" />
        </View>
        <View className="flex-row items-center space-x-2">
          <View className="w-20 h-4 bg-gray-300 rounded" />
          <View className="w-3 h-3 bg-gray-300 rounded-full" />
          <View className="w-24 h-4 bg-gray-300 rounded" />
        </View>
      </View>
    </View>

    <View className="my-2 border-t border-gray-200" />

    <View className="flex-row justify-between items-center mt-2">
      <View className="flex-row items-center space-x-4">
        <View className="w-12 h-4 bg-gray-300 rounded" />
        <View className="w-16 h-4 bg-gray-300 rounded" />
      </View>
      <View className="flex-row space-x-2">
        <View className="w-10 h-10 bg-gray-300 rounded-full" />
        <View className="w-10 h-10 bg-gray-300 rounded-full" />
      </View>
    </View>
  </View>
);

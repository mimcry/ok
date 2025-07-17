import { MenuItem } from "@/types/menuItems";
import { ChevronRight } from "lucide-react-native";
import { Switch, Text, TouchableOpacity, View } from "react-native";

 export const renderMenuItem = (item: MenuItem) => {
    return (
      <TouchableOpacity
      testID={`menu-item-${item.id}`}
        key={item.id}
        className="flex-row items-center justify-between py-4 px-1 border-b border-gray-100"
        activeOpacity={0.7}
        onPress={
          item.type === "link" && item.navigate ? item.navigate : undefined
        }
      >
        <View className="flex-row items-center">
          <View className="w-8">{item.icon}</View>
          <Text className="text-base font-medium text-gray-800 ml-3">
            {item.title}
          </Text>
        </View>

        {item.type === "toggle" ? (
          <Switch
            trackColor={{ false: "#D1D5DB", true: "#C7D2FE" }}
            thumbColor={item.value ? "#4925E9" : "#F3F4F6"}
            onValueChange={item.onToggle}
            value={item.value}
            testID={`switch-${item.id}`} 
          />
        ) : (
          <ChevronRight size={20} color="#9CA3AF" />
        )}
      </TouchableOpacity>
    );
  };

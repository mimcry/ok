import { JobStatus, jobtype } from "@/types/jobs";
import { DateFormatter, DateUtils } from '@/utils/DateUtils';
import { router } from "expo-router";
import { Clock, MapPin } from "lucide-react-native";
import { TouchableOpacity,Image, View,Text } from "react-native";
  const getStatusStyles = (state: JobStatus) => {
    switch (state) {
      case 'Completed':
        return {
          containerClass: 'bg-green-100',
          textClass: 'text-green-700',
          stateText: 'Completed'
        };

      case 'scheduled':
        return {
          containerClass: 'bg-red-100',
          textClass: 'text-red-700',
          stateText: 'Scheduled'
        };
      case 'In-Progress':
        return {
          containerClass: 'bg-yellow-100',
          textClass: 'text-yellow-700',
          stateText: 'In Progress'
        };
      default:
        return {
          containerClass: 'bg-gray-100',
          textClass: 'text-gray-700',
          stateText: 'Unknown'
        };
    }
  };
export    const DisplayJobCard = ({ item }: { item: jobtype }) => {
    const statusStyles = getStatusStyles(item.status);

    return (
      <View className="bg-white rounded-xl mb-4 shadow overflow-hidden">
        <View className="h-36 w-full">
          <Image
            source={{ uri: item.imageUrl[0] }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>

        {/* Use the DateFormatter component with badge format */}
        <View className='absolute top-3 right-3'>
          <DateFormatter 
            date={item.date} 
            format="badge" 
            badgeStyle="bg-black bg-opacity-60 rounded-lg px-4 py-1"
            textStyle="text-white font-medium text-xs"
          />
        </View>

        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-start">
            <Text className="text-lg font-bold flex-1 pr-2" numberOfLines={2}>
              {item.name}
            </Text>
            <View className={`px-3 py-1 rounded-full ${statusStyles.containerClass}`}>
              <Text className={`text-xs font-semibold ${statusStyles.textClass}`}>
                {statusStyles.stateText}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mt-2">
            <View className="w-5 h-5 mr-1 justify-center items-center">
              <MapPin size={16} color="#6B7280" />
            </View>
            <Text className="text-gray-600 text-sm" numberOfLines={1}>
              {item.address}
            </Text>
          </View>

          <View className="flex-row items-center mt-1">
            <View className="w-5 h-5 mr-1 justify-center items-center">
              <Clock size={16} color="#6B7280" />
            </View>
            <Text className="text-gray-600 text-sm">
              Due {item.dueTime}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-indigo-600 rounded-lg py-2 mt-3 items-center"
            activeOpacity={0.8}
            onPress={() => {
              const encodedImageUrls = JSON.stringify(item.imageUrl);

              router.push({
                pathname: "/(helper)/jobdetails",
                params: {
                  id: item.id,
                  name: item.name,
                  date: item.date,
                  imageUrl: encodedImageUrls, 
                  address: item.address,
                  dueTime: item.dueTime,
                  price: item.price,
                  description: item.description,
                  status: item.status,
                  instruction:item.property.instruction,
                  end_time:item.end_time,
                  start_time:item.start_time,
              

                }
              });
            }}
          >
            <Text className="text-white font-medium">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
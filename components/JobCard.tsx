import usePropertyStore from "@/store/jobStore";
import { Job, Property } from "@/types/propertytype";
import { DateFormatter } from "@/utils/DateUtils";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Briefcase, Clock, DollarSign, MapPin, User } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface JobCardProps {
  job: Job;
  property?: Property;
  onDelete: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, property, onDelete }) => {
  const router = useRouter();

  const statusColors: Record<Job["status"], string> = {
    'scheduled': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
  };

  console.log("job:", job);

  const handleViewDetails = async () => {
    if (job.id) {
      try {
        // Get user role from AsyncStorage
        const storedRole = await AsyncStorage.getItem('user_role');
        console.log("User role:", storedRole);

        // Set the selected job in the store
        const originalJob = job;
        usePropertyStore.getState().setSelectedJob(originalJob || job);

        // Determine route based on user role
        const targetRoute = storedRole === 'host' ? "/(helper)/jobdetailshost" : "/(helper)/jobdetails";
        router.push({
          pathname: targetRoute,
        
        });
      } catch (error) {
        console.error("Error getting user role or navigating:", error);


        router.push({
          pathname: "/(helper)/jobdetails"});
      }
    }
  };

  // Format the start and end time if they exist
  const formattedStartTime = job.start_time ? (
    <DateFormatter date={job.start_time} format="time" />
  ) : null;

  const formattedEndTime = job.end_time ? (
    <DateFormatter date={job.end_time} format="time" />
  ) : null;

  return (
    <View className="bg-white rounded-xl overflow-hidden shadow-md mb-4">
      {/* Image Section */}
      <Image
        source={{ uri: job.property_detail.main_image }}
        className="w-full h-40"
        resizeMode="cover"
        testID="job-image"
      />

      <View className="p-5">
        {/* Title and Status Section */}
        <View className="flex-row justify-between items-start mb-0">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">{job.title || "Untitled Job"}</Text>
            <Text className="text-base text-gray-600 mt-1">{job.property_detail.title}</Text>
          </View>

          <View className={`px-3 py-1 rounded-full ${statusColors[job.status]}`}>
            <Text className={statusColors[job.status]}>{job.status}</Text>
          </View>
        </View>

        {/* Info Grid Section */}
        <View className="flex-row flex-wrap mt-0">

          {/* Time Range with DateFormatter */}
          {(job.start_time || job.end_time) && (
            <View className="w-1/2 flex-row items-center mb-3">
              <Clock size={16} color="#6B7280" />
              <View className="ml-2 flex-row">
                {formattedStartTime}
                {formattedStartTime && formattedEndTime && (
                  <Text className="text-gray-600 mx-1">-</Text>
                )}
                {formattedEndTime}
              </View>
            </View>
          )}

          {/* Due Time fallback if no start/end time */}
          {!job.start_time && !job.end_time && job.dueTime && (
            <View className="w-1/2 flex-row items-center mb-3">
              <Clock size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">{job.dueTime}</Text>
            </View>
          )}

          {job.propertyAddress && (
            <View className="w-full flex-row items-center mb-3">
              <MapPin size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2 flex-shrink">{job.propertyAddress}</Text>
            </View>
          )}

          {job.price && (
            <View className="w-1/2 flex-row items-center mb-3">
              <DollarSign size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">${job.price}</Text>
            </View>
          )}

          {job.assignedTo && (
            <View className="w-1/2 flex-row items-center mb-3">
              <User size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">{job.assignedTo}</Text>
            </View>
          )}
        </View>

        {/* Relative Date Badge */}
        {job.date && (
          <View className="mb-3">
            <DateFormatter
              date={job.date}
              format="badge"
              badgeStyle="bg-blue-50"
              textStyle="text-blue-700 font-medium text-xs"
            />
          </View>
        )}

        {/* Description Section */}
        {job.description && (
          <View className="mt-1 mb-3 p-3 bg-gray-50 rounded-lg">
            <Text className="text-gray-700 font-medium mb-1">Description:</Text>
            <Text className="text-gray-600" numberOfLines={2} ellipsizeMode="tail">
              {job.description}
            </Text>
          </View>
        )}

        {/* Action Buttons Section */}
        <View className="flex-row justify-between mt-3">
          <TouchableOpacity
            className="bg-blue-50 py-2 px-4 rounded-lg flex-row items-center"
            onPress={handleViewDetails}
          >
            <Briefcase size={16} color="#3B82F6" />
            <Text className="text-blue-600 font-medium ml-1">Details</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity 
            className="bg-red-50 py-2 px-4 rounded-lg flex-row items-center"
            onPress={() => onDelete(job.id)}
          >
            <Trash2 size={16} color="#DC2626" />
            <Text className="text-red-600 font-medium ml-1">Delete</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
};
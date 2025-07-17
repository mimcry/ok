import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, FileText, MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { getChecklist } from '@/api/checkListApi';
import { updateJobStatus } from '@/api/jobApi';
import TimelineCleaner from '@/components/cleaningstatushost/TimelineCleaner';
import { toCamelCase } from '@/constants/camel';
import CustomAlert from '@/hooks/customAlert';
import { useAppToast } from '@/hooks/toastNotification';
import usePropertyStore from '@/store/jobStore';
import { Property } from '@/types/propertytype';
interface ImageData {
  uri: string;
  original: string;
  error?: boolean;
}

interface ChecklistItem {
  id: number;
  property: number;
  property_detail: any;
  room: string;
  room_display: string;
  description: string;
  priority: string;
  priority_display: string;
  assigned_by: number;
  assigned_to: number;
  is_done: boolean;
  created_at: string;
}

export default function jobdescription() {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [base64Images, setBase64Images] = useState<ImageData[]>([]);
  const [imageError, setImageError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [isToday, setIsToday] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [checkList, setCheckList] = useState<ChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = useState<boolean>(true);
  const [showChecklist, setShowChecklist] = useState<boolean>(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  // Get selected job from property store
  const selectedJob = usePropertyStore((state) => state.selectedJob) as unknown as Property | undefined;
  const toast = useAppToast();

  // Early return if no selected job
  if (!selectedJob) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
          <Text className="text-gray-500 text-lg">No job selected</Text>
          <TouchableOpacity
            className="mt-4 bg-indigo-600 px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const {
    id,
    name,
    imageUrl,
    title,
    description,
    status,
    address,
    date,
    instruction,
    end_time,
    start_time,
    property_detail,
    state = "",
    ZipCode,
    city
  } = selectedJob;

  console.log("Selected job from store:", selectedJob.property_detail.main_image);
  useEffect(() => {
    const handleImages = () => {
      checkIfCheckedIn();

      const propertyDetail = selectedJob?.property_detail;

      const imageUrls: string[] =
        propertyDetail?.images?.length > 0
          ? propertyDetail.images.map((img) => img.image)
          : propertyDetail?.main_image
            ? [propertyDetail.main_image]
            : [];

      setPropertyImages(imageUrls);
    };

    handleImages();
    setLoading(false);
  }, [selectedJob.id, selectedJob.date]);


  // Determine if current time is within job start and end time
  const [isWithinJobTime, setIsWithinJobTime] = useState<boolean>(true);

  useEffect(() => {
    if (start_time && end_time) {
      const now = new Date();
      const start = new Date(start_time);
      const end = new Date(end_time);
      const isNowWithinRange = now >= start && now <= end;
      setIsWithinJobTime(isNowWithinRange);
    } else {
      setIsWithinJobTime(false); // fallback if times not provided
    }
  }, [start_time, end_time]);

  // Fetch checklist for this property
  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        setChecklistLoading(true);
        const response = await getChecklist();
        console.log("Raw checklist response:", response);

        // Get the property ID from the selected job
        const currentPropertyId = selectedJob.property_detail?.id || selectedJob.id;
        console.log("Current property ID from store:", currentPropertyId);

        // Filter checklist items for this specific property
        let filteredChecklist: ChecklistItem[] = [];

        if (Array.isArray(response)) {
          filteredChecklist = response.filter((item: ChecklistItem) => {
            const checklistPropertyId = item.property_detail?.id || item.property;
            console.log(`Comparing: Store property ID ${currentPropertyId} with checklist property ID ${checklistPropertyId}`);
            return checklistPropertyId === currentPropertyId;
          });
        } else if (response && Array.isArray(response.data)) {
          filteredChecklist = response.data.filter((item: ChecklistItem) => {
            const checklistPropertyId = item.property_detail?.id || item.property;
            console.log(`Comparing: Store property ID ${currentPropertyId} with checklist property ID ${checklistPropertyId}`);
            return checklistPropertyId === currentPropertyId;
          });
        } else {
          console.warn("Checklist response is not an array:", response);
          toast.error("Invalid checklist data format");
        }

        console.log("Filtered checklist for property:", filteredChecklist);
        console.log("Total matching checklist items:", filteredChecklist.length);
        setCheckList(filteredChecklist);

      } catch (error) {
        console.error("Error loading checklist:", error);
        setCheckList([]);
        toast.error("Error loading checklist");
      } finally {
        setChecklistLoading(false);
      }
    };

    fetchChecklist();
  }, [selectedJob.id, selectedJob.property_detail?.id]);

  // Check if job has been checked in before
  const checkIfCheckedIn = async () => {
    try {
      const checkedInJobs = await AsyncStorage.getItem('checkedInJobs');
      if (checkedInJobs !== null) {
        const jobsArray = JSON.parse(checkedInJobs);
        setIsCheckedIn(jobsArray.includes(selectedJob.id));
      }
    } catch (error) {
      console.error("Error checking checked-in status:", error);
    }
  };

 

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? base64Images.length - 1 : prev - 1);
    setImageError(false); // Reset error state when changing images
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => prev === base64Images.length - 1 ? 0 : prev + 1);
    setImageError(false); // Reset error state when changing images
  };

  const handleLongPressAddress = () => {
    Clipboard.setStringAsync(`${address}`);
    toast.success("Address was copied to clipboard!");
  };

  const handleCheckIn = () => {
    if (!isWithinJobTime) {
      toast.error("You can only check in during the scheduled time window.");
      return;
    }

    if (isCheckedIn) {
      router.push({
        pathname: "/(helper)/precleaning",
        params: {
          checkList: JSON.stringify(checkList)
        }
      });
    } else {
      setShowAlert(true);
    }
  };


  const handleImageError = () => {
    console.log("Image failed to load:", base64Images[currentImageIndex]?.original);
    setImageError(true);
  };

  // Get priority color and icon
  const getPriorityStyle = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',

        };
      case 'medium':
        return {
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200',

        };
      case 'low':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',

        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',

        };
    }
  };

  // Group checklist by room
  const groupedChecklist = checkList.reduce((acc, item) => {
    const room = item.room_display || item.room;
    if (!acc[room]) {
      acc[room] = [];
    }
    acc[room].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Fallback image component
  const FallbackImage = () => (
    <View className="w-full h-full bg-gray-200 items-center justify-center">
      <Text className="text-gray-500">Image failed to load</Text>
      <Text className="text-xs text-gray-400 mt-2 px-4 text-center">
        {base64Images[currentImageIndex]?.original?.substring(0, 30)}...
      </Text>
    </View>
  );

  const showCheckInButton = isToday && !isCheckedIn;

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
          <ScrollView contentContainerStyle={{ paddingBottom: showCheckInButton ? 100 : 20 }}>
            <View className="bg-white rounded-lg overflow-hidden mb-4">
              {/* Image carousel */}
              <View className="relative h-80">
                {loading ? (
                  <View className="w-full h-full bg-gray-100 items-center justify-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text className="text-gray-500 mt-2">Loading images...</Text>
                  </View>
                ) : propertyImages.length > 0 ? (
                  <View className="w-full h-full">
                    {imageError ? (
                      <FallbackImage />
                    ) : (
                      <Image
                        source={{ uri: propertyImages[currentImageIndex] }}
                        className="w-full h-full"
                        resizeMode="cover"
                        onError={handleImageError}
                      />
                    )}
                  </View>
                )
                  : (
                    <View className="w-full h-full bg-gray-200 items-center justify-center">
                      <Text className="text-gray-500">No images available</Text>
                    </View>
                  )}

                {/* Image navigation buttons - only show if there are multiple images */}
                {base64Images.length > 1 && (
                  <View className="absolute inset-0 flex-row justify-between items-center px-2">
                    <TouchableOpacity
                      className="bg-black/50 rounded-full p-3"
                      onPress={handlePrevImage}
                      activeOpacity={0.7}
                    >
                      <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-black/50 rounded-full p-3"
                      onPress={handleNextImage}
                      activeOpacity={0.7}
                    >
                      <ChevronRight size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Image indicator dots - only show if there are multiple images */}
                {base64Images.length > 1 && (
                  <View className="absolute bottom-6 w-full flex-row justify-center">
                    {base64Images.map((_, index) => (
                      <View
                        key={index}
                        className={`h-2 w-2 rounded-full mx-1 ${currentImageIndex === index ? 'bg-white' : 'bg-white/40'
                          }`}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Property details */}
              <View className="p-4 px-6 bg-white rounded-t-2xl -mt-4 mx-2 shadow">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-lg font-bold text-gray-800">{title}</Text>
                  <Text className="text-blue-600 font-bold">{property_detail.base_price}</Text>
                </View>

                {/* Address with copy functionality */}
                <TouchableOpacity
                  className="flex-row justify-between items-center mb-3"
                  onLongPress={handleLongPressAddress}
                  delayLongPress={500}
                >
                  <View className="flex-row items-center">
                    <MapPin size={16} color="#666" className="mr-1" />
                    <Text className="text-gray-600 text-sm">{property_detail.address}, {property_detail.city}, {property_detail.state}, {property_detail.zip_code}</Text>
                  </View>
                  <Text className="text-xs text-gray-400">Hold to copy</Text>
                </TouchableOpacity>
                     <TimelineCleaner jobData={selectedJob}/>

                {/* Description - only show if not empty */}
                {description && description !== "null" && description !== "undefined" && (
                  <View className=" mb-4 ">
                    <Text className=" text-md font-semibold ml-2 mb-2">Description</Text>
                    <View className="flex-row">

                      <View className='bg-blue-50 p-3 rounded-lg'>

                        <Text className="text-gray-700   pr-3 pl-2">{description}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Cleaning requirements */}
                <View className="mb-4">
                  <Text className="text-md font-semibold mb-2 text-gray-800">Cleaning Instruction</Text>
                  <View className="p-3 bg-blue-50 rounded-lg">
                    <Text className='text-gray-700 '>{property_detail.instruction}</Text>
                  </View>
                </View>

                {/* Special instructions - Only show if description is empty */}
                {(!description || description === "null" || description === "undefined") && (
                  <View className="bg-yellow-50 p-3 rounded-lg mb-4">
                    <View className="flex-row">
                      <FileText size={18} color="#B45309" className="mr-2 mt-1" />
                      <View>
                        <Text className="text-amber-800 font-medium ml-2">Special Instructions</Text>
                        <Text className="text-amber-700 text-sm ml-2">Use eco-friendly products only</Text>
                      </View>
                    </View>
                  </View>
                )}

             {checkList.length > 0 && (
  <View className="mb-4">
    <TouchableOpacity
      className="flex-row items-center justify-between mb-3"
      onPress={() => setShowChecklist(!showChecklist)}
    >
      <Text className="text-base font-semibold text-gray-700">
        Cleaning Checklist ({checkList.length} items)
      </Text>
      {showChecklist ? (
        <ChevronUp size={20} color="#666" />
      ) : (
        <ChevronDown size={20} color="#666" />
      )}
    </TouchableOpacity>

    {showChecklist && (
      <View className=" rounded-md border border-gray-200 p-2 pt-4">
        {/* Filter Buttons */}
        <View className="flex-row mb-3 pb-2 bg-white rounded-lg shadow-sm">
          {['all', 'high', 'medium', 'low'].map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`flex-1 py-2 px-3 rounded-lg mr-2 ml-2 last:mr-0 ${priorityFilter === filter ? 'bg-indigo-600' : 'bg-gray-100'
                }`}
              onPress={() => setPriorityFilter(filter)}
            >
              <Text className={`text-center text-xs font-medium capitalize ${priorityFilter === filter ? 'text-white' : 'text-gray-600'
                }`}>
                {toCamelCase(filter)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {checklistLoading ? (
  <View className="py-4 items-center">
    <ActivityIndicator size="small" color="#4F46E5" />
    <Text className="text-gray-500 mt-2 text-sm">Loading checklist...</Text>
  </View>
) : (
  <>
    {/* Check if all filtered lists are empty */}
    {Object.keys(groupedChecklist).every((room) => {
      const filteredItems = priorityFilter === 'all'
        ? groupedChecklist[room]
        : groupedChecklist[room].filter(item => {
            const itemPriority = (item.priority_display || item.priority)?.toLowerCase();
            return itemPriority === priorityFilter.toLowerCase();
          });
      return filteredItems.length === 0;
    }) ? (
      <View className="p-4 rounded-lg items-center bg-blue-50 mb-4">
        <Text className="text-gray-500 text-sm text-center">
          No checklist items found for this filter.
        </Text>
      </View>
    ) : (
      <View className="space-y-2">
        {Object.keys(groupedChecklist).map((room, roomIndex) => {
          const filteredItems = priorityFilter === 'all'
            ? groupedChecklist[room]
            : groupedChecklist[room].filter(item => {
              const itemPriority = (item.priority_display || item.priority)?.toLowerCase();
              return itemPriority === priorityFilter.toLowerCase();
            });

          if (filteredItems.length === 0) return null;

          const sortedItems = [...filteredItems].sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            const aPriority = (a.priority_display || a.priority)?.toLowerCase();
            const bPriority = (b.priority_display || b.priority)?.toLowerCase();
            return (priorityOrder[bPriority] || 0) - (priorityOrder[aPriority] || 0);
          });

          return (
            <View key={roomIndex} className="mb-3">
              <View className="flex-row items-start">
                <View className="mr-4 mt-1">
                  <View className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />
                </View>
                <View className="flex-1">
                  <Text className="text-md font-semibold text-gray-900 ">
                    {room}
                  </Text>
                  <View className="space-y-1">
                    {sortedItems.map((item) => (
                      <View key={item.id} className="flex-row justify-between items-center">
                        <Text className="text-sm text-gray-600 leading-5 flex-1 pr-2 py-2">
                          {item.description}
                        </Text>
                        <Text className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.priority.toLowerCase() === 'high'
                            ? 'bg-red-100 text-red-600'
                            : item.priority.toLowerCase() === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}>
                          {toCamelCase(item.priority_display || item.priority)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    )}
  </>
)}

      </View>
    )}
  </View>
)}

{/* Show message if no checklist items */}
{!checklistLoading && checkList.length === 0 && (
  <View className="mb-4">
    <Text className="text-base font-medium mb-2 text-gray-800">Cleaning Checklist</Text>
    <View className="p-4 rounded-lg items-center bg-blue-50">
      <Text className="text-gray-500 text-sm text-center">
        No specific checklist items found for this property.
        {'\n'}Follow the general cleaning instructions above.
      </Text>
    </View>
  </View>
)}


              </View>
            </View>
              {status !== "completed" && (
            <View className="p-4 bg-white ">
              <TouchableOpacity
                className={`py-4 rounded-lg items-center ${isWithinJobTime ? 'bg-primary' : 'bg-gray-300'}`}
                onPress={handleCheckIn}
                activeOpacity={isWithinJobTime ? 0.8 : 1}
                disabled={!isWithinJobTime}
              >
                <Text className="text-white font-semibold text-lg">
                  {isCheckedIn ? 'Continue Working' : 'Check In'}
                </Text>
              </TouchableOpacity>

              {!isWithinJobTime && (
                <Text className="text-red-500 text-center mt-2 text-sm">
                  You can only check in between your scheduled job time.
                </Text>
              )}
            </View>

          )}
          </ScrollView>

        
        </View>

        <CustomAlert
          visible={showAlert}
          type="warning"
          title="Warning"
          message="Have you reached your destination?"
          onCancel={() => setShowAlert(false)}
          onConfirm={async () => {
            const currentTime = new Date().toLocaleString('en-US', {
              hour: 'numeric',
              minute: "numeric",
              hour12: true
            });

            try {
              const existingJobs = await AsyncStorage.getItem('checkedInJobs');
              let jobsArray = existingJobs ? JSON.parse(existingJobs) : [];

              if (!jobsArray.includes(selectedJob.id)) {
                jobsArray.push(selectedJob.id);
                await AsyncStorage.setItem('checkedInJobs', JSON.stringify(jobsArray));
              }

              console.log("Updated job status id:", selectedJob.id);
              const result = await updateJobStatus(selectedJob.id);
              if (!result.success) {
                console.error("Job status update failed:", result.message);
                Alert.alert("Error", result.message || "Could not update job status.");
                return; // Prevent routing if update fails
              }

              setIsCheckedIn(true);
              console.log("Selected id to update status:", selectedJob.id);
              setShowAlert(false);

              router.push({
                pathname: "/(helper)/precleaning",
                params: {

                  checklist: checkList
                }
              });
            } catch (error) {
              console.error("Error saving check-in status or updating job:", error);
              Alert.alert("Error", "Something went wrong. Please try again.");
            }
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
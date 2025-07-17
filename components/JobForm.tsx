import { createJob } from '@/api/jobApi';
import { useAppToast } from '@/hooks/toastNotification';
import usePropertyStore from "@/store/jobStore";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Briefcase, Calendar, Clock, FileText } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { DateTimeField } from "./DateTimeField";
import { FormField } from "./FormField";

interface Property {
  id: string;
  name: string;
  address: string;
}

interface Job {
  title: string;
  description: string;
  price: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

interface JobStoreState {
  newJob: Job;
  selectedProperty: Property | null;
  updateNewJobField: (field: keyof Job, value: string) => void;
  initializeData: () => void;
}

interface JobFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export interface JobFormRef {
  submitForm: () => Promise<boolean>;
}

export const JobForm = forwardRef<JobFormRef, JobFormProps>(({ 
  onSuccess, 
  onClose 
}, ref) => {
  const { newJob, selectedProperty, updateNewJobField, initializeData } = usePropertyStore() as unknown as JobStoreState;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useAppToast();
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);

  // State for form validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    initializeData();
  }, []);

  // Validation functions
  const validateTitle = (value: string): boolean => {
    if (!value || value.trim() === '') {
      setErrors(prev => ({ ...prev, title: 'Job title is required' }));
      return false;
    }
    setErrors(prev => ({ ...prev, title: '' }));
    return true;
  };

  const validateStartDate = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, startDate: 'Start date is required' }));
      return false;
    }
    setErrors(prev => ({ ...prev, startDate: '' }));
    return true;
  };

  const validateStartTime = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, startTime: 'Start time is required' }));
      return false;
    }
    setErrors(prev => ({ ...prev, startTime: '' }));
    return true;
  };

  const validateEndDate = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, endDate: 'End date is required' }));
      return false;
    }
    setErrors(prev => ({ ...prev, endDate: '' }));
    return true;
  };

  const validateEndTime = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, endTime: 'End time is required' }));
      return false;
    }
    setErrors(prev => ({ ...prev, endTime: '' }));
    return true;
  };

  // Handle field changes with validation
  const handleTitleChange = (value: string): void => {
    updateNewJobField("title", value);
    validateTitle(value);
  };

  const handleDescriptionChange = (value: string): void => {
    updateNewJobField("description", value);
  };

  // Handle start date change
  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    setShowStartDatePicker(false);
    if (event.type === "dismissed") return;
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
      updateNewJobField("startDate", formattedDate);
      validateStartDate(formattedDate);
    }
  };

  // Handle end date change
  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    setShowEndDatePicker(false);
    if (event.type === "dismissed") return;
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
      updateNewJobField("endDate", formattedDate);
      validateEndDate(formattedDate);
    }
  };

  // Handle start time change
  const onStartTimeChange = (event: DateTimePickerEvent, selectedTime?: Date): void => {
    setShowStartTimePicker(false);
    if (event.type === "dismissed") return;
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
      updateNewJobField("startTime", formattedTime);
      validateStartTime(formattedTime);
    }
  };

  // Handle end time change
  const onEndTimeChange = (event: DateTimePickerEvent, selectedTime?: Date): void => {
    setShowEndTimePicker(false);
    if (event.type === "dismissed") return;
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
      updateNewJobField("endTime", formattedTime);
      validateEndTime(formattedTime);
    }
  };

  // Main form submission function
  const handleAddJob = async (): Promise<boolean> => {
    // Validate all required fields
    const isTitleValid = validateTitle(newJob.title);
    const isStartDateValid = validateStartDate(newJob.startDate);
    const isStartTimeValid = validateStartTime(newJob.startTime);
    const isEndDateValid = validateEndDate(newJob.endDate);
    const isEndTimeValid = validateEndTime(newJob.endTime);

    if (!isTitleValid || !isStartDateValid || !isStartTimeValid || !isEndDateValid || !isEndTimeValid) {
      toast.error("Please fill in all required fields");
      return false;
    }

    if (!selectedProperty) {
      toast.error("Please select a property for this job.");
      return false;
    }

    try {
      setIsLoading(true);

      // Format dates and times for API
      const startDateObj = new Date(newJob.startDate);
      if (newJob.startTime) {
        const [timePart, period] = newJob.startTime.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        startDateObj.setHours(hours, minutes, 0, 0);
      }

      const endDateObj = new Date(newJob.endDate);
      if (newJob.endTime) {
        const [timePart, period] = newJob.endTime.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        endDateObj.setHours(hours, minutes, 0, 0);
      }

      const start_time = startDateObj.toISOString();
      const end_time = endDateObj.toISOString();

      const jobData = {
        property: selectedProperty.id,
        title: newJob.title,
        description: newJob.description || '',
        start_time: start_time,
        end_time: end_time
      };

      const result = await createJob(jobData);

      if (result.success) {
        toast.success("Job created successfully!");
        onSuccess?.();
        onClose?.();
        return true;
      } else {
        toast.error(result.message || "Failed to create job");
        return false;
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("An error occurred while creating the job");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Expose the submit function to parent component
  useImperativeHandle(ref, () => ({
    submitForm: handleAddJob
  }));

  // Handle date/time field press with validation
  const handleStartDatePress = (): void => {
    setShowStartDatePicker(true);
    validateStartDate(newJob.startDate);
  };

  const handleEndDatePress = (): void => {
    setShowEndDatePicker(true);
    validateEndDate(newJob.endDate);
  };

  const handleStartTimePress = (): void => {
    setShowStartTimePicker(true);
    validateStartTime(newJob.startTime);
  };

  const handleEndTimePress = (): void => {
    setShowEndTimePicker(true);
    validateEndTime(newJob.endTime);
  };

  // Helper to convert time string to Date
  const parseTimeString = (timeString?: string): Date => {
    if (!timeString) return new Date();

    try {
      const now = new Date();
      const [time, period] = timeString.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      now.setHours(hours, minutes, 0, 0);
      return now;
    } catch (e) {
      console.error("Error parsing time string:", e);
      return new Date();
    }
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {selectedProperty && (
          <View className="mb-5 bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
            <Text className="text-blue-700 font-semibold mb-1">Property Selected:</Text>
            <Text className="text-blue-800 text-lg font-medium">{selectedProperty.name}</Text>
            <Text className="text-blue-600 text-sm">{selectedProperty.address}</Text>
          </View>
        )}

        <FormField
          label="Job Title *"
          icon={<Briefcase size={20} color="#4B5563" />}
          placeholder="Enter job title"
          value={newJob.title}
          onChangeText={handleTitleChange}
          containerStyle={errors.title ? "border-red-500" : "border-gray-300"}
        />
        {errors.title && (
          <Text className="text-red-500 text-sm mb-3">{errors.title}</Text>
        )}

        <FormField
          label="Job Description"
          icon={<FileText size={20} color="#4B5563" />}
          placeholder="Enter job description"
          value={newJob.description}
          onChangeText={handleDescriptionChange}
          multiline
          containerStyle="border-gray-300"
        />

        <DateTimeField
          label="Start Date *"
          icon={<Calendar size={20} color="#4B5563" />}
          value={newJob.startDate}
          onPress={handleStartDatePress}
          containerStyle={errors.startDate ? "border-red-500" : "border-gray-300"}
        />
        {errors.startDate && (
          <Text className="text-red-500 text-sm mt-1 mb-3">{errors.startDate}</Text>
        )}
        {showStartDatePicker && (
          <DateTimePicker
            value={newJob.startDate ? new Date(newJob.startDate) : new Date()}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}

        <DateTimeField
          label="Start Time *"
          icon={<Clock size={20} color="#4B5563" />}
          value={newJob.startTime}
          onPress={handleStartTimePress}
          containerStyle={errors.startTime ? "border-red-500" : "border-gray-300"}
        />
        {errors.startTime && (
          <Text className="text-red-500 text-sm mt-1 mb-3">{errors.startTime}</Text>
        )}
        {showStartTimePicker && (
          <DateTimePicker
            value={parseTimeString(newJob.startTime)}
            mode="time"
            display="default"
            onChange={onStartTimeChange}
          />
        )}

        <DateTimeField
          label="End Date *"
          icon={<Calendar size={20} color="#4B5563" />}
          value={newJob.endDate}
          onPress={handleEndDatePress}
          containerStyle={errors.endDate ? "border-red-500" : "border-gray-300"}
        />
        {errors.endDate && (
          <Text className="text-red-500 text-sm mt-1 mb-3">{errors.endDate}</Text>
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={newJob.endDate ? new Date(newJob.endDate) : new Date()}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}

        <DateTimeField
          label="End Time *"
          icon={<Clock size={20} color="#4B5563" />}
          value={newJob.endTime}
          onPress={handleEndTimePress}
          containerStyle={errors.endTime ? "border-red-500" : "border-gray-300"}
        />
        {errors.endTime && (
          <Text className="text-red-500 text-sm mt-1 mb-3">{errors.endTime}</Text>
        )}
        {showEndTimePicker && (
          <DateTimePicker
            value={parseTimeString(newJob.endTime)}
            mode="time"
            display="default"
            onChange={onEndTimeChange}
          />
        )}
      </ScrollView>
    </View>
  );
});
import { StatusBar } from 'expo-status-bar';
import {
  Briefcase,
  Building,
  CheckSquare,
  Plus
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { createJob, getJobs } from '@/api/jobApi';
import {
  deleteProperty as apiDeleteProperty,
  fetchPropertiesByUserId
} from '@/api/propertyapi';
import { JobCard } from '@/components/JobCard';
import { Property, PropertyCard } from '@/components/PropertyCard';
import CustomAlert from '@/hooks/customAlert';
import { useAppToast } from '@/hooks/toastNotification';
import usePropertyStore from '@/store/jobStore';
import { router } from 'expo-router';

// Empty state component
const EmptyState = ({ icon, title, message, buttonText, onButtonPress }:any) => (
  <View className="flex-1 justify-center items-center p-6">
    {icon === 'property' ? (
      <Building size={70} color="#CBD5E0" />
    ) : (
      <Briefcase size={70} color="#CBD5E0" />
    )}
    <Text className="text-gray-500 mt-6 text-xl text-center font-medium">
      {title}
    </Text>
    <Text className="text-gray-400 mt-2 text-center mb-6">
      {message}
    </Text>
    <TouchableOpacity 
      className="bg-primary px-8 py-4 rounded-xl flex-row items-center shadow-md"
      onPress={onButtonPress}
    >
      {icon === 'property' ? (
        <Plus size={22} color="#fff" />
      ) : (
        <CheckSquare size={22} color="#fff" />
      )}
      <Text className="text-white font-bold ml-2 text-lg">{buttonText}</Text>
    </TouchableOpacity>
  </View>
);

// Tab navigation component
const TabNavigation = ({ activeTab, setActiveTab }:any) => (
  <View className="flex-row bg-white mb-4 shadow-sm">
    <TouchableOpacity 
      className={`flex-1 py-4 items-center ${activeTab === 'properties' ? 'border-b-3 border-blue-500' : ''}`}
      onPress={() => setActiveTab('properties')}
    >
      <Text className={`${activeTab === 'properties' ? 'text-primary font-semibold' : 'text-gray-500'} text-base`}>Properties</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      className={`flex-1 py-4 items-center ${activeTab === 'jobs' ? 'border-b-3 border-blue-500' : ''}`}
      onPress={() => setActiveTab('jobs')}
    >
      <Text className={`${activeTab === 'jobs' ? 'text-primary font-semibold' : 'text-gray-500'} text-base`}>Jobs</Text>
    </TouchableOpacity>
  </View>
);

// Floating Action Button component
const FloatingActionButton = ({ onPress, icon }:any) => {
  return (
    <TouchableOpacity 
      className="absolute bottom-6 right-6 bg-primary p-4 rounded-full shadow-lg z-10"
      onPress={onPress}
    >
      {icon}
    </TouchableOpacity>
  );
};

// Main component with fixes to the property fetching
export default function PropertyManager() {
  const [activeTab, setActiveTab] = useState('properties');
  const [propertyModalVisible, setPropertyModalVisible] = useState(false);
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
  const [showAlert3, setShowAlert3] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const windowHeight = Dimensions.get('window').height;
  const toast = useAppToast();
  
  // State for properties from API
  const [userProperties, setUserProperties] = useState([]);
  const [userJobs, setUserJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Access Zustand store for jobs
  const { 
    jobs, 
    selectedProperty,
    newJob,
    initializeData,
    setSelectedProperty,
    deleteJob,
    updateJobStatus,
    resetNewJob,
    resetNewProperty
  } = usePropertyStore();

  const fetchJobs = async (propertyId = null) => {
    try {
      setIsLoading(true);
      const response = await getJobs(propertyId);
      
      if (response.success && response.data) {
        setUserJobs(response.data);
        console.log("Jobs fetched successfully:", response.data);
      } else {
        console.error("Error fetching jobs:", response.error);
        toast.error("Failed to load jobs");
      }
    } catch (error) {
      console.error("Exception in fetchJobs:", error);
      toast.error("An error occurred while fetching jobs");
    } finally {
      setIsLoading(false);
    }
  }

  // Load properties on component mount
  useEffect(() => {
    fetchProperties();
    fetchJobs();
  }, []);
  
  // Function to fetch properties
  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setRefreshing(true);
      const response = await fetchPropertiesByUserId();
      
      if (response.success) {
        setUserProperties(response.data);
        console.log("Properties fetched successfully:", response.data.length);
      } else {
        console.error("Error fetching properties:", response.error);
        toast.error("Failed to load properties");
      }
    } catch (error) {
      console.error("Exception in fetchProperties:", error);
      toast.error("An error occurred while fetching properties");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle property form success
  const handlePropertyFormSuccess = () => {
    setPropertyModalVisible(false);
    fetchProperties(); // Refresh properties after adding
  };
  
  // Handle property deletion
  const handleDeletePropertyConfirm = async () => {
    if (!selectedPropertyId) return;
    console.log("selected ID:",selectedPropertyId)
    
    try {
      setIsLoading(true);
      const response = await apiDeleteProperty(selectedPropertyId);
      
      if (response.success) {
        // Remove from local state
        setUserProperties(prev => prev.filter(p => p.id !== selectedPropertyId));
        toast.success("Property deleted successfully");
        
        // Clear selection if needed
        if (selectedProperty && selectedProperty.id === selectedPropertyId) {
          setSelectedProperty(null);
        }
      } else {
        console.error("Error deleting property:", response.error);
        toast.error("Failed to delete property: " + (response.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Exception in handleDeletePropertyConfirm:", error);
      toast.error("An error occurred while deleting property");
    } finally {
      setIsLoading(false);
      setShowAlert2(false);
    }
  };
  
  // Handle add job - Updated to use the job API
  const handleAddJob = async () => {
    if (!selectedProperty) {
      toast.error("Please select a property for this job.");
      return;
    }
    
    if (!newJob.title) {
      toast.error("Please enter a job title.");
      return;
    }
    
    if (!newJob.startDate || !newJob.startTime) {
      toast.error("Please enter a start date and time.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Format dates and times for API
      // Combine start date and time
      const startDateObj = new Date(newJob.startDate);
      if (newJob.startTime) {
        const [timePart, period] = newJob.startTime.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        
        // Convert 12-hour format to 24-hour format
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        startDateObj.setHours(hours, minutes, 0, 0);
      }
      
      // Combine end date and time
      const endDateObj = new Date(newJob.endDate);
      if (newJob.endTime) {
        const [timePart, period] = newJob.endTime.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        
        // Convert 12-hour format to 24-hour format
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        endDateObj.setHours(hours, minutes, 0, 0);
      }
      
      // Format for API
      const start_time = startDateObj.toISOString();
      const end_time = endDateObj.toISOString();
      
      // Prepare job data for API
      const jobData = {
        property: selectedProperty.id,
        title: newJob.title,
        description: newJob.description || '',
        start_time: start_time,
        end_time: end_time
      };
      
      // Call API to create job
      const result = await createJob(jobData);
      
      if (result.success) {
        toast.success("Job created successfully!");
        setJobModalVisible(false);
        resetNewJob();
        
        // Refresh jobs
        fetchJobs();
      } else {
        toast.error(result.message || "Failed to create job");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("An error occurred while creating the job");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    setJobModalVisible(true);
  };

  const handleDeleteProperty = (propertyId) => {
    setShowAlert2(true);
    setSelectedPropertyId(propertyId);
  };

  const handleCloseJobModal = () => {
    resetNewJob(); // This already exists in your store
    setJobModalVisible(false);
  };
   const handleClosePropertyModal = () => {
    resetNewProperty()
    setPropertyModalVisible(false)
  };


  const handleDeleteJob = (jobId) => {
    setShowAlert1(true);
    setSelectedJobId(jobId); 
  };

  const getPropertyById = (propertyId) => {
    return userProperties.find(property => property.id === propertyId);
  };

  const handleOpenJobModal = () => {
    if (userProperties.length > 0) {
      if (!selectedProperty) {
        setSelectedProperty(userProperties[0]);
      }
      setJobModalVisible(true);
    } else {
      setShowAlert3(true);
    }
  };

  const handleRefresh = () => {
    fetchProperties();
    fetchJobs();
    initializeData(); 
  };

  // Render property card
  const renderPropertyItem = ({ item }) => (
    <PropertyCard
      property={item}
      onSelect={handleSelectProperty}
      onDelete={handleDeleteProperty}
      onEdit={function (property: Property): void {
        throw new Error('Function not implemented.');
      }}
    />
  );

  const renderJobItem = ({ item }) => (
    <JobCard
      job={item}
      property={getPropertyById(item.propertyId)}
      onDelete={handleDeleteJob}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="auto" />
      
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Properties Content */}
      {activeTab === 'properties' && (
        <View className="flex-1 px-4 pb-20">
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="text-gray-500 mt-4">Loading properties...</Text>
            </View>
          ) : userProperties.length > 0 ? (
            <FlatList
              data={userProperties}
              renderItem={renderPropertyItem}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80, paddingTop: 6 }}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          ) : (
            <EmptyState
              icon="property"
              title="No properties found"
              message="Add your first property to get started"
              buttonText="Add One"
              onButtonPress={() => router.push("/(helper)/propertyform")}
            />
          )}

          {/* Floating Action Button for Properties */}
          <FloatingActionButton 
            onPress={() => router.push("/(helper)/propertyform")}
            icon={<Plus size={28} color="#fff" />}
          />
        </View>
      )}
      
      {/* Jobs Content */}
      {activeTab === 'jobs' && (
        <View className="flex-1 px-4 pb-20">
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="text-gray-500 mt-4">Loading jobs...</Text>
            </View>
          ) : userJobs.length > 0 ? (
            <FlatList
              data={userJobs}
              renderItem={({ item }) => (
                <JobCard
                  job={item}
                  property={getPropertyById(item.property)}
                  onDelete={handleDeleteJob}
                />
              )}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80, paddingTop: 6 }}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          ) : (
            <EmptyState
              icon="job"
              title="No jobs found"
              message={userProperties.length > 0 
                ? "Add your first job to get started" 
                : "Add a property first before creating jobs"}
              buttonText={userProperties.length > 0 ? "Add Job" : "Add Property First"}
              onButtonPress={() => {
                if (userProperties.length > 0) {
                  setSelectedProperty(userProperties[0]);
                  setJobModalVisible(true);
                } else {
                  setActiveTab('properties');
                  setTimeout(() => setPropertyModalVisible(true), 300);
                }
              }}
            />
          )}
          
         
        </View>
      )}
          
      
      
      {/* Delete Property Alert */}
      <CustomAlert
        visible={showAlert2}
        type="danger"
        title="Delete Property"
        message="Are you sure you want to delete this property? All associated jobs will also be deleted."
        onCancel={() => setShowAlert2(false)}
        onConfirm={handleDeletePropertyConfirm}
      />
      
      {/* Delete Job Alert */}
      <CustomAlert
        visible={showAlert1}
        type="danger"
        title="Delete Job"
        message="Are you sure you want to delete this job?"
        onCancel={() => setShowAlert1(false)}
        onConfirm={() => {
          if (selectedJobId) {
            deleteJob(selectedJobId);
            // Refresh jobs after deletion
            fetchJobs();
            toast.success("Job was deleted successfully!");
          } else {
            toast.error("Job was not deleted!");
          }
          setShowAlert1(false); 
        }}
      />
      
      {/* No Properties Alert */}
      <CustomAlert
        visible={showAlert3}
        type="warning"
        title="No Properties"
        message="You need to add a property first before creating a job."
        onCancel={() => setShowAlert3(false)}
        onConfirm={() => {
          setActiveTab('properties');
          setTimeout(() => setPropertyModalVisible(true), 300);
          setShowAlert3(false);
        }}
      />
    </SafeAreaView>
  );
}
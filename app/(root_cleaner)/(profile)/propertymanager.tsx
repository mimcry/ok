import { createJob, getJobs } from '@/api/jobApi';
import {
  deleteProperty as apiDeleteProperty,
  fetchPropertiesByUserId
} from '@/api/propertyapi';
import { DisplayJobCardSkeletonList } from '@/components/DisplayJobCardSkeleton';
// import { FormModal } from '@/components/FormModel';
import { FormModal } from '@/components/FormModel';
import { JobCard } from '@/components/JobCard';
import { JobForm } from '@/components/JobForm';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyForm } from '@/components/PropertyForm';
import CustomAlert from '@/hooks/customAlert';
import { useAppToast } from '@/hooks/toastNotification';
import usePropertyStore from '@/store/jobStore';
import { JobStatus } from '@/types/propertytype';
import { router } from 'expo-router';
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

// Type definitions
interface EmptyStateProps {
  icon: 'property' | 'job';
  title: string;
  message: string;
  buttonText: string;
  onButtonPress: () => void;
}

interface TabNavigationProps {
  activeTab: 'properties' | 'jobs';
  setActiveTab: (tab: 'properties' | 'jobs') => void;
}

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
}

// Unified Property interface that matches your API and internal usage
interface ApiProperty {
  id: number | string;  
  name: string;
  address: string;
  city: string;
  zip_code?: string;
  zipCode?: string;
  images: string[];
  description: string;
  instruction?: string;
  airbnb_link?: string;
  airbnblink?: string;
  bedrooms: number | string;
  bathrooms: number | string;
  property_type?: string;
  type?: string;
  area: number | string;
  base_price?: string;
  connection_id:string
  basePrice?: string;
  main_image?: string;
  cleaner?: any;
  host?: number;
  state: string;
  created_at?: string;
  updated_at?: string;
}

// Unified Job interface
interface ApiJob {
  id: number | string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  dueTime?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  property?: number | string;
  propertyId?: number | string;
  property_detail?: {
    id: number | string;
    title: string;
    main_image: string;
    address?: string;
  };
  price?: string;
  assignedTo?: string;
  propertyAddress?: string;
  propertyName?: string;
  notes?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}

interface JobCardData {
  job: ApiJob;
  property?: ApiProperty;
  onDelete: (jobId: string | number) => void;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Store interface to match your Zustand store
interface PropertyStoreState {
  jobs: ApiJob[];
  selectedProperty: ApiProperty | null;
  newJob: {
    title: string;
    description: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    status: string;
  };
  initializeData: () => Promise<void>;
  setSelectedProperty: (property: ApiProperty | null) => void;
  deleteJob: (jobId: string | number) => void;
  updateJobStatus: (jobId: string | number, status: JobStatus) => void;
  resetNewJob: () => void;
}

// Utility function to fix date timezone issues
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Utility function to create date without timezone offset
const createLocalDate = (year: number, month: number, day: number): Date => {
  return new Date(year, month, day);
};

// Utility function to parse date string safely
const parseDateSafely = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return createLocalDate(year, month - 1, day); // month is 0-indexed
};

// Utility function to format time with proper 12-hour format
const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
  return hours + ':' + minutesStr + ' ' + ampm;
};

// Utility function to combine date and time properly
const combineDateAndTime = (dateString: string, timeString: string): Date => {
  const baseDate = parseDateSafely(dateString);
  
  if (timeString) {
    const [timePart, period] = timeString.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    // Convert 12-hour format to 24-hour format
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    baseDate.setHours(hours, minutes, 0, 0);
  }
  
  return baseDate;
};

// Utility function to normalize property data
const normalizeProperty = (property: any): ApiProperty => ({
  id: property.id || '',
  name: property.name || '',
  address: property.address || '',
  city: property.city || '',
  state: property.state || '',
  zip_code: property.zipCode || property.zip_code || '',
  images: property.images || [],
  description: property.description || '',
  instruction: property.instruction || '',
  airbnblink: property.airbnblink || property.airbnb_link || '',
  bedrooms: property.bedrooms || 0,
  bathrooms: property.bathrooms || 0,
  property_type: property.type || property.property_type || '',
  area: property.area || 0,
  base_price:  property.base_price ,
  connection_id:property.connection_id,
  main_image: property.main_image || '',
  cleaner: property.cleaner,
  host: property.host_id,
  created_at: property.created_at,
  updated_at: property.updated_at,
});

// Utility function to normalize job data
const normalizeJob = (job: any): ApiJob => ({
  id: job.id || '',
  title: job.title || '',
  description: job.description || '',
  start_time: job.start_time,
  end_time: job.end_time,
  date: job.date,
  dueTime: job.dueTime,
  status: job.status || 'scheduled',
  property: job.property,
  propertyId: job.propertyId || job.property,
  property_detail: job.property_detail,
  price: job.price,
  assignedTo: job.assignedTo,
  propertyAddress: job.propertyAddress,
  propertyName: job.propertyName,
  notes: job.notes,
  startDate: job.startDate,
  startTime: job.startTime,
  endDate: job.endDate,
  endTime: job.endTime,
});

// Empty state component
const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  message, 
  buttonText, 
  onButtonPress 
}) => (
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
const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => (
  <View className="flex-row bg-white mb-4 shadow-sm">
    <TouchableOpacity 
      className={`flex-1 py-4 items-center ${activeTab === 'properties' ? 'border-b-3 border-blue-500' : ''}`}
      onPress={() => setActiveTab('properties')}
    >
      <Text className={`${activeTab === 'properties' ? 'text-primary font-semibold' : 'text-gray-500'} text-base`}>
        Properties
      </Text>
    </TouchableOpacity>
    <TouchableOpacity 
      className={`flex-1 py-4 items-center ${activeTab === 'jobs' ? 'border-b-3 border-blue-500' : ''}`}
      onPress={() => setActiveTab('jobs')}
    >
      <Text className={`${activeTab === 'jobs' ? 'text-primary font-semibold' : 'text-gray-500'} text-base`}>
        Jobs
      </Text>
    </TouchableOpacity>
  </View>
);

// Floating Action Button component
const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress, icon }) => {
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
const PropertyManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'properties' | 'jobs'>('properties');
  const [propertyModalVisible, setPropertyModalVisible] = useState<boolean>(false);
  const [jobModalVisible, setJobModalVisible] = useState<boolean>(false);
  const [showAlert1, setShowAlert1] = useState<boolean>(false);
  const [showAlert2, setShowAlert2] = useState<boolean>(false);
  const [showAlert3, setShowAlert3] = useState<boolean>(false);
  const [selectedJobId, setSelectedJobId] = useState<number | string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const windowHeight = Dimensions.get('window').height;
  const toast = useAppToast();
  
  // State for properties from API
  const [userProperties, setUserProperties] = useState<ApiProperty[]>([]);
  const [userJobs, setUserJobs] = useState<ApiJob[]>([]);
  console.log("property that i got:",userProperties)
  // Access Zustand store for jobs
  const store = usePropertyStore() as unknown as PropertyStoreState;
  const { 
    jobs, 
    selectedProperty,
    newJob,
    initializeData,
    setSelectedProperty,
    deleteJob,
    updateJobStatus,
    resetNewJob
  } = store;

  const fetchJobs = async (propertyId: number | string | null = null): Promise<void> => {
    try {
      setIsLoading(true);
      const response: ApiResponse<ApiJob[]> = await getJobs(propertyId);
      
      if (response.success && response.data) {
        const normalizedJobs = response.data.map(normalizeJob);
        setUserJobs(normalizedJobs);
       
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
  };

  // Load properties on component mount
  useEffect(() => {
    fetchProperties();
    fetchJobs();
  }, []);
  
  // Function to fetch properties
  const fetchProperties = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setRefreshing(true);
      const response: ApiResponse<ApiProperty[]> = await fetchPropertiesByUserId();
      console.log("response from backend for property:",response)
      if (response.success && response.data) {
        const normalizedProperties = response.data.map(normalizeProperty);
        setUserProperties(normalizedProperties);
      
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
  
  // Handle property deletion
  const handleDeletePropertyConfirm = async (): Promise<void> => {
    if (!selectedPropertyId) return;
    console.log("selected ID:", selectedPropertyId);
    
    try {
      setIsLoading(true);
      const response: ApiResponse<any> = await apiDeleteProperty(selectedPropertyId);
      
      if (response.success) {
        // Remove from local state
        setUserProperties(prev => prev.filter((p: ApiProperty) => p.id !== selectedPropertyId));
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
  
  // Handle add job - Updated to use the job API with fixed date handling
  const handleAddJob = async (): Promise<void> => {
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
      
      // Use the fixed date combination function
      const startDateTime = combineDateAndTime(newJob.startDate, newJob.startTime);
      const endDateTime = combineDateAndTime(newJob.endDate || newJob.startDate, newJob.endTime || newJob.startTime);
      
      // Format for API (using toISOString but ensure we handle timezone properly)
      const start_time = startDateTime.toISOString();
      const end_time = endDateTime.toISOString();
      
      // Prepare job data for API
      const jobData = {
        property: selectedProperty.id,
        title: newJob.title,
        description: newJob.description || '',
        start_time: start_time,
        end_time: end_time
      };
      
      // Call API to create job
      const result: ApiResponse<ApiJob> = await createJob(jobData);
      
      if (result.success) {
        toast.success("Job created successfully!");
        setJobModalVisible(false);
        resetNewJob();
        
        // Refresh jobs
        await fetchJobs();
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

  const handleSelectProperty = (property: ApiProperty): void => {
    setSelectedProperty(property);
    setJobModalVisible(true);
  };

  const handleDeleteProperty = (propertyId: number | string): void => {
    setShowAlert2(true);
    setSelectedPropertyId(propertyId);
  };

  const handleDeleteJob = (jobId: number | string): void => {
    setShowAlert1(true);
    setSelectedJobId(jobId); 
  };

  const getPropertyById = (propertyId: number | string | undefined): ApiProperty | undefined => {
    if (!propertyId) return undefined;
    return userProperties.find((property: ApiProperty) => property.id.toString() === propertyId.toString());
  };

  const handleOpenJobModal = (): void => {
    if (userProperties.length > 0) {
      if (!selectedProperty) {
        setSelectedProperty(userProperties[0]);
      }
      setJobModalVisible(true);
    } else {
      setShowAlert3(true);
    }
  };

  const handleRefresh = (): void => {
    fetchProperties();
    fetchJobs();
    initializeData(); 
  };

  // Render property card
  const renderPropertyItem = ({ item }: { item: ApiProperty }) => (
    <PropertyCard
      property={item as any} 
      onSelect={handleSelectProperty}
      onDelete={handleDeleteProperty}
      onEdit={(property: any): void => {
        // Implement edit functionality
        console.log('Edit property:', property);
      }}
    />
  );

  const renderJobItem = ({ item }: { item: ApiJob }) => (
    <JobCard
      job={item as any} // Type assertion for compatibility with JobCard
      property={getPropertyById(item.propertyId || item.property) as any}
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
            <View className="flex-1">
              <DisplayJobCardSkeletonList />
            </View>
          ) : userProperties.length > 0 ? (
            <FlatList<ApiProperty>
              data={userProperties}
              renderItem={renderPropertyItem}
              keyExtractor={(item: ApiProperty) => item.id.toString()}
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
              buttonText="Add Property"
              onButtonPress={() => setPropertyModalVisible(true)}
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
            <FlatList<ApiJob>
              data={userJobs}
              renderItem={renderJobItem}
              keyExtractor={(item: ApiJob) => item.id.toString()}
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
      
      
<FormModal
  visible={propertyModalVisible}
  onClose={() => setPropertyModalVisible(false)} 
  title="Add New Property"
  formComponent={
    <PropertyForm />
  }
  button={false}
/>
    
{/* Job Modal */}
<FormModal
  visible={jobModalVisible}
  onClose={() => setJobModalVisible(false)} 
  title="Add New Job"
  formComponent={
    <JobForm 
      onSuccess={() => {
        setJobModalVisible(false);
        fetchJobs();
      }}
      onClose={() => setJobModalVisible(false)}
    />
  }
  button={false}
/>
 
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
};

export default PropertyManager;
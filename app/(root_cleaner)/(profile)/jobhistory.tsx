import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Modal, 
  Image,
  Dimensions
} from 'react-native';
import { getJobHistory } from '@/api/jobApi';

const { width } = Dimensions.get('window');

interface ImageData {
  id: number;
  job: number;
  image: string;
  image_type: string;
  uploaded_by: number;
  uploaded_at: string;
}

interface JobHistoryData {
  history_id: number;
  history_date: string;
  history_type: string;
  history_user: number;
  history_change_reason: string | null;
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  property_name: string;
  status: string;
  assigned_to: number;
  created_by: number;
  cleaner_started_time: string;
  finished_at: string;
  before_images: ImageData[];
  after_images: ImageData[];
  damage_images: ImageData[];
  before_images_count: number;
  after_images_count: number;
  damage_images_count: number;
}

interface JobHistoryCardProps {
  jobData: JobHistoryData;
  onPress: () => void;
}

interface JobDetailModalProps {
  visible: boolean;
  jobDetail: JobHistoryData | null;
  onClose: () => void;
}

const JobHistoryCard: React.FC<JobHistoryCardProps> = ({ jobData, onPress }) => {
  const { title, property_name, start_time, end_time, status } = jobData;
  
  // Format date function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color and text
  const getStatusConfig = (status: string) => {
    const isCompleted = status.toLowerCase() === 'completed';
    return {
      bgColor: isCompleted ? 'bg-green-100' : 'bg-red-100',
      textColor: isCompleted ? 'text-green-800' : 'text-red-800',
      borderColor: isCompleted ? 'border-green-200' : 'border-red-200',
      statusText: isCompleted ? 'Completed' : 'Incomplete'
    };
  };

  const statusConfig = getStatusConfig(status);

  return (
    <TouchableOpacity onPress={onPress}>
      <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mx-4 my-2">
        {/* Header with title and status */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-bold text-gray-900 mb-1">{title}</Text>
            <Text className="text-sm text-gray-600">{property_name}</Text>
          </View>
          
          <View className={`px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
            <Text className={`text-xs font-semibold ${statusConfig.textColor}`}>
              {statusConfig.statusText}
            </Text>
          </View>
        </View>

        {/* Date range */}
        <View className="bg-gray-50 rounded-lg p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Start Date</Text>
              <Text className="text-sm font-medium text-gray-800">
                {formatDate(start_time)}
              </Text>
            </View>
            
            <View className="px-2">
              <Text className="text-gray-400">→</Text>
            </View>
            
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">End Date</Text>
              <Text className="text-sm font-medium text-gray-800">
                {formatDate(end_time)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const JobDetailModal: React.FC<JobDetailModalProps> = ({ visible, jobDetail, onClose }) => {
  if (!jobDetail) return null;

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status: string) => {
    const isCompleted = status.toLowerCase() === 'completed';
    return {
      bgColor: isCompleted ? 'bg-green-100' : 'bg-red-100',
      textColor: isCompleted ? 'text-green-800' : 'text-red-800',
      borderColor: isCompleted ? 'border-green-200' : 'border-red-200',
      statusText: isCompleted ? 'Completed' : 'Incomplete'
    };
  };

  const statusConfig = getStatusConfig(jobDetail.status);

  const ImageGallery: React.FC<{ images: ImageData[]; title: string; emptyMessage: string }> = ({ 
    images, 
    title, 
    emptyMessage 
  }) => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-3">{title}</Text>
      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {images.map((img, index) => (
            <View key={index} className="mr-3">
              <Image 
                source={{ uri: img.image }} 
                style={{ width: 120, height: 120 }}
                className="rounded-lg bg-gray-200"
                resizeMode="cover"
              />
              <Text className="text-xs text-gray-500 mt-1 text-center">
                {formatDateTime(img.uploaded_at)}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
          {emptyMessage}
        </Text>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row justify-between items-center">
          <Text className="text-xl font-bold text-gray-900">Job Details</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Text className="text-blue-600 font-semibold">Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Job Info */}
          <View className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 mr-3">
                <Text className="text-xl font-bold text-gray-900 mb-2">{jobDetail.title}</Text>
                <Text className="text-base text-gray-600 mb-1">{jobDetail.property_name}</Text>
                <Text className="text-sm text-gray-500">Job ID: {jobDetail.id}</Text>
              </View>
              
              <View className={`px-3 py-2 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
                <Text className={`text-sm font-semibold ${statusConfig.textColor}`}>
                  {statusConfig.statusText}
                </Text>
              </View>
            </View>
            {/* Timeline */}
             <View className="ml-2">
          {/* Timeline Item */}
          <View className="flex-row items-center mb-4">
            <View className="w-4 h-4 bg-blue-200 rounded-full mr-4" />
            <View className="flex-1 flex-row justify-between items-center py-2">
              <Text className="text-gray-600 font-medium">Scheduled Start</Text>
              <Text className="text-gray-900 font-semibold">
                {formatDate(jobDetail.start_time)}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-4">
            <View className="w-4 h-4 bg-blue-200 rounded-full mr-4" />
            <View className="flex-1 flex-row justify-between items-center py-2">
              <Text className="text-gray-600 font-medium">Scheduled End</Text>
              <Text className="text-gray-900 font-semibold">
                {formatDate(jobDetail.end_time)}
              </Text>
            </View>
          </View>
          
          {jobDetail.cleaner_started_time && (
            <View className="flex-row items-center mb-4">
              <View className="w-4 h-4 bg-green-400 rounded-full mr-4" />
              <View className="flex-1 flex-row justify-between items-center py-2">
                <Text className="text-gray-600 font-medium">Actually Started</Text>
                <Text className="text-gray-900 font-semibold">
                  {formatDateTime(jobDetail.cleaner_started_time)}
                </Text>
              </View>
            </View>
          )}
          
          {jobDetail.finished_at && (
            <View className="flex-row items-center">
              <View className="w-4 h-4 bg-green-600 rounded-full mr-4" />
              <View className="flex-1 flex-row justify-between items-center py-2">
                <Text className="text-gray-600 font-medium">Completed</Text>
                <Text className="text-gray-900 font-semibold">
                  {formatDateTime(jobDetail.finished_at)}
                </Text>
              </View>
            </View>
          )}
        </View>
         
          </View>

          {/* Image Galleries */}
          <ImageGallery 
            images={jobDetail.before_images} 
            title="Before Images" 
            emptyMessage="No before images available"
          />
                    <ImageGallery 
            images={jobDetail.after_images} 
            title="After Images" 
            emptyMessage="No after images available"
          />
          
          <ImageGallery 
            images={jobDetail.damage_images} 
            title="Damage Images" 
            emptyMessage="No damage images reported"
          />
          
          {/* Bottom spacing */}
          <View className="h-8" />
        </ScrollView>
      </View>
    </Modal>
  );
};

// Main JobHistory component with API integration
const JobHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobHistoryData[]>([]);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobHistoryData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchJobHistory = async () => {
      setLoading(true);
      try {
        const result = await getJobHistory();
        if (result.success) {
          setJobs(result.data || []);
          setError("");
        } else {
          setError(result.message || "Something went wrong.");
        }
      } catch (err) {
        setError("Failed to fetch job history.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobHistory();
  }, []);

  const handleCardPress = (job: JobHistoryData) => {
    console.log("Card pressed for job:", job);
    setSelectedJob(job);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedJob(null);
  };

  console.log("Job history:", jobs);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-2">Loading job history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-4">
        <Text className="text-red-600 text-center text-lg font-semibold mb-2">
          Error
        </Text>
        <Text className="text-gray-600 text-center">{error}</Text>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-4">
        <Text className="text-gray-600 text-center text-lg">
          No job history found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {jobs.map((job, index) => (
          <JobHistoryCard 
            key={ index} 
            jobData={job} 
            onPress={() => handleCardPress(job)}
          />
        ))}
        
        {/* Add some bottom padding */}
        <View className="h-4" />
      </ScrollView>

      <JobDetailModal 
        visible={modalVisible}
        jobDetail={selectedJob}
        onClose={closeModal}
      />
    </View>
  );
};

export default JobHistory;
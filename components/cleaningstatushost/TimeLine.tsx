import { DateFormatter } from '@/utils/DateUtils';
import { AlertCircle, Camera, CircleCheck, Clock } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

// Save this as TimelineSchedule.js in your components folder

const TimelineSchedule = ({ jobData }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'scheduled':
        return {
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-800',
          icon: AlertCircle,
          title: 'Scheduled'
        };
      case 'in-progress':
        return {
          bgColor: 'bg-green-500',
          textColor: 'text-green-800',
          icon: Clock,
          title: 'Cleaning in Progress'
        };
      case 'completed':
        return {
          bgColor: 'bg-green-600',
          textColor: 'text-green-600',
          icon: CircleCheck,
          title: 'Cleaning Completed'
        };
      default:
        return {
          bgColor: 'bg-gray-600',
          textColor: 'text-gray-600',
          icon: Clock,
          title: 'Unknown'
        };
    }
  };

  const statusInfo = getStatusInfo(jobData.status);
  const StatusIcon = statusInfo.icon;

  // Create timeline items based on job status and available data
  const getTimelineItems = () => {
    const items = [];
    
    // Always show scheduled
    items.push({
      icon: CircleCheck,
      iconColor: '#10B981',
      title: 'Scheduled',
      time: `${formatDate(jobData.start_time)} at ${formatTime(jobData.start_time)}`,
      completed: true
    });

    // Show arrived at property if cleaner_started_time exists
    if (jobData.cleaner_started_time) {
      items.push({
        icon: CircleCheck,
        iconColor: '#10B981',
        title: 'Arrived at property',
        time: formatTime(jobData.cleaner_started_time),
        completed: true
      });
    }

    // Show cleaning in progress
    if (jobData.status === 'in-progress' || jobData.status === 'completed') {
      items.push({
        icon: Clock,
        iconColor: '#16A34A',
        title: 'Cleaning in progress',
        time: `Started at ${formatTime(jobData.cleaner_started_time || jobData.start_time)}`,
        completed: jobData.status === 'completed',
        inProgress: jobData.status === 'in-progress'
      });
    }

    // Show before photo added if available
    if (jobData.before_photo_time) {
      items.push({
        icon: Camera,
        iconColor: '#8B5CF6',
        title: 'Before photo added',
        time: `at ${formatTime(jobData.before_photo_time)}`,
        completed: true
      });
    }

    // Show expected completion or actual completion
    if (jobData.status === 'completed' && jobData.finished_at) {
      items.push({
        icon: CircleCheck,
        iconColor: '#16A34A',
        title: 'Cleaning Completed',
        time: `Finished at ${formatTime(jobData.finished_at)}`,
        completed: true
      });
    } else if (jobData.status !== 'completed') {
      items.push({
        icon: AlertCircle,
        iconColor: '#EF4444',
        title: 'Expected completion',
        time: `Around ${formatTime(jobData.end_time)}`,
        completed: false,
        expected: true
      });
    }

    return items;
  };

  const timelineItems = getTimelineItems();

  return (
    <View className="bg-white rounded-md p-4 mb-4 shadow-sm border border-gray-100">
      {/* Status Header */}
      <View className={`${statusInfo.bgColor} rounded-md p-3 mb-4 items-center justify-center`}>
        <View className="flex-row items-center">
       
          <Text className="text-white font-semibold text-lg ml-2">
            {statusInfo.title}
          </Text>
        </View>
         {jobData.status === 'completed' && (
          <Text className="text-white/80 text-sm mt-1">
            Finished at  <DateFormatter date={jobData.finished_at} format='time' textClassName='text-white'/>
          </Text>
        )}
        {jobData.status === 'in-progress' && (
          <Text className="text-white/80 text-sm mt-1">
            Started {Math.floor((new Date() - new Date(jobData.cleaner_started_time || jobData.start_time)) / (1000 * 60))} minutes ago
          </Text>
        )}
      </View>

      {/* Timeline */}
      <View className="space-y-4">
        {timelineItems.map((item, index) => {
          const ItemIcon = item.icon;
          const isLast = index === timelineItems.length - 1;
          
          return (
            <View key={index} className="flex-row items-start">
              {/* Icon and Line */}
              <View className="items-center mr-3">
                <View className={`w-6 h-6 rounded-full ${
                  item.completed ? 'bg-green-100' : 
                  item.inProgress ? 'bg-blue-100' : 
                  item.expected ? 'bg-red-100' : 'bg-gray-100'
                } items-center justify-center`}>
                  <ItemIcon 
                    size={20} 
                    color={item.completed ? '#10B981' : 
                           item.inProgress ? '#3B82F6' : 
                           item.expected ? '#EF4444' : '#6B7280'} 
                  />
                </View>
                  {!isLast && (
                  <View style={{
                    width: 2,
                    height: 40,
                    backgroundColor: '#10B981',
                    marginTop: 4,
                    marginBottom:4
                  }} />
                )}
              </View>

              
        
              {/* Content */}
              <View className="flex-1 pb-2">
                <Text className={`font-medium ${
                  item.completed ? 'text-gray-900' : 
                  item.inProgress ? 'text-blue-900' : 
                  item.expected ? 'text-red-900' : 'text-gray-600'
                }`}>
                  {item.title}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {item.time}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default TimelineSchedule;
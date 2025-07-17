import { getJobs } from '@/api/jobApi';
import HostDashboardCard from '@/components/HostDashboardCard';
import { useAppToast } from '@/hooks/toastNotification';
import { useLocalSearchParams } from 'expo-router';
import { Calendar as CalendarIcon, List } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

type StatusFilter = 'all' | 'scheduled' | 'completed' | 'in-progress' | 'Today';
type ViewMode = 'list' | 'calendar';

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    selected?: boolean;
    selectedColor?: string;
  };
}

// Updated job interface to match backend response
interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  start_time: string;
  end_time: string;
  assigned_to: number;
  created_by: number;
  property_detail: {
    name: string;
    address: string;
    city: string;
  };
  created_at: string;
  updated_at: string;
  finished_at: string | null;
  cleaner_started_time: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
}

export default function Job(): JSX.Element {
  const params = useLocalSearchParams();
  const initialFilter = params.filter as StatusFilter || 'all';
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>(initialFilter);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useAppToast();

  // Apply filter from route params on component mount
  useEffect(() => {
    if (params.filter && typeof params.filter === 'string') {
      setFilterStatus(params.filter as StatusFilter);
    }
  }, [params.filter]);

  const fetchJobs = async (propertyId = null) => {
    try {
      setLoading(true);
      const response = await getJobs(propertyId);

      if (response && Array.isArray(response)) {
        // Backend is directly returning an array of jobs
        setUserJobs(response);
        console.log("Jobs fetched successfully:", response);
      } else if (response && response.success && response.data) {
        // Support for API that returns { success: true, data: [...] }
        setUserJobs(response.data);
        console.log("Jobs fetched successfully:", response.data);
      } else {
        console.error("Error fetching jobs:", response?.error || "Unknown error");
        toast.error("Failed to load jobs");
      }
    } catch (error) {
      console.error("Exception in fetchJobs:", error);
      toast.error("An error occurred while fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to extract date from ISO string
  const extractDateFromISOString = (isoString: string) => {
    if (!isoString) return '';
    return isoString.split('T')[0];
  };

  // Convert start_time to date for job objects
  const processJobsWithDates = (jobs: any) => {
    return jobs.map((job: { start_time: string; }) => ({
      ...job,
      date: extractDateFromISOString(job.start_time)
    }));
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const todayString = formatDate(new Date());

  // Sort jobs in ascending order by date, starting from today
  const sortJobsByDateAscending = (jobs: any) => {
    const processedJobs = processJobsWithDates(jobs);
    return [...processedJobs].sort((a, b) => {
      // Handle cases where date might be undefined
      const dateA = a.date || '';
      const dateB = b.date || '';

      // Put past dates at the end
      if (dateA < todayString && dateB >= todayString) {
        return 1;
      }
      if (dateB < todayString && dateA >= todayString) {
        return -1;
      }
      // Normal date comparison (ascending)
      return dateA.localeCompare(dateB);
    });
  };

  // Get sorted jobs - ensure we're sorting a valid array
  const sortedJobs = Array.isArray(userJobs) ? sortJobsByDateAscending(userJobs) : [];

  // Normalize status string to match filters (lowercase for comparison)
const normalizeStatus = (status: string) => status?.trim().toLowerCase();

const excludedStatuses = [ 'overdue', 'unknown'];

const filteredJobs = sortedJobs
  .filter(job => {
    // Skip jobs without valid data
    if (!job || !job.start_time) return false;

    const jobStatus = normalizeStatus(job.status);
    const excludedStatuses = ['overdue', 'unknown'];
    if (excludedStatuses.includes(jobStatus)) return false;

    // Convert dates and normalize to 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(job.start_time);
    if (isNaN(startDate.getTime())) return false;
    startDate.setHours(0, 0, 0, 0);

    let withinDateRange = false;

    if (job.end_time) {
      const endDate = new Date(job.end_time);
      if (!isNaN(endDate.getTime())) {
        endDate.setHours(0, 0, 0, 0);
        withinDateRange = today >= startDate && today <= endDate;
      }
    }

    if (!withinDateRange) {
      withinDateRange = startDate.getTime() === today.getTime();
    }

    if (filterStatus === 'Today') {
      return withinDateRange;
    }

    if (filterStatus !== 'all' && normalizeStatus(filterStatus) !== jobStatus) return false;

    if (selectedDate) {
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      return startDate.getTime() === selected.getTime();
    }

    return true;
  })

  // 🟢 Sort "in_progress" jobs at top, others by start_time
  .sort((a, b) => {
    const aStatus = normalizeStatus(a.status);
    const bStatus = normalizeStatus(b.status);

    if (aStatus === 'in-progress' && bStatus !== 'in-progress') return -1;
    if (bStatus === 'in-progress' && aStatus !== 'in-progress') return 1;

    const aDate = new Date(a.start_time).getTime();
    const bDate = new Date(b.start_time).getTime();
    return aDate - bDate;
  });


  // Create marked dates for calendar
  const markedDates: MarkedDates = Array.isArray(sortedJobs) ? sortedJobs.reduce((marked, job) => {
    if (job && job.date && !marked[job.date]) {
      marked[job.date] = { marked: true };
    }
    return marked;
  }, {} as MarkedDates) : {};

  // If a date is selected, mark it
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: '#6366F1'
    };
  }

  // Handle date selection in calendar
  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  // Format display date for human-readable presentation
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';

    if (dateString === todayString) {
      return 'Today';
    }

    try {
      // Split the date string to get year, month, and day
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));

      // Create date with explicit year, month (0-based), and day to avoid timezone issues
      const date = new Date(year, month - 1, day);

      // Format for display
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original string if parsing fails
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white mt-14">
      <View className="px-4 pb-4 ">
        <View className="flex-row justify-between items-center mb-4 ">
          <Text className="text-2xl font-bold text-gray-800">Cleaning Jobs</Text>

          <View className="flex-row -">
            <TouchableOpacity
              className={`mr-2 p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-100' : 'bg-gray-200'}`}
              onPress={() => setViewMode('list')}
            >
              <List size={20} color={viewMode === 'list' ? '#4F46E5' : '#6B7280'} />
            </TouchableOpacity>
            <TouchableOpacity
              className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-indigo-100' : 'bg-gray-200'}`}
              onPress={() => setViewMode('calendar')}
            >
              <CalendarIcon size={20} color={viewMode === 'calendar' ? '#4F46E5' : '#6B7280'} />
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${filterStatus === 'all' ? 'bg-indigo-600' : 'bg-gray-200'}`}
              onPress={() => setFilterStatus('all')}
            >
              <Text className={filterStatus === 'all' ? 'text-white' : 'text-gray-700'}>All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`mr-2 ml-2 px-4 py-2 rounded-full ${filterStatus === 'Today' ? 'bg-indigo-600' : 'bg-gray-200'}`}
              onPress={() => setFilterStatus('Today')}
            >
              <Text className={filterStatus === 'Today' ? 'text-white' : 'text-gray-700'}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`mr-2 px-4 py-2 rounded-full ${filterStatus === 'in-progress' ? 'bg-indigo-600' : 'bg-gray-200'}`}
              onPress={() => setFilterStatus('in-progress')}
            >
              <Text className={filterStatus === 'in-progress' ? 'text-white' : 'text-gray-700'}>In-Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`mr-2 px-4 py-2 rounded-full ${filterStatus === 'scheduled' ? 'bg-indigo-600' : 'bg-gray-200'}`}
              onPress={() => setFilterStatus('scheduled')}
            >
              <Text className={filterStatus === 'scheduled' ? 'text-white' : 'text-gray-700'}>Scheduled</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${filterStatus === 'completed' ? 'bg-indigo-600' : 'bg-gray-200'}`}
              onPress={() => setFilterStatus('completed')}
            >
              <Text className={filterStatus === 'completed' ? 'text-white' : 'text-gray-700'}>Completed</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>

        {/* Calendar view */}
        {viewMode === 'calendar' && (
          <View className="bg-white rounded-lg shadow-sm mt-2 p-4">
            <Calendar
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={{
                todayTextColor: '#4F46E5',
                selectedDayBackgroundColor: '#4F46E5',
                dotColor: '#4F46E5',
              }}
            />
            {selectedDate && (
              <TouchableOpacity
                className="mt-2 py-2 px-4 bg-gray-100 self-center rounded-lg"
                onPress={() => setSelectedDate('')}
              >
                <Text className="text-gray-700">Clear Selection</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Jobs list */}
        <ScrollView showsVerticalScrollIndicator={false} className="mt-2 mb-20">
          {filteredJobs.length > 0 ? (
            <FlatList
             
               data={filteredJobs.filter(
                (item: {
                  property_detail: any;
                  profile_detail: {
                    cleaner_email: any;
                  };
                }) =>
                  item.property_detail?.cleaner_email
              )}
              renderItem={({ item }) => <HostDashboardCard jobs={item} />}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="items-center py-8">
                  <Text className="text-gray-500">
                    No properties scheduled for cleaning today
                  </Text>
                </View>
              }
            />

          ) : (
            <View className="bg-white rounded-lg p-8 items-center mt-40">
              <Text className="text-gray-600 text-center">No jobs found matching your filters</Text>
              <TouchableOpacity
                className="mt-4 py-2 px-4 bg-indigo-600 rounded-lg"
                onPress={() => {
                  setFilterStatus('all');
                  setSelectedDate('');
                }}
              >
                <Text className="text-white">Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}
          <View className="h-20" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
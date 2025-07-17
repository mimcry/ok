import { getChecklist } from '@/api/checkListApi';
import { fetchPropertiesByUserId } from '@/api/propertyapi';
import { ChecklistView } from '@/components/cleanerchecklist/CheckListView';
import { PropertiesListView } from '@/components/cleanerchecklist/PropertyListView';
import { LoadingState } from '@/components/Loading';
import { useChecklistLogic } from '@/hooks/cleanerchecklist/useChecklistLogic';
import { usePropertyTaskCounts } from '@/hooks/cleanerchecklist/usePropertyTaskCount';
import { useAppToast } from '@/hooks/toastNotification';
import { Property } from '@/types/checklist';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';

const CleanerChecklistManager: React.FC = () => {
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentView, setCurrentView] = useState<'properties' | 'checklist'>('properties');
  const [checkList, setCheckList] = useState<any[]>([]);
  const toast = useAppToast();

  const propertyTaskCounts = usePropertyTaskCounts(checkList);
  const checklistLogic = useChecklistLogic(selectedProperty, checkList, setCheckList, toast, setIsLoading);

  // Fetch checklist data
  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await getChecklist();
        console.log("Raw checklist response:", response);
        
        if (Array.isArray(response)) {
          setCheckList(response);
        } else if (response && Array.isArray(response.data)) {
          setCheckList(response.data);
        } else {
          console.warn("Checklist response is not an array:", response);
          setCheckList([]);
          toast.error("Invalid checklist data format");
        }
      } catch (error) {
        console.error("Error loading checklist:", error);
        setCheckList([]);
        toast.error("Error loading checklist");
      }
    };
    fetchChecklist();
  }, []);

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetchPropertiesByUserId();
        
        if (response.success) {
          setUserProperties(response.data);
          console.log("Properties fetched successfully:", response.data);
        } else {
          console.error("Error fetching properties:", response.error);
          toast.error("Failed to load properties");
        }
      } catch (error) {
        console.error("Exception in fetchProperties:", error);
        toast.error("An error occurred while fetching properties");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Loading screen
  if (isLoading) {
    return  <LoadingState 
      message="cleaner checklist"
      overlay={true}
      size="large"
    />;
  }

  // Properties list view
  if (currentView === 'properties') {
    return (
      <SafeAreaView className="flex-1 mt-14">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <PropertiesListView
          userProperties={userProperties}
          selectedProperty={selectedProperty}
          propertyTaskCounts={propertyTaskCounts}
          onSelectProperty={(property) => {
            setSelectedProperty(property);
            setCurrentView('checklist');
          }}
        />
      </SafeAreaView>
    );
  }

  // Checklist view
  return (
    <SafeAreaView className="flex-1 bg-slate-50 rounded-t-lg mt-14">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC"  />
      <ChecklistView
        selectedProperty={selectedProperty}
        checkList={checkList}
        onBackPress={() => setCurrentView('properties')}
        checklistLogic={checklistLogic}
      />
    </SafeAreaView>
  );
};

export default CleanerChecklistManager;
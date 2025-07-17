import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// Base interfaces
interface PropertyDetail {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  base_price: string;
  description: string;
  instruction: string;
  main_image: string;
  images: string[];
  property_type: string;
  cleaner_id: number;
  startTime: string;
}

interface JobDetail {
  id: number;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  cleaner_started_time: string | null;
  finished_at: string | null;
  assigned_to: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  property_detail: PropertyDetail;
  startTime: string;
}

// Store interfaces
interface Property {
  property_type: ReactNode;
  main_image: any;
  base_price: ReactNode;
  zip_code: ReactNode;
  cleaner: any;
  airbnb_link: string;
  id: string;
  name: string;
  address: string;
  images: string[];
  description: string;
  bedrooms: number;
  bathrooms: number;
  instruction: string;
  airbnblink: string;
  type: string;
  area: number;
  city: string;
  ZipCode: string;
  basePrice: number;
  createdAt: string | undefined;
  updatedAt?: string;
  propertyType: string;
}

interface NewProperty {
  id: string;
  name: string;
  address: string;
  images: string[];
  description: string;
  bedrooms: number;
  bathrooms: number;
  instruction: string;
  airbnblink: string;
  type: string;
  area: number;
  city: string;
  ZipCode: string;
  basePrice: number;
  createdAt: string | undefined;
  propertyType: string;
}

type JobStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

interface Job {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyDescription: string;
  status: JobStatus;
  date: string;
  price: string;
  description: string;
  dueTime: string;
  createdAt: string;
}

interface NewJob {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyDescription: string;
  status: JobStatus;
  price: string;
  date: string;
  description: string;
  dueTime: string;
  createdAt: string;
}

// Store state interface
interface PropertyStoreState {
  properties: Property[];
  jobs: Job[];
  selectedProperty: Property | null;
  selectedJob: JobDetail | null;
  newProperty: NewProperty;
  newJob: NewJob;
  
  // Actions
  initializeData: () => Promise<void>;
  updateNewPropertyField: <K extends keyof NewProperty>(field: K, value: NewProperty[K]) => void;
  addImageToProperty: (imageUri: string) => void;
  removeImageFromProperty: (indexToRemove: number) => void;
  addProperty: () => void;
  resetNewProperty: () => void;
  setSelectedProperty: (property: Property) => void;
  setSelectedJob: (job: JobDetail) => void;
  deleteProperty: (propertyId: string) => void;
  updateProperty: (updatedProperty: Property) => boolean;
  updateNewJobField: <K extends keyof NewJob>(field: K, value: NewJob[K]) => void;
  addJob: () => void;
  resetNewJob: () => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  deleteJob: (jobId: string) => void;
}

const initialNewProperty: NewProperty = {
  id: '',
  name: '',
  address: '',
  images: [],
  description: '',
  bedrooms: 0,
  bathrooms: 0,
  instruction: '',
  airbnblink: '',
  type: '',
  area: 0,
  city: '',
  ZipCode: '',
  basePrice: 0,
  createdAt: undefined,
  propertyType: ''
};

const initialNewJob: NewJob = {
  id: '',
  propertyId: '',
  propertyName: '',
  propertyAddress: '',
  propertyDescription: '',
  status: 'Pending',
  date: '',
  price: '',
  description: '',
  dueTime: '',
  createdAt: ''
};

const usePropertyStore = create<PropertyStoreState>((set, get) => ({
  properties: [],
  jobs: [],
  selectedProperty: null,
  selectedJob: null,
  newProperty: { ...initialNewProperty },
  newJob: { ...initialNewJob },

  initializeData: async (): Promise<void> => {
    try {
      const propertiesData = await AsyncStorage.getItem('properties');
      const jobsData = await AsyncStorage.getItem('jobs');
      
      if (propertiesData) {
        const parsedProperties: Property[] = JSON.parse(propertiesData);
        set({ properties: parsedProperties });
      }
      
      if (jobsData) {
        const parsedJobs: Job[] = JSON.parse(jobsData);
        set({ jobs: parsedJobs });
      }
    } catch (error) {
      console.error('Failed to load data from storage', error);
    }
  },

  updateNewPropertyField: <K extends keyof NewProperty>(field: K, value: NewProperty[K]): void => {
    set(state => ({
      newProperty: {
        ...state.newProperty,
        [field]: value
      }
    }));
  },

  addImageToProperty: (imageUri: string): void => {
    set(state => ({
      newProperty: {
        ...state.newProperty,
        images: [...state.newProperty.images, imageUri]
      }
    }));
  },

  removeImageFromProperty: (indexToRemove: number): void => {
    set(state => ({
      newProperty: {
        ...state.newProperty,
        images: state.newProperty.images.filter((_, index) => index !== indexToRemove)
      }
    }));
  },

  addProperty: (): void => {
    const { newProperty, properties } = get();
    const timestamp = new Date().getTime();
    const property: Property = {
      ...newProperty,
      id: `property-${timestamp}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedProperties = [...properties, property];
    set({ properties: updatedProperties });
    AsyncStorage.setItem('properties', JSON.stringify(updatedProperties));
  },

  resetNewProperty: (): void => {
    set({
      newProperty: { ...initialNewProperty }
    });
  },

  setSelectedProperty: (property: Property): void => {
    set({ selectedProperty: property });
    
    // When a property is selected, update the newJob with its details
    set(state => ({
      newJob: {
        ...state.newJob,
        propertyId: property.id,
        propertyName: property.name,
        propertyAddress: property.address,
        propertyDescription: property.description
      }
    }));
  },

  setSelectedJob: (job: JobDetail): void => {
    set({ selectedJob: job });
  },

  deleteProperty: (propertyId: string): void => {
    const { properties, jobs } = get();
    
    const updatedProperties = properties.filter(property => property.id !== propertyId);
    const updatedJobs = jobs.filter(job => job.propertyId !== propertyId);
    
    set({ 
      properties: updatedProperties,
      jobs: updatedJobs
    });
    
    AsyncStorage.setItem('properties', JSON.stringify(updatedProperties));
    AsyncStorage.setItem('jobs', JSON.stringify(updatedJobs));
  },

  updateProperty: (updatedProperty: Property): boolean => {
    const { properties } = get();
    
    const updatedProperties = properties.map(property => {
      if (property.id === updatedProperty.id) {
        return {
          ...updatedProperty,
          createdAt: property.createdAt,
          updatedAt: new Date().toISOString()
        };
      }
      return property;
    });
    
    set({ 
      properties: updatedProperties,
      selectedProperty: get().selectedProperty?.id === updatedProperty.id 
        ? updatedProperties.find(p => p.id === updatedProperty.id) || null
        : get().selectedProperty
    });
    
    AsyncStorage.setItem('properties', JSON.stringify(updatedProperties));
    
    return true;
  },

  updateNewJobField: <K extends keyof NewJob>(field: K, value: NewJob[K]): void => {
    set(state => ({
      newJob: {
        ...state.newJob,
        [field]: value
      }
    }));
  },
  
  addJob: (): void => {
    const { newJob, jobs, selectedProperty } = get();
    const timestamp = new Date().getTime();
  
    if (!selectedProperty) {
      console.warn('No selected property to assign the job to.');
      return;
    }
  
    const job: Job = {
      ...newJob,
      id: `job-${timestamp}`,
      propertyId: selectedProperty.id,
      propertyName: selectedProperty.name,
      propertyAddress: selectedProperty.address,
      propertyDescription: selectedProperty.description,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
  
    const updatedJobs = [...jobs, job];
    set({ jobs: updatedJobs });
    AsyncStorage.setItem('jobs', JSON.stringify(updatedJobs));
  },

  resetNewJob: (): void => {
    set({
      newJob: { ...initialNewJob }
    });
  },

  updateJobStatus: (jobId: string, status: JobStatus): void => {
    const { jobs } = get();
    
    const updatedJobs = jobs.map(job => {
      if (job.id === jobId) {
        return { ...job, status };
      }
      return job;
    });
    
    set({ jobs: updatedJobs });
    AsyncStorage.setItem('jobs', JSON.stringify(updatedJobs));
  },

  deleteJob: (jobId: string): void => {
    const { jobs } = get();
    
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    
    set({ jobs: updatedJobs });
    AsyncStorage.setItem('jobs', JSON.stringify(updatedJobs));
  }
}));

export default usePropertyStore;
export type { Job, JobDetail, JobStatus, Property, PropertyDetail };


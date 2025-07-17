// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { create } from "zustand";

// export const usePropertyStore = create((set, get) => ({
//     properties: [],
//     jobs: [],
//     selectedProperty: null,
//     newProperty: {
//       id: '',
//       name: '',
//       location: '',
//       address: '',
//       images: [],
//       description: ''
//     },
//     newJob: {
//       id: '',
//       propertyId: '',
//       propertyName: '',
//       propertyAddress: '',
//       propertyDescription: '',
//       status: 'Pending',
//       date: '',
//       price: '',
//       description: '',
//       dueTime: '',
//       createdAt: ''
//     },
  
//     initializeData: async () => {
//       try {
//         const propertiesData = await AsyncStorage.getItem('properties');
//         const jobsData = await AsyncStorage.getItem('jobs');
        
//         if (propertiesData) {
//           set({ properties: JSON.parse(propertiesData) });
//         }
        
//         if (jobsData) {
//           set({ jobs: JSON.parse(jobsData) });
//         }
//       } catch (error) {
//         console.error('Failed to load data from storage', error);
//       }
//     },
  
//     updateNewPropertyField: (field, value) => {
//       set(state => ({
//         newProperty: {
//           ...state.newProperty,
//           [field]: value
//         }
//       }));
//     },
  
//     addImageToProperty: (imageUri) => {
//       set(state => ({
//         newProperty: {
//           ...state.newProperty,
//           images: [...state.newProperty.images, imageUri]
//         }
//       }));
//     },
  
//     removeImageFromProperty: (indexToRemove) => {
//       set(state => ({
//         newProperty: {
//           ...state.newProperty,
//           images: state.newProperty.images.filter((_, index) => index !== indexToRemove)
//         }
//       }));
//     },
  
//     addProperty: () => {
//       const { newProperty, properties } = get();
//       const timestamp = new Date().getTime();
//       const property = {
//         ...newProperty,
//         id: `property-${timestamp}`,
//         createdAt: new Date().toISOString()
//       };
      
//       const updatedProperties = [...properties, property];
//       set({ properties: updatedProperties });
//       AsyncStorage.setItem('properties', JSON.stringify(updatedProperties));
//     },
  
//     resetNewProperty: () => {
//       set({
//         newProperty: {
//           id: '',
//           name: '',
//           address: '',
//           images: [],
//           description: ''
//         }
//       });
//     },
  
//     setSelectedProperty: (property) => {
//       set({ selectedProperty: property });
      
//       // When a property is selected, update the newJob with its details
//       set(state => ({
//         newJob: {
//           ...state.newJob,
//           propertyId: property.id,
//           propertyName: property.name,
//           propertyAddress: property.address,
//           propertyDescription: property.description
//         }
//       }));
//     },
  
//     deleteProperty: (propertyId) => {
//       const { properties, jobs } = get();
      
//       const updatedProperties = properties.filter(property => property.id !== propertyId);
//       const updatedJobs = jobs.filter(job => job.propertyId !== propertyId);
      
//       set({ 
//         properties: updatedProperties,
//         jobs: updatedJobs
//       });
      
//       AsyncStorage.setItem('properties', JSON.stringify(updatedProperties));
//       AsyncStorage.setItem('jobs', JSON.stringify(updatedJobs));
//     },
  
//     updateNewJobField: (field, value) => {
//       set(state => ({
//         newJob: {
//           ...state.newJob,
//           [field]: value
//         }
//       }));
//     },
  
//     addJob: () => {
//       const { newJob, jobs, selectedProperty } = get();
//       const timestamp = new Date().getTime();
      
//       const job = {
//         ...newJob,
//         id: `job-${timestamp}`,
//         propertyId: selectedProperty.id,
//         propertyName: selectedProperty.name,
//         propertyAddress: selectedProperty.address,
//         propertyDescription: selectedProperty.description,
//         status: 'Pending', // Default status is pending
//         createdAt: new Date().toISOString()
//       };
      
//       const updatedJobs = [...jobs, job];
//       set({ jobs: updatedJobs });
//       AsyncStorage.setItem('jobs', JSON.stringify(updatedJobs));
//     },
  
//     resetNewJob: () => {
//       set({
//         newJob: {
//           id: '',
//           propertyId: '',
//           propertyName: '',
//           propertyAddress: '',
//           propertyDescription: '',
//           status: 'Pending',
//           price: '',
//           date: '',
//           description: '',
//           dueTime: '',
//           createdAt: ''
//         }
//       });
//     },
  
//     updateJobStatus: (jobId, status) => {
//       const { jobs } = get();
      
//       const updatedJobs = jobs.map(job => {
//         if (job.id === jobId) {
//           return { ...job, status };
//         }
//         return job;
//       });
      
//       set({ jobs: updatedJobs });
//       AsyncStorage.setItem('jobs', JSON.stringify(updatedJobs));
//     },
  
//     deleteJob: (jobId) => {
//       const { jobs } = get();
      
//       const updatedJobs = jobs.filter(job => job.id !== jobId);
      
//       set({ jobs: updatedJobs });
//       AsyncStorage.setItem('jobs', JSON.stringify(updatedJobs));
//     }
//   }));
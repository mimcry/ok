// Updated Property Types with consistent field names and types

// Define the available property types
export const propertyTypes: string[] = [
  "house",
  "apartment", 
  "condominium",
  "townhouse",
  "duplex",
  "triplex",
  "studio",
  "loft",
  "bungalow",
  "cottage",
  "cabin",
  "penthouse",
  "villa"
];

// Base property data structure
export interface PropertyData {
  id?: string |number;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zipCode: string; // Consistent field name
  area: number | string; // Allow both number and string for flexibility
  bedrooms: number | string; // Allow both number and string for flexibility
  bathrooms: number | string; // Allow both number and string for flexibility
  basePrice: string;
  instruction: string;
  description: string;
  airbnblink?: string;
  images: string[];
  user_id?: string;
}

// Full property object with all required fields
export interface Property extends PropertyData {
  id: string |number; // Required for existing properties
  end_time?: string;
  date?: string;
  dueTime?: string;
  status?: string;
  property_detail?: any;
  title?: string;
  propertyType?: string; // Optional alias for 'type'
  created_at?: string;
  updated_at?: string;
  start_time?: string;
  imageUrl?: string;
  
  // Legacy field support (for backward compatibility)
  ZipCode?: string; // Deprecated, use zipCode instead
  zip_code?: string; // Deprecated, use zipCode instead
  base_price?: string; // Deprecated, use basePrice instead
  airbnb_link?: string; // Deprecated, use airbnblink instead
  property_type?: string; // Deprecated, use type instead
}

// Interface for creating new properties (id is optional)
export interface NewProperty extends Omit<Property, 'id'> {
  id?: string;
}

// Alternative property interface that matches API expectations (with string fields)
export interface UpdatedProperty extends Omit<Property, 'bedrooms' | 'bathrooms' | 'area'> {
  bedrooms: string;
  bathrooms: string;
  area: string;
}

// Interface for job data
export interface JobData {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status: JobStatus;
  propertyId: string;
  notes?: string;
  assignedTo?: string;
  price?: string;
}

// Full job object with ID required
export interface Job extends JobData {
  end_time: any;
  dueTime: boolean;
  propertyAddress: any;
  start_time: any;
  id: string;
  propertyName: string;
  property_detail?: any;
  
  starttime?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
   startTime?:string;
   startDate?:string;
   endDate?:string ;
   endTime?:string;
}

// Job status enum
export enum JobStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Interface for API response
export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Interface for authentication context
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegistrationData) => Promise<void>;
  logout: () => void;
}

// User interface
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

// User registration data
export interface UserRegistrationData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

// Updated Property Store State
export type PropertyStoreState = {
  selectedJob: Job | null;
  setSelectedJob: (item: Job | null) => void;
  properties: Property[];
  jobs: Job[];
  selectedProperty: Property | null;
  newProperty: NewProperty;
  newJob: Omit<Job, 'id' | 'propertyName'>;
  initializeData: () => Promise<void>;
  updateNewPropertyField: (field: keyof NewProperty, value: string | string[] | number) => void;
  addImageToProperty: (imageUri: string) => void;
  removeImageFromProperty: (indexToRemove: number) => void;
  addProperty: () => void;
  resetNewProperty: () => void;
  setSelectedProperty: (property: Property | null) => void;
  deleteProperty: (propertyId: string) => void;
  updateProperty: (updatedProperty: Property) => boolean;
  updateNewJobField: (field: keyof Omit<Job, 'id' | 'propertyName'>, value: string) => void;
  addJob: () => void;
  resetNewJob: () => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  deleteJob: (jobId: string) => void;
}

// Helper function to create a default property
export const createDefaultProperty = (): NewProperty => ({
  name: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  description: "",
  type: "",
  bedrooms: 0,
  bathrooms: 0,
  area: 0,
  images: [],
  instruction: "",
  airbnblink: "",
  basePrice: "0.00",
  end_time: "",
  date: "",
  dueTime: "",
  status: "",
});

// Helper function to normalize property data (handles legacy field names)
export const normalizeProperty = (property: Partial<Property>): Property => ({
  id: property.id || "",
  name: property.name || "",
  address: property.address || "",
  city: property.city || "",
  state: property.state || "",
  zipCode: property.zipCode || property.ZipCode || property.zip_code || "",
  description: property.description || "",
  type: property.type || property.property_type || property.propertyType || "",
  bedrooms: property.bedrooms || 0,
  bathrooms: property.bathrooms || 0,
  area: property.area || 0,
  images: property.images || [],
  instruction: property.instruction || "",
  airbnblink: property.airbnblink || property.airbnb_link || "",
  basePrice: property.basePrice || property.base_price || "0.00",
  end_time: property.end_time || "",
  date: property.date || "",
  dueTime: property.dueTime || "",
  status: property.status || "",
  property_detail: property.property_detail,
  title: property.title,
  propertyType: property.propertyType || property.type,
  created_at: property.created_at,
  updated_at: property.updated_at,
  start_time: property.start_time,
  imageUrl: property.imageUrl,
  user_id: property.user_id,
});

// Helper function to convert numbers to strings for API compatibility
export const convertPropertyForAPI = (property: Property): Property => ({
  ...property,
  bedrooms: typeof property.bedrooms === 'number' ? property.bedrooms : parseInt(property.bedrooms as string) || 0,
  bathrooms: typeof property.bathrooms === 'number' ? property.bathrooms : parseInt(property.bathrooms as string) || 0,
  area: typeof property.area === 'number' ? property.area : parseInt(property.area as string) || 0,
});

// Helper function to ensure numeric fields are numbers for internal use
export const normalizePropertyNumbers = (property: Partial<Property>): Property => {
  const normalized = normalizeProperty(property);
  return {
    ...normalized,
    bedrooms: typeof normalized.bedrooms === 'string' ? parseInt(normalized.bedrooms) || 0 : normalized.bedrooms,
    bathrooms: typeof normalized.bathrooms === 'string' ? parseInt(normalized.bathrooms) || 0 : normalized.bathrooms,
    area: typeof normalized.area === 'string' ? parseInt(normalized.area) || 0 : normalized.area,
  };
};

// Helper function to convert Property to UpdatedProperty (for API compatibility)
export const convertToUpdatedProperty = (property: Property): UpdatedProperty => ({
  ...property,
  bedrooms: String(property.bedrooms),
  bathrooms: String(property.bathrooms),
  area: String(property.area),
});

// Helper function to convert UpdatedProperty to Property (for internal use)
export const convertFromUpdatedProperty = (updatedProperty: UpdatedProperty): Property => ({
  ...updatedProperty,
  bedrooms: parseInt(updatedProperty.bedrooms) || 0,
  bathrooms: parseInt(updatedProperty.bathrooms) || 0,
  area: parseInt(updatedProperty.area) || 0,
});
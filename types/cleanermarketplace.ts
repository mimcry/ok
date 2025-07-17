


export interface Rating {
  id?: number;
  score: number;
  comment: string;
  created_at: string;
  host_name?: string;
}

// Enhanced interface for detailed user data
export interface DetailedUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: string;
  profile_picture: string | null;
  address_line?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  date_joined: string;
  bio?: string;
  speciality?: string;
  average_rating?: number;
  ratings: Rating[];
  total_assigned: number;
  completed_jobs: number;
  scheduled_jobs: number;
  in_progress_jobs: number;
  overdue_jobs: number;
}

// Transformed interface for frontend use
export interface Cleaner {
  totalJobs: any;
  reviews: any;
  rating: any;
  avatar: any;
  specialties: any;
  name: any;
  id: string;
  email: string;
  username: string;
  full_name: string;
  profile_picture?: string;
  date_joined?: string;
  total_assigned?: number;
  completed_jobs?: number;
  scheduled_jobs?: number;
  in_progress_jobs?: number;
  overdue_jobs?: number;
  bio?: string | null;
  experience?: string | number | null;
  speciality?: string | null;
  speciality_display?: string | null;
  average_rating?: number | null;
  ratings?: Rating[];
  member_since?: string;
  availability?: boolean;
}

export interface Partner {
  id: number;
  email: string;
  full_name: string;
  profile_picture: string | null;
  average_rating: number | null;
  speciality: string | null;
  experience: string | null;
  phone_number: string;
}

export interface PendingRequest {
  id: number;
  partner: Partner;
  status: string;
  created_at: string;
  unread_count: number;
}
export interface CleanerProfileModalProps {
  visible: boolean;
  selectedCleaner: Cleaner | null;
  selectedCleanerDetails: any;
  loadingCleanerDetails: boolean;
  assigningCleaner: boolean;
  onClose: () => void;
  onAssignCleaner: (cleanerId: string) => void;
}
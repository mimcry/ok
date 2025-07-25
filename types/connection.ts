export type ConnectionRequest = {
  cleaner_city: string;
  cleaner_country: string;
  id: number;
  cleaner_full_name: string;
  host_full_name: string;
  initiator_full_name: string;
  initiator_id: number;
  status: string;
  created_at: string;
  host_city?: string;
  host_country?: string;
  host_state?: string;
  host_profile_picture?: string;
  cleaner_profile_picture?: string;
  host_email?: string;
  cleaner_email?: string;
  host_phone?: string;
  cleaner_phone?: string;
  avatar?: string;
  address?: string;
  email?: string;
  phone?: string;
  memberSince?: string;
};

export interface ValidationErrors {
  name?: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  ZipCode?: string;
  area?: string;
  bedrooms?: string;
  bathrooms?: string;
  basePrice?: string;
  instruction?: string;
  description?: string;
  images?: string;
}

export interface FormattedProperty {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  basePrice: string;
  type: string;
  instruction?: string;
  airbnblink?: string;
}

export interface ApiResult {
  success: boolean;
  error?: string;
  data?: any;
}

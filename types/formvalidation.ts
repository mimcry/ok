
import React from 'react';
import { ValidationErrors } from '@/types/validation';

export class ValidationComponent {
  private setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;

  constructor(setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>) {
    this.setErrors = setErrors;
  }

  validateName = (value: string): boolean => {
    if (!value || value.trim() === '') {
      this.setErrors(prev => ({ ...prev, name: 'Property name is required' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, name: undefined }));
    return true;
  };

  validateType = (value: string): boolean => {
    if (!value) {
      this.setErrors(prev => ({ ...prev, type: 'Property type is required' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, type: undefined }));
    return true;
  };

  validateAddress = (value: string): boolean => {
    if (!value || value.trim() === '') {
      this.setErrors(prev => ({ ...prev, address: 'Address is required' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, address: undefined }));
    return true;
  };

  validateCity = (value: string): boolean => {
    if (!value || value.trim() === '') {
      this.setErrors(prev => ({ ...prev, city: 'City is required' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, city: undefined }));
    return true;
  };

  validateState = (value: string): boolean => {
    if (!value || value.trim() === '') {
      this.setErrors(prev => ({ ...prev, state: 'State is required' }));
      return false;
    }
    this.setErrors((prev: any) => ({ ...prev, state: undefined }));
    return true;
  };

  validateZipCode = (value: string): boolean => {
    if (!value || value.trim() === '') {
      this.setErrors(prev => ({ ...prev, ZipCode: 'Zip code is required' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, ZipCode: undefined }));
    return true;
  };

  validateArea = (value: string): boolean => {
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      this.setErrors(prev => ({ ...prev, area: 'Area must be a positive number' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, area: undefined }));
    return true;
  };

  validateBedrooms = (value: string): boolean => {
    if (!value || isNaN(parseInt(value)) || parseInt(value) < 0) {
      this.setErrors(prev => ({ ...prev, bedrooms: 'Number of bedrooms must be 0 or higher' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, bedrooms: undefined }));
    return true;
  };

  validateBathrooms = (value: string): boolean => {
    if (!value || isNaN(parseInt(value)) || parseInt(value) < 0) {
      this.setErrors(prev => ({ ...prev, bathrooms: 'Number of bathrooms must be 0 or higher' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, bathrooms: undefined }));
    return true;
  };

  validateBasePrice = (value: string): boolean => {
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      this.setErrors(prev => ({ ...prev, basePrice: 'Cleaning price must be a positive amount' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, basePrice: undefined }));
    return true;
  };

  validateInstruction = (value: string): boolean => {
    if (!value || value.trim() === '') {
      this.setErrors(prev => ({ ...prev, instruction: 'Special instructions are required' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, instruction: undefined }));
    return true;
  };

  validateDescription = (value: string): boolean => {
    if (!value || value.trim() === '') {
      this.setErrors(prev => ({ ...prev, description: 'Additional description is required' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, description: undefined }));
    return true;
  };

  validateImages = (images: string[]): boolean => {
    if (images.length === 0) {
      this.setErrors(prev => ({ ...prev, images: 'At least one image is required' }));
      return false;
    }
    this.setErrors(prev => ({ ...prev, images: undefined }));
    return true;
  };

  validateForm = (
    name: string,
    type: string,
    address: string,
    city: string,
    state: string,
    zipCode: string,
    area: string,
    bedrooms: string,
    bathrooms: string,
    basePrice: string,
    instruction: string,
    description: string,
    images: string[]
  ): boolean => {
    const isNameValid = this.validateName(name);
    const isTypeValid = this.validateType(type);
    const isAddressValid = this.validateAddress(address);
    const isCityValid = this.validateCity(city);
    const isStateValid = this.validateState(state);
    const isZipCodeValid = this.validateZipCode(zipCode);
    const isAreaValid = this.validateArea(area);
    const isBedroomsValid = this.validateBedrooms(bedrooms);
    const isBathroomsValid = this.validateBathrooms(bathrooms);
    const isBasePriceValid = this.validateBasePrice(basePrice);
    const isInstructionValid = this.validateInstruction(instruction);
    const isDescriptionValid = this.validateDescription(description);
    const isImagesValid = this.validateImages(images);

    return isNameValid && isTypeValid && isAddressValid && isCityValid && 
           isStateValid && isZipCodeValid && isAreaValid && isBedroomsValid && 
           isBathroomsValid && isBasePriceValid && isInstructionValid && 
           isDescriptionValid && isImagesValid;
  };
}

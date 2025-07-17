import { createPropertyWithImages } from "@/api/propertyapi";
import usePropertyStore from "@/store/jobStore";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { useToast } from "react-native-toast-notifications";
import { PropertyForm } from "../components/PropertyForm";

// Mock external dependencies
jest.mock("@/store/jobStore");
jest.mock("react-native-toast-notifications");
jest.mock("@/api/propertyapi");

describe("PropertyForm", () => {
  const mockUpdateNewPropertyField = jest.fn();
  const mockResetNewProperty = jest.fn();
  const mockToastShow = jest.fn();
  const mockCreatePropertyWithImages = createPropertyWithImages as jest.Mock;

  const getBaseProperty = (overrides = {}) => ({
    name: "",
    type: "",
    address: "",
    city: "",
    state: "",
    ZipCode: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    basePrice: "",
    instruction: "",
    description: "",
    airbnblink: "",
    images: [],
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    (usePropertyStore as jest.Mock).mockImplementation((selector) =>
      selector({
        newProperty: getBaseProperty(),
        updateNewPropertyField: mockUpdateNewPropertyField,
        resetNewProperty: mockResetNewProperty,
      })
    );

    (useToast as jest.Mock).mockReturnValue({
      show: mockToastShow,
    });
  });

  it("calls updateNewPropertyField on field change", () => {
    const { getByPlaceholderText } = render(<PropertyForm />);
    const input = getByPlaceholderText("Enter property name");
    fireEvent.changeText(input, "Test Property");
    expect(mockUpdateNewPropertyField).toHaveBeenCalledWith("name", "Test Property");
  });

  it("shows validation error toast if form invalid", async () => {
    const { getByText } = render(<PropertyForm />);
    fireEvent.press(getByText("Create Property"));
    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        "Please fix all validation errors before submitting",
        expect.any(Object)
      );
    });
  });

  it("submits form successfully and resets on API success", async () => {
    mockCreatePropertyWithImages.mockResolvedValue({ success: true, data: {} });

    // Override store with valid property data
    (usePropertyStore as jest.Mock).mockImplementation((selector) =>
      selector({
        newProperty: getBaseProperty({
          name: "My Property",
          type: "Apartment",
          address: "123 Main St",
          city: "Los Angeles",
          state: "CA",
          ZipCode: "90001",
          area: "120",
          bedrooms: "3",
          bathrooms: "2",
          basePrice: "150",
          instruction: "Be careful",
          description: "Nice place",
          airbnblink: "",
          images: ["fake-image.jpg"],
        }),
        updateNewPropertyField: mockUpdateNewPropertyField,
        resetNewProperty: mockResetNewProperty,
      })
    );

    const { getByText } = render(<PropertyForm />);
    fireEvent.press(getByText("Create Property"));

    await waitFor(() => {
      expect(mockCreatePropertyWithImages).toHaveBeenCalled();
      expect(mockToastShow).toHaveBeenCalledWith(
        "Property created successfully!",
        expect.any(Object)
      );
      expect(mockResetNewProperty).toHaveBeenCalled();
    });
  });

  it("shows error toast on API failure", async () => {
    mockCreatePropertyWithImages.mockResolvedValue({
      success: false,
      error: "API error occurred",
      data: {},
    });

    (usePropertyStore as jest.Mock).mockImplementation((selector) =>
      selector({
        newProperty: getBaseProperty({
          name: "My Property",
          type: "Apartment",
          address: "123 Main St",
          city: "Los Angeles",
          state: "CA",
          ZipCode: "90001",
          area: "120",
          bedrooms: "3",
          bathrooms: "2",
          basePrice: "150",
          instruction: "Be careful",
          description: "Nice place",
          airbnblink: "",
          images: ["fake-image.jpg"],
        }),
        updateNewPropertyField: mockUpdateNewPropertyField,
        resetNewProperty: mockResetNewProperty,
      })
    );

    const { getByText } = render(<PropertyForm />);
    fireEvent.press(getByText("Create Property"));

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        "API error occurred",
        expect.objectContaining({ type: "danger" })
      );
    });
  });
});

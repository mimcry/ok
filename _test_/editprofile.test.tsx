import EditProfileModal from "@/components/EditProfileModal";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("EditProfileModal", () => {
  it("calls onClose when close button pressed", async () => {
    const onCloseMock = jest.fn();
    const onSaveMock = jest.fn();
    const onImagePickMock = jest.fn();

    const { getByTestId } = render(
      <EditProfileModal
        visible={true}
        onClose={onCloseMock}
        onSave={onSaveMock}
        userInfo={{
          firstName: "John",
          lastName: "Doe",
          address: "123 Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          email: "john@example.com",
          phone: "1234567890",
          profileImage: "",
          country: "US",
        }}
        onImagePick={onImagePickMock}
      />
    );

    // Use either getByTestId or getByA11yLabel
    fireEvent.press(getByTestId("close-button"));
    // or fireEvent.press(getByA11yLabel("close-button"));

    expect(onCloseMock).toHaveBeenCalled();
  });
});

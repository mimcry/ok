import * as yup from 'yup';
export  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    address: yup.string().required("Address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    zipCode: yup.string().required("Zip code is required"),
    email: yup.string().email("Email is invalid").required("Email is required"),
    phone: yup
      .string()
      .required("Phone number is required")
      .matches(/^[0-9+\s]{10,15}$/, "Phone number must be valid"),
    profileImage: yup.string(),
    country: yup.string().required("Country is required"),
  });
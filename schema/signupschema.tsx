import * as Yup from 'yup';
export const SignupSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .required('Username is required'),
    email: Yup.string()
      .email('Please enter a valid email')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
      .required('Password is required'),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
    first_name: Yup.string()
      .min(1, 'First name is required')
      .required('First name is required'),
    last_name: Yup.string()
      .min(1, 'Last name is required')
      .required('Last name is required'),
    phone_number: Yup.string()
      .min(10, 'Phone number must be at least 10 digits')
      .required('Phone number is required'),
    role: Yup.string()
      .oneOf(['host', 'cleaner'], 'Please select a valid role')
      .required('Role is required'),
  });
export type SignUpScreenProps ={
  onSignUp?: (data: { 
    username: string; 
    email: string; 
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
  }) => void;
  onSignIn?: () => void;
  onGoogleSignIn?: () => void;
}
export type ValidationErrors= {
    username?: string;
    email?: string;
    password?: string;
    confirm_password?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    role?: string;
  }
  export type userData ={
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
  }
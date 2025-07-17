export type SignInScreenProps = {
    onSignIn?: (data: { email: string; password: string }) => void;
    onSignUp?: () => void;
    onForgotPassword?: () => void;
    onGoogleSignIn?: () => void;
    onFacebookSignIn?: () => void;
  }
  
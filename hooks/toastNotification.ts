import { useToast } from 'react-native-toast-notifications';

export const useAppToast = () => {
  const toast = useToast();

  return {
    success: (message: string) =>
      toast.show(message, { type: 'success' }),
    error: (message: string) =>
      toast.show(message, { type: 'danger' }),
    warning: (message: string) =>
      toast.show(message, { type: 'warning' }),
    normal: (message: string) =>
      toast.show(message, { type: 'normal' }),
  };
};

import { useUserStore } from '@/store/userStore';
import { fetchUserDetails } from '@/api/userdetails';
import { useAppToast } from './toastNotification';
import { countries } from '@/constants/countries'; 
import { useEffect, useState } from 'react';

export const useLoadUser = (user: any, token: string | null) => {
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
const toast = useAppToast()
  useEffect(() => {
    let isMounted = true;

    const loadUserDetails = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetchUserDetails(user.id, token, user.role);
        console.log('User from backend:', result);

        if (result.success && result.user) {
          const userCountry = result.user.country || 'US';
          const foundCountry = countries.find((c) => c.code === userCountry);
          if (foundCountry) setSelectedCountry(foundCountry);

          const formattedUser = {
            name: result.user.name || '',
            firstName: result.user.first_name || '',
            lastName: result.user.last_name || '',
            address: result.user.address || '',
            city: result.user.city || '',
            state: result.user.state || '',
            zipCode: result.user.zipcode || '',
            email: result.user.email || '',
            phone: result.user.phone || '',
            country: result.user.country || '',
            profileImage: result.user.profile_picture || '',
          };

          setUserInfo(formattedUser);
        } else {
          if (isMounted) {
            setError(result.error || 'Unable to fetch user data');
            toast.show(result.error || 'Failed to load user profile', {
              type: 'error',
            });
          }
        }
      } catch (err) {
        console.error('Error in useLoadUser:', err);
        if (isMounted) {
          setError('An unexpected error occurred');
          toast.show('Failed to load user profile', { type: 'error' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUserDetails();
    return () => {
      isMounted = false;
    };
  }, [user?.id, token]);

  return { loading, error, selectedCountry };
};

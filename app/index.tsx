import { useAuthStore } from '@/context/userAuthStore';
import { Redirect } from 'expo-router';

export default function IndexPage() {
  const { isSignedIn, user, isHydrated } = useAuthStore();

  // While the auth state is loading
  if (!isHydrated) {
    return null; // or a loading spinner
  }

  // Not signed in → go to welcome
  if (!isSignedIn) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // If signed in but user object is missing or invalid
  if (!user || !user.role) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Signed in and has valid role → route accordingly
  if (user.role === 'host') {
    return <Redirect href="/(root_host)/(tabs)" />;
  }

  if (user.role === 'cleaner') {
    return <Redirect href="/(root_cleaner)/(tabs)" />;
  }

  // Fallback (unknown role)
  return <Redirect href="/(auth)/welcome" />;
}

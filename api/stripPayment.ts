// import { createPaymentMethod } from '@stripe/stripe-react-native';
// import { Alert } from 'react-native';
// import { EXPO_PUBLIC_BASE_URL } from "@env";
// import { getAuthToken } from './userdetails';
// interface BillingDetails {
//   name: string;
//   email: string;
// }

// interface SaveCardResult {
//   success: boolean;
//   data?: any;
//   error?: string;
// }

// export const saveCard = async (billingDetails: BillingDetails): Promise<SaveCardResult> => {
//   try {
//     const token = getAuthToken();
//     // 1. Create Payment Method using Stripe
//     const { paymentMethod, error } = await createPaymentMethod({
//       type: 'Card',
//       billingDetails,
//     });

//     if (error || !paymentMethod) {
//       const message = error?.message || 'Failed to create card.';
//       Alert.alert('Stripe Error', message);
//       return { success: false, error: message };
//     }

//     // 2. Send Payment Method ID to backend to save
//     const response = await fetch(`${EXPO_PUBLIC_BASE_URL}/api/invoices/payment-methods/`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         payment_method_id: paymentMethod.id,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       const message = data?.message || 'Could not save card.';
//       Alert.alert('Backend Error', message);
//       return { success: false, error: message };
//     }

//     // 3. Success
//     return { success: true, data };
//   } catch (err) {
//     console.error('Save Card Error:', err);
//     Alert.alert('Unexpected Error', 'Something went wrong while saving the card.');
//     return { success: false, error: 'Unexpected error occurred.' };
//   }
// };

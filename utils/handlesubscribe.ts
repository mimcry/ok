import { getAuthToken } from '@/api/userdetails';
import { Alert } from 'react-native';

export const handleSubscribe = async ({
  cardDetails,
  formData,
  selectedPlan,
  plans,
  user,
  createPaymentMethod,
  setIsProcessing,
}: {
  cardDetails: any;
  formData: any;
  selectedPlan: string;
  plans: any[];
  user: any;
  createPaymentMethod: any;
  setIsProcessing: (val: boolean) => void;
}) => {
  if (!formData.firstName || !formData.lastName || !formData.email) {
    Alert.alert('Incomplete Form', 'Please fill in all required fields.');
    return;
  }

  if (!cardDetails?.complete) {
    Alert.alert('Card Incomplete', 'Please fill in all card details.');
    return;
  }

  setIsProcessing(true);

  try {
    const { paymentMethod, error } = await createPaymentMethod({
      paymentMethodType: 'Card',
      card: cardDetails,
      billingDetails: {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        address: {
          line1: formData.address,
          city: formData.city,
          postal_code: formData.zipCode,
          country: formData.country,
        },
      },
    });

    if (error) {
      Alert.alert('Payment Error', error.message);
      setIsProcessing(false);
      return;
    }

    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(now.getMonth() + 1);
 const token = getAuthToken();

    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    const payload = {
      host: user?.id,
      host_email: formData.email,
      plan_id: selectedPlan,
      plan_name: selectedPlanData.name,
      amount: selectedPlanData.price,
      slots_purchased: 1,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      auto_pay: true,
      started_at: now.toISOString(),
      expires_at: expires.toISOString(),
      total_allowed: 1,
      slots_remaining: 1,
      payment_method_id: paymentMethod.id,
      price_id: `price_${selectedPlan}_monthly`,
      billing_details: formData,
    };

    const response = await fetch(
      'http://192.168.1.126:8000/api/invoices/subscription/',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(token ? { "X-CSRFToken": token } : {}),
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (response.ok) {
      Alert.alert(
        '✅ Success!',
        `Welcome to ${selectedPlanData.name} plan! Your subscription is now active.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('❌ Server Error', data.detail || 'Check server logs.');
    }
  } catch (err: any) {
    Alert.alert('Network Error', err.message || 'Something went wrong.');
  } finally {
    setIsProcessing(false);
  }
};

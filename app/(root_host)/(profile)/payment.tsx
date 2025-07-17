import { getAuthToken } from '@/api/userdetails';
import { BASE_URL } from '@/utils/config';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function AddPaymentMethodScreen() {
  const { createPaymentMethod } = useStripe();
  const [cardDetails, setCardDetails] = useState<CardFieldInput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddPaymentMethod = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Incomplete Card Info', 'Please enter complete card details.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create a Stripe PaymentMethod
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
        card: cardDetails,
      });
      if (error || !paymentMethod?.id) {
        throw new Error(error?.message ?? 'Failed to create payment method.');
      }

      // 2. Get your auth token
      const token = await getAuthToken();

      // 3. POST to /api/invoices/payment-methods/
      const res = await fetch(`${BASE_URL}/api/invoices/payment-methods/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),          
 ...(token ? { "X-CSRFToken": token } : {}),
        },
        body: JSON.stringify({
          stripe_payment_method_id: paymentMethod.id,
          is_default: false,
        }),
      });
console.log("paymentMethod.id",paymentMethod.id)
      const payload = await res.text();
      if (!res.ok) {
        throw new Error(payload);
      }

      Alert.alert('Success', 'Payment method added successfully!');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a payment method</Text>
      <CardField
        postalCodeEnabled={false}
        placeholder={{ number: '4242 4242 4242 4242' }}
        cardStyle={styles.cardField}
        style={styles.cardContainer}
        onCardChange={(card) => setCardDetails(card)}
      />
      {isProcessing
        ? <ActivityIndicator size="large" color="#4F46E5" />
        : <Button title="Save Card" onPress={handleAddPaymentMethod} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: '600',
  },
  cardContainer: {
    height: 50,
    marginBottom: 20,
  },
  cardField: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
});

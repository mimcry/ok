import { router } from 'expo-router';
import React, { JSX } from 'react';
import { Dimensions, Image, ImageSourcePropType, StatusBar, Text, TouchableOpacity, View } from 'react-native';

// Define required image assets
interface Assets {
  welcomeIllustration: ImageSourcePropType;
  logoIcon: ImageSourcePropType;
}

// Component props
interface WelcomeScreenProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
  onExplore?: () => void;
}

export default function WelcomeScreen({
  onSignIn,
  onSignUp,
  onExplore
}: WelcomeScreenProps): JSX.Element {

  const assets: Assets = {
    welcomeIllustration: require('@/assets/images/cleaner.png'),
    logoIcon: require('@/assets/images/hero.png'),
  };

  const { width, height } = Dimensions.get('window');

  return (
    <View className="flex-1 bg-white">
      {/* Hide status bar */}
      <StatusBar hidden={false} />
      
      <View className="flex-1">
        {/* Header Section with Full Screen Image */}
        <View className="relative">
          <Image 
            source={assets.welcomeIllustration}
            style={{ 
              width: width, 
              height: height * 0.60, // Increased height since no status bar
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 200,
            }}
            resizeMode="cover"
          />
          
         
        </View>

        {/* Content Section */}
        <View className="flex-1 px-6 justify-between">
          {/* Title and Description */}
          <View className="items-center mt-8 mb-6">
            <Text className="text-3xl font-bold text-gray-800 text-center leading-10">
              Reliable Cleaning for{'\n'}
              <Text className="text-blue-600">Airbnb Hosts</Text>
              <Text className="text-blue-600"> & Cleaner</Text>
            </Text>
            <Text className="text-gray-500 mt-4 text-center text-base leading-6 px-4">
              Schedule, Track, and Complete Cleanings -{'\n'}
              All in One App.
            </Text>
          </View>

          {/* Buttons Section - Side by Side */}
          <View className="mb-8 flex-row space-x-3 gap-2">
            {/* Get Started Button */}
            <TouchableOpacity 
              className="bg-blue-500 rounded-2xl py-4 items-center flex-1"
              style={{
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={() => router.push("/(auth)/signup")}
              accessibilityRole="button"
              accessibilityLabel="Get Started"
              activeOpacity={0.9}
            >
              <Text className="text-white font-bold text-lg">Get Started</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity 
              className="border-2 border-blue-500 rounded-2xl py-4 items-center bg-blue-50 flex-1"
              onPress={() => router.push("/(auth)/signin")}
              accessibilityRole="button"
              accessibilityLabel="I already have an account"
              activeOpacity={0.9}
            >
              <Text className="text-blue-600 font-semibold text-lg">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom decoration */}
        <View className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
      </View>
    </View>
  );
}
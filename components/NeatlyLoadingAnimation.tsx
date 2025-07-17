import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Text } from 'react-native';

const NeatlyLoadingAnimation = ({ size = 150 }) => {
  // Animation values
  const opacityValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.9)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;
  
  // Set up animations
  useEffect(() => {
    // Fade-in animation
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Dot animation
    Animated.loop(
      Animated.sequence([
        // Dot 1 animation
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Dot 2 animation
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Dot 3 animation
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  // Calculate font size based on overall size
  const fontSize = size * 0.6;
  const neatlyColor = "#4834DF"; // Close match to the purple in your logo
  const dotSize = size * 0.08;

  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Animated.View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          opacity: opacityValue,
          transform: [{ scale: scaleValue }]
        }}
      >
        {/* Neatly text */}
        <Text 
          style={{ 
            fontSize, 
            fontWeight: 'bold',
            color: neatlyColor
          }}
        >
          Neatly
        </Text>
        
        {/* Animated dots */}
        <View style={{ 
          flexDirection: 'row', 
          marginTop: size * 0.15,
          justifyContent: 'center'
        }}>
          <Animated.View style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: neatlyColor,
            marginHorizontal: dotSize * 0.5,
            opacity: dot1Opacity
          }} />
          <Animated.View style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: neatlyColor,
            marginHorizontal: dotSize * 0.5,
            opacity: dot2Opacity
          }} />
          <Animated.View style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: neatlyColor,
            marginHorizontal: dotSize * 0.5,
            opacity: dot3Opacity
          }} />
        </View>
      </Animated.View>
    </View>
  );
};

export default NeatlyLoadingAnimation;
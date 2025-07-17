import React from 'react';
import { ActivityIndicator, Text, View, ViewStyle } from 'react-native';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
  fullScreen?: boolean;
  backgroundColor?: string;
  textColor?: string;
  showIcon?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  size = "large",
  color = "#4F46E5",
  overlay = false,
  fullScreen = false,
  backgroundColor = "transparent",
  textColor = "#6B7280",
  showIcon = true,
  animated = true,
  style
}) => {
  const getContainerClasses = () => {
    let classes = "justify-center items-center";
    
    if (fullScreen) {
      classes += " flex-1 absolute inset-0";
    } else if (overlay) {
      classes += " absolute inset-0 z-50";
    } else {
      classes += " flex-1";
    }
    
    return classes;
  };

  const getBackgroundColor = () => {
    if (overlay) {
      return "rgba(0, 0, 0, 0.5)";
    }
    return backgroundColor;
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return "text-sm";
      case 'large':
      default:
        return "text-base";
    }
  };

  const containerStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    ...style
  };

  return (
    <View 
      className={getContainerClasses()}
      style={containerStyle}
    >
      {overlay && (
        <View className="bg-white rounded-lg p-6 shadow-lg min-w-[120px] items-center">
          {showIcon && (
            <ActivityIndicator 
              size={size} 
              color={color}
              animating={animated}
            />
          )}
          {message && (
            <Text 
              className={`mt-3 font-medium text-center ${getTextSize()}`}
              style={{ color: textColor }}
            >
              {message}
            </Text>
          )}
        </View>
      )}
      
      {!overlay && (
        <>
          {showIcon && (
            <ActivityIndicator 
              size={size} 
              color={color}
              animating={animated}
            />
          )}
          {message && (
            <Text 
              className={`mt-4 font-medium text-center ${getTextSize()}`}
              style={{ color: textColor }}
            >
              {message}
            </Text>
          )}
        </>
      )}
    </View>
  );
};

// Predefined variants for common use cases
export const LoadingVariants = {
  // Full screen loading
  fullScreen: (message?: string) => (
    <LoadingState 
      message={message}
      fullScreen={true}
      backgroundColor="#F8FAFC"
      size="large"
    />
  ),
  
  // Overlay loading (modal style)
  overlay: (message?: string) => (
    <LoadingState 
      message={message}
      overlay={true}
      size="large"
    />
  ),
  
  // Inline loading (for cards, sections)
  inline: (message?: string) => (
    <LoadingState 
      message={message}
      size="small"
      color="#6B7280"
    />
  ),
  
  // Minimal loading (just spinner)
  minimal: () => (
    <LoadingState 
      message=""
      size="small"
      showIcon={true}
    />
  ),
  
  // Success state (green)
  success: (message: string = "Success!") => (
    <LoadingState 
      message={message}
      color="#10B981"
      showIcon={false}
      textColor="#10B981"
    />
  ),
  
  // Error state (red)
  error: (message: string = "Error occurred") => (
    <LoadingState 
      message={message}
      color="#EF4444"
      showIcon={false}
      textColor="#EF4444"
    />
  )
};

// Usage examples:
/*
// Basic usage
<LoadingState />

// With custom message
<LoadingState message="Saving changes..." />

// Overlay style
<LoadingState overlay={true} message="Processing..." />

// Full screen
<LoadingState fullScreen={true} message="Loading app..." />

// Using predefined variants
{LoadingVariants.fullScreen("Loading properties...")}
{LoadingVariants.overlay("Saving task...")}
{LoadingVariants.inline("Loading tasks...")}
{LoadingVariants.minimal()}
{LoadingVariants.success("Task saved!")}
{LoadingVariants.error("Failed to load")}

// Custom styling
<LoadingState 
  message="Custom loading..."
  size="large"
  color="#8B5CF6"
  backgroundColor="#F3F4F6"
  textColor="#374151"
  style={{ padding: 20 }}
/>
*/
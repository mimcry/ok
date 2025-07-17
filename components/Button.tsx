import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from 'react-native';

interface CustomButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  // Text props
  text: string;
  loadingText?: string;
  
  // State props
  loading?: boolean;
  disabled?: boolean;
  
  // Icon props
  icon?: LucideIcon;
  iconSize?: number;
  iconColor?: string;
  iconPosition?: 'left' | 'right';
  
  // Style props
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  customStyle?: ViewStyle;
  textStyle?: TextStyle;
  
  // Loading indicator props
  loadingColor?: string;
  loadingSize?: 'small' | 'large';
}

const NealtyButton: React.FC<CustomButtonProps> = ({
  text,
  loadingText = 'Loading...',
  loading = false,
  disabled = false,
  icon: Icon,
  iconSize = 20,
  iconColor,
  iconPosition = 'left',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  customStyle,
  textStyle,
  loadingColor,
  loadingSize = 'small',
  onPress,
  ...props
}) => {
  // Get variant styles
  const getVariantStyles = () => {
    const baseStyles = {
      primary: {
        backgroundColor: '#4F46E5', // indigo-600
        borderColor: '#4F46E5',
        textColor: '#FFFFFF',
      },
      secondary: {
        backgroundColor: '#6B7280', // gray-500
        borderColor: '#6B7280',
        textColor: '#FFFFFF',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '#4F46E5',
        textColor: '#4F46E5',
      },
      danger: {
        backgroundColor: '#EF4444', // red-500
        borderColor: '#EF4444',
        textColor: '#FFFFFF',
      },
      success: {
        backgroundColor: '#10B981', // green-500
        borderColor: '#10B981',
        textColor: '#FFFFFF',
      },
      warning: {
        backgroundColor: '#F59E0B', // yellow-500
        borderColor: '#F59E0B',
        textColor: '#FFFFFF',
      },
    };

    const disabledStyles = {
      backgroundColor: '#9CA3AF', // gray-400
      borderColor: '#9CA3AF',
      textColor: '#FFFFFF',
    };

    if (disabled || loading) {
      return disabledStyles;
    }

    return baseStyles[variant];
  };

  // Get size styles
  const getSizeStyles = () => {
    const sizes = {
      small: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        iconSize: 16,
      },
      medium: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        iconSize: 20,
      },
      large: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 18,
        iconSize: 24,
      },
    };

    return sizes[size];
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const finalIconSize = iconSize || sizeStyles.iconSize;
  const finalIconColor = iconColor || variantStyles.textColor;
  const finalLoadingColor = loadingColor || variantStyles.textColor;

  // Button container style
  const buttonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variantStyles.backgroundColor,
    borderWidth: 1,
    borderColor: variantStyles.borderColor,
    borderRadius: 12,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    opacity: (disabled || loading) ? 0.6 : 1,
    minHeight: 44, // Minimum touch target
    ...(fullWidth && { width: '100%' }),
    ...customStyle,
  };

  // Text style
  const buttonTextStyle: TextStyle = {
    color: variantStyles.textColor,
    fontSize: sizeStyles.fontSize,
    fontWeight: '600',
    ...textStyle,
  };

  // Render icon
  const renderIcon = () => {
    if (!Icon || loading) return null;

    return (
      <Icon
        size={finalIconSize}
        color={finalIconColor}
        style={{
          marginRight: iconPosition === 'left' ? 8 : 0,
          marginLeft: iconPosition === 'right' ? 8 : 0,
        }}
      />
    );
  };

  // Render loading indicator
  const renderLoadingIndicator = () => {
    if (!loading) return null;

    return (
      <ActivityIndicator
        size={loadingSize}
        color={finalLoadingColor}
        style={{ marginRight: 8 }}
      />
    );
  };

  // Render content
  const renderContent = () => {
    const displayText = loading ? loadingText : text;

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {renderLoadingIndicator()}
        
        {iconPosition === 'left' && renderIcon()}
        
        <Text style={buttonTextStyle} numberOfLines={1}>
          {displayText}
        </Text>
        
        {iconPosition === 'right' && renderIcon()}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default NealtyButton;
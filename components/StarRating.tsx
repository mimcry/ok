import { Star } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

interface StarRatingProps {
  rating: number | undefined |null;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 14 }) => {
  const validRating = isNaN(rating) ? 0 : Math.max(0, Math.min(5, rating));

  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={star <= validRating ? "#FFB800" : "#D1D5DB"}
          fill={star <= validRating ? "#FFB800" : "none"}
        />
      ))}
    </View>
  );
};

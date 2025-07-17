import React from 'react';
import { Text, View } from 'react-native';

interface DateFormatterProps {
  date: string | Date | undefined ;
  format?: 'badge' | 'full' | 'short'|"shorttime" | string | undefined;
  badgeStyle?: string;
  textStyle?: string;
    badgeClassName?: string;  // use className for Tailwind/nativewind style
  textClassName?: string;
}


export const DateFormatter: React.FC<DateFormatterProps> = ({
  date,
  format = 'full',
  badgeClassName = 'bg-indigo-100 rounded px-2 py-1',
  textClassName = 'text-black text-base',
}) => {
  if (!date) {
    return <Text className={textClassName}>Invalid Date</Text>;
  }

  let dateObj: Date;
  try {
    dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to DateFormatter:', date);
      return <Text className={textClassName}>Invalid Date</Text>;
    }
  } catch (error) {
    console.error('Error parsing date in DateFormatter:', error, date);
    return <Text className={textClassName}>Invalid Date</Text>;
  }

  const formatDate = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const time = dateObj.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    switch (format) {
      case 'badge':
        return `${day} ${month}`;
      case 'short':
        return `${day} ${month}, ${year}`;
      case 'shorttime':
        return `${day} ${month}, ${time}`;
      case 'time':
        return time;
      case 'full':
      default:
        return dateObj.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
    }
  };

  if (format === 'badge') {
    return (
      <View className={badgeClassName}>
        <Text className={textClassName}>{formatDate()}</Text>
      </View>
    );
  }

  return <Text className={textClassName}>{formatDate()}</Text>;
};

// Utility functions for date handling
export class DateUtils {
  static isSameDay(date1: Date, date2: Date): boolean {
    if (!date1 || !date2) return false;
    
    try {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    } catch (error) {
      console.error("Error in isSameDay:", error);
      return false;
    }
  }

  static isToday(date: Date): boolean {
    if (!date) return false;
    
    try {
      const today = new Date();
      return this.isSameDay(date, today);
    } catch (error) {
      console.error("Error in isToday:", error);
      return false;
    }
  }

  static isFutureDate(date: Date): boolean {
    if (!date) return false;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return compareDate.getTime() > today.getTime();
    } catch (error) {
      console.error("Error in isFutureDate:", error);
      return false;
    }
  }

  static isPastDate(date: Date): boolean {
    if (!date) return false;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return compareDate.getTime() < today.getTime();
    } catch (error) {
      console.error("Error in isPastDate:", error);
      return false;
    }
  }

  static filterTodaysItems<T extends { date: Date | string }>(items: T[]): T[] {
    if (!items || !Array.isArray(items)) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return items.filter(item => {
      if (!item.date) return false;
      
      try {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime();
      } catch (error) {
        console.error("Error filtering today's items:", error);
        return false;
      }
    });
  }

  static filterFutureItems<T extends { date: Date | string }>(items: T[]): T[] {
    if (!items || !Array.isArray(items)) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return items.filter(item => {
      if (!item.date) return false;
      
      try {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() > today.getTime();
      } catch (error) {
        console.error("Error filtering future items:", error);
        return false;
      }
    });
  }

  static filterPastItems<T extends { date: Date | string }>(items: T[]): T[] {
    if (!items || !Array.isArray(items)) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return items.filter(item => {
      if (!item.date) return false;
      
      try {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() < today.getTime();
      } catch (error) {
        console.error("Error filtering past items:", error);
        return false;
      }
    });
  }
  static formatToTime(date: Date | string): string {
  if (!date) return "";

  try {
    const d = new Date(date);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
}
static formatToDateTime(date: Date | string): string {
  if (!date) return "";

  try {
    const d = new Date(date);
    const datePart = d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} at ${timePart}`;
  } catch (error) {
    console.error("Error formatting date & time:", error);
    return "";
  }
}


}

export const today = new Date().toLocaleDateString(undefined, {
  weekday: 'long',   // e.g., Monday
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
export function getTimeDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Invalid date";
  }

  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    const roundedHours = Math.round(diffHours * 10) / 10; // 1 decimal place
    return `${roundedHours} hour${roundedHours !== 1 ? "s" : ""}`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  }
}

// Helper function to get room ID from room name
export const getRoomId = (roomName: string): string => {
  const roomMap: { [key: string]: string } = {
    'Living Room': "living_room",
    'Kitchen': "kitchen",
    'Bedroom': "bedroom",
    'Bathroom': "bathroom",
    'All Rooms': "all_rooms",
    'Outdoor': "outdoor",
    'Laundry Room': "laundry_room",
    'Dining Room': "dining_room",
  };
  return roomMap[roomName] || "unknown";
};

// Helper function to get room display name from room ID
export const getRoomDisplayName = (roomId: string): string => {
  const roomMap: { [key: string]: string } = {
    "living_room": "Living Room",
    "kitchen": "Kitchen",
    "bedroom": "Bedroom",
    "bathroom": "Bathroom",
    "all_rooms": "All Rooms",
    "outdoor": "Outdoor",
    "laundry_room": "Laundry Room",
    "dining_room": "Dining Room",
  };
  return roomMap[roomId] || roomId;
};

// Helper function to convert priority string to number
export const getPriorityNumber = (priority: string): number => {
  switch (priority) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 2;
  }
};
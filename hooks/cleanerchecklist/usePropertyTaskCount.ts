import { useMemo } from 'react';

export const usePropertyTaskCounts = (checkList: any[]) => {
  return useMemo(() => {
    const counts: { [propertyId: number]: number } = {};
    
    if (Array.isArray(checkList)) {
      checkList.forEach((checklistItem: any) => {
        if (checklistItem && checklistItem.property) {
          const propertyId = checklistItem.property;
          counts[propertyId] = (counts[propertyId] || 0) + 1;
        }
      });
    }
    
    console.log("Computed property task counts:", counts);
    return counts;
  }, [checkList]);
};
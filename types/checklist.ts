// types.ts
export interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  main_image: string;
}

export interface Task {
  id: number;
  task: string;
  room: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
}

export interface PriorityStyle {
  backgroundColor: string;
  color: string;
}

export interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  task: Partial<Task> | null;
  setTask: (task: Partial<Task>) => void;
  title: string;
  rooms: string[];
  priorities: Array<'low' | 'medium' | 'high'>;
  getPriorityColor: (priority: string) => PriorityStyle;
}

export interface PropertyCardProps {
  item: Property;
  onPress: () => void;
  isSelected: boolean;
  taskCount: number;
}

export interface TaskItemProps {
  item: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  getPriorityColor: (priority: string) => PriorityStyle;
}

export interface ChecklistItems {
  [propertyId: number]: Task[];
}
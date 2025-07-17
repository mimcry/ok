import { createPropertyChecklist, deletePropertyChecklist, getChecklist, updatePropertyChecklist } from '@/api/checkListApi';
import { PriorityStyle, Property, Task } from '@/types/checklist';
import { getRoomId } from '@/utils/room';
import { useState } from 'react';

export interface ChecklistLogic {
  newTask: Partial<Task>;
  setNewTask: (task: Partial<Task>) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  showNewTaskModal: boolean;
  setShowNewTaskModal: (show: boolean) => void;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  showValidationAlert: boolean;
  setShowValidationAlert: (show: boolean) => void;
  showDeleteAlert: boolean;
  setShowDeleteAlert: (show: boolean) => void;
  showEditValidationAlert: boolean;
  setShowEditValidationAlert: (show: boolean) => void;
  addTask: () => Promise<void>;
  deleteTask: (taskId: number) => void;
  confirmDeleteTask: () => Promise<void>;
  cancelDeleteTask: () => void;
  startEditing: (task: Task) => void;
  saveEdit: () => Promise<void>;
  cancelEdit: () => void;
  cancelNewTask: () => void;
  getPriorityColor: (priority: string) => PriorityStyle;
  rooms: string[];
  priorities: Array<'low' | 'medium' | 'high'>;
}

export const useChecklistLogic = (
  selectedProperty: Property | null,
  checkList: any[],
  setCheckList: (checkList: any[]) => void,
  toast: any,
  setIsLoading: (loading: boolean) => void
): ChecklistLogic => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditValidationAlert, setShowEditValidationAlert] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  
  const [newTask, setNewTask] = useState<Partial<Task>>({ 
    task: '', 
    room: 'Living Room', 
    priority: 'medium', 
    estimatedTime: '' 
  });

  const rooms: string[] = [
    'Living Room', 
    'Kitchen', 
    'Bedroom', 
    'Bathroom', 
    'All Rooms', 
    'Outdoor', 
    'Laundry Room', 
    'Dining Room'
  ];

  const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

  const resetNewTask = (): void => {
    setNewTask({ task: '', room: 'Living Room', priority: 'medium', estimatedTime: '' });
  };

  const refreshChecklistData = async () => {
    try {
      const updatedChecklist = await getChecklist();
      
      if (Array.isArray(updatedChecklist)) {
        setCheckList(updatedChecklist);
      } else if (updatedChecklist && Array.isArray(updatedChecklist.data)) {
        setCheckList(updatedChecklist.data);
      } else {
        setCheckList([]);
      }
    } catch (error) {
      console.error("Error refreshing checklist:", error);
      setCheckList([]);
    }
  };

  const addTask = async (): Promise<void> => {
    if (newTask.task?.trim() && selectedProperty) {
      try {
        setIsLoading(true);
        
        const checklistData = {
          property: selectedProperty.id,
          room: getRoomId(newTask.room),
          description: newTask.task,
          priority: newTask.priority 
        };
        
        const response = await createPropertyChecklist(checklistData);
        
        if (response.success) {
          await refreshChecklistData();
          resetNewTask();
          setShowNewTaskModal(false);
          toast.success("Task created successfully");
        } else {
          toast.error(response.message || "Failed to create task");
        }
      } catch (error) {
        console.error("Error creating task:", error);
        toast.error("An error occurred while creating the task");
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowValidationAlert(true);
    }
  };

  const deleteTask = (taskId: number): void => {
    if (!selectedProperty) return;
    setTaskToDelete(taskId);
    setShowDeleteAlert(true);
  };

  const confirmDeleteTask = async (): Promise<void> => {
    if (!selectedProperty || taskToDelete === null) return;
    
    try {
      setIsLoading(true);
      
      const response = await deletePropertyChecklist(taskToDelete);
      
      if (response.success) {
        await refreshChecklistData();
        setShowDeleteAlert(false);
        setTaskToDelete(null);
        toast.success("Task deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("An error occurred while deleting the task");
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
      setTaskToDelete(null);
    }
  };

  const cancelDeleteTask = (): void => {
    setShowDeleteAlert(false);
    setTaskToDelete(null);
  };

  const startEditing = (task: Task): void => {
    setEditingTask({ ...task });
    setShowEditModal(true);
  };

  const saveEdit = async (): Promise<void> => {
    if (editingTask && editingTask.task.trim() && selectedProperty) {
      try {
        setIsLoading(true);
        
        const updateData = {
          id: editingTask.id,
          property: selectedProperty.id,
          room: getRoomId(editingTask.room),
          description: editingTask.task,
          priority: editingTask.priority,
        };

        const response = await updatePropertyChecklist(updateData);
        
        if (response.success) {
          await refreshChecklistData();
          setEditingTask(null);
          setShowEditModal(false);
          toast.success("Task updated successfully");
        } else {
          toast.error(response.message || "Failed to update task");
        }
      } catch (error) {
        console.error("Error updating task:", error);
        toast.error("An error occurred while updating the task");
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowEditValidationAlert(true);
    }
  };

  const cancelEdit = (): void => {
    setEditingTask(null);
    setShowEditModal(false);
  };

  const cancelNewTask = (): void => {
    resetNewTask();
    setShowNewTaskModal(false);
  };

  const getPriorityColor = (priority: string): PriorityStyle => {
    switch (priority) {
      case 'high': 
        return { backgroundColor: '#FEE2E2', color: '#DC2626' };
      case 'medium': 
        return { backgroundColor: '#FEF3C7', color: '#D97706' };
      case 'low': 
        return { backgroundColor: '#D1FAE5', color: '#059669' };
      default: 
        return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  };

  return {
    newTask,
    setNewTask,
    editingTask,
    setEditingTask,
    showNewTaskModal,
    setShowNewTaskModal,
    showEditModal,
    setShowEditModal,
    showValidationAlert,
    setShowValidationAlert,
    showDeleteAlert,
    setShowDeleteAlert,
    showEditValidationAlert,
    setShowEditValidationAlert,
    addTask,
    deleteTask,
    confirmDeleteTask,
    cancelDeleteTask,
    startEditing,
    saveEdit,
    cancelEdit,
    cancelNewTask,
    getPriorityColor,
    rooms,
    priorities
  };
};
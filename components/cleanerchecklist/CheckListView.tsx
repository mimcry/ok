import TaskFormModal from '@/components/CheckListForm';
import TaskItem from '@/components/TaskItem';
import { ChecklistLogic } from '@/hooks/cleanerchecklist/useChecklistLogic';
import CustomAlert from '@/hooks/customAlert';
import { Property, Task } from '@/types/checklist';
import { getRoomDisplayName } from '@/utils/room';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface ChecklistViewProps {
  selectedProperty: Property | null;
  checkList: any[];
  onBackPress: () => void;
  checklistLogic: ChecklistLogic;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  selectedProperty,
  checkList,
  onBackPress,
  checklistLogic
}) => {
  const {
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
  } = checklistLogic;

  // Calculate current tasks
  const currentTasks: Task[] = selectedProperty && Array.isArray(checkList)
    ? checkList
        .filter((checklistItem: any) => {
          return checklistItem && checklistItem.property === selectedProperty.id;
        })
        .map((checklistItem: any) => ({
          id: checklistItem.id,
          task: checklistItem.description || '',
          room: checklistItem.room_display || getRoomDisplayName(checklistItem.room || ''),
          priority: checklistItem.priority || 'medium',
          estimatedTime: checklistItem.estimatedTime || ''
        }))
    : [];

  const tasksByRoom: { [room: string]: Task[] } = currentTasks.reduce((acc, task) => {
    if (!acc[task.room]) acc[task.room] = [];
    acc[task.room].push(task);
    return acc;
  }, {} as { [room: string]: Task[] });

  return (
    <>
      <View className="flex-row items-center justify-between px-5 py-4  bg-white border-b border-gray-200 rounded-tr-[20px]">
        <TouchableOpacity 
          onPress={onBackPress}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-xl font-semibold text-gray-900">{selectedProperty?.name || 'Property'}</Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {currentTasks.length} tasks
          </Text>
        </View>
        <TouchableOpacity
          className="bg-blue-500 rounded-full w-10 h-10 justify-center items-center"
          onPress={() => setShowNewTaskModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {currentTasks.length === 0 ? (
        <View className="flex-1 justify-center items-center p-10">
          <Ionicons name="checkmark-circle-outline" size={64} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-500 mt-4">No tasks yet</Text>
          <Text className="text-sm text-gray-400 text-center mt-2 leading-5">Add your first cleaning task to get started</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
          {Object.entries(tasksByRoom).map(([room, tasks]) => (
            <View key={room} className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                {room} ({tasks.length} tasks)
              </Text>
              <FlatList
                data={tasks}
                renderItem={({ item }) => (
                  <TaskItem
                    item={item}
                    onEdit={startEditing}
                    onDelete={deleteTask}
                    getPriorityColor={getPriorityColor}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </View>
          ))}
        </ScrollView>
      )}

      <TaskFormModal
        visible={showNewTaskModal}
        onClose={cancelNewTask}
        onSave={addTask}
        task={newTask}
        setTask={setNewTask}
        title="Add New Task"
        rooms={rooms}
        priorities={priorities}
        getPriorityColor={getPriorityColor}
      />

      <TaskFormModal
        visible={showEditModal}
        onClose={cancelEdit}
        onSave={saveEdit}
        task={editingTask}
        setTask={(task) => setEditingTask(task as Task)}
        title="Edit Task"
        rooms={rooms}
        priorities={priorities}
        getPriorityColor={getPriorityColor}
      />

      {/* Custom Alert for Add Task Validation */}
      <CustomAlert
        visible={showValidationAlert}
        type="warning"
        title="Validation Error"
        message="Please enter a task description."
        onCancel={() => setShowValidationAlert(false)}
        onConfirm={() => setShowValidationAlert(false)}
      />

      {/* Custom Alert for Edit Task Validation */}
      <CustomAlert
        visible={showEditValidationAlert}
        type="warning"
        title="Validation Error"
        message="Please enter a task description."
        onCancel={() => setShowEditValidationAlert(false)}
        onConfirm={() => setShowEditValidationAlert(false)}
      />

      {/* Custom Alert for Delete Confirmation */}
      <CustomAlert
        visible={showDeleteAlert}
        type="danger"
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onCancel={cancelDeleteTask}
        onConfirm={confirmDeleteTask}
      />
    </>
  );
};
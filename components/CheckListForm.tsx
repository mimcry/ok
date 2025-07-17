import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskFormModalProps } from '@/types/checklist';

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onClose,
  onSave,
  task,
  setTask,
  title,
  rooms,
  priorities,
  getPriorityColor,
}) => (
  <Modal 
    visible={visible} 
    animationType="slide" 
    presentationStyle="overFullScreen"
    transparent={true}
  >
    <View className="flex-1 justify-end bg-black/50">
      <View className="h-[60%] bg-white rounded-t-3xl">
        <SafeAreaView className="flex-1">
          <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900 flex-1 text-center">
              {title}
            </Text>
            <TouchableOpacity 
              onPress={onSave} 
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            className="flex-1 p-5" 
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Task Description
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-white"
                style={{ textAlignVertical: 'top' }}
                placeholder="e.g., Clean and disinfect kitchen counters"
                value={task?.task || ''}
                onChangeText={(text) => setTask({ ...task, task: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Room
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                className="flex-row"
              >
                {rooms.map((room) => (
                  <TouchableOpacity
                    key={room}
                    className={`px-4 py-2 rounded-full mr-2 ${
                      task?.room === room 
                        ? 'bg-blue-500' 
                        : 'bg-gray-100'
                    }`}
                    onPress={() => setTask({ ...task, room })}
                  >
                    <Text className={`text-sm font-medium ${
                      task?.room === room 
                        ? 'text-white' 
                        : 'text-gray-600'
                    }`}>
                      {room}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Priority
              </Text>
              <View className="flex-row justify-between">
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    className={`flex-1 py-3 rounded-lg items-center mx-1 ${
                      task?.priority === priority 
                        ? 'border-2 border-gray-700' 
                        : ''
                    }`}
                    style={{
                      backgroundColor: getPriorityColor(priority).backgroundColor
                    }}
                    onPress={() => setTask({ ...task, priority })}
                  >
                    <Text 
                      className="text-sm font-semibold"
                      style={{ color: getPriorityColor(priority).color }}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  </Modal>
);

export default TaskFormModal;
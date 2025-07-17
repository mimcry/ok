// TaskItem.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskItemProps } from '@/types/checklist';

const TaskItem: React.FC<TaskItemProps> = ({
  item,
  onEdit,
  onDelete,
  getPriorityColor,
}) => (
  <View style={styles.taskCard}>
    <View style={styles.taskContent}>
      <Text style={styles.taskTitle}>{item.task}</Text>
      <View style={styles.taskMeta}>
        <View style={[styles.priorityBadge, getPriorityColor(item.priority)]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority).color }]}>
            {item.priority.toUpperCase()}
          </Text>
        </View>
        {item.estimatedTime && (
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.timeText}>{item.estimatedTime} min</Text>
          </View>
        )}
      </View>
    </View>
    <View style={styles.taskActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onEdit(item)}
      >
        <Ionicons name="create-outline" size={20} color="#3B82F6" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  taskActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default TaskItem;
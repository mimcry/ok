import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react-native';

type AlertType = 'warning' | 'danger'|'success' | 'default'| string| undefined;

type CustomAlertProps = {
  visible: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  type?: AlertType | undefined;
  confirmText?: string;
  cancelText?: string;
  hideCancel?: boolean; 
};

const CustomAlert: React.FC<CustomAlertProps> = ({ 
  visible, 
  title = "Alert", 
  message, 
  onCancel, 
  onConfirm, 
  type = 'default',
  confirmText = 'OK',
  cancelText = 'Cancel',
  hideCancel=false
}) => {
  
  // Get styling and icon based on alert type
  const getAlertConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: <AlertTriangle size={24} color="#FF9800" />,
          confirmButtonColor: '#FF9800',
          titleColor: '#FF9800'
        };
      case 'danger':
        return {
          icon: <AlertCircle size={24} color="#F44336" />,
          confirmButtonColor: '#F44336',
          titleColor: '#F44336'
        };
        case 'success':
        return {
          icon: <CheckCircle size={24} color="#4CAF50" />,
          confirmButtonColor: '#4CAF50',
          titleColor: '#4CAF50'
        };
      default:
        return {
          icon: null,
          confirmButtonColor: '#4925E9',
          titleColor: '#000000'
        };
    }
  };

  const alertConfig = getAlertConfig();

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            {alertConfig.icon && (
              <View style={styles.iconContainer}>
                {alertConfig.icon}
              </View>
            )}
            <Text style={[styles.title, { color: alertConfig.titleColor }]}>{title}</Text>
          </View>
          
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonRow}>
  {!hideCancel && (
    <TouchableOpacity 
      onPress={onCancel} 
      style={[styles.button, styles.cancelButton]}
    >
      <Text style={styles.cancelText}>{cancelText}</Text>
    </TouchableOpacity>
  )}

  <TouchableOpacity 
    onPress={onConfirm} 
    style={[
      styles.button, 
      styles.confirmButton,
      { backgroundColor: alertConfig.confirmButtonColor },
      hideCancel && { flex: 1, marginHorizontal: 0 } // center align if no cancel
    ]}
  >
    <Text style={styles.confirmText}>{confirmText}</Text>
  </TouchableOpacity>
</View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CustomAlert;
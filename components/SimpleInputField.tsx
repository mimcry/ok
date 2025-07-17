
import { EyeIcon, EyeOffIcon } from "lucide-react-native";
import { View,TextInput,Text, TouchableOpacity } from "react-native";
export const SimpleInputField = ({ 
    label, 
    value, 
    setValue, 
    placeholder, 
    error, 
    secureTextEntry = false,
    keyboardType = "default",
    showPasswordToggle = false,
    passwordVisible = false,
    togglePasswordVisibility = () => {},
    testID
  }) => (
    <View>
      <Text className="text-gray-700 mb-2 font-medium">{label}</Text>
      <View className="relative flex-row items-center">
        <TextInput
          className={`border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-lg px-4 py-3 text-gray-700 flex-1 bg-gray-50`}
          placeholder={placeholder}
          value={value}
          onChangeText={setValue}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          testID={testID}
          // These props help maintain focus
          blurOnSubmit={false}
          autoCorrect={false}
          spellCheck={false}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            className="absolute right-3"
            onPress={togglePasswordVisibility}
            accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? (
              <EyeOffIcon size={20} color="#6B7280" />
            ) : (
              <EyeIcon size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      )}
    </View>
  );
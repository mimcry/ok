import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  HelpCircle,
  BookOpen,
  MessageSquare,
  FileText,
  ExternalLink,
  Send
} from 'lucide-react-native';
import { useAppToast } from '@/hooks/toastNotification';

// FAQ item interface
interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// FAQ section component props
interface FAQSectionProps {
  faqs: FAQItem[];
}

// Contact form state interface
interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Resource item interface
interface ResourceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

// Accordion component for FAQ items
const AccordionItem: React.FC<{ item: FAQItem }> = ({ item }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <View className="mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
      <TouchableOpacity 
        className="flex-row justify-between items-center p-4"
        onPress={() => setExpanded(!expanded)}
      >
        <Text className="text-lg font-medium flex-1 text-gray-800">{item.question}</Text>
        {expanded ? (
          <ChevronUp size={20} color="#4F46E5" />
        ) : (
          <ChevronDown size={20} color="#4F46E5" />
        )}
      </TouchableOpacity>
      
      {expanded && (
        <View className="p-4 pt-0 bg-gray-50">
          <Text className="text-base text-gray-700 leading-relaxed">{item.answer}</Text>
        </View>
      )}
    </View>
  );
};

// FAQ Section component
const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <HelpCircle size={20} color="#4F46E5" />
        <Text className="text-xl font-bold ml-2 text-gray-800">Frequently Asked Questions</Text>
      </View>
      
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} item={faq} />
      ))}
    </View>
  );
};

// Contact form component
const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const toast = useAppToast();

  const handleSubmit = async (): Promise<void> => {
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      toast.success('Your message has been sent successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="bg-white rounded-lg shadow-sm p-5 mb-8">
      <View className="flex-row items-center mb-4">
        <MessageSquare size={20} color="#4F46E5" />
        <Text className="text-xl font-bold ml-2 text-gray-800">Contact Us</Text>
      </View>
      
      <View className="mb-4">
        <Text className="text-gray-700 mb-1 font-medium">Name *</Text>
        <TextInput
          className="bg-gray-100 p-3 rounded-md text-gray-800"
          placeholder="Your name"
          value={formData.name}
          onChangeText={(text: string) => setFormData({...formData, name: text})}
        />
      </View>
      
      <View className="mb-4">
        <Text className="text-gray-700 mb-1 font-medium">Email *</Text>
        <TextInput
          className="bg-gray-100 p-3 rounded-md text-gray-800"
          placeholder="your.email@example.com"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text: string) => setFormData({...formData, email: text})}
        />
      </View>
      
      <View className="mb-4">
        <Text className="text-gray-700 mb-1 font-medium">Subject</Text>
        <TextInput
          className="bg-gray-100 p-3 rounded-md text-gray-800"
          placeholder="What's this about?"
          value={formData.subject}
          onChangeText={(text: string) => setFormData({...formData, subject: text})}
        />
      </View>
      
      <View className="mb-4">
        <Text className="text-gray-700 mb-1 font-medium">Message *</Text>
        <TextInput
          className="bg-gray-100 p-3 rounded-md text-gray-800 min-h-[100px]"
          placeholder="How can we help you?"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={formData.message}
          onChangeText={(text: string) => setFormData({...formData, message: text})}
        />
      </View>
      
      <TouchableOpacity
        className="bg-primary py-3 px-4 rounded-lg flex-row justify-center items-center"
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Send size={18} color="#ffffff" />
            <Text className="text-white font-bold ml-2">Send Message</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Resources section component
const ResourcesSection: React.FC = () => {
  const resources: ResourceItem[] = [
    {
      id: '1',
      title: 'User Guide',
      description: 'Learn how to use all features of the app',
      icon: <BookOpen size={20} color="#4F46E5" />,
      action: () => Linking.openURL('https://example.com/user-guide')
    },
    {
      id: '2',
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: <FileText size={20} color="#4F46E5" />,
      action: () => Linking.openURL('https://example.com/tutorials')
    }
  ];

  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <BookOpen size={20} color="#4F46E5" />
        <Text className="text-xl font-bold ml-2 text-gray-800">Resources</Text>
      </View>
      
      {resources.map((resource) => (
        <TouchableOpacity 
          key={resource.id}
          className="bg-white rounded-lg shadow-sm p-4 mb-3 flex-row items-center"
          onPress={resource.action}
        >
          <View className="mr-3">
            {resource.icon}
          </View>
          <View className="flex-1">
            <Text className="text-lg font-medium text-gray-800">{resource.title}</Text>
            <Text className="text-gray-600">{resource.description}</Text>
          </View>
          <ExternalLink size={18} color="#4F46E5" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Contact info section component
const ContactInfoSection: React.FC = () => {
  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <Phone size={20} color="#4F46E5" />
        <Text className="text-xl font-bold ml-2 text-gray-800">Contact Information</Text>
      </View>
      
      <View className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <View className="flex-row items-center mb-3">
          <Mail size={18} color="#4F46E5" />
          <TouchableOpacity onPress={() => Linking.openURL('mailto:salon.neatly@gmail.com')}>
            <Text className="text-primary text-base ml-2">salon.neatly@gmail.com</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center">
          <Phone size={18} color="#4F46E5" />
          <TouchableOpacity onPress={() => Linking.openURL('tel:+977 9860428022')}>
            <Text className="text-primary text-base ml-2">+977 9860428022</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Main component
const HelpAndSupport: React.FC = () => {
  // FAQ data - can be moved to a separate file or fetched from API
  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I add a new property?',
      answer: 'To add a new property, navigate to the Properties tab and tap on the + button in the bottom right corner. Fill in the required information about your property and save it.'
    },
    {
      id: '2',
      question: 'How do I create a job for my property?',
      answer: 'First, make sure you have at least one property added. Then, go to the Jobs tab and tap on the briefcase icon in the bottom right corner. Select a property, fill in the job details, and tap Create Job.'
    },
    {
      id: '3',
      question: 'How do I delete a property?',
      answer: 'On the Properties tab, find the property you want to delete. Swipe left on the property card or tap the property options menu (usually three dots) and select Delete. Confirm your action when prompted. Please note that deleting a property will also delete all jobs associated with it.'
    },
    {
      id: '4',
      question: 'Can I edit a job after creating it?',
      answer: 'Yes, you can edit a job. Find the job in the Jobs tab, tap on it to view details, then tap the Edit button. Make your changes and save the updated information.'
    },
    {
      id: '5',
      question: 'How do I mark a job as completed?',
      answer: 'In the Jobs tab, find the job you want to mark as completed. Tap on the job card and use the status toggle or completion button to mark it as done. The job status will update and it will be flagged as completed.'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="auto" />
      
      <ScrollView 
        className="flex-1 px-4 pt-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
     
        <FAQSection faqs={faqs} />
        <ResourcesSection />
        <ContactInfoSection />
        <ContactForm />
        
        <View className="items-center mb-10 mt-2">
          <Text className="text-gray-500 text-center">
            Property Manager App v1.0.0
          </Text>
          <Text className="text-gray-400 text-sm mt-1 text-center">
            © 2025 Property Manager Inc. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpAndSupport;
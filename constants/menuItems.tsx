import { router } from "expo-router";
import {
  Building,
  DollarSign,
  Briefcase,
  UserRoundPlus,
  Shield,
  Settings,
  HelpCircle,
  Bell,
  Plus,
  Users,
  Languages,
  SquareCheckBig,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { MenuItem } from "@/types/menuItems";
import { useAppToast } from "@/hooks/toastNotification";
export const MenuItemsforcleaners = () => {
  const [notifications, setNotifications] = useState<boolean>(true);
const [language,setLanguage]=useState<boolean>(false)
const toast =useAppToast()
  useEffect(() => {
    if (language) {
     toast.warning("This service will be available soon!")
    }
  }, [language]);
  const menuItems: MenuItem[] = [
    {
      id: "property",
      title: "Assigned Properties",
      icon: <Building size={20} color="#4925E9" />,
      type: "link",
      navigate: () => router.push("/(root_cleaner)/(profile)/propertymanager"),
    },
    {
      id: "payment",
      title: "Payments History",
      icon: <DollarSign size={20} color="#4925E9" />,
      type: "link",
      navigate: () => router.push("/(root_cleaner)/(profile)/payment"),
    },
    {
      id: "jobhistory",
      title: "Jobs History",
      icon: <Briefcase size={20} color="#4925E9" />,
      type: "link",
      navigate: () => router.push("/(root_cleaner)/(profile)/jobhistory"),
    },
    
    {
      id: "connecttocleaners",
      title: "Connect with Host",
      icon: <UserRoundPlus size={20} color="#4925E9" />,
      type: "link",
      navigate: () => router.push("/(root_cleaner)/(profile)/connecttohost"),
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: <Shield size={20} color="#4925E9" />,
      type: "link",
      navigate: () => router.push("/(helper)/security&privacy"),
    },
    {
      id: "settings",
      title: "App Settings",
      icon: <Settings size={20} color="#4925E9" />,
      type: "link",
      navigate: () => router.push("/(root_cleaner)/(profile)/appsettings"),
    },
    {
      id: "help",
      title: "Help & Support",
      icon: <HelpCircle size={20} color="#4925E9" />,
      type: "link",
      navigate: () => router.push("/(helper)/help&support"),
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <Bell size={20} color="#4925E9" />,
      type: "toggle",
      value: notifications,
      onToggle: () => setNotifications((prev) => !prev),
    },
      {
      id: "chnagelanguage",
      title: "Chnage Language to Spanish",
      icon: <Languages size={20} color="#4925E9" />,
      type: "toggle",
      value: language,
      onToggle: () => setLanguage((prev) => !prev),
    },
  ];

  return menuItems;
};
export const MenuItemsforhosts = () => {
  const [notifications, setNotifications] = useState<boolean>(true);

  const menuItems: MenuItem[] = [
    {
         id: "property",
         title: " My Properties",
         icon: <Building size={20} color="#4925E9" />,
         type: "link",
         navigate: () => router.push("/(root_host)/(profile)/propertymanager"),
       },
       {
         id: "payment",
         title: "Payments History",
         icon: <DollarSign size={20} color="#4925E9" />,
         type: "link",
         navigate: () => router.push("/(root_host)/(profile)/payment")
       },
       {
         id: "Propertyintergation",
         title: "Property Intergation",
         icon: <Building size={20} color="#4925E9" />,
         type: "link",
         navigate: () => router.push("/(root_host)/(profile)/propertyintegration")
       },
       {
         id: "connecttocleaners",
         title: "Connect with Cleaner",
         icon: <UserRoundPlus size={20} color="#4925E9" />,
         type: "link",
         navigate: () => router.push("/(root_host)/(profile)/connecttocleaners"),
       },
        {
         id: "cleanersmarketplace",
         title: "Find a cleaner",
         icon: <Users size={20} color="#4925E9" />,
         type: "link",
         navigate: () => router.push("/(helper)/cleanermarketplace"),
       },
        {
      id: "Cleanechecklists",
      title: "Cleaner Checklists",
      icon: <SquareCheckBig size={20} color="#4925E9" />,
      type: "link",
      navigate: () => router.push("/(helper)/cleanerchecklist"),
    },
       {
         id: "security",
         title: "Security & Privacy",
         icon: <Shield size={20} color="#4925E9" />,
         type: "link",
         navigate: () => router.push("/(helper)/security&privacy")
       },
       {
         id: "settings",
         title: "App Settings",
         icon: <Settings size={20} color="#4925E9" />,
         type: "link",
         navigate: () => router.push("/(root_host)/(profile)/appsettings"),
       },
       {
         id: "help",
         title: "Help & Support",
         icon: <HelpCircle size={20} color="#4925E9" />,
         type: "link",
         navigate: () => router.push("/(helper)/help&support")
       },
       {
         id: "notifications",
         title: "Notifications",
         icon: <Bell size={20} color="#4925E9" />,
         type: "toggle",
         value: notifications,
         onToggle: () => setNotifications(!notifications),
       },
  ];

  return menuItems;
};

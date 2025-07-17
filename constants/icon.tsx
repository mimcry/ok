import * as Icons from 'lucide-react-native';
import { LucideIcon, LucideProps } from 'lucide-react-native';

// Exclude functions and non-icon exports from Icons
type IconName = keyof Omit<typeof Icons, "createLucideIcon" | "icons">;

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

const Icon = ({ name, ...props }: IconProps) => {
  // Type assertion to ensure we get a valid icon component
  const LucideIcon = Icons[name] as LucideIcon;
  return LucideIcon ? <LucideIcon {...props} /> : null;
};

export default Icon;
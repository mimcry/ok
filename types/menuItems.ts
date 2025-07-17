export type MenuItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  type: "link" | "toggle";
  value?: boolean;
  onToggle?: () => void;
  navigate?: () => void;
}
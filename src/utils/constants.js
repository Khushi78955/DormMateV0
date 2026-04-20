export const CHORE_TYPES = [
  { id: "cleaning", label: "Cleaning", icon: "🧹" },
  { id: "laundry", label: "Laundry", icon: "👕" },
  { id: "garbage", label: "Garbage", icon: "🗑️" },
  { id: "groceries", label: "Buying Groceries", icon: "🛒" },
  { id: "dishes", label: "Dishes", icon: "🍽️" },
  { id: "bathroom", label: "Bathroom", icon: "🚿" },
  { id: "mopping", label: "Mopping", icon: "🪣" },
];

export const MAINTENANCE_CATEGORIES = [
  { id: "electrical", label: "Electrical", icon: "⚡" },
  { id: "plumbing", label: "Plumbing", icon: "🔧" },
  { id: "wifi", label: "WiFi Issue", icon: "📶" },
  { id: "ac", label: "AC/Cooling", icon: "❄️" },
  { id: "fan", label: "Fan/Ceiling", icon: "💨" },
  { id: "furniture", label: "Furniture", icon: "🪑" },
  { id: "other", label: "Other", icon: "🔩" },
];

export const MAINTENANCE_STATUS = {
  PENDING: {
    label: "Pending",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  },
  RESOLVED: {
    label: "Resolved",
    color: "text-green-400 bg-green-400/10 border-green-400/30",
  },
};

export const ATTENDANCE_STATUSES = [
  { id: "hostel", label: "At Hostel", icon: "🏠", color: "text-green-400" },
  { id: "out", label: "Out", icon: "🚶", color: "text-yellow-400" },
  { id: "home", label: "Going Home", icon: "🏡", color: "text-blue-400" },
  { id: "class", label: "In Class", icon: "📚", color: "text-purple-400" },
  { id: "sleeping", label: "Sleeping", icon: "😴", color: "text-gray-400" },
];

export const ROOM_MOODS = [
  {
    id: "study",
    label: "Study Mode",
    icon: "📚",
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "chill",
    label: "Chill Mode",
    icon: "😎",
    color: "from-green-600 to-teal-600",
  },
  {
    id: "sleep",
    label: "Sleep Mode",
    icon: "🌙",
    color: "from-indigo-900 to-gray-900",
  },
  {
    id: "party",
    label: "Party Mode",
    icon: "🎉",
    color: "from-pink-600 to-purple-600",
  },
];

export const EXPENSE_CATEGORIES = [
  { id: "food", label: "Food", icon: "🍕", color: "#6c22ff" },
  { id: "groceries", label: "Groceries", icon: "🛒", color: "#22d3ee" },
  { id: "utilities", label: "Utilities", icon: "💡", color: "#f59e0b" },
  { id: "rent", label: "Rent", icon: "🏠", color: "#ef4444" },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: "🎮",
    color: "#8b5cf6",
  },
  {
    id: "transport",
    label: "Transport",
    icon: "🚗",
    color: "#10b981",
  },
  { id: "other", label: "Other", icon: "📦", color: "#6b7280" },
];

export const SHOPPING_CATEGORIES = [
  { id: "food", label: "Food", icon: "🥦" },
  { id: "cleaning", label: "Cleaning", icon: "🧴" },
  { id: "toiletries", label: "Toiletries", icon: "🪥" },
  { id: "electronics", label: "Electronics", icon: "🔌" },
  { id: "other", label: "Other", icon: "📦" },
];

export const FOOD_OPTIONS = [
  "Pizza",
  "Burger",
  "Momos",
  "Maggi",
  "Biryani",
  "Sandwich",
  "Noodles",
  "Rolls",
];

export const BADGE_DEFINITIONS = [
  {
    id: "chore_master",
    label: "Chore Master",
    icon: "🏆",
    description: "Completed 10+ chores",
  },
  {
    id: "clean_freak",
    label: "Clean Freak",
    icon: "✨",
    description: "Cleaned 5 weeks in a row",
  },
  {
    id: "expense_guru",
    label: "Expense Guru",
    icon: "💰",
    description: "Settled all dues on time",
  },
  {
    id: "peace_keeper",
    label: "Peace Keeper",
    icon: "☮️",
    description: "Zero noise complaints",
  },
  {
    id: "social_planner",
    label: "Social Planner",
    icon: "🎯",
    description: "Organized 3 group orders",
  },
];

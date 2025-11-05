// Animation variants for Framer Motion
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Note card hover animation
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Modal backdrop
export const backdropVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Modal content
export const modalVariant = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

// Color options for notes (optional feature)
export const NOTE_COLORS = [
  { name: 'Default', value: 'bg-white dark:bg-gray-800' },
  { name: 'Red', value: 'bg-red-50 dark:bg-red-900/20' },
  { name: 'Orange', value: 'bg-orange-50 dark:bg-orange-900/20' },
  { name: 'Yellow', value: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { name: 'Green', value: 'bg-green-50 dark:bg-green-900/20' },
  { name: 'Blue', value: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Purple', value: 'bg-purple-50 dark:bg-purple-900/20' },
  { name: 'Pink', value: 'bg-pink-50 dark:bg-pink-900/20' },
];

// Transition settings
export const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

export const springTransition = {
  type: 'spring',
  damping: 20,
  stiffness: 300,
};

// Formatting toolbar buttons for the text editor
export const FORMATTING_BUTTONS = [
  { command: 'bold', icon: 'Bold', label: 'Bold' },
  { command: 'italic', icon: 'Italic', label: 'Italic' },
  { command: 'underline', icon: 'Underline', label: 'Underline' },
  { command: 'strikethrough', icon: 'Strikethrough', label: 'Strikethrough' },
  { command: 'insertUnorderedList', icon: 'List', label: 'Bullet List' },
  { command: 'insertOrderedList', icon: 'ListOrdered', label: 'Numbered List' },
];
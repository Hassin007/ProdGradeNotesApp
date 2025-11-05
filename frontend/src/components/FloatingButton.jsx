import { motion } from 'framer-motion';
import { Plus, Edit3 } from 'lucide-react';
import { scaleIn } from '../utils/constants';

const FloatingButton = ({ onClick, isEditing = false }) => {
  return (
    <motion.button
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
    >
      {isEditing ? (
        <Edit3 className="w-6 h-6" />
      ) : (
        <Plus className="w-6 h-6" />
      )}
    </motion.button>
  );
};

export default FloatingButton;
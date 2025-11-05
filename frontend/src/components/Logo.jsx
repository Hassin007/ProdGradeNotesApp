import { motion } from 'framer-motion';
import { useState } from 'react';

const AnimatedCreativeLogo = ({ 
  size = 32, 
  className = "",
  isAnimating = true,
  animationType = "draw",
  onHover = true
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants
  const containerVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const drawVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        pathLength: { duration: 1.5, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  };

  const fadeInVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const bounceVariants = {
    initial: { scale: 0 },
    animate: { 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 8,
        delay: 0.8
      }
    },
    hover: { 
      scale: 1.2,
      rotate: 15,
      transition: { duration: 0.3 }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const starVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 10,
        delay: 1.2
      }
    },
    hover: {
      scale: 1.1,
      rotate: 10,
      transition: { duration: 0.4 }
    }
  };

  const getAnimationProps = (type) => {
    switch (type) {
      case "draw":
        return { variants: drawVariants };
      case "fade":
        return { variants: fadeInVariants };
      case "bounce":
        return { variants: bounceVariants };
      default:
        return { variants: drawVariants };
    }
  };

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      initial="initial"
      animate={isAnimating ? "animate" : "initial"}
      whileHover={onHover ? "hover" : undefined}
      whileTap="tap"
      variants={containerVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Animated Background */}
        <motion.rect
          width="32"
          height="32"
          rx="6"
          fill="url(#gradient-creative)"
          variants={pulseVariants}
        />
        
        {/* Stacked notes - First layer */}
        <motion.rect
          x="8"
          y="8"
          width="16"
          height="16"
          rx="2"
          stroke="white"
          strokeWidth="1.2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        
        {/* Stacked notes - Second layer */}
        <motion.rect
          x="10"
          y="10"
          width="12"
          height="12"
          rx="1"
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0.8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        
        {/* Creative 'N' lines - Left vertical */}
        <motion.path
          d="M13 14L13 20"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />
        
        {/* Creative 'N' lines - Diagonal */}
        <motion.path
          d="M13 14L17 20"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        />
        
        {/* Creative 'N' lines - Right vertical */}
        <motion.path
          d="M17 14L17 20"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        />
        
        {/* Animated Star */}
        <motion.path
          d="M22 10L23 12L25 12.5L23.5 14L24 16L22 15L20 16L20.5 14L19 12.5L21 12L22 10Z"
          fill="white"
          fillOpacity="0.9"
          variants={starVariants}
        />

        {/* Sparkle effect on hover */}
        {isHovered && (
          <>
            <motion.circle
              cx="24"
              cy="12"
              r="1"
              fill="white"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.circle
              cx="20"
              cy="9"
              r="0.8"
              fill="white"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            />
          </>
        )}
        
        <defs>
          <linearGradient id="gradient-creative" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB"/>
            <stop offset="1" stopColor="#7C3AED"/>
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};

export default AnimatedCreativeLogo;
import React from 'react';
import { motion } from 'motion/react';

const itemVariants = {
  initial: {
    opacity: 0.001,
    y: 20,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
      mass: 0.9,
    },
  },
};

export interface BlurRevealItemProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const BlurRevealItem: React.FC<BlurRevealItemProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      variants={itemVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay }}
      className={className}
      style={{ willChange: 'transform, filter, opacity' }}
    >
      {children}
    </motion.div>
  );
};

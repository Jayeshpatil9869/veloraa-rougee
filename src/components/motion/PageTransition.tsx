import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PageTransitionProps {
  children: React.ReactNode;
  routeKey: string;
  onExitComplete?: () => void;
}

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: [0.27, 0, 0.51, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  routeKey,
  onExitComplete,
}) => {
  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        if (onExitComplete) onExitComplete();
      }}
    >
      <motion.div
        key={routeKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

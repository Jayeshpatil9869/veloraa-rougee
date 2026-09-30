import React from 'react';
import { motion, HTMLMotionProps, Variants } from 'motion/react';

/* ========================================================================= */
/*                          1. SCROLL REVEAL WRAPPER                         */
/* ========================================================================= */

export interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  blur?: boolean;
  className?: string;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.65,
  distance = 28,
  blur = true,
  className = '',
  once = true,
  ...props
}) => {
  const getInitialOffset = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'none':
      default:
        return { x: 0, y: 0 };
    }
  };

  const offset = getInitialOffset();

  const variants: Variants = {
    hidden: {
      opacity: 0.001,
      x: offset.x,
      y: offset.y,
      filter: blur ? 'blur(8px)' : 'none',
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // Smooth cubic-bezier deceleration
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
      variants={variants}
      className={className}
      style={{ willChange: 'transform, opacity, filter' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/* ========================================================================= */
/*                    2. STAGGERED GRID CONTAINER & ITEMS                    */
/* ========================================================================= */

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  stagger?: number;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  once?: boolean;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  stagger,
  staggerDelay = 0.08,
  delayChildren = 0.05,
  className = '',
  once = true,
  ...props
}) => {
  const finalStagger = stagger !== undefined ? stagger : staggerDelay;
  const containerVariants: Variants = {
    hidden: { opacity: 0.001 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: finalStagger,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      variants={containerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  blur?: boolean;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = '',
  distance = 24,
  blur = true,
  ...props
}) => {
  const itemVariants: Variants = {
    hidden: {
      opacity: 0.001,
      y: distance,
      filter: blur ? 'blur(6px)' : 'none',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      className={className}
      style={{ willChange: 'transform, opacity, filter' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/* ========================================================================= */
/*                           3. SCALE & FADE IN                              */
/* ========================================================================= */

interface ScaleRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  scaleStart?: number;
  className?: string;
}

export const ScaleReveal: React.FC<ScaleRevealProps> = ({
  children,
  delay = 0,
  duration = 0.7,
  scaleStart = 0.94,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0.001, scale: scaleStart, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      style={{ willChange: 'transform, opacity, filter' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

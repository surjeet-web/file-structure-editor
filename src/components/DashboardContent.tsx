import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTreeStore } from '@/store/tree-store';
import { PromptGenerator } from './PromptGenerator';
import { TextEditor } from './TextEditor';
import { TreeEditor } from './TreeEditor';
import { CodeEditor } from './CodeEditor';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

export const DashboardContent = () => {
  const { activeView } = useTreeStore();

  const renderContent = () => {
    switch (activeView) {
      case 'prompt':
        return (
          <motion.div
            key="prompt"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-card border rounded-lg overflow-hidden h-full"
          >
            <PromptGenerator />
          </motion.div>
        );
      
      case 'text':
        return (
          <motion.div
            key="text"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-card border rounded-lg overflow-hidden h-full"
          >
            <TextEditor />
          </motion.div>
        );
      
      case 'tree':
        return (
          <motion.div
            key="tree"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-card border rounded-lg overflow-hidden h-full"
          >
            <TreeEditor />
          </motion.div>
        );
      
      case 'code':
        return (
          <motion.div
            key="code"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-card border rounded-lg overflow-hidden h-full"
          >
            <CodeEditor />
          </motion.div>
        );
      
      case 'editors':
        return (
          <motion.div
            key="editors"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"
          >
            <motion.div 
              variants={contentVariants}
              className="bg-card border rounded-lg overflow-hidden"
            >
              <TextEditor />
            </motion.div>
            
            <motion.div 
              variants={contentVariants}
              className="bg-card border rounded-lg overflow-hidden"
            >
              <TreeEditor />
            </motion.div>
            
            <motion.div 
              variants={contentVariants}
              className="bg-card border rounded-lg overflow-hidden"
            >
              <CodeEditor />
            </motion.div>
          </motion.div>
        );
      
      default:
        return (
          <motion.div
            key="default"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-card border rounded-lg overflow-hidden h-full"
          >
            <PromptGenerator />
          </motion.div>
        );
    }
  };

  return (
    <motion.main 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 sm:px-6 py-6 flex-1 min-h-0"
    >
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </motion.main>
  );
};
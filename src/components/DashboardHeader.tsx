import React from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTreeStore } from '@/store/tree-store';
import { 
  Download, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export const DashboardHeader = () => {
  const { generateZip, isGeneratingZip, parsedTree, errors, warnings } = useTreeStore();

  const handleDownload = async () => {
    await generateZip();
  };

  const statusColor = errors.length > 0 ? 'destructive' : warnings.length > 0 ? 'warning' : 'success';
  const StatusIcon = errors.length > 0 ? AlertCircle : CheckCircle;

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border-b sticky top-0 z-40"
    >
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                File Structure Dashboard
              </h1>
              
              <Badge variant={statusColor === 'destructive' ? 'destructive' : 'secondary'} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {errors.length > 0 ? `${errors.length} errors` : 
                 warnings.length > 0 ? `${warnings.length} warnings` : 'Valid'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleDownload}
                disabled={isGeneratingZip || parsedTree.length === 0 || errors.length > 0}
                className="gap-2 text-sm px-4 h-10"
              >
                {isGeneratingZip ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Download ZIP</span>
                <span className="sm:hidden">ZIP</span>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                className="gap-2 text-sm px-4 h-10"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Assistant</span>
                <span className="sm:hidden">AI</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
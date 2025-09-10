import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { 
  FolderTree,
  Zap,
  FileText,
  TreePine,
  Code2,
  Settings,
  HelpCircle,
  Sparkles,
  Upload,
  Download
} from 'lucide-react';
import { useTreeStore } from '@/store/tree-store';

const mainSections = [
  {
    title: 'Generate Prompt',
    icon: Sparkles,
    id: 'prompt',
    description: 'AI-powered prompt generation'
  },
  {
    title: 'Editors',
    icon: Code2,
    id: 'editors',
    description: 'Text, Tree & Code editors'
  }
];

const editorItems = [
  {
    title: 'Text Editor',
    icon: FileText,
    id: 'text',
    description: 'Raw structure input'
  },
  {
    title: 'Tree View',
    icon: TreePine,
    id: 'tree',
    description: 'Interactive tree'
  },
  {
    title: 'Code Editor',
    icon: Code2,
    id: 'code',
    description: 'Edit file contents'
  }
];

export const DashboardSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { parsedTree, errors, activeView, setActiveView } = useTreeStore();

  const totalFiles = React.useMemo(() => {
    const countFiles = (nodes: any[]): number => {
      return nodes.reduce((count, node) => {
        if (node.type === 'file') return count + 1;
        if (node.children) return count + countFiles(node.children);
        return count;
      }, 0);
    };
    return countFiles(parsedTree);
  }, [parsedTree]);

  const totalFolders = React.useMemo(() => {
    const countFolders = (nodes: any[]): number => {
      return nodes.reduce((count, node) => {
        if (node.type === 'folder') {
          const childCount = node.children ? countFolders(node.children) : 0;
          return count + 1 + childCount;
        }
        return count;
      }, 0);
    };
    return countFolders(parsedTree);
  }, [parsedTree]);

  return (
    <Sidebar className="border-r bg-card">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-md">
            <FolderTree className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground">File Structure</h2>
              <p className="text-sm text-muted-foreground">Generator</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">
              {totalFolders} folders
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {totalFiles} files
            </Badge>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu className="space-y-2">
          {mainSections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fade-in"
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === section.id || (section.id === 'editors' && ['text', 'tree', 'code'].includes(activeView))}
                  onClick={() => setActiveView(section.id)}
                  className="w-full justify-start"
                >
                  <section.icon className="h-4 w-4" />
                  <span>{section.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </motion.div>
          ))}
        </SidebarMenu>

        {/* Editors submenu */}
        {!collapsed && (activeView === 'editors' || ['text', 'tree', 'code'].includes(activeView)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="ml-6 mt-2 space-y-1"
          >
            {editorItems.map((item) => (
              <SidebarMenuButton
                key={item.id}
                isActive={activeView === item.id}
                onClick={() => setActiveView(item.id)}
                className="w-full justify-start text-sm"
                size="sm"
              >
                <item.icon className="h-3 w-3" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            ))}
          </motion.div>
        )}

        {!collapsed && errors.length > 0 && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <Badge variant="destructive" className="mb-2 text-xs">
              {errors.length} error{errors.length !== 1 ? 's' : ''}
            </Badge>
            <div className="text-xs text-muted-foreground space-y-1">
              {errors.slice(0, 2).map((error, index) => (
                <div key={index} className="truncate">
                  {error}
                </div>
              ))}
              {errors.length > 2 && (
                <div>+{errors.length - 2} more...</div>
              )}
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <div className="mb-1">Privacy first • Client-side only</div>
            <div>Built with React + TypeScript</div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
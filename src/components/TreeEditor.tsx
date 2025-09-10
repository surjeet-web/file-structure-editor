import React, { useState, useRef } from 'react';
import { useTreeStore } from '@/store/tree-store';
import { TreeNode } from '@/types/tree';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  FolderOpen, 
  File, 
  Upload, 
  Trash2, 
  Plus, 
  Edit2,
  Check,
  X,
  FileText,
  Image,
  FileCode,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeFileName } from '@/utils/filename-sanitizer';

interface TreeItemProps {
  node: TreeNode;
  level: number;
  isLast: boolean;
  ancestors: boolean[];
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'scss':
    case 'json':
      return FileCode;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return Image;
    case 'zip':
    case 'tar':
    case 'gz':
      return Archive;
    default:
      return File;
  }
};

const TreeItem: React.FC<TreeItemProps> = ({ node, level, isLast, ancestors }) => {
  const { selectedNodeId, selectNode, selectFile, updateNode, deleteNode, addNode, uploadFile } = useTreeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.displayName || node.name);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildType, setNewChildType] = useState<'file' | 'folder'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isSelected = selectedNodeId === node.id;
  const isFolder = node.type === 'folder';
  const isExpanded = node.isExpanded ?? true;
  const FileIcon = isFolder ? (isExpanded ? FolderOpen : Folder) : getFileIcon(node.name);
  
  const handleToggleExpanded = () => {
    if (isFolder) {
      updateNode(node.id, { isExpanded: !isExpanded });
    }
  };
  
  const handleSelect = () => {
    selectNode(node.id);
    // If it's a file, also select it for the code editor
    if (node.type === 'file') {
      selectFile(node.id);
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditName(node.displayName || node.name);
  };
  
  const handleSaveEdit = () => {
    if (editName.trim() && editName !== (node.displayName || node.name)) {
      // Update both name (clean) and displayName (for display)
      updateNode(node.id, { 
        name: sanitizeFileName(editName.trim()),
        displayName: editName.trim() 
      });
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditName(node.displayName || node.name);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    deleteNode(node.id);
  };
  
  const handleAddChild = () => {
    if (isFolder) {
      setIsAddingChild(true);
      setNewChildName('');
      setNewChildType('file');
    }
  };
  
  const handleSaveNewChild = () => {
    if (newChildName.trim()) {
      addNode(node.id, {
        name: sanitizeFileName(newChildName.trim()),
        displayName: newChildName.trim(),
        type: newChildType,
        children: newChildType === 'folder' ? [] : undefined,
      });
    }
    setIsAddingChild(false);
  };
  
  const handleCancelNewChild = () => {
    setIsAddingChild(false);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && node.type === 'file') {
      uploadFile(node.id, file);
    }
  };
  
  const renderTreeLines = () => {
    const lines = [];
    
    // Vertical lines for ancestors
    for (let i = 0; i < level; i++) {
      lines.push(
        <div
          key={i}
          className={cn(
            "absolute w-px bg-border/40",
            "top-0 bottom-0",
            i === level - 1 ? (isLast ? "h-4" : "h-full") : "h-full"
          )}
          style={{ left: `${i * 24 + 12}px` }}
        />
      );
    }
    
    // Horizontal line
    if (level > 0) {
      lines.push(
        <div
          key="horizontal"
          className="absolute w-3 h-px bg-border/40 top-4"
          style={{ left: `${(level - 1) * 24 + 12}px` }}
        />
      );
    }
    
    return lines;
  };
  
  return (
    <div className="relative">
      {renderTreeLines()}
      
      <div
        className={cn(
          "group flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/50 transition-all duration-200",
          isSelected && "bg-accent/20 border border-accent/30",
          "cursor-pointer"
        )}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse button */}
        {isFolder && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpanded();
            }}
          >
            <FileIcon className="h-4 w-4 text-syntax-folder" />
          </Button>
        )}
        
        {!isFolder && (
          <div className="h-6 w-6 flex items-center justify-center">
            <FileIcon className="h-4 w-4 text-syntax-file" />
          </div>
        )}
        
        {/* Name */}
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="h-7 text-sm font-mono"
              autoFocus
              onBlur={handleSaveEdit}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleSaveEdit}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleCancelEdit}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-mono text-sm truncate">
              {node.displayName || node.name}
              {isFolder && !node.displayName && '/'}
            </span>
            
            {node.uploadedFile && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                <Upload className="h-3 w-3 mr-1" />
                {(node.uploadedFile.size / 1024).toFixed(1)}kb
              </Badge>
            )}
            
            {node.comment && (
              <span className="text-xs text-syntax-comment italic truncate">
                # {node.comment}
              </span>
            )}
          </div>
        )}
        
        {/* Actions */}
        {isSelected && !isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            
            {node.type === 'file' && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="h-3 w-3" />
                </Button>
              </>
            )}
            
            {isFolder && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddChild();
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Add child form */}
      {isAddingChild && (
        <div
          className="flex items-center gap-2 py-1 px-2 ml-6 bg-muted/30 rounded-md"
          style={{ marginLeft: `${(level + 1) * 24 + 8}px` }}
        >
          <select
            value={newChildType}
            onChange={(e) => setNewChildType(e.target.value as 'file' | 'folder')}
            className="h-7 text-sm bg-background border border-border rounded px-2"
          >
            <option value="file">File</option>
            <option value="folder">Folder</option>
          </select>
          
          <Input
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNewChild();
              if (e.key === 'Escape') handleCancelNewChild();
            }}
            placeholder="Enter name..."
            className="h-7 text-sm font-mono flex-1"
            autoFocus
          />
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleSaveNewChild}
          >
            <Check className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleCancelNewChild}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {/* Children */}
      {isFolder && isExpanded && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child, index) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              isLast={index === node.children!.length - 1}
              ancestors={[...ancestors, !isLast]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeEditor: React.FC = () => {
  const { parsedTree, errors, addNode } = useTreeStore();
  
  const handleAddRoot = () => {
    addNode(null, {
      name: 'new-folder',
      type: 'folder',
      children: [],
    });
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">File Structure</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRoot}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Root
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h4 className="font-medium text-destructive mb-2">Parsing Errors:</h4>
            <ul className="text-sm space-y-1 text-destructive/80">
              {errors.map((error, index) => (
                <li key={index} className="font-mono">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {parsedTree.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No file structure parsed</p>
            <p className="text-sm">Enter a tree structure in the text editor</p>
          </div>
        ) : (
          <div className="space-y-1">
            {parsedTree.map((node, index) => (
              <TreeItem
                key={node.id}
                node={node}
                level={0}
                isLast={index === parsedTree.length - 1}
                ancestors={[]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
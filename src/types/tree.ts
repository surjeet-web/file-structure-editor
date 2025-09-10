export interface TreeNode {
  id: string;
  name: string; // Clean filename for ZIP generation
  displayName?: string; // Original text for UI display (optional)
  type: 'file' | 'folder';
  children?: TreeNode[];
  uploadedFile?: File;
  content?: string;
  comment?: string;
  isExpanded?: boolean;
  level?: number;
}

export interface ParsedLine {
  content: string;
  level: number;
  isFolder: boolean;
  comment?: string;
  error?: string;
}

export interface ParseResult {
  tree: TreeNode[];
  errors: string[];
  warnings: string[];
}

export interface TreeState {
  rawText: string;
  parsedTree: TreeNode[];
  selectedNodeId: string | null;
  selectedFileId: string | null;
  undoStack: string[];
  redoStack: string[];
  errors: string[];
  warnings: string[];
  isGeneratingZip: boolean;
  activeView: string;
}

export interface TreeActions {
  setRawText: (text: string) => void;
  parseTree: () => void;
  selectNode: (nodeId: string | null) => void;
  selectFile: (fileId: string | null) => void;
  updateNode: (nodeId: string, updates: Partial<TreeNode>) => void;
  updateFileContent: (fileId: string, content: string) => void;
  deleteNode: (nodeId: string) => void;
  addNode: (parentId: string | null, node: Omit<TreeNode, 'id'>) => void;
  uploadFile: (nodeId: string, file: File) => void;
  generateZip: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  setActiveView: (view: string) => void;
}
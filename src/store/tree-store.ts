import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { TreeState, TreeActions, TreeNode } from '@/types/tree';
import { TreeParser } from '@/utils/tree-parser';

interface TreeStore extends TreeState, TreeActions {}

const initialState: TreeState = {
  rawText: `project/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── About.tsx
│   ├── utils/
│   │   └── helpers.ts
│   └── App.tsx
├── public/
│   ├── index.html
│   └── favicon.ico
├── package.json
└── README.md`,
  parsedTree: [],
  selectedNodeId: null,
  selectedFileId: null,
  undoStack: [],
  redoStack: [],
  errors: [],
  warnings: [],
  isGeneratingZip: false,
  activeView: 'prompt',
};

export const useTreeStore = create<TreeStore>()(
  immer((set, get) => ({
    ...initialState,

    setRawText: (text: string) => {
      set((state) => {
        // Save current state to undo stack
        state.undoStack.push(state.rawText);
        if (state.undoStack.length > 50) {
          state.undoStack.shift();
        }
        state.redoStack = [];
        
        state.rawText = text;
      });
      
      // Parse after setting text
      get().parseTree();
    },

    parseTree: () => {
      set((state) => {
        const result = TreeParser.parseTreeStructure(state.rawText);
        state.parsedTree = result.tree;
        state.errors = result.errors;
        state.warnings = result.warnings;
      });
    },

    selectNode: (nodeId: string | null) => {
      set((state) => {
        state.selectedNodeId = nodeId;
      });
    },

    selectFile: (fileId: string | null) => {
      set((state) => {
        state.selectedFileId = fileId;
        // Also select the node when selecting a file
        if (fileId) {
          state.selectedNodeId = fileId;
        }
      });
    },

    updateFileContent: (fileId: string, content: string) => {
      set((state) => {
        const updateFileRecursive = (nodes: TreeNode[]): boolean => {
          for (const node of nodes) {
            if (node.id === fileId && node.type === 'file') {
              node.content = content;
              return true;
            }
            if (node.children && updateFileRecursive(node.children)) {
              return true;
            }
          }
          return false;
        };
        
        updateFileRecursive(state.parsedTree);
      });
    },

    updateNode: (nodeId: string, updates: Partial<TreeNode>) => {
      set((state) => {
        const updateNodeRecursive = (nodes: TreeNode[]): boolean => {
          for (const node of nodes) {
            if (node.id === nodeId) {
              Object.assign(node, updates);
              return true;
            }
            if (node.children && updateNodeRecursive(node.children)) {
              return true;
            }
          }
          return false;
        };
        
        updateNodeRecursive(state.parsedTree);
        
        // Update raw text
        state.rawText = TreeParser.generateTreeText(state.parsedTree);
      });
    },

    deleteNode: (nodeId: string) => {
      set((state) => {
        const deleteNodeRecursive = (nodes: TreeNode[]): boolean => {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === nodeId) {
              nodes.splice(i, 1);
              return true;
            }
            if (nodes[i].children && deleteNodeRecursive(nodes[i].children!)) {
              return true;
            }
          }
          return false;
        };
        
        deleteNodeRecursive(state.parsedTree);
        
        // Update raw text
        state.rawText = TreeParser.generateTreeText(state.parsedTree);
        
        // Clear selection if deleted node was selected
        if (state.selectedNodeId === nodeId) {
          state.selectedNodeId = null;
        }
      });
    },

    addNode: (parentId: string | null, node: Omit<TreeNode, 'id'>) => {
      set((state) => {
        const newNode: TreeNode = {
          ...node,
          id: crypto.randomUUID(),
          isExpanded: true,
        };
        
        if (parentId === null) {
          state.parsedTree.push(newNode);
        } else {
          const addNodeRecursive = (nodes: TreeNode[]): boolean => {
            for (const parentNode of nodes) {
              if (parentNode.id === parentId) {
                if (parentNode.type === 'folder') {
                  if (!parentNode.children) parentNode.children = [];
                  parentNode.children.push(newNode);
                  return true;
                }
              }
              if (parentNode.children && addNodeRecursive(parentNode.children)) {
                return true;
              }
            }
            return false;
          };
          
          addNodeRecursive(state.parsedTree);
        }
        
        // Update raw text
        state.rawText = TreeParser.generateTreeText(state.parsedTree);
      });
    },

    uploadFile: (nodeId: string, file: File) => {
      set((state) => {
        const updateFileRecursive = (nodes: TreeNode[]): boolean => {
          for (const node of nodes) {
            if (node.id === nodeId) {
              node.uploadedFile = file;
              return true;
            }
            if (node.children && updateFileRecursive(node.children)) {
              return true;
            }
          }
          return false;
        };
        
        updateFileRecursive(state.parsedTree);
      });
    },

    generateZip: async () => {
      set((state) => {
        state.isGeneratingZip = true;
      });
      
      try {
        const zip = new JSZip();
        const state = get();
        
        const addNodesToZip = async (nodes: TreeNode[], currentPath: string = '') => {
          for (const node of nodes) {
            const nodePath = currentPath + node.name;
            
            if (node.type === 'folder') {
              // Create folder
              zip.folder(nodePath);
              
              // Add children
              if (node.children) {
                await addNodesToZip(node.children, nodePath + '/');
              }
              } else {
                // Add file content if available
                let content = '';
                if (node.uploadedFile) {
                  // For uploaded files, use the file content
                  zip.file(nodePath, node.uploadedFile);
                } else if (node.content) {
                  // For files with custom content
                  content = node.content;
                  zip.file(nodePath, content);
                } else {
                  // Create empty file with comment if any
                  content = node.comment ? `# ${node.comment}\n` : '';
                  zip.file(nodePath, content);
                }
              }
          }
        };
        
        await addNodesToZip(state.parsedTree);
        
        // Generate and download
        const blob = await zip.generateAsync({ type: 'blob' });
        const filename = state.parsedTree[0]?.name || 'project';
        saveAs(blob, `${filename}.zip`);
        
      } catch (error) {
        console.error('Failed to generate ZIP:', error);
      } finally {
        set((state) => {
          state.isGeneratingZip = false;
        });
      }
    },

    undo: () => {
      set((state) => {
        if (state.undoStack.length > 0) {
          const previousText = state.undoStack.pop()!;
          state.redoStack.push(state.rawText);
          state.rawText = previousText;
        }
      });
      
      get().parseTree();
    },

    redo: () => {
      set((state) => {
        if (state.redoStack.length > 0) {
          const nextText = state.redoStack.pop()!;
          state.undoStack.push(state.rawText);
          state.rawText = nextText;
        }
      });
      
      get().parseTree();
    },

    reset: () => {
      set((state) => {
        Object.assign(state, initialState);
      });
      
      get().parseTree();
    },

    setActiveView: (view: string) => {
      set((state) => {
        state.activeView = view;
      });
    },
  }))
);

// Initialize the store
setTimeout(() => {
  useTreeStore.getState().parseTree();
}, 0);
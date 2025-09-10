import { v4 as uuidv4 } from 'uuid';
import { TreeNode, ParsedLine, ParseResult } from '@/types/tree';
import { sanitizeFileName } from '@/utils/filename-sanitizer';

export class TreeParser {
  private static readonly TREE_CHARS = ['├──', '└──', '│   ', '    '];
  private static readonly FOLDER_INDICATORS = ['/', '\\'];
  
  static parseTreeStructure(text: string): ParseResult {
    const lines = text.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    const warnings: string[] = [];
    const parsedLines: ParsedLine[] = [];
    
    // Parse each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parsed = this.parseLine(line, i + 1);
      
      if (parsed.error) {
        errors.push(`Line ${i + 1}: ${parsed.error}`);
      }
      
      parsedLines.push(parsed);
    }
    
    // Build tree structure
    const tree = this.buildTree(parsedLines, errors);
    
    return { tree, errors, warnings };
  }
  
  private static parseLine(line: string, lineNumber: number): ParsedLine {
    const trimmed = line.trim();
    if (!trimmed) {
      return {
        content: '',
        level: 0,
        isFolder: false,
        error: 'Empty line'
      };
    }
    
    // Strip ANSI escape codes
    const cleanLine = this.stripAnsiCodes(line);
    
    // Extract comment
    const commentMatch = cleanLine.match(/^(.+?)\s+#\s*(.+)$/);
    const mainContent = commentMatch ? commentMatch[1] : cleanLine;
    const comment = commentMatch ? commentMatch[2] : undefined;
    
    // Calculate indentation level
    const level = this.calculateLevel(mainContent);
    
    // Extract file/folder name
    const content = this.extractContent(mainContent);
    const isFolder = this.isFolder(content);
    
    // Validate
    let error: string | undefined;
    if (!content) {
      error = 'No content found';
    } else if (content.includes('..')) {
      error = 'Path traversal detected';
    } else if (/[<>:"|?*]/.test(content)) {
      error = 'Invalid filename characters';
    }
    
    return {
      content: content.replace(/\/$/, ''), // Remove trailing slash for processing
      level,
      isFolder,
      comment,
      error
    };
  }
  
  private static stripAnsiCodes(text: string): string {
    // Remove ANSI escape sequences
    return text.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
  }
  
  private static calculateLevel(line: string): number {
    // Count leading whitespace and tree characters
    let level = 0;
    let index = 0;
    
    while (index < line.length) {
      if (line.substr(index, 4) === '│   ' || line.substr(index, 4) === '    ') {
        level++;
        index += 4;
      } else if (line.substr(index, 3) === '├──' || line.substr(index, 3) === '└──') {
        level++;
        break;
      } else if (line[index] === ' ' || line[index] === '\t') {
        index++;
        if (index % 4 === 0) level = Math.floor(index / 4);
      } else {
        break;
      }
    }
    
    return level;
  }
  
  private static extractContent(line: string): string {
    // Remove tree characters and leading/trailing whitespace
    let content = line;
    
    // Remove tree drawing characters
    for (const char of this.TREE_CHARS) {
      content = content.replace(new RegExp(`^(\\s*${this.escapeRegex(char)}\\s*)+`), '');
    }
    
    return content.trim();
  }
  
  private static isFolder(content: string): boolean {
    return this.FOLDER_INDICATORS.some(indicator => content.endsWith(indicator));
  }
  
  private static escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  private static buildTree(parsedLines: ParsedLine[], errors: string[]): TreeNode[] {
    const tree: TreeNode[] = [];
    const stack: TreeNode[] = [];
    
    for (const line of parsedLines) {
      if (line.error || !line.content) continue;
      
      const node: TreeNode = {
        id: uuidv4(),
        name: sanitizeFileName(line.content), // Clean name for ZIP
        displayName: line.content, // Original content for display
        type: line.isFolder ? 'folder' : 'file',
        comment: line.comment,
        isExpanded: true,
        level: line.level,
        children: line.isFolder ? [] : undefined
      };
      
      // Adjust stack to current level
      while (stack.length > line.level) {
        stack.pop();
      }
      
      // Add to parent or root
      if (stack.length === 0) {
        tree.push(node);
      } else {
        const parent = stack[stack.length - 1];
        if (parent.children) {
          parent.children.push(node);
        }
      }
      
      // Add to stack if it's a folder
      if (line.isFolder) {
        stack.push(node);
      }
    }
    
    return tree;
  }
  
  static generateTreeText(tree: TreeNode[], level: number = 0): string {
    let result = '';
    
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      const isLast = i === tree.length - 1;
      const prefix = this.generatePrefix(level, isLast);
      
      result += `${prefix}${node.displayName || node.name}${node.type === 'folder' ? '/' : ''}`;
      if (node.comment) {
        result += ` # ${node.comment}`;
      }
      result += '\n';
      
      if (node.children && node.children.length > 0) {
        result += this.generateTreeText(node.children, level + 1);
      }
    }
    
    return result;
  }
  
  private static generatePrefix(level: number, isLast: boolean): string {
    let prefix = '';
    
    for (let i = 0; i < level; i++) {
      prefix += '│   ';
    }
    
    if (level > 0) {
      prefix = prefix.slice(0, -4) + (isLast ? '└── ' : '├── ');
    }
    
    return prefix;
  }
}
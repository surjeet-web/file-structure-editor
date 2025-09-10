import React, { useRef, useEffect } from 'react';
import { useTreeStore } from '@/store/tree-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Undo2, 
  Redo2, 
  RotateCcw, 
  FileText,
  AlertCircle,
  CheckCircle,
  Copy,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SAMPLE_TEMPLATES = {
  react: `my-react-app/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Button.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   └── Contact.tsx
│   ├── hooks/
│   │   └── useApi.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── styles/
│   │   └── globals.css
│   └── App.tsx
├── public/
│   ├── index.html
│   └── favicon.ico
├── package.json
├── tsconfig.json
└── README.md`,

  python: `my-python-project/
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── views/
│   │   ├── __init__.py
│   │   └── api.py
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
├── tests/
│   ├── __init__.py
│   ├── test_main.py
│   └── test_models.py
├── requirements.txt
├── setup.py
└── README.md`,

  plugin: `my-plugin/
├── src/
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── assets/
│   └── styles.css
└── README.md`
};

export const TextEditor: React.FC = () => {
  const { 
    rawText, 
    setRawText, 
    undoStack, 
    redoStack, 
    undo, 
    redo, 
    reset, 
    errors, 
    warnings 
  } = useTreeStore();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [rawText]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value);
  };
  
  const handleTemplateSelect = (template: string) => {
    setRawText(SAMPLE_TEMPLATES[template as keyof typeof SAMPLE_TEMPLATES]);
  };
  
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawText(text);
    } catch (err) {
      console.error('Failed to paste text:', err);
    }
  };
  
  const statusColor = errors.length > 0 ? 'destructive' : warnings.length > 0 ? 'warning' : 'success';
  const StatusIcon = errors.length > 0 ? AlertCircle : CheckCircle;
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">Tree Structure</h3>
          <Badge variant={statusColor === 'destructive' ? 'destructive' : 'secondary'} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {errors.length > 0 ? `${errors.length} errors` : 
             warnings.length > 0 ? `${warnings.length} warnings` : 'Valid'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={undoStack.length === 0}
            className="gap-2"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={redoStack.length === 0}
            className="gap-2"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyText}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Templates */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-foreground-muted">Templates:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(SAMPLE_TEMPLATES).map((template) => (
            <Button
              key={template}
              variant="outline"
              size="sm"
              onClick={() => handleTemplateSelect(template)}
              className="capitalize"
            >
              {template}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 p-4">
        <div className="relative h-full">
          <textarea
            ref={textareaRef}
            value={rawText}
            onChange={handleTextChange}
            placeholder="Paste your file structure here...

Example:
project/
├── src/
│   ├── components/
│   │   └── Button.tsx
│   └── App.tsx
├── package.json
└── README.md"
            className={cn(
              "w-full h-full resize-none",
              "font-mono text-sm leading-relaxed",
              "bg-background text-foreground",
              "border border-border rounded-lg",
              "p-4 focus:outline-none focus:ring-2 focus:ring-ring",
              "placeholder:text-muted-foreground",
              "transition-all duration-200"
            )}
            spellCheck={false}
          />
          
          {/* Line numbers overlay */}
          <div className="absolute left-2 top-4 pointer-events-none select-none font-mono text-xs text-muted-foreground/50 leading-relaxed">
            {rawText.split('\n').map((_, index) => (
              <div key={index} className="text-right w-6">
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{rawText.length} characters</span>
            <span>{rawText.split('\n').length} lines</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>ASCII Tree Format</span>
          </div>
        </div>
      </div>
    </div>
  );
};
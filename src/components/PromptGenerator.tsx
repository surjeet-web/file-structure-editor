import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Sparkles, 
  Code2, 
  FolderTree,
  Lightbulb,
  Zap,
  Bot,
  MessageSquare,
  Check,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const PROJECT_TYPES = [
  { id: 'web', label: 'Web App', icon: Code2 },
  { id: 'mobile', label: 'Mobile App', icon: FolderTree },
  { id: 'desktop', label: 'Desktop App', icon: Sparkles },
  { id: 'api', label: 'API/Backend', icon: Zap },
  { id: 'library', label: 'Library/Package', icon: Bot },
  { id: 'other', label: 'Other', icon: Lightbulb }
];

const FRAMEWORKS = {
  web: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Vanilla JS'],
  mobile: ['React Native', 'Flutter', 'Ionic', 'Native iOS/Android', 'Expo'],
  desktop: ['Electron', 'Tauri', 'Flutter Desktop', 'Qt', 'WPF', '.NET MAUI'],
  api: ['Node.js/Express', 'Python/FastAPI', 'Python/Django', 'Go/Gin', 'Rust/Actix', 'Java/Spring'],
  library: ['npm Package', 'Python Package', 'Rust Crate', 'Go Module', 'Ruby Gem'],
  other: ['Custom']
};

export const PromptGenerator: React.FC = () => {
  const [projectIdea, setProjectIdea] = useState('');
  const [projectType, setProjectType] = useState('web');
  const [framework, setFramework] = useState('React');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState('');
  const { toast } = useToast();

  const generatePrompt = () => {
    const basePrompt = `Generate a detailed file structure for a ${projectType} project using ${framework}.

Project Description: ${projectIdea}

Requirements:
- Create a comprehensive file and folder structure
- Use proper naming conventions for ${framework}
- Include all necessary configuration files
- Add comments (using # symbol) to explain folder purposes
- Use ASCII tree format with ├── and └── characters
- Include both source code files and assets
- Follow industry best practices for ${projectType} development

Format the output as an ASCII tree structure like this example:
my-project/
├── src/
│   ├── components/
│   │   └── Button.tsx # Reusable UI components
│   ├── pages/
│   │   └── Home.tsx # Application pages
│   └── App.tsx # Main application file
├── public/
│   └── index.html # Entry HTML file
├── package.json # Dependencies and scripts
└── README.md # Project documentation

Make sure to:
1. Include appropriate file extensions for ${framework}
2. Add realistic folder names for a ${projectIdea}
3. Include testing folders if applicable
4. Add configuration files specific to ${framework}
5. Use comments to explain complex folder structures
6. Make it production-ready with proper organization

Generate the file structure now:`;

    setGeneratedPrompt(basePrompt);
  };

  const copyPrompt = async (text: string, type: string = 'detailed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        description: "Prompt copied to clipboard! 📋",
        duration: 2000,
      });
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
      toast({
        description: "Failed to copy prompt",
        variant: "destructive",
      });
    }
  };

  const quickPrompts = {
    chatgpt: `Hey ChatGPT! I need a file structure for: ${projectIdea}. 

Make it a ${projectType} project using ${framework}. Give me the complete folder/file structure in ASCII tree format (with ├── and └── symbols). Include comments with # to explain what each folder is for. Make it production-ready!`,

    claude: `Hi Claude! Can you generate a comprehensive file structure for a ${projectType} project?

Project: ${projectIdea}
Tech: ${framework}

Please format it as an ASCII tree with ├── └── symbols and add # comments explaining folder purposes. Include all necessary config files and follow best practices.`,

    gemini: `Create a detailed file structure for: ${projectIdea}

- Type: ${projectType}  
- Framework: ${framework}
- Format: ASCII tree (├── └──)
- Include: Config files, best practices, comments with #
- Make it: Production-ready and well-organized

Show me the complete folder structure!`
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 sm:p-6 border-b border-border"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-gradient-accent rounded-lg glow-accent"
          >
            <Wand2 className="h-4 w-4 text-accent-foreground" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground">AI Prompt Generator</h3>
            <p className="text-xs text-foreground-muted hidden sm:block">Generate prompts for any LLM</p>
          </div>
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Badge variant="secondary" className="gap-1">
            <Bot className="h-3 w-3" />
            LLM Ready
          </Badge>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-auto"
      >
        {/* Project Input */}
        <motion.div variants={itemVariants}>
          <Card className="transition-all duration-300 hover:shadow-elegant border-border/50">
            <CardHeader className="pb-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent" />
                Describe Your Project
              </h4>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Textarea
                  placeholder="e.g., A task management app with user authentication, real-time updates, and team collaboration features..."
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  className="min-h-[100px] sm:min-h-[80px] text-sm resize-none transition-all duration-300 focus:shadow-primary/20 focus:shadow-lg"
                />
              </motion.div>
            
              {/* Project Type Selection */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-foreground-muted">Project Type:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {PROJECT_TYPES.map((type, index) => {
                    const Icon = type.icon;
                    return (
                      <motion.div
                        key={type.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant={projectType === type.id ? "gradient" : "outline"}
                          size="sm"
                          onClick={() => {
                            setProjectType(type.id);
                            setFramework(FRAMEWORKS[type.id as keyof typeof FRAMEWORKS][0]);
                          }}
                          className={cn(
                            "gap-2 text-xs w-full h-12 transition-all duration-300",
                            projectType === type.id && "shadow-primary"
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          <span className="hidden sm:inline">{type.label}</span>
                          <span className="sm:hidden">{type.label.split(' ')[0]}</span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Framework Selection */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-foreground-muted">Framework/Technology:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <AnimatePresence mode="wait">
                    {FRAMEWORKS[projectType as keyof typeof FRAMEWORKS].map((fw, index) => (
                      <motion.div
                        key={fw}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={framework === fw ? "gradientAccent" : "outline"}
                          size="sm"
                          onClick={() => setFramework(fw)}
                          className={cn(
                            "text-xs w-full h-10 transition-all duration-300",
                            framework === fw && "shadow-accent"
                          )}
                        >
                          {fw}
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={generatePrompt}
                  disabled={!projectIdea.trim()}
                  className="w-full gap-2 h-12 text-sm font-medium shadow-primary/50 hover:shadow-primary transition-all duration-300"
                  variant="gradient"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Prompt
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Prompts */}
        <AnimatePresence>
          {generatedPrompt && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="transition-all duration-300 hover:shadow-elegant border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Generated Prompts
                    </h4>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="detailed" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                      <TabsTrigger value="detailed" className="text-xs px-2 py-2">Detailed</TabsTrigger>
                      <TabsTrigger value="chatgpt" className="text-xs px-2 py-2">ChatGPT</TabsTrigger>
                      <TabsTrigger value="claude" className="text-xs px-2 py-2">Claude</TabsTrigger>
                      <TabsTrigger value="gemini" className="text-xs px-2 py-2">Gemini</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="detailed" className="space-y-2">
                      <div className="relative">
                        <motion.div 
                          className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50 backdrop-blur-sm"
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                            {generatedPrompt}
                          </pre>
                        </motion.div>
                        <motion.div
                          className="absolute top-2 right-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPrompt(generatedPrompt, 'detailed')}
                            className={cn(
                              "gap-1 h-8 px-2 transition-all duration-300",
                              copied === 'detailed' && "text-success"
                            )}
                          >
                            {copied === 'detailed' ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </TabsContent>

                    {['chatgpt', 'claude', 'gemini'].map((type) => (
                      <TabsContent key={type} value={type} className="space-y-2">
                        <div className="relative">
                          <motion.div 
                            className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50 backdrop-blur-sm"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                              {quickPrompts[type as keyof typeof quickPrompts]}
                            </pre>
                          </motion.div>
                          <motion.div
                            className="absolute top-2 right-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPrompt(quickPrompts[type as keyof typeof quickPrompts], type)}
                              className={cn(
                                "gap-1 h-8 px-2 transition-all duration-300",
                                copied === type && "text-success"
                              )}
                            >
                              {copied === type ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guide */}
        <motion.div variants={itemVariants}>
          <Card className="transition-all duration-300 hover:shadow-elegant border-border/50">
            <CardHeader className="pb-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-secondary" />
                How to Use
              </h4>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-foreground-muted">
              <div className="grid gap-3">
                {[
                  "Describe your project idea in detail",
                  "Select your project type and framework", 
                  "Generate and copy the prompt",
                  "Paste it to ChatGPT, Claude, Gemini, or any AI",
                  "Copy the AI's response back to this tool",
                  "Edit, visualize, and download your structure!"
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground">
                      {index + 1}
                    </div>
                    <p className="text-xs">{step}</p>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-3 border-t border-border"
              >
                <p className="text-xs font-medium mb-2 text-accent">Pro Tips:</p>
                <div className="grid gap-2 text-xs">
                  {[
                    "Be specific about features you want",
                    "Mention if you need testing files",
                    "Ask for configuration files", 
                    "Request comments explaining folders"
                  ].map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-1 h-1 bg-accent rounded-full"></div>
                      <span>{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
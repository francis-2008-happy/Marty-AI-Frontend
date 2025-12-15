import { useRef } from 'react';
import type { Document } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Upload, Trash2, RefreshCw, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils';

interface SidebarProps {
  documents: Document[];
  selectedDocs: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onDeleteSelected: () => void;
  onUpload: (files: File[]) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onDeleteDoc: (id: string) => void;
  onSetActive: (id: string) => void;
  activeDocId: string | null;
}

export function Sidebar({
  documents,
  selectedDocs,
  onToggleSelect,
  onSelectAll,
  onDeleteSelected,
  onUpload,
  isLoading,
  onRefresh,
  onDeleteDoc,
  onSetActive,
  activeDocId
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isAllSelected = documents.length > 0 && selectedDocs.size === documents.length;

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            Marty AI
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{documents.length} documents</p>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onRefresh}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>

        {/* Upload Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer group"
        >
          <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
          <p className="text-sm font-medium">Click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
            accept=".pdf,.docx,.txt"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." className="pl-8" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-y bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={isAllSelected} 
            onChange={(e) => onSelectAll(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground">Select All</span>
        </div>
        
        {selectedDocs.size > 0 && (
          <Button variant="destructive" size="sm" onClick={onDeleteSelected} className="h-7 text-xs">
            <Trash2 className="w-3 h-3 mr-2" />
            Delete ({selectedDocs.size})
          </Button>
        )}
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {documents.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <p>No documents yet.</p>
          </div>
        ) : (
          documents.map(doc => {
            const isProcessing = doc.summary?.toLowerCase().includes('processing');
            const isActive = doc.id === activeDocId;
            
            return (
              <Card 
                key={doc.id}
                className={cn(
                  "p-3 transition-all hover:border-primary/50 cursor-pointer group relative",
                  isActive && "border-primary bg-primary/5"
                )}
                onClick={() => onSetActive(doc.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.has(doc.id)}
                      onChange={() => onToggleSelect(doc.id)}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm truncate pr-2" title={doc.filename}>
                        {doc.filename}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={isProcessing ? "secondary" : "outline"} className={cn("text-[10px] h-5", isProcessing && "text-amber-500 bg-amber-500/10")}>
                        {isProcessing ? 'Processing' : 'Ready'}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {doc.summary || "No summary available"}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDoc(doc.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

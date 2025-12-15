import { useState, useMemo } from 'react';
import { useDocuments } from './hooks/useDocuments';
import { useChat } from './hooks/useChat';
import { Sidebar } from './components/documents/Sidebar';
import { ChatWindow } from './components/chat/ChatWindow';
import { ChatInput } from './components/chat/ChatInput';
import { ThemeProvider } from './context/ThemeContext';
import { Menu, X } from 'lucide-react';
import { Button } from './components/ui/Button';

function AppContent() {
  const { 
    documents, 
    isLoading: isDocsLoading, 
    fetchDocuments, 
    uploadFiles, 
    deleteDocument,
  } = useDocuments();
  
  const { 
    getMessages, 
    sendMessage, 
    isProcessing: isChatProcessing 
  } = useChat();

  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Computed state
  const activeContextKey = useMemo(() => {
    if (selectedDocs.size > 0) {
      return `selected_${Array.from(selectedDocs).sort().join('_')}`;
    }
    if (activeDocId) return activeDocId;
    return 'global';
  }, [activeDocId, selectedDocs]);

  const messages = getMessages(activeContextKey);

  // Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedDocs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Clear active doc if we start multiple selection
    if (activeDocId) setActiveDocId(null);
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedDocs(new Set(documents.map(d => d.id)));
      setActiveDocId(null);
    } else {
      setSelectedDocs(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm('Are you sure you want to delete selected documents?')) return;
    for (const id of Array.from(selectedDocs)) {
      await deleteDocument(id);
    }
    setSelectedDocs(new Set());
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await deleteDocument(id);
    if (activeDocId === id) setActiveDocId(null);
    if (selectedDocs.has(id)) {
      setSelectedDocs(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSetActive = (id: string) => {
    setActiveDocId(id);
    setSelectedDocs(new Set()); // Clear multi-select when choosing one
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    // Determine context
    const docIds = selectedDocs.size > 0 ? Array.from(selectedDocs) : undefined;
    const activeId = !docIds && activeDocId ? activeDocId : undefined;
    
    await sendMessage(text, activeContextKey, activeId, docIds);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          documents={documents}
          selectedDocs={selectedDocs}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onDeleteSelected={handleDeleteSelected}
          onUpload={uploadFiles}
          isLoading={isDocsLoading}
          onRefresh={() => fetchDocuments()}
          onDeleteDoc={handleDeleteDoc}
          onSetActive={handleSetActive}
          activeDocId={activeDocId}
        />
        {/* Close button for mobile sidebar */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center p-4 border-b bg-background">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
          <span className="ml-3 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Marty AI</span>
        </header>

        {/* Top Banner (Optional, mimicking Streamlit style) */}
          <div className="hidden md:block bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 shadow-md transition-all">
            <h1 className="text-6xl font-extrabold tracking-tight mb-2">Marty AI</h1>
            <p className="opacity-90 text-lg">
              {selectedDocs.size > 0 
                ? `Analyzing ${selectedDocs.size} selected documents`
                : activeDocId 
                  ? `Analyzing: ${documents.find(d => d.id === activeDocId)?.filename || 'Document'}`
                  : 'Your intelligent document assistant'
              }
            </p>
          </div>

        {/* Context Indicator */}
        <div className="p-3 bg-muted/20 border-b text-sm text-center md:text-left md:px-6">
           <span className="font-semibold text-primary">
             {selectedDocs.size > 0 
               ? `Analyzing ${selectedDocs.size} documents`
               : activeDocId 
                 ? `Analyzing: ${documents.find(d => d.id === activeDocId)?.filename || 'Document'}`
                 : 'Global Search (All Documents)'
             }
           </span>
        </div>

        <ChatWindow 
          messages={messages} 
          isLoading={isChatProcessing} 
        />
        
        <div className="p-4 md:p-6 bg-background">
          <ChatInput 
            onSend={handleSendMessage} 
            disabled={isChatProcessing}
            placeholder={
              selectedDocs.size > 0 
                ? "Ask about selected docs..."
                : activeDocId 
                  ? "Ask about this document..."
                  : "Ask across all documents..."
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

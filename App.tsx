
import React, { useState, useCallback, useRef } from 'react';
import { AppStatus, Message, DesignStyle } from './types';
import { DESIGN_STYLES } from './constants';
import { generateReimaginedImage, getDesignAdvice, editImage } from './services/geminiService';
import CompareSlider from './components/CompareSlider';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setStatus(AppStatus.READY);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (style: DesignStyle) => {
    if (!originalImage) return;
    
    setSelectedStyle(style);
    setStatus(AppStatus.GENERATING);
    
    try {
      const result = await generateReimaginedImage(originalImage, style.prompt);
      setGeneratedImage(result);
      setStatus(AppStatus.READY);
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to reimagine space. Please try again.");
      setStatus(AppStatus.READY);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      // Logic for "Edit Image" triggers
      const editKeywords = ['make', 'change', 'remove', 'add', 'put', 'filter'];
      const isEditRequest = editKeywords.some(k => text.toLowerCase().includes(k)) && 
                          (text.length < 100); // Simple heuristic for edit vs advice

      if (isEditRequest && generatedImage) {
        setStatus(AppStatus.EDITING);
        const newImage = await editImage(generatedImage, text);
        setGeneratedImage(newImage);
        setStatus(AppStatus.READY);
        
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "I've updated the design based on your request. How does it look?",
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        // Standard Advice
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
        
        const { text: responseText, sources } = await getDesignAdvice(text, history);
        
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText,
          timestamp: Date.now(),
          sources
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting to my design database right now. Please try again in a moment.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setStatus(AppStatus.IDLE);
    setSelectedStyle(null);
    setMessages([]);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">Lumina <span className="text-indigo-600">Spaces</span></span>
        </div>
        {originalImage && (
          <button onClick={reset} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
            Start Over
          </button>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-16">
        
        {/* Intro / Upload Section */}
        {!originalImage && (
          <section className="text-center py-20 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Reimagine Your <span className="text-indigo-600 italic">Living Space</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-light">
              Upload a photo of any room and let Lumina's AI designers transform it into your dream aesthetic in seconds.
            </p>
            <div className="relative inline-block group">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 hover:-translate-y-1"
              >
                Upload Room Photo
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
            </div>
            <p className="mt-4 text-sm text-gray-400">Supported: JPG, PNG, WEBP (max 10MB)</p>
          </section>
        )}

        {originalImage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Visualizer & Styles */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-2 rounded-3xl shadow-xl border border-gray-100">
                {!generatedImage ? (
                  <div className="relative aspect-video group overflow-hidden rounded-2xl">
                    <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                    {status === AppStatus.GENERATING && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-lg font-medium text-indigo-900">Crafting your new space...</p>
                      </div>
                    )}
                    {status === AppStatus.READY && !generatedImage && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full text-indigo-900 font-semibold shadow-xl border border-indigo-100">
                          Select a style below to begin
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <CompareSlider original={originalImage} reimagined={generatedImage} />
                    {status === AppStatus.EDITING && (
                      <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                         <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                         <p className="text-lg font-medium">Applying your changes...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Styles Carousel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Choose a Style</h2>
                  <p className="text-sm text-gray-400">{DESIGN_STYLES.length} aesthetics available</p>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar">
                  {DESIGN_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleGenerate(style)}
                      disabled={status === AppStatus.GENERATING || status === AppStatus.EDITING}
                      className={`flex-shrink-0 group relative w-44 transition-all ${
                        selectedStyle?.id === style.id ? 'ring-4 ring-indigo-600 ring-offset-2 scale-95' : 'hover:scale-105'
                      }`}
                    >
                      <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-md mb-2">
                        <img src={style.previewUrl} alt={style.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        <div className="absolute bottom-3 left-3 right-3 text-white text-left">
                          <p className="font-bold text-sm leading-tight">{style.name}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat & Controls */}
            <div className="space-y-6">
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-2">Design Refinement</h3>
                <p className="text-sm text-indigo-700/80 leading-relaxed">
                  Chat with Lumina to tweak your design. You can ask to change specific colors, swap furniture, or get advice on accent pieces.
                </p>
              </div>

              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isChatLoading} 
              />
              
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-2xl">
                  <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Pro Tip</h4>
                  <p className="text-xs text-gray-500">Ask Lumina "Where can I buy a similar lamp?" to find shoppable items.</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 py-10 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Lumina Spaces AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;

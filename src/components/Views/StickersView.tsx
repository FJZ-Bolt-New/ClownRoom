import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Download, 
  Share2, 
  Type, 
  Image as ImageIcon, 
  Smile, 
  Palette, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  Move,
  ChevronUp,
  ChevronDown,
  Layers,
  Copy,
  Lock,
  Unlock
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    addSticker, 
    updateUserPoints, 
    stickerPacks, 
    addStickerToPack, 
    updateStickerPack 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'create' | 'my-stickers' | 'my-packs' | 'explore'>('create');
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Layer management functions
  const moveElementUp = (elementId: string) => {
    setElements(prev => {
      const elementIndex = prev.findIndex(el => el.id === elementId);
      if (elementIndex === -1 || elementIndex === prev.length - 1) return prev;
      
      const newElements = [...prev];
      [newElements[elementIndex], newElements[elementIndex + 1]] = [newElements[elementIndex + 1], newElements[elementIndex]];
      
      // Update layer numbers
      newElements.forEach((el, index) => {
        el.layer = index + 1;
      });
      
      return newElements;
    });
    toast.success('Layer moved up! 📈');
  };

  const moveElementDown = (elementId: string) => {
    setElements(prev => {
      const elementIndex = prev.findIndex(el => el.id === elementId);
      if (elementIndex === -1 || elementIndex === 0) return prev;
      
      const newElements = [...prev];
      [newElements[elementIndex], newElements[elementIndex - 1]] = [newElements[elementIndex - 1], newElements[elementIndex]];
      
      // Update layer numbers
      newElements.forEach((el, index) => {
        el.layer = index + 1;
      });
      
      return newElements;
    });
    toast.success('Layer moved down! 📉');
  };

  const moveElementToTop = (elementId: string) => {
    setElements(prev => {
      const element = prev.find(el => el.id === elementId);
      if (!element) return prev;
      
      const otherElements = prev.filter(el => el.id !== elementId);
      const newElements = [...otherElements, element];
      
      // Update layer numbers
      newElements.forEach((el, index) => {
        el.layer = index + 1;
      });
      
      return newElements;
    });
    toast.success('Layer moved to top! 🔝');
  };

  const moveElementToBottom = (elementId: string) => {
    setElements(prev => {
      const element = prev.find(el => el.id === elementId);
      if (!element) return prev;
      
      const otherElements = prev.filter(el => el.id !== elementId);
      const newElements = [element, ...otherElements];
      
      // Update layer numbers
      newElements.forEach((el, index) => {
        el.layer = index + 1;
      });
      
      return newElements;
    });
    toast.success('Layer moved to bottom! 🔻');
  };

  const toggleElementVisibility = (elementId: string) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, visible: !el.visible }
        : el
    ));
  };

  const toggleElementLock = (elementId: string) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, locked: !el.locked }
        : el
    ));
  };

  const duplicateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const newElement: StickerElement = {
      ...element,
      id: `element-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      layer: elements.length + 1,
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    toast.success('Element duplicated! 📋');
  };

  const deleteElement = (elementId: string) => {
    setElements(prev => {
      const filtered = prev.filter(el => el.id !== elementId);
      // Update layer numbers
      filtered.forEach((el, index) => {
        el.layer = index + 1;
      });
      return filtered;
    });
    
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
    toast.success('Element deleted! 🗑️');
  };

  // Add element functions
  const addTextElement = () => {
    const newElement: StickerElement = {
      id: `element-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      x: 150,
      y: 150,
      width: 120,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
      visible: true,
      locked: false,
      style: {
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'normal',
      },
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    toast.success('Text added! ✏️');
  };

  const addEmojiElement = (emoji: string) => {
    const newElement: StickerElement = {
      id: `element-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 150,
      y: 150,
      width: 60,
      height: 60,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
      visible: true,
      locked: false,
      style: {
        fontSize: 48,
      },
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    toast.success(`${emoji} added!`);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large! Max 5MB 📏');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      
      const newElement: StickerElement = {
        id: `element-${Date.now()}`,
        type: 'image',
        content: file.name,
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        rotation: 0,
        flipX: false,
        flipY: false,
        layer: elements.length + 1,
        visible: true,
        locked: false,
        imageData,
      };
      
      setElements(prev => [...prev, newElement]);
      setSelectedElement(newElement.id);
      toast.success('Image added! 🖼️');
    };
    
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent, elementId: string, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element || element.locked) return;

    setSelectedElement(elementId);
    
    if (handle) {
      // Resize operation
      setResizeHandle(handle);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element.width,
        height: element.height,
      });
    } else {
      // Drag operation
      setDragStart({
        x: e.clientX - element.x,
        y: e.clientY - element.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedElement) return;
    
    const element = elements.find(el => el.id === selectedElement);
    if (!element || element.locked) return;

    if (resizeStart && resizeHandle) {
      // Handle resize
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      
      switch (resizeHandle) {
        case 'nw':
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          break;
        case 'ne':
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          break;
        case 'sw':
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
        case 'se':
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
      }
      
      // For text and emoji, maintain aspect ratio and update font size
      if (element.type === 'text' || element.type === 'emoji') {
        const scale = newWidth / resizeStart.width;
        newHeight = resizeStart.height * scale;
        
        setElements(prev => prev.map(el => 
          el.id === selectedElement 
            ? { 
                ...el, 
                width: newWidth, 
                height: newHeight,
                style: {
                  ...el.style,
                  fontSize: element.type === 'text' 
                    ? Math.max(8, (el.style?.fontSize || 24) * scale)
                    : Math.max(12, (el.style?.fontSize || 48) * scale)
                }
              }
            : el
        ));
      } else {
        setElements(prev => prev.map(el => 
          el.id === selectedElement 
            ? { ...el, width: newWidth, height: newHeight }
            : el
        ));
      }
    } else if (dragStart) {
      // Handle drag
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      setElements(prev => prev.map(el => 
        el.id === selectedElement 
          ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) }
          : el
      ));
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
    setResizeStart(null);
    setResizeHandle(null);
  };

  // Update element properties
  const updateElement = (elementId: string, updates: Partial<StickerElement>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  const updateElementStyle = (elementId: string, styleUpdates: Partial<StickerElement['style']>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, style: { ...el.style, ...styleUpdates } }
        : el
    ));
  };

  // Save sticker
  const saveSticker = async () => {
    if (elements.length === 0) {
      toast.error('Add some elements first! 🎨');
      return;
    }

    try {
      // Create canvas for preview
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Clear canvas
      ctx.clearRect(0, 0, 400, 400);

      // Sort elements by layer (bottom to top)
      const sortedElements = [...elements]
        .filter(el => el.visible)
        .sort((a, b) => a.layer - b.layer);

      // Draw each element
      for (const element of sortedElements) {
        ctx.save();
        
        // Apply transformations
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.scale(element.flipX ? -1 : 1, element.flipY ? -1 : 1);
        
        if (element.type === 'text') {
          ctx.fillStyle = element.style?.color || '#ffffff';
          ctx.font = `${element.style?.fontWeight || 'normal'} ${element.style?.fontSize || 24}px ${element.style?.fontFamily || 'Arial'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content, 0, 0);
        } else if (element.type === 'emoji') {
          ctx.font = `${element.style?.fontSize || 48}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content, 0, 0);
        } else if (element.type === 'image' && element.imageData) {
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = element.imageData!;
          });
          ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
        }
        
        ctx.restore();
      }

      // Convert to data URL
      const imageUrl = canvas.toDataURL('image/png');

      // Create sticker object
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: `Sticker ${Date.now()}`,
        imageUrl,
        tags: ['custom'],
        createdBy: 'user-1',
        usageCount: 0,
        elementData: elements,
      };

      // Add to store
      addSticker(newSticker);
      
      // Add to "My Stickers" pack
      const myStickersPackId = 'pack-default';
      addStickerToPack(newSticker, myStickersPackId);
      
      // Update pack count
      updateStickerPack(myStickersPackId, {
        count: stickerPacks.find(p => p.id === myStickersPackId)?.count || 0 + 1
      });

      updateUserPoints(20);
      toast.success('Sticker saved successfully! 🎉 (+20 CP)');
      
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker! 😞');
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    toast.success('Canvas cleared! 🧹');
  };

  // Get selected element
  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  // Emoji options
  const emojiOptions = ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀', '🔥', '💯', '⚡', '💎', '🌟', '✨', '🎉', '🎊', '🎈', '🎁'];

  // My Stickers component
  const MyStickersTab = () => {
    const myStickers = stickers.filter(sticker => sticker.createdBy === 'user-1');
    const [previewSticker, setPreviewSticker] = useState<Sticker | null>(null);

    const downloadSticker = (sticker: Sticker) => {
      const link = document.createElement('a');
      link.download = `${sticker.name}.png`;
      link.href = sticker.imageUrl;
      link.click();
      toast.success(`${sticker.name} downloaded! 💾`);
    };

    const shareSticker = (sticker: Sticker) => {
      if (navigator.share) {
        navigator.share({
          title: sticker.name,
          text: 'Check out this awesome sticker!',
          url: sticker.imageUrl,
        });
      } else {
        navigator.clipboard.writeText(sticker.imageUrl);
        toast.success('Sticker link copied! 📋');
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">My Stickers ({myStickers.length})</h3>
        </div>

        {myStickers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-6xl mb-4 animate-bounce-doodle">🎨</div>
            <p className="font-hand text-lg">No stickers created yet!</p>
            <p className="font-hand text-sm mt-2">Create your first sticker to get started! ✨</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {myStickers.map((sticker) => (
              <motion.div
                key={sticker.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-dark-card rounded-xl p-4 border border-gray-800 relative group"
              >
                <div 
                  className="aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setPreviewSticker(sticker)}
                >
                  <img 
                    src={sticker.imageUrl} 
                    alt={sticker.name}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
                
                <h4 className="text-white font-semibold text-sm mb-2 truncate">{sticker.name}</h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Used {sticker.usageCount} times</span>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => downloadSticker(sticker)}
                      className="p-1 text-secondary hover:text-white transition-colors"
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => shareSticker(sticker)}
                      className="p-1 text-accent hover:text-white transition-colors"
                      title="Share"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        <AnimatePresence>
          {previewSticker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setPreviewSticker(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-dark-card rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <img 
                    src={previewSticker.imageUrl} 
                    alt={previewSticker.name}
                    className="w-48 h-48 object-contain mx-auto mb-4 rounded-lg bg-gray-800"
                  />
                  <h3 className="text-white font-bold text-lg mb-2">{previewSticker.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">Used {previewSticker.usageCount} times</p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => downloadSticker(previewSticker)}
                      className="flex-1 bg-secondary text-white rounded-lg py-2 font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => shareSticker(previewSticker)}
                      className="flex-1 bg-accent text-dark rounded-lg py-2 font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/10 to-dark relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🎭</div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'my-stickers', label: 'My Stickers', icon: Eye },
              { id: 'my-packs', label: 'My Packs', icon: Layers },
              { id: 'explore', label: 'Explore', icon: Share2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-secondary text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* Create Tab */}
            {activeTab === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                {/* Canvas Area */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold">Canvas</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={clearCanvas}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={saveSticker}
                          className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90 transition-colors flex items-center space-x-1"
                        >
                          <Save size={14} />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                    
                    <div 
                      ref={canvasRef}
                      className="relative w-full h-96 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 overflow-hidden"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {/* Render elements sorted by layer */}
                      {elements
                        .filter(el => el.visible)
                        .sort((a, b) => a.layer - b.layer)
                        .map((element) => (
                        <div
                          key={element.id}
                          className={`absolute cursor-move select-none ${
                            element.locked ? 'cursor-not-allowed opacity-50' : ''
                          } ${
                            selectedElement === element.id ? 'ring-2 ring-primary' : ''
                          }`}
                          style={{
                            left: element.x,
                            top: element.y,
                            width: element.width,
                            height: element.height,
                            transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                            zIndex: element.layer,
                          }}
                          onMouseDown={(e) => handleMouseDown(e, element.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!element.locked) {
                              setSelectedElement(element.id);
                            }
                          }}
                        >
                          {element.type === 'text' && (
                            <div
                              className="w-full h-full flex items-center justify-center text-center break-words"
                              style={{
                                fontSize: element.style?.fontSize || 24,
                                color: element.style?.color || '#ffffff',
                                fontFamily: element.style?.fontFamily || 'Arial',
                                fontWeight: element.style?.fontWeight || 'normal',
                              }}
                            >
                              {element.content}
                            </div>
                          )}
                          
                          {element.type === 'emoji' && (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{
                                fontSize: element.style?.fontSize || 48,
                              }}
                            >
                              {element.content}
                            </div>
                          )}
                          
                          {element.type === 'image' && element.imageData && (
                            <img
                              src={element.imageData}
                              alt={element.content}
                              className="w-full h-full object-cover rounded"
                              draggable={false}
                            />
                          )}
                          
                          {/* Resize handles */}
                          {selectedElement === element.id && !element.locked && (
                            <>
                              {/* Corner handles */}
                              {['nw', 'ne', 'sw', 'se'].map((handle) => (
                                <div
                                  key={handle}
                                  className={`absolute w-3 h-3 bg-primary border-2 border-white rounded-full cursor-${handle}-resize`}
                                  style={{
                                    top: handle.includes('n') ? -6 : 'auto',
                                    bottom: handle.includes('s') ? -6 : 'auto',
                                    left: handle.includes('w') ? -6 : 'auto',
                                    right: handle.includes('e') ? -6 : 'auto',
                                    zIndex: 1000,
                                  }}
                                  onMouseDown={(e) => handleMouseDown(e, element.id, handle)}
                                />
                              ))}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tools Panel */}
                <div className="space-y-4">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-4">Add Elements</h3>
                    
                    <div className="space-y-3">
                      <button
                        onClick={addTextElement}
                        className="w-full bg-primary text-white rounded-lg py-3 font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Type size={20} />
                        <span>Add Text</span>
                      </button>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-secondary text-white rounded-lg py-3 font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ImageIcon size={20} />
                        <span>Add Image</span>
                      </button>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-white font-semibold mb-2">Emojis</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {emojiOptions.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmojiElement(emoji)}
                            className="p-2 text-2xl hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adobe-Style Layer Panel */}
                <div className="space-y-4">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold flex items-center space-x-2">
                        <Layers size={18} />
                        <span>Layers</span>
                      </h3>
                      <button
                        onClick={() => setShowLayerPanel(!showLayerPanel)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {showLayerPanel ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    
                    {showLayerPanel && (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {elements.length === 0 ? (
                          <div className="text-center py-4 text-gray-400">
                            <Layers size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No layers yet</p>
                          </div>
                        ) : (
                          // Show layers from top to bottom (reverse order)
                          [...elements]
                            .sort((a, b) => b.layer - a.layer)
                            .map((element, index) => (
                            <div
                              key={element.id}
                              className={`flex items-center space-x-2 p-2 rounded-lg border transition-all cursor-pointer ${
                                selectedElement === element.id
                                  ? 'border-primary bg-primary/10'
                                  : 'border-gray-700 hover:border-gray-600'
                              }`}
                              onClick={() => setSelectedElement(element.id)}
                            >
                              {/* Layer preview */}
                              <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-xs border border-gray-600">
                                {element.type === 'text' && <Type size={12} />}
                                {element.type === 'emoji' && <span className="text-xs">{element.content}</span>}
                                {element.type === 'image' && <ImageIcon size={12} />}
                              </div>
                              
                              {/* Layer info */}
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-medium truncate">
                                  {element.type === 'text' ? element.content : 
                                   element.type === 'emoji' ? element.content :
                                   element.content}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  Layer {element.layer}
                                </div>
                              </div>
                              
                              {/* Layer controls */}
                              <div className="flex items-center space-x-1">
                                {/* Visibility toggle */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleElementVisibility(element.id);
                                  }}
                                  className={`p-1 rounded transition-colors ${
                                    element.visible 
                                      ? 'text-gray-400 hover:text-white' 
                                      : 'text-red-400 hover:text-red-300'
                                  }`}
                                  title={element.visible ? 'Hide layer' : 'Show layer'}
                                >
                                  {element.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                </button>
                                
                                {/* Lock toggle */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleElementLock(element.id);
                                  }}
                                  className={`p-1 rounded transition-colors ${
                                    element.locked 
                                      ? 'text-red-400 hover:text-red-300' 
                                      : 'text-gray-400 hover:text-white'
                                  }`}
                                  title={element.locked ? 'Unlock layer' : 'Lock layer'}
                                >
                                  {element.locked ? <Lock size={12} /> : <Unlock size={12} />}
                                </button>
                                
                                {/* Move up */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveElementUp(element.id);
                                  }}
                                  disabled={index === 0}
                                  className="p-1 rounded transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move layer up"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                
                                {/* Move down */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveElementDown(element.id);
                                  }}
                                  disabled={index === elements.length - 1}
                                  className="p-1 rounded transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move layer down"
                                >
                                  <ChevronDown size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    
                    {/* Layer actions */}
                    {selectedElement && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => duplicateElement(selectedElement)}
                            className="px-2 py-1 bg-secondary/20 text-secondary rounded text-xs hover:bg-secondary/30 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Copy size={10} />
                            <span>Duplicate</span>
                          </button>
                          <button
                            onClick={() => deleteElement(selectedElement)}
                            className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Trash2 size={10} />
                            <span>Delete</span>
                          </button>
                          <button
                            onClick={() => moveElementToTop(selectedElement)}
                            className="px-2 py-1 bg-accent/20 text-accent rounded text-xs hover:bg-accent/30 transition-colors"
                          >
                            To Top
                          </button>
                          <button
                            onClick={() => moveElementToBottom(selectedElement)}
                            className="px-2 py-1 bg-purple/20 text-purple rounded text-xs hover:bg-purple/30 transition-colors"
                          >
                            To Bottom
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Properties Panel */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h3 className="text-white font-bold mb-4">Properties</h3>
                      
                      <div className="space-y-4">
                        {/* Position */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">X</label>
                              <input
                                type="number"
                                value={Math.round(selectedElementData.x)}
                                onChange={(e) => updateElement(selectedElement!, { x: parseInt(e.target.value) || 0 })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Y</label>
                              <input
                                type="number"
                                value={Math.round(selectedElementData.y)}
                                onChange={(e) => updateElement(selectedElement!, { y: parseInt(e.target.value) || 0 })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Size */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Size</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Width</label>
                              <input
                                type="number"
                                value={Math.round(selectedElementData.width)}
                                onChange={(e) => updateElement(selectedElement!, { width: parseInt(e.target.value) || 20 })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Height</label>
                              <input
                                type="number"
                                value={Math.round(selectedElementData.height)}
                                onChange={(e) => updateElement(selectedElement!, { height: parseInt(e.target.value) || 20 })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Text-specific properties */}
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Text</label>
                              <input
                                type="text"
                                value={selectedElementData.content}
                                onChange={(e) => updateElement(selectedElement!, { content: e.target.value })}
                                className="w-full bg-dark-light text-white rounded px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
                              <input
                                type="range"
                                min="8"
                                max="72"
                                value={selectedElementData.style?.fontSize || 24}
                                onChange={(e) => updateElementStyle(selectedElement!, { fontSize: parseInt(e.target.value) })}
                                className="w-full"
                              />
                              <div className="text-center text-xs text-gray-400 mt-1">
                                {selectedElementData.style?.fontSize || 24}px
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#ffffff'}
                                onChange={(e) => updateElementStyle(selectedElement!, { color: e.target.value })}
                                className="w-full h-10 bg-dark-light rounded border border-gray-700"
                              />
                            </div>
                          </>
                        )}

                        {/* Transform */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Transform</label>
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Rotation</label>
                              <input
                                type="range"
                                min="-180"
                                max="180"
                                value={selectedElementData.rotation}
                                onChange={(e) => updateElement(selectedElement!, { rotation: parseInt(e.target.value) })}
                                className="w-full"
                              />
                              <div className="text-center text-xs text-gray-400 mt-1">
                                {selectedElementData.rotation}°
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateElement(selectedElement!, { flipX: !selectedElementData.flipX })}
                                className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                                  selectedElementData.flipX
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                <FlipHorizontal size={16} className="mx-auto" />
                              </button>
                              <button
                                onClick={() => updateElement(selectedElement!, { flipY: !selectedElementData.flipY })}
                                className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                                  selectedElementData.flipY
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                <FlipVertical size={16} className="mx-auto" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* My Stickers Tab */}
            {activeTab === 'my-stickers' && (
              <motion.div
                key="my-stickers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MyStickersTab />
              </motion.div>
            )}

            {/* Other tabs placeholder */}
            {(activeTab === 'my-packs' || activeTab === 'explore') && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4 animate-bounce-doodle">🚧</div>
                <h3 className="text-white font-bold text-xl mb-2">Coming Soon!</h3>
                <p className="text-gray-400">This feature is under development.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
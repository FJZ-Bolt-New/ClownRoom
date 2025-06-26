import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Type, 
  Smile, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  Triangle, 
  Save, 
  Trash2, 
  Undo, 
  Redo, 
  Download, 
  Upload, 
  Palette, 
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Grid,
  Eye,
  EyeOff,
  Package,
  ShoppingCart,
  Star,
  Search,
  Filter,
  X,
  Check,
  Edit3
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    stickerPacks, 
    addSticker, 
    addStickerToPack, 
    addStickerPack,
    updateStickerPack,
    purchaseStickerPack, 
    updateUserPoints, 
    currentUser 
  } = useStore();

  // Main state
  const [activeTab, setActiveTab] = useState<'create' | 'browse' | 'packs'>('create');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCreatePackModal, setShowCreatePackModal] = useState(false);
  
  // Canvas state
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [history, setHistory] = useState<StickerElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [canvasSize] = useState({ width: 300, height: 300 });
  
  // Tool state
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'emoji' | 'image' | 'shape'>('select');
  const [textInput, setTextInput] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😀');
  const [selectedShape, setSelectedShape] = useState<'circle' | 'square' | 'triangle'>('circle');
  const [selectedColor, setSelectedColor] = useState('#FF6B9D');
  
  // Drag and resize state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialElementState, setInitialElementState] = useState<StickerElement | null>(null);
  
  // Save state
  const [stickerName, setStickerName] = useState('');
  const [stickerTags, setStickerTags] = useState<string[]>([]);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [newPackName, setNewPackName] = useState('');
  const [newPackDescription, setNewPackDescription] = useState('');
  
  // Browse state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emoji categories
  const emojiCategories = {
    'Faces': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊'],
    'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦'],
    'Objects': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅'],
  };

  // Available fonts
  const fonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Times', value: 'Times New Roman, serif' },
    { name: 'Courier', value: 'Courier New, monospace' },
    { name: 'Comic Sans', value: 'Comic Sans MS, cursive' },
    { name: 'Impact', value: 'Impact, sans-serif' },
  ];

  // Get canvas bounds for constraint calculations
  const getCanvasBounds = useCallback(() => {
    if (!canvasRef.current) return { left: 0, top: 0, width: canvasSize.width, height: canvasSize.height };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: canvasSize.width,
      height: canvasSize.height
    };
  }, [canvasSize]);

  // Add element to canvas
  const addElement = useCallback((type: StickerElement['type'], content: string, additionalProps: Partial<StickerElement> = {}) => {
    const newElement: StickerElement = {
      id: `element-${Date.now()}`,
      type,
      content,
      x: Math.random() * (canvasSize.width - 100),
      y: Math.random() * (canvasSize.height - 100),
      width: type === 'text' ? 120 : type === 'emoji' ? 60 : 100,
      height: type === 'text' ? 40 : type === 'emoji' ? 60 : 100,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length,
      style: {
        fontSize: type === 'text' ? 16 : type === 'emoji' ? 32 : undefined,
        color: type === 'text' ? selectedColor : undefined,
        fontFamily: type === 'text' ? 'Arial, sans-serif' : undefined,
        fontWeight: type === 'text' ? 'normal' : undefined,
      },
      ...additionalProps
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added! 🎨`);
  }, [elements, history, historyIndex, canvasSize, selectedColor]);

  // Handle text addition
  const handleAddText = () => {
    if (!textInput.trim()) {
      toast.error('Enter some text first! 📝');
      return;
    }
    addElement('text', textInput.trim());
    setTextInput('');
  };

  // Handle emoji addition
  const handleAddEmoji = (emoji: string) => {
    addElement('emoji', emoji);
    setSelectedEmoji(emoji);
  };

  // Handle shape addition
  const handleAddShape = () => {
    addElement('shape', selectedShape, {
      style: { color: selectedColor }
    });
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file! 🖼️');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      addElement('image', file.name, {
        imageData,
        width: 120,
        height: 120
      });
    };
    reader.readAsDataURL(file);
  };

  // Mouse event handlers for drag and resize
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setSelectedElement(elementId);
    setInitialElementState({ ...element });
    
    const bounds = getCanvasBounds();
    const startX = e.clientX - bounds.left;
    const startY = e.clientY - bounds.top;
    
    setDragStart({ x: startX, y: startY });
    
    if (action === 'drag') {
      setIsDragging(true);
    } else if (action === 'resize') {
      setIsResizing(true);
      setResizeHandle(handle || null);
    }
  }, [elements, getCanvasBounds]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!selectedElement || (!isDragging && !isResizing) || !initialElementState) return;

    const bounds = getCanvasBounds();
    const currentX = e.clientX - bounds.left;
    const currentY = e.clientY - bounds.top;
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    setElements(prevElements => 
      prevElements.map(element => {
        if (element.id !== selectedElement) return element;

        if (isDragging) {
          // Handle dragging
          const newX = Math.max(0, Math.min(bounds.width - element.width, initialElementState.x + deltaX));
          const newY = Math.max(0, Math.min(bounds.height - element.height, initialElementState.y + deltaY));
          
          return {
            ...element,
            x: newX,
            y: newY
          };
        } else if (isResizing && resizeHandle) {
          // Handle resizing
          let newX = element.x;
          let newY = element.y;
          let newWidth = element.width;
          let newHeight = element.height;

          const minSize = 20;
          
          switch (resizeHandle) {
            case 'nw': // Top-left
              newWidth = Math.max(minSize, initialElementState.width - deltaX);
              newHeight = Math.max(minSize, initialElementState.height - deltaY);
              newX = initialElementState.x + (initialElementState.width - newWidth);
              newY = initialElementState.y + (initialElementState.height - newHeight);
              break;
            case 'ne': // Top-right
              newWidth = Math.max(minSize, initialElementState.width + deltaX);
              newHeight = Math.max(minSize, initialElementState.height - deltaY);
              newY = initialElementState.y + (initialElementState.height - newHeight);
              break;
            case 'sw': // Bottom-left
              newWidth = Math.max(minSize, initialElementState.width - deltaX);
              newHeight = Math.max(minSize, initialElementState.height + deltaY);
              newX = initialElementState.x + (initialElementState.width - newWidth);
              break;
            case 'se': // Bottom-right
              newWidth = Math.max(minSize, initialElementState.width + deltaX);
              newHeight = Math.max(minSize, initialElementState.height + deltaY);
              break;
            case 'n': // Top
              newHeight = Math.max(minSize, initialElementState.height - deltaY);
              newY = initialElementState.y + (initialElementState.height - newHeight);
              break;
            case 's': // Bottom
              newHeight = Math.max(minSize, initialElementState.height + deltaY);
              break;
            case 'w': // Left
              newWidth = Math.max(minSize, initialElementState.width - deltaX);
              newX = initialElementState.x + (initialElementState.width - newWidth);
              break;
            case 'e': // Right
              newWidth = Math.max(minSize, initialElementState.width + deltaX);
              break;
          }

          // Ensure element stays within canvas bounds
          newX = Math.max(0, Math.min(bounds.width - newWidth, newX));
          newY = Math.max(0, Math.min(bounds.height - newHeight, newY));
          newWidth = Math.min(newWidth, bounds.width - newX);
          newHeight = Math.min(newHeight, bounds.height - newY);

          return {
            ...element,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          };
        }

        return element;
      })
    );
  }, [selectedElement, isDragging, isResizing, dragStart, initialElementState, resizeHandle, getCanvasBounds]);

  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
      // Add to history when drag/resize ends
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...elements]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setInitialElementState(null);
  }, [isDragging, isResizing, elements, history, historyIndex]);

  // Add global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging || isResizing) {
        handleMouseMove(e as any);
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Update element properties
  const updateElement = useCallback((elementId: string, updates: Partial<StickerElement>) => {
    setElements(prevElements => 
      prevElements.map(element => 
        element.id === elementId 
          ? { ...element, ...updates, style: { ...element.style, ...updates.style } }
          : element
      )
    );
  }, []);

  // Delete element
  const deleteElement = useCallback((elementId: string) => {
    const newElements = elements.filter(el => el.id !== elementId);
    setElements(newElements);
    setSelectedElement(null);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    toast.success('Element deleted! 🗑️');
  }, [elements, history, historyIndex]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
      setSelectedElement(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
      setSelectedElement(null);
    }
  }, [history, historyIndex]);

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    toast.success('Canvas cleared! 🧹');
  };

  // Save sticker
  const handleSaveSticker = () => {
    if (elements.length === 0) {
      toast.error('Add some elements first! 🎨');
      return;
    }
    setShowSaveModal(true);
  };

  const confirmSaveSticker = () => {
    if (!stickerName.trim()) {
      toast.error('Give your sticker a name! 📝');
      return;
    }

    if (!selectedPackId && !newPackName.trim()) {
      toast.error('Select a pack or create a new one! 📦');
      return;
    }

    try {
      // Create the sticker
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName.trim(),
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzRFQ0RDNCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3RpY2tlcjwvdGV4dD48L3N2Zz4=',
        tags: stickerTags,
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        elementData: elements, // Save all element data
      };

      let targetPackId = selectedPackId;

      // Create new pack if needed
      if (!selectedPackId && newPackName.trim()) {
        const newPack = {
          id: `pack-${Date.now()}`,
          name: newPackName.trim(),
          description: newPackDescription.trim() || 'Custom sticker pack',
          stickers: [],
          category: 'custom' as const,
          count: 0,
          owned: true,
          price: 0,
          createdBy: currentUser?.id || 'user-1',
          createdAt: new Date(),
        };
        
        addStickerPack(newPack);
        targetPackId = newPack.id;
        toast.success(`New pack "${newPack.name}" created! 📦`);
      }

      // Add sticker to pack
      if (targetPackId) {
        addStickerToPack(newSticker, targetPackId);
        updateUserPoints(10);
        
        // Reset form
        setStickerName('');
        setStickerTags([]);
        setSelectedPackId('');
        setNewPackName('');
        setNewPackDescription('');
        setShowSaveModal(false);
        
        toast.success(`Sticker "${newSticker.name}" saved! 🎨 (+10 CP)`);
      } else {
        throw new Error('No pack selected or created');
      }
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker! Please try again. 😞');
    }
  };

  // Render resize handles
  const renderResizeHandles = (element: StickerElement) => {
    if (selectedElement !== element.id) return null;

    const handles = [
      { id: 'nw', style: { top: -4, left: -4, cursor: 'nw-resize' } },
      { id: 'ne', style: { top: -4, right: -4, cursor: 'ne-resize' } },
      { id: 'sw', style: { bottom: -4, left: -4, cursor: 'sw-resize' } },
      { id: 'se', style: { bottom: -4, right: -4, cursor: 'se-resize' } },
      { id: 'n', style: { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
      { id: 's', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
      { id: 'w', style: { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'w-resize' } },
      { id: 'e', style: { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'e-resize' } },
    ];

    return (
      <>
        {handles.map(handle => (
          <div
            key={handle.id}
            className="absolute w-2 h-2 bg-primary border border-white rounded-sm z-10"
            style={handle.style}
            onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', handle.id)}
          />
        ))}
      </>
    );
  };

  // Render element on canvas
  const renderElement = (element: StickerElement) => {
    const isSelected = selectedElement === element.id;
    
    return (
      <div
        key={element.id}
        className={`absolute cursor-move select-none ${isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''}`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
          zIndex: element.layer,
        }}
        onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement(element.id);
        }}
      >
        {/* Element content */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {element.type === 'text' && (
            <div
              className="w-full h-full flex items-center justify-center text-center break-words"
              style={{
                fontSize: element.style?.fontSize || 16,
                color: element.style?.color || '#000000',
                fontFamily: element.style?.fontFamily || 'Arial, sans-serif',
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
                fontSize: element.style?.fontSize || 32,
              }}
            >
              {element.content}
            </div>
          )}
          
          {element.type === 'shape' && (
            <div
              className="w-full h-full"
              style={{
                backgroundColor: element.style?.color || '#FF6B9D',
                borderRadius: element.content === 'circle' ? '50%' : element.content === 'triangle' ? '0' : '0',
                clipPath: element.content === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
              }}
            />
          )}
          
          {element.type === 'image' && element.imageData && (
            <img
              src={element.imageData}
              alt={element.content}
              className="w-full h-full object-cover rounded"
              draggable={false}
            />
          )}
        </div>
        
        {/* Resize handles */}
        {renderResizeHandles(element)}
      </div>
    );
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

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
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 max-w-md mx-auto">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'browse', label: 'Browse', icon: Search },
              { id: 'packs', label: 'Packs', icon: Package },
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
                  <Icon size={16} />
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
                {/* Tools Panel */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Tool Selection */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3">Tools</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'select', icon: Move, label: 'Select' },
                        { id: 'text', icon: Type, label: 'Text' },
                        { id: 'emoji', icon: Smile, label: 'Emoji' },
                        { id: 'image', icon: ImageIcon, label: 'Image' },
                      ].map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as any)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              activeTool === tool.id
                                ? 'border-secondary bg-secondary/20 text-secondary'
                                : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                            }`}
                          >
                            <Icon size={20} className="mx-auto mb-1" />
                            <div className="text-xs">{tool.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tool Options */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3">Options</h3>
                    
                    {activeTool === 'text' && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Enter text..."
                          className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
                        />
                        <button
                          onClick={handleAddText}
                          disabled={!textInput.trim()}
                          className="w-full bg-secondary text-white rounded-lg py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Text
                        </button>
                      </div>
                    )}

                    {activeTool === 'emoji' && (
                      <div className="space-y-3">
                        {Object.entries(emojiCategories).map(([category, emojis]) => (
                          <div key={category}>
                            <h4 className="text-xs text-gray-400 mb-2">{category}</h4>
                            <div className="grid grid-cols-4 gap-1">
                              {emojis.slice(0, 8).map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleAddEmoji(emoji)}
                                  className="p-2 text-lg hover:bg-gray-700 rounded transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTool === 'image' && (
                      <div className="space-y-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full bg-secondary text-white rounded-lg py-2 font-semibold flex items-center justify-center space-x-2"
                        >
                          <Upload size={16} />
                          <span>Upload Image</span>
                        </button>
                      </div>
                    )}

                    {activeTool === 'shape' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'circle', icon: Circle },
                            { id: 'square', icon: Square },
                            { id: 'triangle', icon: Triangle },
                          ].map((shape) => {
                            const Icon = shape.icon;
                            return (
                              <button
                                key={shape.id}
                                onClick={() => setSelectedShape(shape.id as any)}
                                className={`p-2 rounded border-2 transition-all ${
                                  selectedShape === shape.id
                                    ? 'border-secondary text-secondary'
                                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                                }`}
                              >
                                <Icon size={20} className="mx-auto" />
                              </button>
                            );
                          })}
                        </div>
                        <input
                          type="color"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-full h-10 rounded border border-gray-700"
                        />
                        <button
                          onClick={handleAddShape}
                          className="w-full bg-secondary text-white rounded-lg py-2 font-semibold"
                        >
                          Add Shape
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Canvas Controls */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3">Canvas</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Undo size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Redo size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2 rounded transition-colors ${
                          showGrid ? 'bg-secondary text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        <Grid size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={clearCanvas}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-500"
                      >
                        <Trash2 size={16} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold">Canvas</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveSticker}
                          disabled={elements.length === 0}
                          className="px-4 py-2 bg-primary text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save size={16} />
                          <span>Save Sticker</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative mx-auto bg-white rounded-lg overflow-hidden" style={{ width: canvasSize.width, height: canvasSize.height }}>
                      {/* Grid overlay */}
                      {showGrid && (
                        <div 
                          className="absolute inset-0 pointer-events-none opacity-20"
                          style={{
                            backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }}
                        />
                      )}
                      
                      {/* Canvas area */}
                      <div
                        ref={canvasRef}
                        className="relative w-full h-full cursor-crosshair"
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onClick={() => setSelectedElement(null)}
                      >
                        {elements.map(renderElement)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Properties Panel */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h3 className="text-white font-bold mb-3">Properties</h3>
                      
                      <div className="space-y-3">
                        {/* Position */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Position</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={Math.round(selectedElementData.x)}
                              onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={Math.round(selectedElementData.y)}
                              onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                              placeholder="Y"
                            />
                          </div>
                        </div>

                        {/* Size */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Size</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={Math.round(selectedElementData.width)}
                              onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 20 })}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                              placeholder="W"
                              min="20"
                            />
                            <input
                              type="number"
                              value={Math.round(selectedElementData.height)}
                              onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 20 })}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                              placeholder="H"
                              min="20"
                            />
                          </div>
                        </div>

                        {/* Text-specific properties */}
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                              <input
                                type="number"
                                value={selectedElementData.style?.fontSize || 16}
                                onChange={(e) => updateElement(selectedElementData.id, { 
                                  style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) || 16 }
                                })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                                min="8"
                                max="72"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#000000'}
                                onChange={(e) => updateElement(selectedElementData.id, { 
                                  style: { ...selectedElementData.style, color: e.target.value }
                                })}
                                className="w-full h-8 rounded border border-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Font</label>
                              <select
                                value={selectedElementData.style?.fontFamily || 'Arial, sans-serif'}
                                onChange={(e) => updateElement(selectedElementData.id, { 
                                  style: { ...selectedElementData.style, fontFamily: e.target.value }
                                })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                              >
                                {fonts.map(font => (
                                  <option key={font.value} value={font.value}>{font.name}</option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}

                        {/* Emoji-specific properties */}
                        {selectedElementData.type === 'emoji' && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Size</label>
                            <input
                              type="number"
                              value={selectedElementData.style?.fontSize || 32}
                              onChange={(e) => updateElement(selectedElementData.id, { 
                                style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) || 32 }
                              })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                              min="16"
                              max="128"
                            />
                          </div>
                        )}

                        {/* Shape-specific properties */}
                        {selectedElementData.type === 'shape' && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Color</label>
                            <input
                              type="color"
                              value={selectedElementData.style?.color || '#FF6B9D'}
                              onChange={(e) => updateElement(selectedElementData.id, { 
                                style: { ...selectedElementData.style, color: e.target.value }
                              })}
                              className="w-full h-8 rounded border border-gray-700"
                            />
                          </div>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="w-full bg-red-600 text-white rounded-lg py-2 font-semibold hover:bg-red-500 flex items-center justify-center space-x-2"
                        >
                          <Trash2 size={16} />
                          <span>Delete Element</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Layers Panel */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3">Layers</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {elements
                        .sort((a, b) => b.layer - a.layer)
                        .map((element, index) => (
                          <div
                            key={element.id}
                            onClick={() => setSelectedElement(element.id)}
                            className={`p-2 rounded cursor-pointer transition-colors ${
                              selectedElement === element.id
                                ? 'bg-secondary/20 border border-secondary'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white text-sm">
                                {element.type === 'text' ? `Text: ${element.content.slice(0, 10)}...` :
                                 element.type === 'emoji' ? `Emoji: ${element.content}` :
                                 element.type === 'shape' ? `Shape: ${element.content}` :
                                 `Image: ${element.content.slice(0, 10)}...`}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedElement(selectedElement === element.id ? null : element.id);
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                {selectedElement === element.id ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      
                      {elements.length === 0 && (
                        <div className="text-center py-4 text-gray-400">
                          <Layers size={24} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No elements yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Browse Tab */}
            {activeTab === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Search and Filter */}
                <div className="flex space-x-4 max-w-md mx-auto">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search stickers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-dark-card text-white rounded-lg border border-gray-700 focus:border-secondary focus:outline-none"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-dark-card text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="custom">Custom</option>
                    <option value="wholesome">Wholesome</option>
                    <option value="roast">Roast</option>
                    <option value="meme">Meme</option>
                  </select>
                </div>

                {/* Stickers Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {stickers
                    .filter(sticker => 
                      (filterCategory === 'all' || sticker.tags.includes(filterCategory)) &&
                      (searchTerm === '' || sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       sticker.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
                    )
                    .map((sticker) => (
                      <motion.div
                        key={sticker.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark-card rounded-xl p-3 border border-gray-800 hover:border-secondary transition-colors cursor-pointer"
                      >
                        <div className="aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                          <span className="text-2xl">🎨</span>
                        </div>
                        <h4 className="text-white font-semibold text-sm mb-1">{sticker.name}</h4>
                        <div className="flex flex-wrap gap-1">
                          {sticker.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-secondary/20 text-secondary rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                </div>

                {stickers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Search size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No stickers found</p>
                    <p className="text-sm">Create your first sticker to get started!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Packs Tab */}
            {activeTab === 'packs' && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stickerPacks.map((pack) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-dark-card rounded-xl p-4 border border-gray-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold">{pack.name}</h3>
                        {pack.owned ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                            Owned
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                            {pack.price} CP
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{pack.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{pack.count} stickers</span>
                        {!pack.owned && (
                          <button
                            onClick={() => purchaseStickerPack(pack.id, currentUser?.id || 'user-1')}
                            disabled={!currentUser || currentUser.clownPoints < pack.price}
                            className="px-3 py-1 bg-accent text-dark rounded font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          >
                            <ShoppingCart size={12} />
                            <span>Buy</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Save Sticker Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Save Sticker</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sticker Name
                  </label>
                  <input
                    type="text"
                    value={stickerName}
                    onChange={(e) => setStickerName(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                    placeholder="My awesome sticker"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={stickerTags.join(', ')}
                    onChange={(e) => setStickerTags(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                    placeholder="funny, meme, custom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Save to Pack
                  </label>
                  <select
                    value={selectedPackId}
                    onChange={(e) => setSelectedPackId(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                  >
                    <option value="">Create new pack...</option>
                    {stickerPacks
                      .filter(pack => pack.owned)
                      .map(pack => (
                        <option key={pack.id} value={pack.id}>
                          {pack.name} ({pack.count} stickers)
                        </option>
                      ))}
                  </select>
                </div>

                {!selectedPackId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Pack Name
                      </label>
                      <input
                        type="text"
                        value={newPackName}
                        onChange={(e) => setNewPackName(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                        placeholder="My Sticker Pack"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Pack Description
                      </label>
                      <textarea
                        value={newPackDescription}
                        onChange={(e) => setNewPackDescription(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none h-20 resize-none"
                        placeholder="Describe your pack..."
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSaveSticker}
                  className="flex-1 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
                >
                  Save Sticker
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
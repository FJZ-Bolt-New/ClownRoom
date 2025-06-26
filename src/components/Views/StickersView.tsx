import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Type, 
  Smile, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  Save, 
  Undo, 
  Redo, 
  Grid3X3, 
  Trash2, 
  Download,
  Palette,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    stickerPacks, 
    addSticker, 
    addStickerToPack, 
    updateStickerPack,
    addStickerPack,
    updateUserPoints 
  } = useStore();
  
  // Canvas state
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'text' | 'emoji' | 'image' | 'shape'>('select');
  const [showGrid, setShowGrid] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [history, setHistory] = useState<StickerElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Layer management state
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [layerFilter, setLayerFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  
  // Creation modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPackModal, setShowPackModal] = useState(false);
  
  // Form states
  const [stickerName, setStickerName] = useState('');
  const [selectedPack, setSelectedPack] = useState('');
  const [newPackName, setNewPackName] = useState('');
  const [newPackDescription, setNewPackDescription] = useState('');
  const [newPackCategory, setNewPackCategory] = useState<'custom' | 'wholesome' | 'cursed' | 'roast' | 'meme'>('custom');
  
  // Element properties
  const [textInput, setTextInput] = useState('');
  const [emojiInput, setEmojiInput] = useState('😀');
  const [selectedColor, setSelectedColor] = useState('#FF6B9D');
  const [selectedFontSize, setSelectedFontSize] = useState(24);
  const [selectedFontFamily, setSelectedFontFamily] = useState('Arial');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get canvas bounds for coordinate calculations
  const getCanvasBounds = () => {
    if (!canvasRef.current) return { left: 0, top: 0, width: 400, height: 300 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    };
  };

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (screenX: number, screenY: number) => {
    const bounds = getCanvasBounds();
    return {
      x: screenX - bounds.left,
      y: screenY - bounds.top
    };
  };

  // Add element to history for undo/redo
  const addToHistory = (newElements: StickerElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
      setSelectedElement(null);
    }
  };

  // Redo function
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
      setSelectedElement(null);
    }
  };

  // Get next available layer
  const getNextLayer = () => {
    if (elements.length === 0) return 1;
    return Math.max(...elements.map(el => el.layer)) + 1;
  };

  // Sort elements by layer for rendering
  const getSortedElements = () => {
    return [...elements].sort((a, b) => a.layer - b.layer);
  };

  // Get filtered elements for layer panel
  const getFilteredElements = () => {
    const sorted = getSortedElements();
    switch (layerFilter) {
      case 'visible':
        return sorted.filter(el => !el.hidden);
      case 'hidden':
        return sorted.filter(el => el.hidden);
      default:
        return sorted;
    }
  };

  // Layer management functions
  const moveElementToLayer = (elementId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const sortedElements = getSortedElements();
    const currentIndex = sortedElements.findIndex(el => el.id === elementId);
    
    let newLayer = element.layer;
    
    switch (direction) {
      case 'up':
        if (currentIndex < sortedElements.length - 1) {
          const nextElement = sortedElements[currentIndex + 1];
          newLayer = nextElement.layer + 1;
        }
        break;
      case 'down':
        if (currentIndex > 0) {
          const prevElement = sortedElements[currentIndex - 1];
          newLayer = prevElement.layer - 1;
        }
        break;
      case 'top':
        newLayer = Math.max(...elements.map(el => el.layer)) + 1;
        break;
      case 'bottom':
        newLayer = Math.min(...elements.map(el => el.layer)) - 1;
        break;
    }

    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, layer: newLayer } : el
    );
    
    setElements(newElements);
    addToHistory(newElements);
    toast.success(`Element moved ${direction}! 📚`);
  };

  // Toggle element visibility
  const toggleElementVisibility = (elementId: string) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, hidden: !el.hidden } : el
    );
    
    setElements(newElements);
    addToHistory(newElements);
    
    const element = elements.find(el => el.id === elementId);
    toast.success(`Element ${element?.hidden ? 'shown' : 'hidden'}! 👁️`);
  };

  // Set specific layer number
  const setElementLayer = (elementId: string, layer: number) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, layer: Math.max(1, layer) } : el
    );
    
    setElements(newElements);
    addToHistory(newElements);
  };

  // Add text element
  const addTextElement = () => {
    if (!textInput.trim()) {
      toast.error('Enter some text first! 📝');
      return;
    }

    const newElement: StickerElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: textInput,
      x: 50,
      y: 50,
      width: 150,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getNextLayer(),
      hidden: false,
      style: {
        fontSize: selectedFontSize,
        color: selectedColor,
        fontFamily: selectedFontFamily,
        fontWeight: 'normal'
      }
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setTextInput('');
    setTool('select');
    setSelectedElement(newElement.id);
    toast.success('Text added! ✨');
  };

  // Add emoji element
  const addEmojiElement = () => {
    const newElement: StickerElement = {
      id: `emoji-${Date.now()}`,
      type: 'emoji',
      content: emojiInput,
      x: 100,
      y: 100,
      width: 60,
      height: 60,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getNextLayer(),
      hidden: false
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setTool('select');
    setSelectedElement(newElement.id);
    toast.success('Emoji added! 😄');
  };

  // Add shape element
  const addShapeElement = (shapeType: 'circle' | 'square') => {
    const newElement: StickerElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      content: shapeType,
      x: 75,
      y: 75,
      width: 80,
      height: 80,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getNextLayer(),
      hidden: false,
      style: {
        color: selectedColor
      }
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setTool('select');
    setSelectedElement(newElement.id);
    toast.success(`${shapeType} added! 🔷`);
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
      
      const newElement: StickerElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        content: file.name,
        x: 25,
        y: 25,
        width: 120,
        height: 120,
        rotation: 0,
        flipX: false,
        flipY: false,
        layer: getNextLayer(),
        hidden: false,
        imageData
      };

      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setTool('select');
      setSelectedElement(newElement.id);
      toast.success('Image added! 🖼️');
    };
    
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // Mouse event handlers for drag and resize
  const handleMouseDown = (e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setDragStart(canvasPos);
    setSelectedElement(elementId);
    
    if (action === 'drag') {
      setIsDragging(true);
    } else if (action === 'resize') {
      setIsResizing(true);
      setResizeHandle(handle || null);
    }
  };

  // Global mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!selectedElement) return;

      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const deltaX = canvasPos.x - dragStart.x;
      const deltaY = canvasPos.y - dragStart.y;

      setElements(prevElements => 
        prevElements.map(element => {
          if (element.id !== selectedElement) return element;

          if (isDragging) {
            const bounds = getCanvasBounds();
            const newX = Math.max(0, Math.min(bounds.width - element.width, element.x + deltaX));
            const newY = Math.max(0, Math.min(bounds.height - element.height, element.y + deltaY));
            
            return { ...element, x: newX, y: newY };
          }

          if (isResizing && resizeHandle) {
            let newWidth = element.width;
            let newHeight = element.height;
            let newX = element.x;
            let newY = element.y;

            const minSize = 20;

            switch (resizeHandle) {
              case 'nw':
                newWidth = Math.max(minSize, element.width - deltaX);
                newHeight = Math.max(minSize, element.height - deltaY);
                newX = element.x + (element.width - newWidth);
                newY = element.y + (element.height - newHeight);
                break;
              case 'ne':
                newWidth = Math.max(minSize, element.width + deltaX);
                newHeight = Math.max(minSize, element.height - deltaY);
                newY = element.y + (element.height - newHeight);
                break;
              case 'sw':
                newWidth = Math.max(minSize, element.width - deltaX);
                newHeight = Math.max(minSize, element.height + deltaY);
                newX = element.x + (element.width - newWidth);
                break;
              case 'se':
                newWidth = Math.max(minSize, element.width + deltaX);
                newHeight = Math.max(minSize, element.height + deltaY);
                break;
              case 'n':
                newHeight = Math.max(minSize, element.height - deltaY);
                newY = element.y + (element.height - newHeight);
                break;
              case 's':
                newHeight = Math.max(minSize, element.height + deltaY);
                break;
              case 'w':
                newWidth = Math.max(minSize, element.width - deltaX);
                newX = element.x + (element.width - newWidth);
                break;
              case 'e':
                newWidth = Math.max(minSize, element.width + deltaX);
                break;
            }

            return { ...element, width: newWidth, height: newHeight, x: newX, y: newY };
          }

          return element;
        })
      );

      setDragStart(canvasPos);
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        addToHistory(elements);
      }
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, selectedElement, dragStart, elements, resizeHandle]);

  // Update element properties
  const updateElementProperty = (elementId: string, property: string, value: any) => {
    const newElements = elements.map(element => {
      if (element.id === elementId) {
        if (property.startsWith('style.')) {
          const styleProp = property.replace('style.', '');
          return {
            ...element,
            style: { ...element.style, [styleProp]: value }
          };
        }
        return { ...element, [property]: value };
      }
      return element;
    });
    
    setElements(newElements);
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    const newElements = elements.filter(el => el.id !== elementId);
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(null);
    toast.success('Element deleted! 🗑️');
  };

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    addToHistory([]);
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

  // Create new pack
  const handleCreatePack = () => {
    if (!newPackName.trim()) {
      toast.error('Pack name is required! 📝');
      return;
    }

    const newPack = {
      id: `pack-${Date.now()}`,
      name: newPackName.trim(),
      description: newPackDescription.trim() || 'Custom sticker pack',
      stickers: [],
      category: newPackCategory,
      count: 0,
      owned: true,
      price: 0,
      createdBy: 'user-1',
      createdAt: new Date(),
    };

    addStickerPack(newPack);
    setSelectedPack(newPack.id);
    setNewPackName('');
    setNewPackDescription('');
    setShowPackModal(false);
    toast.success(`Pack "${newPack.name}" created! 📦`);
  };

  // Save sticker to pack
  const saveSticker = () => {
    if (!stickerName.trim()) {
      toast.error('Sticker name is required! 📝');
      return;
    }

    if (!selectedPack) {
      toast.error('Select a pack to save to! 📦');
      return;
    }

    // Create sticker with element data
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      name: stickerName.trim(),
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzRFQ0RDNCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3RpY2tlcjwvdGV4dD48L3N2Zz4=',
      tags: ['custom', 'handmade'],
      createdBy: 'user-1',
      usageCount: 0,
      packId: selectedPack,
      elementData: elements // Store the element data for editing
    };

    // Add sticker to the selected pack
    addStickerToPack(newSticker, selectedPack);
    updateUserPoints(10);

    // Reset form
    setStickerName('');
    setSelectedPack('');
    setShowSaveModal(false);
    
    toast.success(`Sticker "${newSticker.name}" saved! 🎨 (+10 CP)`);
  };

  // Get resize cursor for handle
  const getResizeCursor = (handle: string) => {
    const cursors: Record<string, string> = {
      'nw': 'nw-resize',
      'ne': 'ne-resize',
      'sw': 'sw-resize',
      'se': 'se-resize',
      'n': 'n-resize',
      's': 's-resize',
      'w': 'w-resize',
      'e': 'e-resize'
    };
    return cursors[handle] || 'default';
  };

  // Render resize handles
  const renderResizeHandles = (element: StickerElement) => {
    if (selectedElement !== element.id || element.hidden) return null;

    const handles = [
      { id: 'nw', x: -4, y: -4 },
      { id: 'ne', x: element.width - 4, y: -4 },
      { id: 'sw', x: -4, y: element.height - 4 },
      { id: 'se', x: element.width - 4, y: element.height - 4 },
      { id: 'n', x: element.width / 2 - 4, y: -4 },
      { id: 's', x: element.width / 2 - 4, y: element.height - 4 },
      { id: 'w', x: -4, y: element.height / 2 - 4 },
      { id: 'e', x: element.width - 4, y: element.height / 2 - 4 }
    ];

    return (
      <>
        {handles.map(handle => (
          <div
            key={handle.id}
            className="absolute w-2 h-2 bg-primary border border-white rounded-sm"
            style={{
              left: handle.x,
              top: handle.y,
              cursor: getResizeCursor(handle.id)
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', handle.id)}
          />
        ))}
      </>
    );
  };

  // Render element content
  const renderElementContent = (element: StickerElement) => {
    const commonStyle = {
      transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
      opacity: element.hidden ? 0.3 : 1
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            style={{
              ...commonStyle,
              fontSize: element.style?.fontSize || 24,
              color: element.style?.color || '#000',
              fontFamily: element.style?.fontFamily || 'Arial',
              fontWeight: element.style?.fontWeight || 'normal',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              wordBreak: 'break-word',
              textAlign: 'center'
            }}
          >
            {element.content}
          </div>
        );
      
      case 'emoji':
        return (
          <div
            style={{
              ...commonStyle,
              fontSize: Math.min(element.width, element.height) * 0.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            {element.content}
          </div>
        );
      
      case 'image':
        return element.imageData ? (
          <img
            src={element.imageData}
            alt={element.content}
            style={{
              ...commonStyle,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
            draggable={false}
          />
        ) : (
          <div
            style={{
              ...commonStyle,
              width: '100%',
              height: '100%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}
          >
            <ImageIcon size={24} className="text-gray-400" />
          </div>
        );
      
      case 'shape':
        return (
          <div
            style={{
              ...commonStyle,
              width: '100%',
              height: '100%',
              backgroundColor: element.style?.color || '#4ECDC4',
              borderRadius: element.content === 'circle' ? '50%' : '4px'
            }}
          />
        );
      
      default:
        return null;
    }
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/10 to-dark relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🎭</div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Tools Panel */}
            <div className="lg:col-span-1 space-y-4">
              {/* Tool Selection */}
              <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                <h3 className="text-white font-bold mb-3 font-sketch">🛠️ Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'select', icon: Move, label: 'Select' },
                    { id: 'text', icon: Type, label: 'Text' },
                    { id: 'emoji', icon: Smile, label: 'Emoji' },
                    { id: 'image', icon: ImageIcon, label: 'Image' },
                  ].map((toolItem) => {
                    const Icon = toolItem.icon;
                    return (
                      <button
                        key={toolItem.id}
                        onClick={() => setTool(toolItem.id as any)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          tool === toolItem.id
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-gray-700 bg-dark-light text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <Icon size={20} className="mx-auto mb-1" />
                        <div className="text-xs font-hand">{toolItem.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Shape Tools */}
                <div className="mt-3">
                  <h4 className="text-gray-300 text-sm font-semibold mb-2">Shapes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addShapeElement('circle')}
                      className="p-2 bg-dark-light rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <Circle size={16} className="mx-auto text-gray-400" />
                      <div className="text-xs text-gray-400 mt-1">Circle</div>
                    </button>
                    <button
                      onClick={() => addShapeElement('square')}
                      className="p-2 bg-dark-light rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <Square size={16} className="mx-auto text-gray-400" />
                      <div className="text-xs text-gray-400 mt-1">Square</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tool-specific Controls */}
              {tool === 'text' && (
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <h3 className="text-white font-bold mb-3 font-sketch">📝 Add Text</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter text..."
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Size</label>
                        <input
                          type="range"
                          min="12"
                          max="72"
                          value={selectedFontSize}
                          onChange={(e) => setSelectedFontSize(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-400 text-center">{selectedFontSize}px</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Color</label>
                        <input
                          type="color"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-full h-8 rounded border border-gray-700"
                        />
                      </div>
                    </div>
                    <select
                      value={selectedFontFamily}
                      onChange={(e) => setSelectedFontFamily(e.target.value)}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                    <button
                      onClick={addTextElement}
                      disabled={!textInput.trim()}
                      className="w-full bg-primary text-white rounded-lg py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Text
                    </button>
                  </div>
                </div>
              )}

              {tool === 'emoji' && (
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <h3 className="text-white font-bold mb-3 font-sketch">😀 Add Emoji</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={emojiInput}
                      onChange={(e) => setEmojiInput(e.target.value)}
                      placeholder="Enter emoji..."
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none text-center text-2xl"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀', '🔥', '✨'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setEmojiInput(emoji)}
                          className="p-2 text-2xl hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={addEmojiElement}
                      className="w-full bg-secondary text-white rounded-lg py-2 font-semibold"
                    >
                      Add Emoji
                    </button>
                  </div>
                </div>
              )}

              {tool === 'image' && (
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <h3 className="text-white font-bold mb-3 font-sketch">🖼️ Add Image</h3>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-accent text-dark rounded-lg py-3 font-semibold flex items-center justify-center space-x-2"
                  >
                    <ImageIcon size={20} />
                    <span>Upload Image</span>
                  </button>
                </div>
              )}

              {/* Layer Panel */}
              <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold font-sketch flex items-center space-x-2">
                    <Layers size={18} />
                    <span>📚 Layers</span>
                  </h3>
                  <button
                    onClick={() => setShowLayerPanel(!showLayerPanel)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {showLayerPanel ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {showLayerPanel && (
                  <div className="space-y-3">
                    {/* Layer Filter */}
                    <select
                      value={layerFilter}
                      onChange={(e) => setLayerFilter(e.target.value as any)}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none text-sm"
                    >
                      <option value="all">All Elements</option>
                      <option value="visible">Visible Only</option>
                      <option value="hidden">Hidden Only</option>
                    </select>

                    {/* Layer List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {getFilteredElements().reverse().map((element, index) => (
                        <div
                          key={element.id}
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            selectedElement === element.id
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-700 bg-dark-light hover:border-gray-600'
                          }`}
                          onClick={() => setSelectedElement(element.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <div className="text-lg flex-shrink-0">
                                {element.type === 'text' && '📝'}
                                {element.type === 'emoji' && element.content}
                                {element.type === 'image' && '🖼️'}
                                {element.type === 'shape' && (element.content === 'circle' ? '⭕' : '⬜')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-semibold truncate">
                                  {element.type === 'text' ? element.content : `${element.type} ${element.id.split('-')[1]}`}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Layer {element.layer} • {element.width}×{element.height}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              {/* Visibility Toggle */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleElementVisibility(element.id);
                                }}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                title={element.hidden ? 'Show' : 'Hide'}
                              >
                                {element.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              
                              {/* Layer Controls */}
                              <div className="flex flex-col">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveElementToLayer(element.id, 'up');
                                  }}
                                  className="p-0.5 text-gray-400 hover:text-white transition-colors"
                                  title="Move Up"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveElementToLayer(element.id, 'down');
                                  }}
                                  className="p-0.5 text-gray-400 hover:text-white transition-colors"
                                  title="Move Down"
                                >
                                  <ChevronDown size={12} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Layer Number Input */}
                          <div className="mt-2 flex items-center space-x-2">
                            <label className="text-xs text-gray-400">Layer:</label>
                            <input
                              type="number"
                              min="1"
                              value={element.layer}
                              onChange={(e) => setElementLayer(element.id, parseInt(e.target.value) || 1)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-16 bg-dark text-white rounded px-2 py-1 text-xs border border-gray-700 focus:border-primary focus:outline-none"
                            />
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElementToLayer(element.id, 'top');
                                }}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                title="Move to Top"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElementToLayer(element.id, 'bottom');
                                }}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                title="Move to Bottom"
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {getFilteredElements().length === 0 && (
                        <div className="text-center py-4 text-gray-400">
                          <Layers size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No elements to show</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-2">
              <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                {/* Canvas Controls */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold font-sketch">🎨 Canvas</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Undo"
                    >
                      <Undo size={18} />
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Redo"
                    >
                      <Redo size={18} />
                    </button>
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`p-2 transition-colors ${showGrid ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                      title="Toggle Grid"
                    >
                      <Grid3X3 size={18} />
                    </button>
                    <button
                      onClick={clearCanvas}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Clear Canvas"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Canvas */}
                <div
                  ref={canvasRef}
                  className={`relative w-full h-96 bg-white rounded-lg border-2 border-dashed border-gray-600 overflow-hidden ${
                    showGrid ? 'bg-grid-pattern' : ''
                  }`}
                  style={{
                    backgroundImage: showGrid 
                      ? 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)'
                      : undefined,
                    backgroundSize: showGrid ? '20px 20px' : undefined
                  }}
                  onClick={(e) => {
                    if (e.target === canvasRef.current) {
                      setSelectedElement(null);
                    }
                  }}
                >
                  {/* Render elements sorted by layer */}
                  {getSortedElements().map((element) => (
                    <div
                      key={element.id}
                      className={`absolute border-2 transition-all ${
                        selectedElement === element.id 
                          ? 'border-primary border-dashed' 
                          : 'border-transparent hover:border-gray-400'
                      } ${isDragging && selectedElement === element.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        zIndex: element.layer
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
                    >
                      {renderElementContent(element)}
                      {renderResizeHandles(element)}
                    </div>
                  ))}

                  {/* Empty state */}
                  {elements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Palette size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold">Start Creating!</p>
                        <p className="text-sm">Add text, emojis, images, or shapes</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Canvas Info */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                  <div>Elements: {elements.length}</div>
                  <div>Selected: {selectedElement ? selectedElementData?.type : 'None'}</div>
                  <div>Canvas: 400×300</div>
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="lg:col-span-1 space-y-4">
              {/* Element Properties */}
              {selectedElementData && (
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <h3 className="text-white font-bold mb-3 font-sketch">⚙️ Properties</h3>
                  
                  <div className="space-y-3">
                    {/* Position */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500">X</label>
                          <input
                            type="number"
                            value={Math.round(selectedElementData.x)}
                            onChange={(e) => updateElementProperty(selectedElementData.id, 'x', Number(e.target.value))}
                            className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Y</label>
                          <input
                            type="number"
                            value={Math.round(selectedElementData.y)}
                            onChange={(e) => updateElementProperty(selectedElementData.id, 'y', Number(e.target.value))}
                            className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Size</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500">Width</label>
                          <input
                            type="number"
                            value={Math.round(selectedElementData.width)}
                            onChange={(e) => updateElementProperty(selectedElementData.id, 'width', Number(e.target.value))}
                            className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Height</label>
                          <input
                            type="number"
                            value={Math.round(selectedElementData.height)}
                            onChange={(e) => updateElementProperty(selectedElementData.id, 'height', Number(e.target.value))}
                            className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Layer */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Layer</label>
                      <input
                        type="number"
                        min="1"
                        value={selectedElementData.layer}
                        onChange={(e) => setElementLayer(selectedElementData.id, parseInt(e.target.value) || 1)}
                        className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>

                    {/* Text-specific properties */}
                    {selectedElementData.type === 'text' && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Text Content</label>
                          <input
                            type="text"
                            value={selectedElementData.content}
                            onChange={(e) => updateElementProperty(selectedElementData.id, 'content', e.target.value)}
                            className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                          <input
                            type="range"
                            min="8"
                            max="72"
                            value={selectedElementData.style?.fontSize || 24}
                            onChange={(e) => updateElementProperty(selectedElementData.id, 'style.fontSize', Number(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-400 text-center">{selectedElementData.style?.fontSize || 24}px</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Color</label>
                          <input
                            type="color"
                            value={selectedElementData.style?.color || '#000000'}
                            onChange={(e) => updateElementProperty(selectedElementData.id, 'style.color', e.target.value)}
                            className="w-full h-8 rounded border border-gray-700"
                          />
                        </div>
                      </>
                    )}

                    {/* Shape-specific properties */}
                    {selectedElementData.type === 'shape' && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Color</label>
                        <input
                          type="color"
                          value={selectedElementData.style?.color || '#4ECDC4'}
                          onChange={(e) => updateElementProperty(selectedElementData.id, 'style.color', e.target.value)}
                          className="w-full h-8 rounded border border-gray-700"
                        />
                      </div>
                    )}

                    {/* Transform controls */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Transform</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => updateElementProperty(selectedElementData.id, 'rotation', (selectedElementData.rotation + 90) % 360)}
                          className="p-2 bg-dark-light rounded border border-gray-700 hover:border-gray-600 transition-colors"
                          title="Rotate 90°"
                        >
                          <RotateCw size={14} className="mx-auto text-gray-400" />
                        </button>
                        <button
                          onClick={() => updateElementProperty(selectedElementData.id, 'flipX', !selectedElementData.flipX)}
                          className="p-2 bg-dark-light rounded border border-gray-700 hover:border-gray-600 transition-colors"
                          title="Flip Horizontal"
                        >
                          <FlipHorizontal size={14} className="mx-auto text-gray-400" />
                        </button>
                        <button
                          onClick={() => updateElementProperty(selectedElementData.id, 'flipY', !selectedElementData.flipY)}
                          className="p-2 bg-dark-light rounded border border-gray-700 hover:border-gray-600 transition-colors"
                          title="Flip Vertical"
                        >
                          <FlipVertical size={14} className="mx-auto text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteElement(selectedElementData.id)}
                      className="w-full bg-red-500/20 text-red-400 rounded-lg py-2 font-semibold hover:bg-red-500/30 transition-colors"
                    >
                      Delete Element
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                <h3 className="text-white font-bold mb-3 font-sketch">💾 Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleSaveSticker}
                    disabled={elements.length === 0}
                    className="w-full bg-gradient-to-r from-primary to-purple text-white rounded-lg py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Save size={18} />
                    <span>Save Sticker</span>
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full bg-secondary text-white rounded-lg py-2 font-semibold flex items-center justify-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>New Sticker</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
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
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4 font-sketch">💾 Save Sticker</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sticker Name
                  </label>
                  <input
                    type="text"
                    value={stickerName}
                    onChange={(e) => setStickerName(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    placeholder="My awesome sticker"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Save to Pack
                  </label>
                  <select
                    value={selectedPack}
                    onChange={(e) => setSelectedPack(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                  >
                    <option value="">Select a pack...</option>
                    {stickerPacks.filter(pack => pack.owned).map((pack) => (
                      <option key={pack.id} value={pack.id}>
                        {pack.name} ({pack.count} stickers)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowPackModal(true)}
                  className="w-full bg-accent/20 text-accent rounded-lg py-2 font-semibold hover:bg-accent/30 transition-colors"
                >
                  + Create New Pack
                </button>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSticker}
                  disabled={!stickerName.trim() || !selectedPack}
                  className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Pack Modal */}
      <AnimatePresence>
        {showPackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPackModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4 font-sketch">📦 Create New Pack</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pack Name
                  </label>
                  <input
                    type="text"
                    value={newPackName}
                    onChange={(e) => setNewPackName(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    placeholder="My Sticker Pack"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPackDescription}
                    onChange={(e) => setNewPackDescription(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none h-20 resize-none"
                    placeholder="Describe your pack..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newPackCategory}
                    onChange={(e) => setNewPackCategory(e.target.value as any)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                  >
                    <option value="custom">Custom</option>
                    <option value="wholesome">Wholesome</option>
                    <option value="cursed">Cursed</option>
                    <option value="roast">Roast</option>
                    <option value="meme">Meme</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPackModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePack}
                  disabled={!newPackName.trim()}
                  className="flex-1 py-2 bg-accent text-dark rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Pack
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
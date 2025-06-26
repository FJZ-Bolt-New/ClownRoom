import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Trash2, 
  Download, 
  Upload, 
  Palette, 
  Grid3X3, 
  Undo, 
  Redo,
  MousePointer,
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
  ArrowDown,
  MoreVertical
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
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'text' | 'emoji' | 'image' | 'shape'>('select');
  const [showGrid, setShowGrid] = useState(false);
  const [canvasSize] = useState({ width: 300, height: 300 });
  
  // Layer management state
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [layerMenuOpen, setLayerMenuOpen] = useState<string | null>(null);
  
  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialElementState, setInitialElementState] = useState<StickerElement | null>(null);
  
  // History state
  const [history, setHistory] = useState<StickerElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [stickerName, setStickerName] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('pack-default');
  const [newPackName, setNewPackName] = useState('');
  const [createNewPack, setCreateNewPack] = useState(false);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get canvas bounds for coordinate calculations
  const getCanvasBounds = useCallback(() => {
    if (!canvasRef.current) return { left: 0, top: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  }, []);
  
  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const bounds = getCanvasBounds();
    return {
      x: screenX - bounds.left,
      y: screenY - bounds.top
    };
  }, [getCanvasBounds]);
  
  // Add to history
  const addToHistory = useCallback((newElements: StickerElement[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...newElements]);
      return newHistory.slice(-20); // Keep last 20 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [historyIndex]);
  
  // Undo/Redo functions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setElements([...history[historyIndex - 1]]);
      setSelectedElementId(null);
    }
  }, [history, historyIndex]);
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setElements([...history[historyIndex + 1]]);
      setSelectedElementId(null);
    }
  }, [history, historyIndex]);
  
  // Layer management functions
  const moveElementToFront = useCallback((elementId: string) => {
    setElements(prev => {
      const newElements = [...prev];
      const maxLayer = Math.max(...newElements.map(el => el.layer), 0);
      const elementIndex = newElements.findIndex(el => el.id === elementId);
      
      if (elementIndex !== -1) {
        newElements[elementIndex] = {
          ...newElements[elementIndex],
          layer: maxLayer + 1
        };
        addToHistory(newElements);
        return newElements;
      }
      return prev;
    });
    toast.success('Moved to front! 🔝');
  }, [addToHistory]);
  
  const moveElementToBack = useCallback((elementId: string) => {
    setElements(prev => {
      const newElements = [...prev];
      const minLayer = Math.min(...newElements.map(el => el.layer), 0);
      const elementIndex = newElements.findIndex(el => el.id === elementId);
      
      if (elementIndex !== -1) {
        newElements[elementIndex] = {
          ...newElements[elementIndex],
          layer: minLayer - 1
        };
        addToHistory(newElements);
        return newElements;
      }
      return prev;
    });
    toast.success('Moved to back! 🔙');
  }, [addToHistory]);
  
  const moveElementUp = useCallback((elementId: string) => {
    setElements(prev => {
      const newElements = [...prev];
      const elementIndex = newElements.findIndex(el => el.id === elementId);
      
      if (elementIndex !== -1) {
        const currentLayer = newElements[elementIndex].layer;
        const elementsAbove = newElements.filter(el => el.layer > currentLayer);
        
        if (elementsAbove.length > 0) {
          const nextLayer = Math.min(...elementsAbove.map(el => el.layer));
          newElements[elementIndex] = {
            ...newElements[elementIndex],
            layer: nextLayer + 0.1
          };
          addToHistory(newElements);
          return newElements;
        }
      }
      return prev;
    });
    toast.success('Moved up! ⬆️');
  }, [addToHistory]);
  
  const moveElementDown = useCallback((elementId: string) => {
    setElements(prev => {
      const newElements = [...prev];
      const elementIndex = newElements.findIndex(el => el.id === elementId);
      
      if (elementIndex !== -1) {
        const currentLayer = newElements[elementIndex].layer;
        const elementsBelow = newElements.filter(el => el.layer < currentLayer);
        
        if (elementsBelow.length > 0) {
          const nextLayer = Math.max(...elementsBelow.map(el => el.layer));
          newElements[elementIndex] = {
            ...newElements[elementIndex],
            layer: nextLayer - 0.1
          };
          addToHistory(newElements);
          return newElements;
        }
      }
      return prev;
    });
    toast.success('Moved down! ⬇️');
  }, [addToHistory]);
  
  const toggleElementVisibility = useCallback((elementId: string) => {
    setElements(prev => {
      const newElements = prev.map(el => 
        el.id === elementId 
          ? { ...el, visible: !el.visible }
          : el
      );
      addToHistory(newElements);
      return newElements;
    });
  }, [addToHistory]);
  
  const duplicateElement = useCallback((elementId: string) => {
    setElements(prev => {
      const elementToDuplicate = prev.find(el => el.id === elementId);
      if (!elementToDuplicate) return prev;
      
      const newElement: StickerElement = {
        ...elementToDuplicate,
        id: `element-${Date.now()}`,
        x: elementToDuplicate.x + 20,
        y: elementToDuplicate.y + 20,
        layer: Math.max(...prev.map(el => el.layer), 0) + 1
      };
      
      const newElements = [...prev, newElement];
      addToHistory(newElements);
      setSelectedElementId(newElement.id);
      return newElements;
    });
    toast.success('Element duplicated! 📋');
  }, [addToHistory]);
  
  // Get sorted elements by layer (bottom to top for rendering)
  const getSortedElements = useCallback(() => {
    return [...elements].sort((a, b) => a.layer - b.layer);
  }, [elements]);
  
  // Get sorted elements for layer panel (top to bottom for UI)
  const getLayerPanelElements = useCallback(() => {
    return [...elements].sort((a, b) => b.layer - a.layer);
  }, [elements]);
  
  // Add element function
  const addElement = useCallback((type: StickerElement['type'], content: string, additionalProps: Partial<StickerElement> = {}) => {
    const newElement: StickerElement = {
      id: `element-${Date.now()}`,
      type,
      content,
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 25,
      width: type === 'text' ? 100 : type === 'emoji' ? 50 : 80,
      height: type === 'text' ? 30 : type === 'emoji' ? 50 : 80,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: Math.max(...elements.map(el => el.layer), 0) + 1,
      visible: true,
      style: type === 'text' ? {
        fontSize: 16,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'normal'
      } : undefined,
      ...additionalProps
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElementId(newElement.id);
    setTool('select');
  }, [elements, canvasSize, addToHistory]);
  
  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (elementId) {
      setSelectedElementId(elementId);
      
      // Check if clicking on resize handle
      const target = e.target as HTMLElement;
      const handle = target.getAttribute('data-handle');
      
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        const element = elements.find(el => el.id === elementId);
        if (element) {
          setInitialElementState({ ...element });
        }
      } else {
        setIsDragging(true);
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        const element = elements.find(el => el.id === elementId);
        if (element) {
          setDragStart({
            x: canvasPos.x - element.x,
            y: canvasPos.y - element.y
          });
        }
      }
    } else {
      setSelectedElementId(null);
    }
  }, [elements, screenToCanvas]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!selectedElementId) return;
    
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    
    if (isDragging) {
      setElements(prev => prev.map(el => 
        el.id === selectedElementId
          ? {
              ...el,
              x: Math.max(0, Math.min(canvasSize.width - el.width, canvasPos.x - dragStart.x)),
              y: Math.max(0, Math.min(canvasSize.height - el.height, canvasPos.y - dragStart.y))
            }
          : el
      ));
    } else if (isResizing && resizeHandle && initialElementState) {
      const deltaX = canvasPos.x - (initialElementState.x + initialElementState.width / 2);
      const deltaY = canvasPos.y - (initialElementState.y + initialElementState.height / 2);
      
      let newWidth = initialElementState.width;
      let newHeight = initialElementState.height;
      let newX = initialElementState.x;
      let newY = initialElementState.y;
      
      switch (resizeHandle) {
        case 'nw':
          newWidth = Math.max(20, initialElementState.width - deltaX * 2);
          newHeight = Math.max(20, initialElementState.height - deltaY * 2);
          newX = initialElementState.x + (initialElementState.width - newWidth) / 2;
          newY = initialElementState.y + (initialElementState.height - newHeight) / 2;
          break;
        case 'ne':
          newWidth = Math.max(20, initialElementState.width + deltaX * 2);
          newHeight = Math.max(20, initialElementState.height - deltaY * 2);
          newX = initialElementState.x + (initialElementState.width - newWidth) / 2;
          newY = initialElementState.y + (initialElementState.height - newHeight) / 2;
          break;
        case 'sw':
          newWidth = Math.max(20, initialElementState.width - deltaX * 2);
          newHeight = Math.max(20, initialElementState.height + deltaY * 2);
          newX = initialElementState.x + (initialElementState.width - newWidth) / 2;
          newY = initialElementState.y + (initialElementState.height - newHeight) / 2;
          break;
        case 'se':
          newWidth = Math.max(20, initialElementState.width + deltaX * 2);
          newHeight = Math.max(20, initialElementState.height + deltaY * 2);
          newX = initialElementState.x + (initialElementState.width - newWidth) / 2;
          newY = initialElementState.y + (initialElementState.height - newHeight) / 2;
          break;
        case 'n':
          newHeight = Math.max(20, initialElementState.height - deltaY * 2);
          newY = initialElementState.y + (initialElementState.height - newHeight) / 2;
          break;
        case 's':
          newHeight = Math.max(20, initialElementState.height + deltaY * 2);
          newY = initialElementState.y + (initialElementState.height - newHeight) / 2;
          break;
        case 'w':
          newWidth = Math.max(20, initialElementState.width - deltaX * 2);
          newX = initialElementState.x + (initialElementState.width - newWidth) / 2;
          break;
        case 'e':
          newWidth = Math.max(20, initialElementState.width + deltaX * 2);
          newX = initialElementState.x + (initialElementState.width - newWidth) / 2;
          break;
      }
      
      // Ensure element stays within canvas bounds
      newX = Math.max(0, Math.min(canvasSize.width - newWidth, newX));
      newY = Math.max(0, Math.min(canvasSize.height - newHeight, newY));
      
      setElements(prev => prev.map(el => 
        el.id === selectedElementId
          ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight }
          : el
      ));
    }
  }, [selectedElementId, isDragging, isResizing, resizeHandle, initialElementState, dragStart, canvasSize, screenToCanvas]);
  
  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
      addToHistory(elements);
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setInitialElementState(null);
  }, [isDragging, isResizing, elements, addToHistory]);
  
  // Global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);
  
  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([[]]);
      setHistoryIndex(0);
    }
  }, [history.length]);
  
  // Tool handlers
  const handleAddText = () => addElement('text', 'New Text');
  const handleAddEmoji = () => addElement('emoji', '😀');
  const handleAddShape = (shape: 'circle' | 'square') => {
    addElement('image', shape, {
      style: { 
        backgroundColor: '#FF6B9D',
        borderRadius: shape === 'circle' ? '50%' : '8px'
      }
    });
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        addElement('image', 'uploaded-image', { imageData });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Update element properties
  const updateElementProperty = useCallback((elementId: string, property: string, value: any) => {
    setElements(prev => {
      const newElements = prev.map(el => {
        if (el.id === elementId) {
          if (property.startsWith('style.')) {
            const styleProp = property.replace('style.', '');
            return {
              ...el,
              style: { ...el.style, [styleProp]: value }
            };
          } else {
            return { ...el, [property]: value };
          }
        }
        return el;
      });
      return newElements;
    });
  }, []);
  
  // Delete element
  const deleteElement = useCallback((elementId: string) => {
    setElements(prev => {
      const newElements = prev.filter(el => el.id !== elementId);
      addToHistory(newElements);
      return newElements;
    });
    setSelectedElementId(null);
    toast.success('Element deleted! 🗑️');
  }, [addToHistory]);
  
  // Save sticker
  const handleSaveSticker = async () => {
    if (!stickerName.trim()) {
      toast.error('Please enter a sticker name! 📝');
      return;
    }
    
    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }
    
    try {
      // Create canvas for preview
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Render elements in layer order
      const sortedElements = getSortedElements().filter(el => el.visible);
      
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
          ctx.font = `${element.style?.fontWeight || 'normal'} ${element.style?.fontSize || 16}px ${element.style?.fontFamily || 'Arial'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content, 0, 0);
        } else if (element.type === 'emoji') {
          ctx.font = `${element.height}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content, 0, 0);
        } else if (element.type === 'image') {
          if (element.content === 'circle' || element.content === 'square') {
            ctx.fillStyle = element.style?.backgroundColor || '#FF6B9D';
            if (element.content === 'circle') {
              ctx.beginPath();
              ctx.arc(0, 0, Math.min(element.width, element.height) / 2, 0, 2 * Math.PI);
              ctx.fill();
            } else {
              ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height);
            }
          } else if (element.imageData) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
            };
            img.src = element.imageData;
          }
        }
        
        ctx.restore();
      }
      
      // Convert to blob
      const imageUrl = canvas.toDataURL('image/png');
      
      // Create sticker object
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName.trim(),
        imageUrl,
        tags: ['custom'],
        createdBy: 'user-1',
        usageCount: 0,
        elementData: elements
      };
      
      // Handle pack selection
      let targetPackId = selectedPackId;
      
      if (createNewPack && newPackName.trim()) {
        const newPack = {
          id: `pack-${Date.now()}`,
          name: newPackName.trim(),
          description: 'Custom sticker pack',
          stickers: [],
          category: 'custom' as const,
          count: 0,
          owned: true,
          price: 0,
          createdBy: 'user-1',
          createdAt: new Date()
        };
        
        addStickerPack(newPack);
        targetPackId = newPack.id;
        toast.success(`New pack "${newPackName}" created! 📦`);
      }
      
      // Add sticker to pack
      addStickerToPack(newSticker, targetPackId);
      updateUserPoints(10);
      
      // Reset form
      setStickerName('');
      setNewPackName('');
      setCreateNewPack(false);
      setElements([]);
      setSelectedElementId(null);
      setHistory([[]]);
      setHistoryIndex(0);
      setShowSaveModal(false);
      
      toast.success(`Sticker "${stickerName}" saved! 🎨 (+10 CP)`);
      
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker. Please try again! 😞');
    }
  };
  
  // Get selected element
  const selectedElement = selectedElementId ? elements.find(el => el.id === selectedElementId) : null;
  
  // Render resize handles
  const renderResizeHandles = (element: StickerElement) => {
    if (!selectedElementId || selectedElementId !== element.id) return null;
    
    const handles = [
      { id: 'nw', x: -4, y: -4, cursor: 'nw-resize' },
      { id: 'n', x: element.width / 2 - 4, y: -4, cursor: 'n-resize' },
      { id: 'ne', x: element.width - 4, y: -4, cursor: 'ne-resize' },
      { id: 'w', x: -4, y: element.height / 2 - 4, cursor: 'w-resize' },
      { id: 'e', x: element.width - 4, y: element.height / 2 - 4, cursor: 'e-resize' },
      { id: 'sw', x: -4, y: element.height - 4, cursor: 'sw-resize' },
      { id: 's', x: element.width / 2 - 4, y: element.height - 4, cursor: 's-resize' },
      { id: 'se', x: element.width - 4, y: element.height - 4, cursor: 'se-resize' },
    ];
    
    return handles.map(handle => (
      <div
        key={handle.id}
        data-handle={handle.id}
        className="absolute w-2 h-2 bg-primary border border-white rounded-sm z-10"
        style={{
          left: handle.x,
          top: handle.y,
          cursor: handle.cursor
        }}
        onMouseDown={(e) => handleMouseDown(e, element.id)}
      />
    ));
  };
  
  // Render element
  const renderElement = (element: StickerElement) => {
    if (!element.visible) return null;
    
    const isSelected = selectedElementId === element.id;
    
    return (
      <div
        key={element.id}
        className={`absolute select-none ${isSelected ? 'ring-2 ring-primary' : ''}`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
          zIndex: element.layer,
          cursor: tool === 'select' ? 'move' : 'default'
        }}
        onMouseDown={(e) => handleMouseDown(e, element.id)}
      >
        {element.type === 'text' && (
          <div
            className="w-full h-full flex items-center justify-center text-center break-words"
            style={{
              fontSize: element.style?.fontSize || 16,
              color: element.style?.color || '#ffffff',
              fontFamily: element.style?.fontFamily || 'Arial',
              fontWeight: element.style?.fontWeight || 'normal'
            }}
          >
            {element.content}
          </div>
        )}
        
        {element.type === 'emoji' && (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ fontSize: element.height * 0.8 }}
          >
            {element.content}
          </div>
        )}
        
        {element.type === 'image' && (
          <div className="w-full h-full">
            {element.content === 'circle' && (
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: element.style?.backgroundColor || '#FF6B9D' }}
              />
            )}
            {element.content === 'square' && (
              <div
                className="w-full h-full rounded-lg"
                style={{ backgroundColor: element.style?.backgroundColor || '#FF6B9D' }}
              />
            )}
            {element.imageData && (
              <img
                src={element.imageData}
                alt="Uploaded"
                className="w-full h-full object-cover rounded-lg"
                draggable={false}
              />
            )}
          </div>
        )}
        
        {renderResizeHandles(element)}
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
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 font-sketch crayon-text">
              🎨 Sticker Studio
            </h1>
            <p className="text-gray-400 font-hand">Create amazing custom stickers with layers!</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tools Panel */}
            <div className="lg:col-span-1">
              <div className="bg-dark-card rounded-xl p-4 border border-gray-800 mb-4">
                <h3 className="text-white font-bold mb-3 font-sketch">🛠️ Tools</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { id: 'select', icon: MousePointer, label: 'Select' },
                    { id: 'text', icon: Type, label: 'Text' },
                    { id: 'emoji', icon: Smile, label: 'Emoji' },
                    { id: 'image', icon: ImageIcon, label: 'Image' },
                  ].map((toolItem) => {
                    const Icon = toolItem.icon;
                    return (
                      <button
                        key={toolItem.id}
                        onClick={() => setTool(toolItem.id as any)}
                        className={`p-3 rounded-lg transition-all doodle-btn ${
                          tool === toolItem.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <Icon size={16} className="mx-auto mb-1" />
                        <div className="text-xs font-hand">{toolItem.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <button
                    onClick={handleAddText}
                    className="w-full bg-gradient-to-r from-primary to-purple text-white rounded-lg py-2 text-sm font-semibold doodle-btn"
                  >
                    <Type size={16} className="inline mr-2" />
                    Add Text
                  </button>
                  
                  <button
                    onClick={handleAddEmoji}
                    className="w-full bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg py-2 text-sm font-semibold doodle-btn"
                  >
                    <Smile size={16} className="inline mr-2" />
                    Add Emoji
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddShape('circle')}
                      className="bg-accent text-dark rounded-lg py-2 text-sm font-semibold doodle-btn"
                    >
                      <Circle size={16} className="inline mr-1" />
                      Circle
                    </button>
                    <button
                      onClick={() => handleAddShape('square')}
                      className="bg-orange text-white rounded-lg py-2 text-sm font-semibold doodle-btn"
                    >
                      <Square size={16} className="inline mr-1" />
                      Square
                    </button>
                  </div>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-purple text-white rounded-lg py-2 text-sm font-semibold doodle-btn"
                  >
                    <Upload size={16} className="inline mr-2" />
                    Upload Image
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Canvas Controls */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-white font-semibold mb-2 text-sm">Canvas</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Undo size={16} />
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Redo size={16} />
                    </button>
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`p-2 rounded-lg transition-colors ${
                        showGrid ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Grid3X3 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setElements([]);
                        setSelectedElementId(null);
                        addToHistory([]);
                      }}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Layer Panel */}
              <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold font-sketch flex items-center">
                    <Layers size={18} className="mr-2" />
                    Layers
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
                    {getLayerPanelElements().map((element, index) => (
                      <div
                        key={element.id}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          selectedElementId === element.id
                            ? 'border-primary bg-primary/20'
                            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50'
                        }`}
                        onClick={() => setSelectedElementId(element.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="text-lg flex-shrink-0">
                              {element.type === 'text' && '📝'}
                              {element.type === 'emoji' && element.content}
                              {element.type === 'image' && '🖼️'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-medium truncate">
                                {element.type === 'text' ? element.content : 
                                 element.type === 'emoji' ? 'Emoji' :
                                 element.type === 'image' ? 'Image' : 'Element'}
                              </div>
                              <div className="text-xs text-gray-400">
                                Layer {Math.round(element.layer)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleElementVisibility(element.id);
                              }}
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                            >
                              {element.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                            </button>
                            
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLayerMenuOpen(layerMenuOpen === element.id ? null : element.id);
                                }}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                              >
                                <MoreVertical size={12} />
                              </button>
                              
                              {layerMenuOpen === element.id && (
                                <div className="absolute right-0 top-6 bg-dark-light border border-gray-600 rounded-lg shadow-lg z-50 min-w-32">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementToFront(element.id);
                                      setLayerMenuOpen(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                                  >
                                    <ArrowUp size={12} />
                                    <span>To Front</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementUp(element.id);
                                      setLayerMenuOpen(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                                  >
                                    <ChevronUp size={12} />
                                    <span>Move Up</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementDown(element.id);
                                      setLayerMenuOpen(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                                  >
                                    <ChevronDown size={12} />
                                    <span>Move Down</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementToBack(element.id);
                                      setLayerMenuOpen(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                                  >
                                    <ArrowDown size={12} />
                                    <span>To Back</span>
                                  </button>
                                  <hr className="border-gray-600" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateElement(element.id);
                                      setLayerMenuOpen(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                                  >
                                    Duplicate
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteElement(element.id);
                                      setLayerMenuOpen(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {elements.length === 0 && (
                      <div className="text-center py-4 text-gray-400">
                        <Layers size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-hand">No layers yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold font-sketch">🎨 Canvas</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm font-hand">
                      {canvasSize.width} × {canvasSize.height}
                    </span>
                    <button
                      onClick={() => setShowSaveModal(true)}
                      disabled={elements.length === 0}
                      className="bg-gradient-to-r from-primary to-purple text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed doodle-btn"
                    >
                      <Save size={16} className="inline mr-2" />
                      Save Sticker
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div
                    ref={canvasRef}
                    className="relative bg-white rounded-lg border-2 border-dashed border-gray-600 overflow-hidden"
                    style={{
                      width: canvasSize.width,
                      height: canvasSize.height,
                      backgroundImage: showGrid 
                        ? 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)'
                        : undefined,
                      backgroundSize: showGrid ? '20px 20px' : undefined
                    }}
                    onMouseDown={(e) => handleMouseDown(e)}
                  >
                    {getSortedElements().map(renderElement)}
                    
                    {elements.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <Palette size={48} className="mx-auto mb-2 opacity-50" />
                          <p className="font-hand">Start creating your sticker!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="lg:col-span-1">
              <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                <h3 className="text-white font-bold mb-3 font-sketch">⚙️ Properties</h3>
                
                {selectedElement ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Element Type
                      </label>
                      <div className="text-white font-semibold capitalize">
                        {selectedElement.type}
                      </div>
                    </div>

                    {selectedElement.type === 'text' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Text Content
                          </label>
                          <input
                            type="text"
                            value={selectedElement.content}
                            onChange={(e) => updateElementProperty(selectedElement.id, 'content', e.target.value)}
                            className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Font Size
                          </label>
                          <input
                            type="range"
                            min="8"
                            max="72"
                            value={selectedElement.style?.fontSize || 16}
                            onChange={(e) => updateElementProperty(selectedElement.id, 'style.fontSize', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-400 mt-1">
                            {selectedElement.style?.fontSize || 16}px
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Color
                          </label>
                          <input
                            type="color"
                            value={selectedElement.style?.color || '#ffffff'}
                            onChange={(e) => updateElementProperty(selectedElement.id, 'style.color', e.target.value)}
                            className="w-full h-10 rounded-lg border border-gray-700"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Font Family
                          </label>
                          <select
                            value={selectedElement.style?.fontFamily || 'Arial'}
                            onChange={(e) => updateElementProperty(selectedElement.id, 'style.fontFamily', e.target.value)}
                            className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Font Weight
                          </label>
                          <select
                            value={selectedElement.style?.fontWeight || 'normal'}
                            onChange={(e) => updateElementProperty(selectedElement.id, 'style.fontWeight', e.target.value)}
                            className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="lighter">Lighter</option>
                          </select>
                        </div>
                      </>
                    )}

                    {selectedElement.type === 'emoji' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Emoji
                        </label>
                        <input
                          type="text"
                          value={selectedElement.content}
                          onChange={(e) => updateElementProperty(selectedElement.id, 'content', e.target.value)}
                          className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none text-center text-2xl"
                          maxLength={2}
                        />
                      </div>
                    )}

                    {selectedElement.type === 'image' && selectedElement.content !== 'uploaded-image' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Background Color
                        </label>
                        <input
                          type="color"
                          value={selectedElement.style?.backgroundColor || '#FF6B9D'}
                          onChange={(e) => updateElementProperty(selectedElement.id, 'style.backgroundColor', e.target.value)}
                          className="w-full h-10 rounded-lg border border-gray-700"
                        />
                      </div>
                    )}

                    {/* Position and Size */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">X</label>
                        <input
                          type="number"
                          value={Math.round(selectedElement.x)}
                          onChange={(e) => updateElementProperty(selectedElement.id, 'x', parseInt(e.target.value) || 0)}
                          className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Y</label>
                        <input
                          type="number"
                          value={Math.round(selectedElement.y)}
                          onChange={(e) => updateElementProperty(selectedElement.id, 'y', parseInt(e.target.value) || 0)}
                          className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Width</label>
                        <input
                          type="number"
                          value={Math.round(selectedElement.width)}
                          onChange={(e) => updateElementProperty(selectedElement.id, 'width', Math.max(20, parseInt(e.target.value) || 20))}
                          className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Height</label>
                        <input
                          type="number"
                          value={Math.round(selectedElement.height)}
                          onChange={(e) => updateElementProperty(selectedElement.id, 'height', Math.max(20, parseInt(e.target.value) || 20))}
                          className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Transform Controls */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rotation
                      </label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedElement.rotation}
                        onChange={(e) => updateElementProperty(selectedElement.id, 'rotation', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        {selectedElement.rotation}°
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateElementProperty(selectedElement.id, 'flipX', !selectedElement.flipX)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedElement.flipX ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <FlipHorizontal size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => updateElementProperty(selectedElement.id, 'flipY', !selectedElement.flipY)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedElement.flipY ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <FlipVertical size={16} className="mx-auto" />
                      </button>
                    </div>

                    {/* Layer Controls */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Layer Order
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => moveElementUp(selectedElement.id)}
                          className="bg-gray-700 text-gray-300 rounded-lg py-2 text-sm hover:bg-gray-600 transition-colors"
                        >
                          <ChevronUp size={16} className="inline mr-1" />
                          Up
                        </button>
                        <button
                          onClick={() => moveElementDown(selectedElement.id)}
                          className="bg-gray-700 text-gray-300 rounded-lg py-2 text-sm hover:bg-gray-600 transition-colors"
                        >
                          <ChevronDown size={16} className="inline mr-1" />
                          Down
                        </button>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteElement(selectedElement.id)}
                      className="w-full bg-red-500 text-white rounded-lg py-2 font-semibold hover:bg-red-400 transition-colors"
                    >
                      <Trash2 size={16} className="inline mr-2" />
                      Delete Element
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <MousePointer size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-hand">Select an element to edit properties</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
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
              <h2 className="text-xl font-bold text-white mb-4 font-sketch">
                💾 Save Sticker
              </h2>

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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Sticker Pack
                    </label>
                    <button
                      onClick={() => setCreateNewPack(!createNewPack)}
                      className="text-xs text-primary hover:text-white transition-colors"
                    >
                      {createNewPack ? 'Use Existing' : 'Create New'}
                    </button>
                  </div>

                  {createNewPack ? (
                    <input
                      type="text"
                      value={newPackName}
                      onChange={(e) => setNewPackName(e.target.value)}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                      placeholder="New pack name"
                    />
                  ) : (
                    <select
                      value={selectedPackId}
                      onChange={(e) => setSelectedPackId(e.target.value)}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    >
                      {stickerPacks.filter(pack => pack.owned).map((pack) => (
                        <option key={pack.id} value={pack.id}>
                          {pack.name} ({pack.count} stickers)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSticker}
                  className="flex-1 py-2 bg-gradient-to-r from-primary to-purple text-white rounded-lg font-semibold hover:from-primary/90 hover:to-purple/90 transition-colors"
                >
                  Save Sticker
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close layer menu */}
      {layerMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setLayerMenuOpen(null)}
        />
      )}
    </div>
  );
};
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Palette, 
  Plus, 
  Save, 
  Undo, 
  Redo, 
  Grid, 
  Type, 
  Smile, 
  Square, 
  Image as ImageIcon, 
  MousePointer, 
  Trash2, 
  Eye, 
  EyeOff, 
  RotateCw, 
  Copy, 
  Layers,
  Search,
  Filter,
  ShoppingCart,
  Star,
  Download,
  Share2,
  Edit3,
  X,
  Check,
  Package
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

interface CanvasElement extends StickerElement {
  isSelected?: boolean;
  isDragging?: boolean;
  isResizing?: boolean;
}

interface ResizeHandle {
  position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  x: number;
  y: number;
}

export const StickersView = () => {
  const { 
    stickers, 
    stickerPacks, 
    addSticker, 
    addStickerToPack, 
    updateStickerUsage, 
    updateUserPoints,
    purchaseStickerPack,
    currentUser,
    addStickerPack
  } = useStore();

  // Main state
  const [activeTab, setActiveTab] = useState<'create' | 'gallery' | 'packs'>('create');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Creator state
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'emoji' | 'shape' | 'image'>('select');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [canvasSize] = useState({ width: 300, height: 300 });
  
  // Drag and resize state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    elementId: string | null;
    startX: number;
    startY: number;
    startElementX: number;
    startElementY: number;
  }>({
    isDragging: false,
    elementId: null,
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0,
  });
  
  const [resizeState, setResizeState] = useState<{
    isResizing: boolean;
    elementId: string | null;
    handle: string | null;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startElementX: number;
    startElementY: number;
  }>({
    isResizing: false,
    elementId: null,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startElementX: 0,
    startElementY: 0,
  });

  // Text properties
  const [textProperties, setTextProperties] = useState({
    content: 'Your Text',
    fontSize: 24,
    color: '#FF6B9D',
    fontFamily: 'Arial',
    fontWeight: 'normal',
  });

  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveData, setSaveData] = useState({
    name: '',
    tags: [] as string[],
    packId: 'pack-default',
    newPackName: '',
    createNewPack: false,
  });

  // Gallery state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Color palettes
  const colorPalettes = {
    vibrant: ['#FF6B9D', '#4ECDC4', '#FFE66D', '#FF8A5B', '#9B59B6', '#E74C3C', '#3498DB', '#2ECC71'],
    pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFD1DC', '#E0BBE4', '#C7CEEA', '#FFDAB9'],
    dark: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1', '#1ABC9C', '#16A085'],
    neon: ['#FF073A', '#00FF41', '#0066FF', '#FF6600', '#FF00FF', '#00FFFF', '#FFFF00', '#FF0080'],
  };

  const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Comic Sans MS'];

  const emojiCategories = {
    faces: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕'],
    objects: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭'],
  };

  const shapes = [
    { type: 'rectangle', name: 'Rectangle', icon: '▭' },
    { type: 'circle', name: 'Circle', icon: '●' },
    { type: 'triangle', name: 'Triangle', icon: '▲' },
    { type: 'heart', name: 'Heart', icon: '♥' },
    { type: 'star', name: 'Star', icon: '★' },
  ];

  // Add element to canvas
  const addElement = useCallback((type: StickerElement['type'], content: string, additionalProps: Partial<StickerElement> = {}) => {
    const newElement: CanvasElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      x: Math.random() * (canvasSize.width - 100),
      y: Math.random() * (canvasSize.height - 100),
      width: type === 'text' ? 120 : 60,
      height: type === 'text' ? 40 : 60,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length,
      style: type === 'text' ? {
        fontSize: textProperties.fontSize,
        color: textProperties.color,
        fontFamily: textProperties.fontFamily,
        fontWeight: textProperties.fontWeight,
      } : undefined,
      ...additionalProps,
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElementId(newElement.id);
    saveToHistory(newElements);
  }, [elements, canvasSize, textProperties]);

  // Save to history for undo/redo
  const saveToHistory = useCallback((newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo/Redo functions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
      setSelectedElementId(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
      setSelectedElementId(null);
    }
  }, [history, historyIndex]);

  // Get mouse position relative to canvas
  const getMousePosition = useCallback((e: React.MouseEvent, canvas: HTMLElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Mouse event handlers for drag and resize
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canvasRef.current) return;
    
    const mousePos = getMousePosition(e, canvasRef.current);
    const element = elements.find(el => el.id === elementId);
    
    if (!element) return;
    
    setSelectedElementId(elementId);
    
    if (action === 'drag') {
      setDragState({
        isDragging: true,
        elementId,
        startX: mousePos.x,
        startY: mousePos.y,
        startElementX: element.x,
        startElementY: element.y,
      });
    } else if (action === 'resize' && handle) {
      setResizeState({
        isResizing: true,
        elementId,
        handle,
        startX: mousePos.x,
        startY: mousePos.y,
        startWidth: element.width,
        startHeight: element.height,
        startElementX: element.x,
        startElementY: element.y,
      });
    }
  }, [elements, getMousePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const mousePos = getMousePosition(e, canvasRef.current);
    
    // Handle dragging
    if (dragState.isDragging && dragState.elementId) {
      const deltaX = mousePos.x - dragState.startX;
      const deltaY = mousePos.y - dragState.startY;
      
      setElements(prev => prev.map(el => 
        el.id === dragState.elementId 
          ? {
              ...el,
              x: Math.max(0, Math.min(canvasSize.width - el.width, dragState.startElementX + deltaX)),
              y: Math.max(0, Math.min(canvasSize.height - el.height, dragState.startElementY + deltaY)),
            }
          : el
      ));
    }
    
    // Handle resizing
    if (resizeState.isResizing && resizeState.elementId) {
      const deltaX = mousePos.x - resizeState.startX;
      const deltaY = mousePos.y - resizeState.startY;
      
      setElements(prev => prev.map(el => {
        if (el.id !== resizeState.elementId) return el;
        
        let newWidth = resizeState.startWidth;
        let newHeight = resizeState.startHeight;
        let newX = resizeState.startElementX;
        let newY = resizeState.startElementY;
        
        switch (resizeState.handle) {
          case 'se': // Bottom-right
            newWidth = Math.max(20, resizeState.startWidth + deltaX);
            newHeight = Math.max(20, resizeState.startHeight + deltaY);
            break;
          case 'sw': // Bottom-left
            newWidth = Math.max(20, resizeState.startWidth - deltaX);
            newHeight = Math.max(20, resizeState.startHeight + deltaY);
            newX = resizeState.startElementX + deltaX;
            break;
          case 'ne': // Top-right
            newWidth = Math.max(20, resizeState.startWidth + deltaX);
            newHeight = Math.max(20, resizeState.startHeight - deltaY);
            newY = resizeState.startElementY + deltaY;
            break;
          case 'nw': // Top-left
            newWidth = Math.max(20, resizeState.startWidth - deltaX);
            newHeight = Math.max(20, resizeState.startHeight - deltaY);
            newX = resizeState.startElementX + deltaX;
            newY = resizeState.startElementY + deltaY;
            break;
          case 'e': // Right
            newWidth = Math.max(20, resizeState.startWidth + deltaX);
            break;
          case 'w': // Left
            newWidth = Math.max(20, resizeState.startWidth - deltaX);
            newX = resizeState.startElementX + deltaX;
            break;
          case 's': // Bottom
            newHeight = Math.max(20, resizeState.startHeight + deltaY);
            break;
          case 'n': // Top
            newHeight = Math.max(20, resizeState.startHeight - deltaY);
            newY = resizeState.startElementY + deltaY;
            break;
        }
        
        // Ensure element stays within canvas bounds
        newX = Math.max(0, Math.min(canvasSize.width - newWidth, newX));
        newY = Math.max(0, Math.min(canvasSize.height - newHeight, newY));
        
        return {
          ...el,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };
      }));
    }
  }, [dragState, resizeState, getMousePosition, canvasSize]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging || resizeState.isResizing) {
      saveToHistory(elements);
    }
    
    setDragState({
      isDragging: false,
      elementId: null,
      startX: 0,
      startY: 0,
      startElementX: 0,
      startElementY: 0,
    });
    
    setResizeState({
      isResizing: false,
      elementId: null,
      handle: null,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      startElementX: 0,
      startElementY: 0,
    });
  }, [dragState.isDragging, resizeState.isResizing, elements, saveToHistory]);

  // Add global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragState.isDragging || resizeState.isResizing) {
        handleMouseMove(e as any);
      }
    };
    
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };
    
    if (dragState.isDragging || resizeState.isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState.isDragging, resizeState.isResizing, handleMouseMove, handleMouseUp]);

  // Get resize handles for selected element
  const getResizeHandles = useCallback((element: CanvasElement): ResizeHandle[] => {
    const handles: ResizeHandle[] = [];
    const { x, y, width, height } = element;
    
    // Corner handles
    handles.push(
      { position: 'nw', x: x - 4, y: y - 4 },
      { position: 'ne', x: x + width - 4, y: y - 4 },
      { position: 'sw', x: x - 4, y: y + height - 4 },
      { position: 'se', x: x + width - 4, y: y + height - 4 }
    );
    
    // Edge handles
    handles.push(
      { position: 'n', x: x + width / 2 - 4, y: y - 4 },
      { position: 's', x: x + width / 2 - 4, y: y + height - 4 },
      { position: 'w', x: x - 4, y: y + height / 2 - 4 },
      { position: 'e', x: x + width - 4, y: y + height / 2 - 4 }
    );
    
    return handles;
  }, []);

  // Update element properties
  const updateElement = useCallback((elementId: string, updates: Partial<StickerElement>) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);

  // Delete element
  const deleteElement = useCallback((elementId: string) => {
    const newElements = elements.filter(el => el.id !== elementId);
    setElements(newElements);
    setSelectedElementId(null);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB! 📏');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      addElement('image', file.name, { imageData });
      toast.success('Image added to canvas! 🖼️');
    };
    reader.readAsDataURL(file);
  }, [addElement]);

  // Render shape
  const renderShape = useCallback((element: CanvasElement) => {
    const { content, width, height, style } = element;
    const color = style?.color || '#FF6B9D';
    
    switch (content) {
      case 'rectangle':
        return (
          <div 
            className="w-full h-full border-2 rounded"
            style={{ 
              backgroundColor: color + '40',
              borderColor: color,
            }}
          />
        );
      case 'circle':
        return (
          <div 
            className="w-full h-full border-2 rounded-full"
            style={{ 
              backgroundColor: color + '40',
              borderColor: color,
            }}
          />
        );
      case 'triangle':
        return (
          <div 
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ color }}
          >
            ▲
          </div>
        );
      case 'heart':
        return (
          <div 
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ color }}
          >
            ♥
          </div>
        );
      case 'star':
        return (
          <div 
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ color }}
          >
            ★
          </div>
        );
      default:
        return null;
    }
  }, []);

  // Save sticker function
  const handleSaveSticker = useCallback(async () => {
    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    if (!saveData.name.trim()) {
      toast.error('Give your sticker a name! 📝');
      return;
    }

    try {
      // Create the sticker object
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: saveData.name.trim(),
        imageUrl: `data:image/svg+xml;base64,${btoa('<svg>placeholder</svg>')}`, // Placeholder
        tags: saveData.tags,
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        elementData: elements.map(el => ({
          id: el.id,
          type: el.type,
          content: el.content,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation,
          flipX: el.flipX,
          flipY: el.flipY,
          layer: el.layer,
          style: el.style,
          imageData: el.imageData,
        })),
      };

      // Handle pack selection
      let targetPackId = saveData.packId;
      
      if (saveData.createNewPack && saveData.newPackName.trim()) {
        // Create new pack
        const newPack = {
          id: `pack-${Date.now()}`,
          name: saveData.newPackName.trim(),
          description: `Custom pack created by ${currentUser?.username || 'User'}`,
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

      // Add sticker to the selected/created pack
      addStickerToPack(newSticker, targetPackId);
      updateUserPoints(10);

      // Reset states
      setElements([]);
      setSelectedElementId(null);
      setHistory([[]]);
      setHistoryIndex(0);
      setShowSaveModal(false);
      setSaveData({
        name: '',
        tags: [],
        packId: 'pack-default',
        newPackName: '',
        createNewPack: false,
      });

      toast.success(`Sticker "${newSticker.name}" saved successfully! 🎉 (+10 CP)`);
      
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker. Please try again! 😞');
    }
  }, [elements, saveData, currentUser, addStickerToPack, addStickerPack, updateUserPoints]);

  // Add tag to save data
  const addTag = useCallback((tag: string) => {
    if (tag.trim() && !saveData.tags.includes(tag.trim())) {
      setSaveData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  }, [saveData.tags]);

  // Remove tag from save data
  const removeTag = useCallback((tagToRemove: string) => {
    setSaveData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Get selected element
  const selectedElement = selectedElementId ? elements.find(el => el.id === selectedElementId) : null;

  // Filter stickers for gallery
  const filteredStickers = stickers.filter(sticker => {
    const matchesSearch = sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sticker.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || sticker.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

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
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 max-w-md mx-auto">
            {[
              { id: 'create', label: 'Create', icon: Palette },
              { id: 'gallery', label: 'Gallery', icon: Eye },
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
                {/* Tools Panel */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Tool Selection */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 font-sketch">Tools</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                      {[
                        { id: 'select', label: 'Select', icon: MousePointer },
                        { id: 'text', label: 'Text', icon: Type },
                        { id: 'emoji', label: 'Emoji', icon: Smile },
                        { id: 'shape', label: 'Shape', icon: Square },
                        { id: 'image', label: 'Image', icon: ImageIcon },
                      ].map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as any)}
                            className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
                              activeTool === tool.id
                                ? 'bg-secondary text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <Icon size={16} />
                            <span className="text-sm font-medium">{tool.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tool-specific options */}
                  {activeTool === 'text' && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-bold mb-3">Text Options</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Content</label>
                          <input
                            type="text"
                            value={textProperties.content}
                            onChange={(e) => setTextProperties(prev => ({ ...prev, content: e.target.value }))}
                            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Font Size</label>
                          <input
                            type="range"
                            min="12"
                            max="72"
                            value={textProperties.fontSize}
                            onChange={(e) => setTextProperties(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-400">{textProperties.fontSize}px</span>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Font Family</label>
                          <select
                            value={textProperties.fontFamily}
                            onChange={(e) => setTextProperties(prev => ({ ...prev, fontFamily: e.target.value }))}
                            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                          >
                            {fontFamilies.map(font => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">Colors</label>
                          <div className="grid grid-cols-4 gap-1">
                            {colorPalettes.vibrant.map(color => (
                              <button
                                key={color}
                                onClick={() => setTextProperties(prev => ({ ...prev, color }))}
                                className={`w-8 h-8 rounded border-2 ${
                                  textProperties.color === color ? 'border-white' : 'border-gray-600'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => addElement('text', textProperties.content, {
                            style: {
                              fontSize: textProperties.fontSize,
                              color: textProperties.color,
                              fontFamily: textProperties.fontFamily,
                              fontWeight: textProperties.fontWeight,
                            }
                          })}
                          className="w-full bg-secondary text-white rounded-lg py-2 font-semibold hover:bg-secondary/90 transition-colors"
                        >
                          Add Text
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTool === 'emoji' && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-bold mb-3">Emojis</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {Object.entries(emojiCategories).map(([category, emojis]) => (
                          <div key={category}>
                            <h5 className="text-xs text-gray-400 mb-2 capitalize">{category}</h5>
                            <div className="grid grid-cols-6 gap-1">
                              {emojis.slice(0, 12).map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => addElement('emoji', emoji)}
                                  className="p-1 text-lg hover:bg-gray-700 rounded transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTool === 'shape' && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-bold mb-3">Shapes</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">Color</label>
                          <div className="grid grid-cols-4 gap-1">
                            {colorPalettes.vibrant.map(color => (
                              <button
                                key={color}
                                onClick={() => setTextProperties(prev => ({ ...prev, color }))}
                                className={`w-8 h-8 rounded border-2 ${
                                  textProperties.color === color ? 'border-white' : 'border-gray-600'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {shapes.map(shape => (
                            <button
                              key={shape.type}
                              onClick={() => addElement('shape', shape.type, {
                                style: { color: textProperties.color }
                              })}
                              className="flex items-center space-x-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                            >
                              <span className="text-lg">{shape.icon}</span>
                              <span className="text-sm">{shape.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTool === 'image' && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-bold mb-3">Image Upload</h4>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-3 border-2 border-dashed border-gray-600 transition-colors"
                      >
                        <ImageIcon size={24} className="mx-auto mb-2" />
                        <span className="text-sm">Click to upload image</span>
                        <p className="text-xs text-gray-400 mt-1">Max 5MB</p>
                      </button>
                    </div>
                  )}

                  {/* Canvas Controls */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3">Canvas</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2 transition-colors"
                      >
                        <Undo size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2 transition-colors"
                      >
                        <Redo size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`flex-1 rounded-lg py-2 transition-colors ${
                          showGrid ? 'bg-secondary text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                      >
                        <Grid size={16} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold font-sketch">Canvas</h3>
                      <button
                        onClick={() => setShowSaveModal(true)}
                        disabled={elements.length === 0}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                      >
                        <Save size={16} />
                        <span>Save Sticker</span>
                      </button>
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
                        onClick={(e) => {
                          if (e.target === e.currentTarget) {
                            setSelectedElementId(null);
                          }
                        }}
                      >
                        {/* Render elements */}
                        {elements.map((element) => (
                          <div
                            key={element.id}
                            className={`absolute select-none ${
                              selectedElementId === element.id ? 'ring-2 ring-secondary' : ''
                            }`}
                            style={{
                              left: element.x,
                              top: element.y,
                              width: element.width,
                              height: element.height,
                              transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                              zIndex: element.layer,
                              cursor: activeTool === 'select' ? 'move' : 'default',
                            }}
                            onMouseDown={(e) => {
                              if (activeTool === 'select') {
                                handleMouseDown(e, element.id, 'drag');
                              }
                            }}
                          >
                            {/* Element content */}
                            {element.type === 'text' && (
                              <div
                                className="w-full h-full flex items-center justify-center text-center break-words"
                                style={{
                                  fontSize: element.style?.fontSize || 24,
                                  color: element.style?.color || '#000',
                                  fontFamily: element.style?.fontFamily || 'Arial',
                                  fontWeight: element.style?.fontWeight || 'normal',
                                }}
                              >
                                {element.content}
                              </div>
                            )}
                            
                            {element.type === 'emoji' && (
                              <div className="w-full h-full flex items-center justify-center text-4xl">
                                {element.content}
                              </div>
                            )}
                            
                            {element.type === 'shape' && renderShape(element)}
                            
                            {element.type === 'image' && element.imageData && (
                              <img
                                src={element.imageData}
                                alt={element.content}
                                className="w-full h-full object-cover rounded"
                                draggable={false}
                              />
                            )}
                          </div>
                        ))}
                        
                        {/* Resize handles for selected element */}
                        {selectedElement && activeTool === 'select' && (
                          <>
                            {getResizeHandles(selectedElement).map((handle) => (
                              <div
                                key={handle.position}
                                className="absolute w-2 h-2 bg-secondary border border-white rounded-sm cursor-pointer z-50"
                                style={{
                                  left: handle.x,
                                  top: handle.y,
                                  cursor: `${handle.position}-resize`,
                                }}
                                onMouseDown={(e) => {
                                  handleMouseDown(e, selectedElement.id, 'resize', handle.position);
                                }}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Properties Panel */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Layers */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3">Layers</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {elements
                        .sort((a, b) => b.layer - a.layer)
                        .map((element, index) => (
                          <div
                            key={element.id}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                              selectedElementId === element.id
                                ? 'bg-secondary text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                            onClick={() => setSelectedElementId(element.id)}
                          >
                            <span className="text-sm flex-1 truncate">
                              {element.type === 'text' ? element.content : 
                               element.type === 'emoji' ? element.content :
                               element.type === 'shape' ? `Shape (${element.content})` :
                               element.type === 'image' ? 'Image' : element.type}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(element.id);
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      {elements.length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-4">
                          No elements yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Element Properties */}
                  {selectedElement && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-bold mb-3">Properties</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">X</label>
                            <input
                              type="number"
                              value={Math.round(selectedElement.x)}
                              onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                              className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">Y</label>
                            <input
                              type="number"
                              value={Math.round(selectedElement.y)}
                              onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                              className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">Width</label>
                            <input
                              type="number"
                              value={Math.round(selectedElement.width)}
                              onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) || 20 })}
                              className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">Height</label>
                            <input
                              type="number"
                              value={Math.round(selectedElement.height)}
                              onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 20 })}
                              className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Rotation</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={selectedElement.rotation}
                            onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-400">{selectedElement.rotation}°</span>
                        </div>

                        {selectedElement.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-xs text-gray-300 mb-1">Content</label>
                              <input
                                type="text"
                                value={selectedElement.content}
                                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                                className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-300 mb-1">Font Size</label>
                              <input
                                type="range"
                                min="12"
                                max="72"
                                value={selectedElement.style?.fontSize || 24}
                                onChange={(e) => updateElement(selectedElement.id, {
                                  style: { ...selectedElement.style, fontSize: parseInt(e.target.value) }
                                })}
                                className="w-full"
                              />
                              <span className="text-xs text-gray-400">{selectedElement.style?.fontSize || 24}px</span>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-300 mb-1">Color</label>
                              <div className="grid grid-cols-4 gap-1">
                                {colorPalettes.vibrant.map(color => (
                                  <button
                                    key={color}
                                    onClick={() => updateElement(selectedElement.id, {
                                      style: { ...selectedElement.style, color }
                                    })}
                                    className={`w-6 h-6 rounded border ${
                                      selectedElement.style?.color === color ? 'border-white border-2' : 'border-gray-600'
                                    }`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {(selectedElement.type === 'shape') && (
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">Color</label>
                            <div className="grid grid-cols-4 gap-1">
                              {colorPalettes.vibrant.map(color => (
                                <button
                                  key={color}
                                  onClick={() => updateElement(selectedElement.id, {
                                    style: { ...selectedElement.style, color }
                                  })}
                                  className={`w-6 h-6 rounded border ${
                                    selectedElement.style?.color === color ? 'border-white border-2' : 'border-gray-600'
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => deleteElement(selectedElement.id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 font-semibold transition-colors flex items-center justify-center space-x-2"
                        >
                          <Trash2 size={16} />
                          <span>Delete Element</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Search and Filters */}
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search stickers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-secondary focus:outline-none"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-secondary focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="custom">Custom</option>
                      <option value="roast">Roast</option>
                      <option value="wholesome">Wholesome</option>
                      <option value="meme">Meme</option>
                    </select>
                    <div className="flex bg-gray-700 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-secondary text-white' : 'text-gray-400'}`}
                      >
                        <Grid size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-secondary text-white' : 'text-gray-400'}`}
                      >
                        <Layers size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stickers Grid/List */}
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' 
                    : 'grid-cols-1'
                }`}>
                  {filteredStickers.map((sticker, index) => (
                    <motion.div
                      key={sticker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-dark-card rounded-xl border border-gray-800 overflow-hidden hover:border-secondary transition-colors ${
                        viewMode === 'list' ? 'flex items-center p-4' : 'p-4'
                      }`}
                    >
                      <div className={`${viewMode === 'list' ? 'w-16 h-16 mr-4' : 'w-full h-32'} bg-white rounded-lg flex items-center justify-center mb-3`}>
                        {sticker.elementData && sticker.elementData.length > 0 ? (
                          <div className="relative w-full h-full">
                            {sticker.elementData.map((element) => (
                              <div
                                key={element.id}
                                className="absolute"
                                style={{
                                  left: `${(element.x / 300) * 100}%`,
                                  top: `${(element.y / 300) * 100}%`,
                                  width: `${(element.width / 300) * 100}%`,
                                  height: `${(element.height / 300) * 100}%`,
                                  transform: `rotate(${element.rotation}deg)`,
                                  fontSize: element.type === 'text' ? `${(element.style?.fontSize || 24) * 0.3}px` : undefined,
                                  color: element.style?.color,
                                  fontFamily: element.style?.fontFamily,
                                }}
                              >
                                {element.type === 'text' && element.content}
                                {element.type === 'emoji' && (
                                  <span style={{ fontSize: '1.5em' }}>{element.content}</span>
                                )}
                                {element.type === 'image' && element.imageData && (
                                  <img src={element.imageData} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-4xl">🎨</span>
                        )}
                      </div>
                      
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <h4 className="text-white font-semibold text-sm mb-1">{sticker.name}</h4>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {sticker.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Used {sticker.usageCount} times</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                updateStickerUsage(sticker.id);
                                toast.success(`Used "${sticker.name}" sticker! 🎨`);
                              }}
                              className="p-1 hover:text-secondary transition-colors"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`Sticker: ${sticker.name}`);
                                toast.success('Sticker link copied! 📋');
                              }}
                              className="p-1 hover:text-secondary transition-colors"
                            >
                              <Share2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredStickers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Palette size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No stickers found</p>
                    <p className="text-sm">Try adjusting your search or create some stickers!</p>
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {stickerPacks.map((pack, index) => (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-dark-card rounded-xl p-6 border border-gray-800 hover:border-secondary transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg">{pack.name}</h3>
                      {pack.owned ? (
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          Owned
                        </span>
                      ) : (
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                          {pack.price} CP
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4">{pack.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400 text-sm">{pack.count} stickers</span>
                      <span className="text-gray-400 text-sm capitalize">{pack.category}</span>
                    </div>
                    
                    {!pack.owned && (
                      <button
                        onClick={() => {
                          if (currentUser && currentUser.clownPoints >= pack.price) {
                            purchaseStickerPack(pack.id, currentUser.id);
                            toast.success(`Purchased ${pack.name}! 🛒`);
                          } else {
                            toast.error('Not enough ClownPoints! 💰');
                          }
                        }}
                        disabled={!currentUser || currentUser.clownPoints < pack.price}
                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2 font-semibold transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart size={16} />
                        <span>Purchase Pack</span>
                      </button>
                    )}
                  </motion.div>
                ))}
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
                    value={saveData.name}
                    onChange={(e) => setSaveData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-secondary focus:outline-none"
                    placeholder="Enter sticker name..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (press Enter to add)
                  </label>
                  <input
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-secondary focus:outline-none"
                    placeholder="Add tags..."
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {saveData.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-secondary text-white px-2 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-300 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Save to Pack
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="existing-pack"
                        name="pack-option"
                        checked={!saveData.createNewPack}
                        onChange={() => setSaveData(prev => ({ ...prev, createNewPack: false }))}
                        className="text-secondary"
                      />
                      <label htmlFor="existing-pack" className="text-gray-300">
                        Existing Pack
                      </label>
                    </div>
                    
                    {!saveData.createNewPack && (
                      <select
                        value={saveData.packId}
                        onChange={(e) => setSaveData(prev => ({ ...prev, packId: e.target.value }))}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-secondary focus:outline-none"
                      >
                        {stickerPacks.filter(pack => pack.owned).map(pack => (
                          <option key={pack.id} value={pack.id}>
                            {pack.name} ({pack.count} stickers)
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="new-pack"
                        name="pack-option"
                        checked={saveData.createNewPack}
                        onChange={() => setSaveData(prev => ({ ...prev, createNewPack: true }))}
                        className="text-secondary"
                      />
                      <label htmlFor="new-pack" className="text-gray-300">
                        Create New Pack
                      </label>
                    </div>
                    
                    {saveData.createNewPack && (
                      <input
                        type="text"
                        value={saveData.newPackName}
                        onChange={(e) => setSaveData(prev => ({ ...prev, newPackName: e.target.value }))}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-secondary focus:outline-none"
                        placeholder="New pack name..."
                      />
                    )}
                  </div>
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
                  disabled={!saveData.name.trim() || (saveData.createNewPack && !saveData.newPackName.trim())}
                  className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Sticker</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
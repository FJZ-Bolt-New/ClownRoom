import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Download, 
  Share2, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Smile, 
  RotateCcw, 
  Save,
  Trash2,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  X,
  Check,
  Package,
  FolderPlus
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    addSticker, 
    updateUserPoints, 
    stickerPacks, 
    addStickerPack, 
    addStickerToPack,
    updateStickerPack 
  } = useStore();
  
  // Canvas state
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [currentLayer, setCurrentLayer] = useState(1);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'create' | 'my-stickers' | 'packs'>('create');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF6B9D');
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [showPreview, setShowPreview] = useState(false);
  const [previewSticker, setPreviewSticker] = useState<Sticker | null>(null);
  
  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [stickerName, setStickerName] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('pack-default');
  const [createNewPack, setCreateNewPack] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [newPackDescription, setNewPackDescription] = useState('');
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Colors and fonts
  const colors = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#FF8A5B', '#9B59B6', '#E74C3C', '#2ECC71', '#3498DB', '#F1C40F', '#95A5A6'];
  const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Comic Sans MS'];
  const emojis = ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀', '🔥', '💯', '⚡', '💎', '🌟', '✨', '🎉', '🎊', '🎈', '🎁'];

  // Generate auto sticker name
  const generateStickerName = () => {
    const adjectives = ['Epic', 'Crazy', 'Wild', 'Awesome', 'Chaotic', 'Legendary', 'Mystic', 'Cosmic'];
    const nouns = ['Sticker', 'Creation', 'Masterpiece', 'Art', 'Design', 'Chaos', 'Magic', 'Wonder'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun} ${Date.now().toString().slice(-4)}`;
  };

  // Initialize sticker name when modal opens
  useEffect(() => {
    if (showSaveModal && !stickerName) {
      setStickerName(generateStickerName());
    }
  }, [showSaveModal, stickerName]);

  // Add text element
  const addTextElement = () => {
    if (!textInput.trim()) {
      toast.error('Enter some text first! ✏️');
      return;
    }

    const newElement: StickerElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: textInput,
      x: 50,
      y: 50,
      width: 100,
      height: 30,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
      style: {
        fontSize: 24,
        color: selectedColor,
        fontFamily: selectedFont,
        fontWeight: 'normal',
      },
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setTextInput('');
    toast.success('Text added! 📝');
  };

  // Add emoji element
  const addEmojiElement = (emoji: string) => {
    const newElement: StickerElement = {
      id: `emoji-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 75,
      y: 75,
      width: 50,
      height: 50,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setShowEmojiPicker(false);
    toast.success(`${emoji} added!`);
  };

  // Add image element
  const addImageElement = () => {
    fileInputRef.current?.click();
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
      const newElement: StickerElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        content: file.name,
        x: 25,
        y: 25,
        width: 100,
        height: 100,
        rotation: 0,
        flipX: false,
        flipY: false,
        layer: elements.length + 1,
        imageData: e.target?.result as string,
      };

      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      toast.success('Image added! 🖼️');
    };
    reader.readAsDataURL(file);
  };

  // Element manipulation functions
  const updateElement = (id: string, updates: Partial<StickerElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    toast.success('Element deleted! 🗑️');
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    setCurrentLayer(1);
    toast.success('Canvas cleared! 🧹');
  };

  // Layer management
  const moveLayer = (elementId: string, direction: 'up' | 'down') => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const maxLayer = Math.max(...elements.map(el => el.layer));
    const minLayer = Math.min(...elements.map(el => el.layer));

    if (direction === 'up' && element.layer < maxLayer) {
      // Find element with next higher layer
      const nextElement = elements.find(el => el.layer === element.layer + 1);
      if (nextElement) {
        updateElement(element.id, { layer: element.layer + 1 });
        updateElement(nextElement.id, { layer: nextElement.layer - 1 });
      }
    } else if (direction === 'down' && element.layer > minLayer) {
      // Find element with next lower layer
      const prevElement = elements.find(el => el.layer === element.layer - 1);
      if (prevElement) {
        updateElement(element.id, { layer: element.layer - 1 });
        updateElement(prevElement.id, { layer: prevElement.layer + 1 });
      }
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedElement(elementId);
    setDraggedElement(elementId);
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(300 - 50, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(300 - 50, e.clientY - rect.top - dragOffset.y));

    updateElement(draggedElement, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, elementId: string, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setSelectedElement(elementId);
  };

  const handleResize = (e: React.MouseEvent) => {
    if (!isResizing || !selectedElement || !resizeHandle) return;

    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let newWidth = element.width;
    let newHeight = element.height;
    let newX = element.x;
    let newY = element.y;

    switch (resizeHandle) {
      case 'se': // Southeast corner
        newWidth = Math.max(20, mouseX - element.x);
        newHeight = Math.max(20, mouseY - element.y);
        break;
      case 'sw': // Southwest corner
        newWidth = Math.max(20, element.x + element.width - mouseX);
        newHeight = Math.max(20, mouseY - element.y);
        newX = Math.max(0, mouseX);
        break;
      case 'ne': // Northeast corner
        newWidth = Math.max(20, mouseX - element.x);
        newHeight = Math.max(20, element.y + element.height - mouseY);
        newY = Math.max(0, mouseY);
        break;
      case 'nw': // Northwest corner
        newWidth = Math.max(20, element.x + element.width - mouseX);
        newHeight = Math.max(20, element.y + element.height - mouseY);
        newX = Math.max(0, mouseX);
        newY = Math.max(0, mouseY);
        break;
    }

    updateElement(selectedElement, {
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY,
    });
  };

  // Canvas to image conversion
  const canvasToImage = async (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 300;
      canvas.height = 300;
      
      if (!ctx) {
        resolve('');
        return;
      }

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);

      // Sort elements by layer
      const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);

      let loadedImages = 0;
      const totalImages = sortedElements.filter(el => el.type === 'image').length;

      const drawElement = (element: StickerElement) => {
        ctx.save();
        
        // Apply transformations
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.scale(element.flipX ? -1 : 1, element.flipY ? -1 : 1);

        if (element.type === 'text') {
          ctx.fillStyle = element.style?.color || '#000000';
          ctx.font = `${element.style?.fontWeight || 'normal'} ${element.style?.fontSize || 24}px ${element.style?.fontFamily || 'Arial'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content, 0, 0);
        } else if (element.type === 'emoji') {
          ctx.font = `${element.height}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content, 0, 0);
        }
        
        ctx.restore();
      };

      const checkComplete = () => {
        if (totalImages === 0 || loadedImages === totalImages) {
          // Draw all non-image elements
          sortedElements.forEach(element => {
            if (element.type !== 'image') {
              drawElement(element);
            }
          });
          
          resolve(canvas.toDataURL('image/png'));
        }
      };

      // Handle images
      sortedElements.forEach(element => {
        if (element.type === 'image' && element.imageData) {
          const img = new Image();
          img.onload = () => {
            ctx.save();
            
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            
            ctx.translate(centerX, centerY);
            ctx.rotate((element.rotation * Math.PI) / 180);
            ctx.scale(element.flipX ? -1 : 1, element.flipY ? -1 : 1);
            
            ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
            ctx.restore();
            
            loadedImages++;
            checkComplete();
          };
          img.src = element.imageData;
        }
      });

      // If no images, complete immediately
      checkComplete();
    });
  };

  // FIXED: Save sticker function
  const handleSaveSticker = async () => {
    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    if (!stickerName.trim()) {
      toast.error('Please enter a sticker name! 📝');
      return;
    }

    if (createNewPack && !newPackName.trim()) {
      toast.error('Please enter a pack name! 📦');
      return;
    }

    try {
      // Convert canvas to image
      const imageUrl = await canvasToImage();
      
      // Create the sticker object
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName.trim(),
        imageUrl,
        tags: ['custom', 'user-created'],
        createdBy: 'user-1',
        usageCount: 0,
        elementData: elements, // Store element data for editing
      };

      let targetPackId = selectedPackId;

      // Create new pack if requested
      if (createNewPack) {
        const newPack = {
          id: `pack-${Date.now()}`,
          name: newPackName.trim(),
          description: newPackDescription.trim() || 'Custom sticker pack',
          stickers: [],
          category: 'custom' as const,
          count: 0,
          owned: true,
          price: 0,
          createdBy: 'user-1',
          createdAt: new Date(),
        };

        addStickerPack(newPack);
        targetPackId = newPack.id;
        toast.success(`New pack "${newPack.name}" created! 📦`);
      }

      // Add sticker to the target pack
      addStickerToPack(newSticker, targetPackId);
      
      // Update user points
      updateUserPoints(20);
      
      // Close modal and reset form
      setShowSaveModal(false);
      setStickerName('');
      setSelectedPackId('pack-default');
      setCreateNewPack(false);
      setNewPackName('');
      setNewPackDescription('');
      
      toast.success(`Sticker "${newSticker.name}" saved successfully! 🎉 (+20 CP)`);
      
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker! Please try again. 😞');
    }
  };

  // Download sticker
  const downloadSticker = async () => {
    if (elements.length === 0) {
      toast.error('Add some elements first! 🎨');
      return;
    }

    try {
      const imageUrl = await canvasToImage();
      const link = document.createElement('a');
      link.download = `sticker-${Date.now()}.png`;
      link.href = imageUrl;
      link.click();
      toast.success('Sticker downloaded! 💾');
    } catch (error) {
      toast.error('Failed to download sticker! 😞');
    }
  };

  // Share sticker
  const shareSticker = async () => {
    if (elements.length === 0) {
      toast.error('Add some elements first! 🎨');
      return;
    }

    try {
      const imageUrl = await canvasToImage();
      
      if (navigator.share) {
        // Convert data URL to blob for sharing
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'sticker.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'Check out my sticker!',
          text: 'I created this awesome sticker in ClownRoom! 🎨',
          files: [file],
        });
        toast.success('Sticker shared! 📤');
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText('Check out my awesome sticker from ClownRoom! 🎨');
        toast.success('Share text copied to clipboard! 📋');
      }
    } catch (error) {
      toast.error('Failed to share sticker! 😞');
    }
  };

  // Preview sticker
  const previewStickerImage = (sticker: Sticker) => {
    setPreviewSticker(sticker);
    setShowPreview(true);
  };

  // Get owned sticker packs for dropdown
  const ownedPacks = stickerPacks.filter(pack => pack.owned);

  // Get selected element
  const selectedEl = elements.find(el => el.id === selectedElement);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/20 to-dark relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🌈</div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 max-w-md mx-auto">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'my-stickers', label: 'My Stickers', icon: Package },
              { id: 'packs', label: 'Packs', icon: FolderPlus },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-secondary text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* Create Tab */}
            {activeTab === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Canvas */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg">Sticker Canvas</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowSaveModal(true)}
                          disabled={elements.length === 0}
                          className="px-4 py-2 bg-gradient-to-r from-primary to-purple text-white rounded-lg font-semibold hover:from-primary/90 hover:to-purple/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save size={16} />
                          <span>SAVE</span>
                        </button>
                        <button
                          onClick={downloadSticker}
                          disabled={elements.length === 0}
                          className="p-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={shareSticker}
                          disabled={elements.length === 0}
                          className="p-2 bg-accent text-dark rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={clearCanvas}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors"
                        >
                          <RotateCcw size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Canvas Area */}
                    <div
                      ref={canvasRef}
                      className="relative w-full h-80 bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden"
                      onMouseMove={isResizing ? handleResize : handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onClick={() => setSelectedElement(null)}
                    >
                      {elements
                        .sort((a, b) => a.layer - b.layer)
                        .map((element) => (
                          <div
                            key={element.id}
                            className={`absolute cursor-move select-none ${
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
                              setSelectedElement(element.id);
                            }}
                          >
                            {element.type === 'text' && (
                              <div
                                className="w-full h-full flex items-center justify-center text-center break-words"
                                style={{
                                  fontSize: element.style?.fontSize,
                                  color: element.style?.color,
                                  fontFamily: element.style?.fontFamily,
                                  fontWeight: element.style?.fontWeight,
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
                            
                            {element.type === 'image' && element.imageData && (
                              <img
                                src={element.imageData}
                                alt={element.content}
                                className="w-full h-full object-cover rounded"
                                draggable={false}
                              />
                            )}

                            {/* Resize handles */}
                            {selectedElement === element.id && (
                              <>
                                {['nw', 'ne', 'sw', 'se'].map((handle) => (
                                  <div
                                    key={handle}
                                    className={`absolute w-3 h-3 bg-primary border border-white rounded-full cursor-${handle}-resize ${
                                      handle === 'nw' ? '-top-1 -left-1' :
                                      handle === 'ne' ? '-top-1 -right-1' :
                                      handle === 'sw' ? '-bottom-1 -left-1' :
                                      '-bottom-1 -right-1'
                                    }`}
                                    onMouseDown={(e) => handleResizeStart(e, element.id, handle)}
                                  />
                                ))}
                              </>
                            )}
                          </div>
                        ))}

                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <Palette size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Start creating your sticker!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tools Panel */}
                <div className="space-y-4">
                  {/* Add Elements */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3">Add Elements</h4>
                    
                    {/* Text Input */}
                    <div className="space-y-3 mb-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Enter text..."
                          className="flex-1 bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && addTextElement()}
                        />
                        <button
                          onClick={addTextElement}
                          className="px-3 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                        >
                          <Type size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="flex items-center justify-center space-x-2 p-3 bg-accent text-dark rounded-lg hover:bg-accent/90 transition-colors"
                      >
                        <Smile size={16} />
                        <span className="text-sm font-medium">Emoji</span>
                      </button>
                      <button
                        onClick={addImageElement}
                        className="flex items-center justify-center space-x-2 p-3 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors"
                      >
                        <ImageIcon size={16} />
                        <span className="text-sm font-medium">Image</span>
                      </button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="grid grid-cols-5 gap-2 p-3 bg-dark-light rounded-lg mb-4">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmojiElement(emoji)}
                            className="p-2 text-2xl hover:bg-gray-700 rounded transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Color Picker */}
                    <div className="space-y-2">
                      <label className="text-gray-300 text-sm">Text Color</label>
                      <div className="grid grid-cols-5 gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              selectedColor === color ? 'border-white scale-110' : 'border-gray-600'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Font Selector */}
                    <div className="space-y-2 mt-4">
                      <label className="text-gray-300 text-sm">Font</label>
                      <select
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none text-sm"
                      >
                        {fonts.map((font) => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Properties Panel */}
                  {selectedEl && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-bold">Properties</h4>
                        <button
                          onClick={() => deleteElement(selectedEl.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Position */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-300 text-xs">X</label>
                            <input
                              type="number"
                              value={Math.round(selectedEl.x)}
                              onChange={(e) => updateElement(selectedEl.id, { x: parseInt(e.target.value) || 0 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-300 text-xs">Y</label>
                            <input
                              type="number"
                              value={Math.round(selectedEl.y)}
                              onChange={(e) => updateElement(selectedEl.id, { y: parseInt(e.target.value) || 0 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Size */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-300 text-xs">Width</label>
                            <input
                              type="number"
                              value={Math.round(selectedEl.width)}
                              onChange={(e) => updateElement(selectedEl.id, { width: Math.max(20, parseInt(e.target.value) || 20) })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-300 text-xs">Height</label>
                            <input
                              type="number"
                              value={Math.round(selectedEl.height)}
                              onChange={(e) => updateElement(selectedEl.id, { height: Math.max(20, parseInt(e.target.value) || 20) })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Rotation */}
                        <div>
                          <label className="text-gray-300 text-xs">Rotation</label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={selectedEl.rotation}
                            onChange={(e) => updateElement(selectedEl.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <div className="text-center text-gray-400 text-xs">{selectedEl.rotation}°</div>
                        </div>

                        {/* Text Properties */}
                        {selectedEl.type === 'text' && (
                          <>
                            <div>
                              <label className="text-gray-300 text-xs">Font Size</label>
                              <input
                                type="range"
                                min="8"
                                max="72"
                                value={selectedEl.style?.fontSize || 24}
                                onChange={(e) => updateElement(selectedEl.id, {
                                  style: { ...selectedEl.style, fontSize: parseInt(e.target.value) }
                                })}
                                className="w-full"
                              />
                              <div className="text-center text-gray-400 text-xs">{selectedEl.style?.fontSize || 24}px</div>
                            </div>

                            <div>
                              <label className="text-gray-300 text-xs">Color</label>
                              <div className="grid grid-cols-5 gap-1 mt-1">
                                {colors.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => updateElement(selectedEl.id, {
                                      style: { ...selectedEl.style, color }
                                    })}
                                    className={`w-6 h-6 rounded border-2 transition-all ${
                                      selectedEl.style?.color === color ? 'border-white scale-110' : 'border-gray-600'
                                    }`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Layer Controls */}
                        <div>
                          <label className="text-gray-300 text-xs">Layer</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <button
                              onClick={() => moveLayer(selectedEl.id, 'down')}
                              className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                              <ChevronDown size={16} />
                            </button>
                            <span className="text-white text-sm flex-1 text-center">
                              Layer {selectedEl.layer}
                            </span>
                            <button
                              onClick={() => moveLayer(selectedEl.id, 'up')}
                              className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                              <ChevronUp size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Transform Controls */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => updateElement(selectedEl.id, { flipX: !selectedEl.flipX })}
                            className={`p-2 rounded transition-colors ${
                              selectedEl.flipX ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <FlipHorizontal size={16} />
                          </button>
                          <button
                            onClick={() => updateElement(selectedEl.id, { flipY: !selectedEl.flipY })}
                            className={`p-2 rounded transition-colors ${
                              selectedEl.flipY ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <FlipVertical size={16} />
                          </button>
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {stickers.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <Package size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No stickers created yet!</p>
                      <p className="text-sm mt-1">Switch to Create tab to make your first sticker</p>
                    </div>
                  ) : (
                    stickers.map((sticker) => (
                      <div
                        key={sticker.id}
                        className="bg-dark-card rounded-xl p-4 border border-gray-800 hover:border-secondary transition-colors group"
                      >
                        <div 
                          className="aspect-square bg-white rounded-lg mb-3 overflow-hidden cursor-pointer"
                          onClick={() => previewStickerImage(sticker)}
                        >
                          <img
                            src={sticker.imageUrl}
                            alt={sticker.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h4 className="text-white font-semibold text-sm mb-1 truncate">{sticker.name}</h4>
                        <p className="text-gray-400 text-xs">Used {sticker.usageCount} times</p>
                        
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => previewStickerImage(sticker)}
                            className="flex-1 p-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.download = `${sticker.name}.png`;
                              link.href = sticker.imageUrl;
                              link.click();
                              toast.success('Sticker downloaded! 💾');
                            }}
                            className="flex-1 p-2 bg-accent text-dark rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Packs Tab */}
            {activeTab === 'packs' && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stickerPacks.map((pack) => (
                    <div
                      key={pack.id}
                      className={`bg-dark-card rounded-xl p-4 border transition-colors ${
                        pack.owned ? 'border-secondary' : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-bold">{pack.name}</h4>
                        {pack.owned && (
                          <span className="px-2 py-1 bg-secondary text-white rounded text-xs">Owned</span>
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{pack.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{pack.count} stickers</span>
                        {!pack.owned && (
                          <span className="text-accent font-bold">{pack.price} CP</span>
                        )}
                      </div>
                      
                      {!pack.owned && (
                        <button className="w-full mt-3 p-2 bg-accent text-dark rounded-lg hover:bg-accent/90 transition-colors font-semibold">
                          Purchase Pack
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Save Sticker</h2>

              <div className="space-y-4">
                {/* Sticker Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sticker Name
                  </label>
                  <input
                    type="text"
                    value={stickerName}
                    onChange={(e) => setStickerName(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                    placeholder="Enter sticker name..."
                  />
                </div>

                {/* Create New Pack Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="createNewPack"
                    checked={createNewPack}
                    onChange={(e) => setCreateNewPack(e.target.checked)}
                    className="rounded border-gray-700 bg-dark-light text-secondary focus:ring-secondary"
                  />
                  <label htmlFor="createNewPack" className="text-gray-300 text-sm">
                    Create new pack
                  </label>
                </div>

                {/* Pack Selection or Creation */}
                {createNewPack ? (
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
                        placeholder="Enter pack name..."
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
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Save to Pack
                    </label>
                    <select
                      value={selectedPackId}
                      onChange={(e) => setSelectedPackId(e.target.value)}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                    >
                      {ownedPacks.map((pack) => (
                        <option key={pack.id} value={pack.id}>
                          {pack.name} ({pack.count} stickers)
                        </option>
                      ))}
                    </select>
                    
                    {/* Pack Preview */}
                    {selectedPackId && (
                      <div className="mt-2 p-3 bg-dark-light rounded-lg border border-gray-700">
                        {(() => {
                          const selectedPack = ownedPacks.find(p => p.id === selectedPackId);
                          return selectedPack ? (
                            <>
                              <h4 className="text-white font-semibold text-sm">{selectedPack.name}</h4>
                              <p className="text-gray-400 text-xs mt-1">{selectedPack.description}</p>
                              <p className="text-gray-300 text-xs mt-1">{selectedPack.count} stickers</p>
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
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
                  onClick={handleSaveSticker}
                  className="flex-1 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Sticker</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && previewSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">{previewSticker.name}</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="aspect-square bg-white rounded-lg mb-4 overflow-hidden">
                <img
                  src={previewSticker.imageUrl}
                  alt={previewSticker.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `${previewSticker.name}.png`;
                    link.href = previewSticker.imageUrl;
                    link.click();
                    toast.success('Sticker downloaded! 💾');
                  }}
                  className="flex-1 p-3 bg-accent text-dark rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        const response = await fetch(previewSticker.imageUrl);
                        const blob = await response.blob();
                        const file = new File([blob], `${previewSticker.name}.png`, { type: 'image/png' });
                        
                        await navigator.share({
                          title: `Check out my sticker: ${previewSticker.name}`,
                          text: 'I created this awesome sticker in ClownRoom! 🎨',
                          files: [file],
                        });
                        toast.success('Sticker shared! 📤');
                      } else {
                        navigator.clipboard.writeText(`Check out my sticker: ${previewSticker.name} from ClownRoom! 🎨`);
                        toast.success('Share text copied to clipboard! 📋');
                      }
                    } catch (error) {
                      toast.error('Failed to share sticker! 😞');
                    }
                  }}
                  className="flex-1 p-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Type, 
  Image, 
  Smile, 
  Download, 
  Share2, 
  Trash2, 
  RotateCcw, 
  Save,
  Eye,
  X,
  ChevronUp,
  ChevronDown,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Palette,
  Grid,
  Package,
  Check,
  ShoppingCart,
  Star,
  Crown,
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
    purchaseStickerPack, 
    updateUserPoints, 
    currentUser 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'create' | 'browse' | 'packs'>('create');
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentLayer, setCurrentLayer] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSticker, setPreviewSticker] = useState<Sticker | null>(null);
  
  // Save modal state
  const [saveData, setSaveData] = useState({
    name: '',
    selectedPackId: 'pack-default',
    createNewPack: false,
    newPackName: '',
    newPackDescription: ''
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate auto name for sticker
  const generateStickerName = () => {
    const adjectives = ['Cool', 'Epic', 'Awesome', 'Wild', 'Crazy', 'Fun', 'Cute', 'Silly'];
    const nouns = ['Sticker', 'Creation', 'Art', 'Design', 'Masterpiece'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun} ${Date.now().toString().slice(-4)}`;
  };

  // Initialize save data when modal opens
  useEffect(() => {
    if (showSaveModal) {
      setSaveData({
        name: generateStickerName(),
        selectedPackId: 'pack-default',
        createNewPack: false,
        newPackName: '',
        newPackDescription: ''
      });
    }
  }, [showSaveModal]);

  const addElement = (type: 'text' | 'emoji' | 'image', content: string = '') => {
    const newElement: StickerElement = {
      id: `element-${Date.now()}`,
      type,
      content: content || (type === 'text' ? 'New Text' : type === 'emoji' ? '😀' : ''),
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      width: type === 'text' ? 120 : 80,
      height: type === 'text' ? 40 : 80,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
      style: {
        fontSize: type === 'text' ? 16 : 32,
        color: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'normal',
      },
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added! 🎨`);
  };

  const updateElement = (id: string, updates: Partial<StickerElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    const elementToDelete = elements.find(el => el.id === id);
    if (!elementToDelete) return;

    const newElements = elements.filter(el => el.id !== id);
    
    // Reorder layers
    const reorderedElements = newElements.map((el, index) => ({
      ...el,
      layer: index + 1
    }));

    setElements(reorderedElements);
    setSelectedElement(null);
    
    // Adjust current layer
    const maxLayer = reorderedElements.length;
    if (currentLayer > maxLayer && maxLayer > 0) {
      setCurrentLayer(maxLayer);
    } else if (maxLayer === 0) {
      setCurrentLayer(1);
    }
    
    toast.success('Element deleted! 🗑️');
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    setCurrentLayer(1);
    toast.success('Canvas cleared! ✨');
  };

  const moveLayer = (direction: 'up' | 'down') => {
    if (!selectedElement) return;

    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    const currentLayerNum = element.layer;
    const maxLayer = elements.length;

    let newLayer: number;
    if (direction === 'up' && currentLayerNum < maxLayer) {
      newLayer = currentLayerNum + 1;
    } else if (direction === 'down' && currentLayerNum > 1) {
      newLayer = currentLayerNum - 1;
    } else {
      return; // Can't move further
    }

    // Swap layers
    const otherElement = elements.find(el => el.layer === newLayer);
    if (otherElement) {
      const newElements = elements.map(el => {
        if (el.id === selectedElement) {
          return { ...el, layer: newLayer };
        } else if (el.id === otherElement.id) {
          return { ...el, layer: currentLayerNum };
        }
        return el;
      });

      setElements(newElements);
      setCurrentLayer(newLayer);
      toast.success(`Moved ${direction}! 📐`);
    }
  };

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
      addElement('image', imageData);
    };
    reader.readAsDataURL(file);
  };

  // FIXED: Proper save function implementation
  const handleSaveSticker = async () => {
    if (!saveData.name.trim()) {
      toast.error('Please enter a sticker name! 📝');
      return;
    }

    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    if (saveData.createNewPack) {
      if (!saveData.newPackName.trim()) {
        toast.error('Please enter a pack name! 📦');
        return;
      }
    }

    try {
      // Generate sticker preview (simplified for demo)
      const stickerPreview = await generateStickerPreview();
      
      // Create the sticker object
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: saveData.name.trim(),
        imageUrl: stickerPreview,
        tags: ['custom', 'user-created'],
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        elementData: [...elements], // Save the element data for editing
        packId: saveData.createNewPack ? `pack-${Date.now()}` : saveData.selectedPackId
      };

      // If creating a new pack, create it first
      if (saveData.createNewPack) {
        const newPack = {
          id: newSticker.packId!,
          name: saveData.newPackName.trim(),
          description: saveData.newPackDescription.trim() || 'Custom sticker pack',
          stickers: [newSticker],
          category: 'custom' as const,
          count: 1,
          owned: true,
          price: 0,
          createdBy: currentUser?.id || 'user-1',
          createdAt: new Date()
        };

        addStickerPack(newPack);
        toast.success(`New pack "${newPack.name}" created! 📦✨`);
      } else {
        // Add to existing pack
        addStickerToPack(newSticker, saveData.selectedPackId);
        
        // Update pack count
        const targetPack = stickerPacks.find(p => p.id === saveData.selectedPackId);
        if (targetPack) {
          updateStickerPack(saveData.selectedPackId, {
            count: targetPack.count + 1
          });
        }
      }

      // Add sticker to global stickers array
      addSticker(newSticker);
      
      // Reward user
      updateUserPoints(20);
      
      // Close modal and show success
      setShowSaveModal(false);
      toast.success(`Sticker "${newSticker.name}" saved successfully! 🎨✨ (+20 CP)`);
      
      // Reset save data for next time
      setSaveData({
        name: '',
        selectedPackId: 'pack-default',
        createNewPack: false,
        newPackName: '',
        newPackDescription: ''
      });

    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker. Please try again! 😅');
    }
  };

  // Generate sticker preview (simplified version)
  const generateStickerPreview = async (): Promise<string> => {
    // For demo purposes, we'll create a simple data URL
    // In a real app, you'd render the canvas to an image
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Fill background
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 300, 300);
      
      // Add a simple representation
      ctx.fillStyle = '#FF6B9D';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Custom Sticker', 150, 150);
      ctx.fillText(`${elements.length} elements`, 150, 180);
    }
    
    return canvas.toDataURL('image/png');
  };

  const downloadSticker = async (sticker: Sticker) => {
    try {
      // Create a download link
      const link = document.createElement('a');
      link.href = sticker.imageUrl;
      link.download = `${sticker.name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${sticker.name} downloaded! 💾`);
      updateUserPoints(5);
    } catch (error) {
      toast.error('Download failed! 😅');
    }
  };

  const shareSticker = async (sticker: Sticker) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: sticker.name,
          text: `Check out my custom sticker: ${sticker.name}`,
          url: sticker.imageUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`Check out my custom sticker: ${sticker.name}`);
        toast.success('Sticker info copied to clipboard! 📋');
      }
      updateUserPoints(3);
    } catch (error) {
      toast.error('Share failed! 😅');
    }
  };

  const handlePreviewSticker = (sticker: Sticker) => {
    setPreviewSticker(sticker);
    setShowPreviewModal(true);
  };

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;
  const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
  const maxLayers = elements.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/10 to-dark paper-texture relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-bounce-doodle">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-wiggle">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-float">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🎭</div>
      </div>

      <div className="relative z-10 p-4 pb-20 pl-28">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 max-w-md mx-auto">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'browse', label: 'My Stickers', icon: Grid },
              { id: 'packs', label: 'Packs', icon: Package },
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                {/* Tools Panel */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Add Elements */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 font-sketch">Add Elements</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => addElement('text')}
                        className="w-full flex items-center space-x-2 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors text-white"
                      >
                        <Type size={20} />
                        <span>Add Text</span>
                      </button>
                      <button
                        onClick={() => addElement('emoji')}
                        className="w-full flex items-center space-x-2 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors text-white"
                      >
                        <Smile size={20} />
                        <span>Add Emoji</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center space-x-2 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors text-white"
                      >
                        <Image size={20} />
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
                  </div>

                  {/* Layer Management */}
                  {elements.length > 0 && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h3 className="text-white font-bold mb-3 font-sketch flex items-center space-x-2">
                        <Layers size={16} />
                        <span>Layers ({maxLayers})</span>
                      </h3>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {[...elements]
                          .sort((a, b) => b.layer - a.layer) // Show highest layer first
                          .map((element) => (
                            <div
                              key={element.id}
                              onClick={() => {
                                setSelectedElement(element.id);
                                setCurrentLayer(element.layer);
                              }}
                              className={`p-2 rounded-lg cursor-pointer transition-all ${
                                selectedElement === element.id
                                  ? 'bg-secondary/20 border border-secondary'
                                  : 'bg-dark-light hover:bg-gray-700 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-400">L{element.layer}</span>
                                  <span className="text-white text-sm truncate">
                                    {element.type === 'text' ? element.content : 
                                     element.type === 'emoji' ? element.content : 
                                     'Image'}
                                  </span>
                                </div>
                                {selectedElement === element.id && (
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveLayer('up');
                                      }}
                                      disabled={element.layer >= maxLayers}
                                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <ArrowUp size={12} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveLayer('down');
                                      }}
                                      disabled={element.layer <= 1}
                                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <ArrowDown size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h3 className="text-white font-bold mb-3 font-sketch">Properties</h3>
                      <div className="space-y-3">
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Text</label>
                              <input
                                type="text"
                                value={selectedElementData.content}
                                onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Font Size</label>
                              <input
                                type="range"
                                min="8"
                                max="72"
                                value={selectedElementData.style?.fontSize || 16}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) }
                                })}
                                className="w-full"
                              />
                              <span className="text-xs text-gray-400">{selectedElementData.style?.fontSize || 16}px</span>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#FFFFFF'}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  style: { ...selectedElementData.style, color: e.target.value }
                                })}
                                className="w-full h-8 rounded"
                              />
                            </div>
                          </>
                        )}

                        {selectedElementData.type === 'emoji' && (
                          <>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Emoji</label>
                              <input
                                type="text"
                                value={selectedElementData.content}
                                onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                                placeholder="😀"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Size</label>
                              <input
                                type="range"
                                min="16"
                                max="128"
                                value={selectedElementData.style?.fontSize || 32}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) }
                                })}
                                className="w-full"
                              />
                              <span className="text-xs text-gray-400">{selectedElementData.style?.fontSize || 32}px</span>
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Rotation</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={selectedElementData.rotation}
                            onChange={(e) => updateElement(selectedElementData.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-400">{selectedElementData.rotation}°</span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                            className={`flex-1 p-2 rounded text-sm ${selectedElementData.flipX ? 'bg-secondary text-white' : 'bg-dark-light text-gray-300'}`}
                          >
                            <FlipHorizontal size={16} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                            className={`flex-1 p-2 rounded text-sm ${selectedElementData.flipY ? 'bg-secondary text-white' : 'bg-dark-light text-gray-300'}`}
                          >
                            <FlipVertical size={16} className="mx-auto" />
                          </button>
                        </div>

                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="w-full p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 size={16} className="mx-auto" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Canvas */}
                <div className="lg:col-span-3">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    {/* Canvas Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold font-sketch">Sticker Canvas</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowSaveModal(true)}
                          disabled={elements.length === 0}
                          className="px-4 py-2 bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg hover:from-secondary/90 hover:to-blue-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save size={16} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={clearCanvas}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                        >
                          <RotateCcw size={16} />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>

                    {/* Canvas Area */}
                    <div
                      ref={canvasRef}
                      className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-400 overflow-hidden"
                      style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)', backgroundSize: '20px 20px' }}
                    >
                      {sortedElements.map((element) => (
                        <DraggableResizableElement
                          key={element.id}
                          element={element}
                          isSelected={selectedElement === element.id}
                          onSelect={() => {
                            setSelectedElement(element.id);
                            setCurrentLayer(element.layer);
                          }}
                          onUpdate={(updates) => updateElement(element.id, updates)}
                        />
                      ))}

                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎨</div>
                            <p className="text-sm">Add elements to start creating!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Browse Tab - My Stickers */}
            {activeTab === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white font-sketch mb-2">My Sticker Collection</h2>
                  <p className="text-gray-400 font-hand">Your custom creations</p>
                </div>

                {stickers.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-lg font-hand">No stickers yet!</p>
                    <p className="text-sm mt-2">Create your first sticker to get started</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-4 px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                      Start Creating
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {stickers.map((sticker) => (
                      <motion.div
                        key={sticker.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark-card rounded-xl p-3 border border-gray-800 hover:border-secondary/50 transition-all group"
                      >
                        <div 
                          className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center cursor-pointer overflow-hidden"
                          onClick={() => handlePreviewSticker(sticker)}
                        >
                          <img 
                            src={sticker.imageUrl} 
                            alt={sticker.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <h3 className="text-white font-semibold text-sm truncate mb-1">{sticker.name}</h3>
                        <p className="text-gray-400 text-xs mb-2">Used {sticker.usageCount} times</p>
                        
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handlePreviewSticker(sticker)}
                            className="flex-1 p-1 bg-secondary/20 text-secondary rounded hover:bg-secondary/30 transition-colors"
                          >
                            <Eye size={12} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => downloadSticker(sticker)}
                            className="flex-1 p-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                          >
                            <Download size={12} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => shareSticker(sticker)}
                            className="flex-1 p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                          >
                            <Share2 size={12} className="mx-auto" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
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
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white font-sketch mb-2">Sticker Packs</h2>
                  <p className="text-gray-400 font-hand">Organize and discover sticker collections</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stickerPacks.map((pack) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-dark-card rounded-xl p-4 border border-gray-800"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg">{pack.name}</h3>
                          <p className="text-gray-400 text-sm">{pack.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-secondary text-sm">{pack.count} stickers</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400 text-sm capitalize">{pack.category}</span>
                          </div>
                        </div>
                        
                        {pack.owned ? (
                          <div className="flex items-center space-x-1 text-green-400">
                            <Check size={16} />
                            <span className="text-sm">Owned</span>
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-accent mb-1">
                              <Crown size={14} />
                              <span className="text-sm font-bold">{pack.price} CP</span>
                            </div>
                            <button
                              onClick={() => purchaseStickerPack(pack.id, currentUser?.id || 'user-1')}
                              disabled={!currentUser || currentUser.clownPoints < pack.price}
                              className="px-3 py-1 bg-accent text-dark rounded text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart size={12} className="inline mr-1" />
                              Buy
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Pack Preview */}
                      <div className="grid grid-cols-4 gap-1 mb-3">
                        {pack.stickers.slice(0, 4).map((sticker, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                            <img 
                              src={sticker.imageUrl} 
                              alt={sticker.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {Array.from({ length: Math.max(0, 4 - pack.stickers.length) }).map((_, index) => (
                          <div key={`empty-${index}`} className="aspect-square bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-gray-500 text-xs">+</span>
                          </div>
                        ))}
                      </div>

                      {pack.owned && pack.stickers.length > 0 && (
                        <button
                          onClick={() => {
                            setActiveTab('browse');
                            // Could filter by pack here
                          }}
                          className="w-full py-2 bg-secondary/20 text-secondary rounded hover:bg-secondary/30 transition-colors text-sm"
                        >
                          View Stickers
                        </button>
                      )}
                    </motion.div>
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
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4 font-sketch">Save Sticker</h2>
              
              <div className="space-y-4">
                {/* Sticker Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sticker Name</label>
                  <input
                    type="text"
                    value={saveData.name}
                    onChange={(e) => setSaveData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                    placeholder="Enter sticker name..."
                  />
                </div>

                {/* Create New Pack Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="createNewPack"
                    checked={saveData.createNewPack}
                    onChange={(e) => setSaveData(prev => ({ ...prev, createNewPack: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="createNewPack" className="text-gray-300 text-sm">
                    Create new pack
                  </label>
                </div>

                {/* Pack Selection or New Pack Creation */}
                {saveData.createNewPack ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">New Pack Name</label>
                      <input
                        type="text"
                        value={saveData.newPackName}
                        onChange={(e) => setSaveData(prev => ({ ...prev, newPackName: e.target.value }))}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                        placeholder="Enter pack name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Pack Description</label>
                      <input
                        type="text"
                        value={saveData.newPackDescription}
                        onChange={(e) => setSaveData(prev => ({ ...prev, newPackDescription: e.target.value }))}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                        placeholder="Describe your pack..."
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Save to Pack</label>
                    <select
                      value={saveData.selectedPackId}
                      onChange={(e) => setSaveData(prev => ({ ...prev, selectedPackId: e.target.value }))}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                    >
                      {stickerPacks.filter(pack => pack.owned).map((pack) => (
                        <option key={pack.id} value={pack.id}>
                          {pack.name} ({pack.count} stickers)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Pack Preview */}
                {!saveData.createNewPack && (
                  <div className="bg-dark-light rounded-lg p-3">
                    {(() => {
                      const selectedPack = stickerPacks.find(p => p.id === saveData.selectedPackId);
                      return selectedPack ? (
                        <div>
                          <h4 className="text-white font-semibold text-sm">{selectedPack.name}</h4>
                          <p className="text-gray-400 text-xs">{selectedPack.description}</p>
                          <p className="text-secondary text-xs mt-1">{selectedPack.count} stickers</p>
                        </div>
                      ) : null;
                    })()}
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
                  className="flex-1 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
                >
                  Save Sticker
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && previewSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white font-sketch">{previewSticker.name}</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img 
                  src={previewSticker.imageUrl} 
                  alt={previewSticker.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-400 text-sm">Used {previewSticker.usageCount} times</p>
                <div className="flex flex-wrap gap-1">
                  {previewSticker.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadSticker(previewSticker)}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => shareSticker(previewSticker)}
                  className="flex-1 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Draggable and Resizable Element Component
const DraggableResizableElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onUpdate 
}: {
  element: StickerElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<StickerElement>) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('draggable-content')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - element.x,
        y: e.clientY - element.y
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, 400 - element.width));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, 300 - element.height));
      onUpdate({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(20, resizeStart.width + deltaX);
      const newHeight = Math.max(20, resizeStart.height + deltaY);
      onUpdate({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const elementStyle = {
    position: 'absolute' as const,
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
    zIndex: element.layer,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: isSelected ? '2px solid #4ECDC4' : '2px solid transparent',
    borderRadius: '4px',
    userSelect: 'none' as const,
  };

  const contentStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: element.style?.fontSize || 16,
    color: element.style?.color || '#000000',
    fontFamily: element.style?.fontFamily || 'Arial',
    fontWeight: element.style?.fontWeight || 'normal',
    overflow: 'hidden',
    wordBreak: 'break-word' as const,
    textAlign: 'center' as const,
  };

  return (
    <div
      style={elementStyle}
      onMouseDown={handleMouseDown}
      className="select-none"
    >
      <div className="draggable-content" style={contentStyle}>
        {element.type === 'text' && (
          <span style={{ fontSize: element.style?.fontSize, color: element.style?.color }}>
            {element.content}
          </span>
        )}
        {element.type === 'emoji' && (
          <span style={{ fontSize: element.style?.fontSize }}>
            {element.content}
          </span>
        )}
        {element.type === 'image' && (
          <img 
            src={element.content} 
            alt="Sticker element"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        )}
      </div>
      
      {/* Resize Handle */}
      {isSelected && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-secondary cursor-se-resize"
          style={{ transform: 'translate(50%, 50%)' }}
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};
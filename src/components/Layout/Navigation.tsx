import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Home, 
  Zap,
  Sticker,
  Trophy,
  Camera,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Navigation = () => {
  const { activeView, setActiveView, currentRoom } = useStore();
  const [isExpanded, setIsExpanded] = useState(true);

  // Only show navigation when in a room
  if (!currentRoom) {
    return null;
  }

  const navigationItems = [
    { 
      id: 'roasts', 
      label: 'Roasts', 
      icon: Zap, 
      color: 'text-orange', 
      hoverColor: 'hover:text-orange',
      bgColor: 'bg-orange/20',
      emoji: '🔥',
      tooltip: 'Roast Stage - Where the burns happen!'
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      icon: MessageCircle, 
      color: 'text-secondary', 
      hoverColor: 'hover:text-secondary',
      bgColor: 'bg-secondary/20',
      emoji: '💬',
      tooltip: 'Chat Room - Casual conversations!'
    },
    { 
      id: 'stickers', 
      label: 'Stickers', 
      icon: Sticker, 
      color: 'text-primary', 
      hoverColor: 'hover:text-primary',
      bgColor: 'bg-primary/20',
      emoji: '🎨',
      tooltip: 'Sticker Lab - Create chaos art!'
    },
    { 
      id: 'challenges', 
      label: 'Challenges', 
      icon: Trophy, 
      color: 'text-accent', 
      hoverColor: 'hover:text-accent',
      bgColor: 'bg-accent/20',
      emoji: '🏆',
      tooltip: 'Challenge Arena - Prove your worth!'
    },
    { 
      id: 'memories', 
      label: 'Memories', 
      icon: Camera, 
      color: 'text-purple', 
      hoverColor: 'hover:text-purple',
      bgColor: 'bg-purple/20',
      emoji: '📸',
      tooltip: 'Memory Vault - Capture the chaos!'
    },
  ];

  return (
    <>
      {/* FIXED: Ultra-Compact Sidebar with Minimal Spacing */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1
        }}
        transition={{ 
          type: 'spring', 
          damping: 25, 
          stiffness: 200,
          delay: 0.2 
        }}
        className="fixed left-4 top-24 z-40"
      >
        <motion.div
          animate={{ 
            width: isExpanded ? 220 : 64 // FIXED: Smaller collapsed width
          }}
          transition={{ 
            type: 'spring',
            damping: 30,
            stiffness: 300,
            mass: 0.8
          }}
          className="bg-dark-card/90 backdrop-blur-lg rounded-2xl border border-gray-800/50 sketch-card paper-texture relative shadow-doodle overflow-hidden"
          style={{
            // FIXED: Much more compact height when collapsed
            height: isExpanded ? '480px' : '320px',
            minHeight: isExpanded ? '480px' : '320px',
            maxHeight: isExpanded ? '480px' : '320px'
          }}
        >
          <div className="h-full flex flex-col">
            {/* Artistic doodle decorations */}
            <div className="absolute -top-2 -right-2 text-lg opacity-60 animate-bounce-doodle">✨</div>
            <div className="absolute -bottom-1 -left-1 text-sm opacity-40 animate-wiggle">🎭</div>
            
            {/* FIXED: Compact Toggle Button */}
            <div className={`flex ${isExpanded ? 'justify-end' : 'justify-center'} ${isExpanded ? 'p-3' : 'p-2'} flex-shrink-0`}>
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`${isExpanded ? 'p-2' : 'p-1.5'} rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all doodle-btn`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9, rotate: -5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : 180 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <ChevronLeft size={isExpanded ? 20 : 16} className="hand-drawn-icon" />
                </motion.div>
              </motion.button>
            </div>
            
            {/* FIXED: Ultra-Compact Navigation Items */}
            <div className="flex-1 flex flex-col justify-start min-h-0">
              <div className={`${isExpanded ? 'px-3 space-y-3' : 'px-2 space-y-1'}`}>
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: index * 0.08 + 0.3,
                        type: 'spring',
                        damping: 20
                      }}
                      className="relative group"
                    >
                      <motion.button
                        onClick={() => setActiveView(item.id as any)}
                        className={`relative rounded-xl transition-all duration-300 doodle-btn sketch-border flex items-center overflow-hidden ${
                          isExpanded 
                            ? 'w-full px-4 py-3' 
                            : 'w-10 h-10 justify-center mx-auto' // FIXED: Much smaller and centered
                        } ${
                          isActive
                            ? `${item.color} ${item.bgColor} shadow-doodle`
                            : `text-gray-400 ${item.hoverColor} hover:bg-gray-800/50`
                        }`}
                        whileHover={{ scale: 1.02, rotate: 1 }}
                        whileTap={{ scale: 0.98, rotate: -1 }}
                      >
                        {/* Emoji decoration for active state */}
                        <AnimatePresence>
                          {isActive ? (
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 0.8 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ 
                                type: 'spring',
                                stiffness: 500,
                                damping: 15
                              }}
                              className="absolute -top-1 -right-1 text-xs animate-bounce-doodle"
                            >
                              {item.emoji}
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                        
                        {/* FIXED: Icon - Perfectly centered with smaller size when collapsed */}
                        <div className={`${isExpanded ? 'mr-3' : ''} flex-shrink-0 flex items-center justify-center`}>
                          <Icon size={isExpanded ? 20 : 16} className="hand-drawn-icon" />
                        </div>
                        
                        {/* FIXED: Label with smooth animation */}
                        <AnimatePresence mode="wait">
                          {isExpanded ? (
                            <motion.span
                              initial={{ opacity: 0, x: -10, width: 0 }}
                              animate={{ opacity: 1, x: 0, width: 'auto' }}
                              exit={{ opacity: 0, x: -10, width: 0 }}
                              transition={{ 
                                duration: 0.3,
                                ease: [0.4, 0, 0.2, 1]
                              }}
                              className="font-hand font-semibold text-sm whitespace-nowrap overflow-hidden"
                            >
                              {item.label}
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </motion.button>
                      
                      {/* FIXED: Compact Tooltip for collapsed state */}
                      <AnimatePresence>
                        {!isExpanded ? (
                          <motion.div
                            initial={{ opacity: 0, x: -20, scale: 0.8 }}
                            animate={{ opacity: 0, x: -10, scale: 0.9 }}
                            whileHover={{ 
                              opacity: 1, 
                              x: 0, 
                              scale: 1,
                              transition: { 
                                duration: 0.2,
                                ease: [0.4, 0, 0.2, 1]
                              }
                            }}
                            exit={{ 
                              opacity: 0, 
                              x: -20, 
                              scale: 0.8,
                              transition: { duration: 0.15 }
                            }}
                            className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-dark-light text-white px-3 py-2 rounded-lg text-sm font-hand whitespace-nowrap pointer-events-none z-50 sketch-border shadow-doodle"
                            style={{ minWidth: '180px' }}
                          >
                            <div className="flex items-center space-x-2">
                              <motion.span 
                                className="text-lg flex-shrink-0"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                {item.emoji}
                              </motion.span>
                              <div className="flex-1">
                                <div className="font-bold text-sm">{item.label}</div>
                                <div className="text-xs text-gray-300">{item.tooltip}</div>
                              </div>
                            </div>
                            
                            {/* FIXED: Tooltip arrow */}
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-dark-light"></div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* FIXED: Ultra-Compact Bottom Section */}
            <div className={`flex-shrink-0 ${isExpanded ? 'px-3 pb-3' : 'px-2 pb-2'}`}>
              {/* FIXED: Separator - Only when expanded and smaller */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="relative mb-3"
                  >
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent origin-center"></div>
                    <motion.div 
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs opacity-50"
                      animate={{ rotate: [0, 360] }}
                      transition={{ 
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      ⭐
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* FIXED: Compact Back to Rooms Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.9,
                  type: 'spring',
                  damping: 20
                }}
                className={`relative group ${isExpanded ? 'mb-3' : 'mb-2'}`}
              >
                <motion.button
                  onClick={() => setActiveView('rooms')}
                  className={`relative rounded-xl text-gray-400 hover:text-primary hover:bg-gray-800/50 transition-all duration-300 doodle-btn sketch-border flex items-center overflow-hidden ${
                    isExpanded 
                      ? 'w-full px-4 py-3' 
                      : 'w-10 h-10 justify-center mx-auto' // FIXED: Same compact size
                  }`}
                  whileHover={{ scale: 1.02, rotate: -1 }}
                  whileTap={{ scale: 0.98, rotate: 1 }}
                >
                  <div className={`${isExpanded ? 'mr-3' : ''} flex-shrink-0 flex items-center justify-center`}>
                    <Home size={isExpanded ? 20 : 16} className="hand-drawn-icon" />
                  </div>
                  
                  {/* FIXED: Label with smooth animation */}
                  <AnimatePresence mode="wait">
                    {isExpanded ? (
                      <motion.span
                        initial={{ opacity: 0, x: -10, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 'auto' }}
                        exit={{ opacity: 0, x: -10, width: 0 }}
                        transition={{ 
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        className="font-hand font-semibold text-sm whitespace-nowrap overflow-hidden"
                      >
                        Back to Rooms
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </motion.button>
                
                {/* FIXED: Compact Tooltip for Back to Rooms */}
                <AnimatePresence>
                  {!isExpanded ? (
                    <motion.div
                      initial={{ opacity: 0, x: -20, scale: 0.8 }}
                      animate={{ opacity: 0, x: -10, scale: 0.9 }}
                      whileHover={{ 
                        opacity: 1, 
                        x: 0, 
                        scale: 1,
                        transition: { 
                          duration: 0.2,
                          ease: [0.4, 0, 0.2, 1]
                        }
                      }}
                      exit={{ 
                        opacity: 0, 
                        x: -20, 
                        scale: 0.8,
                        transition: { duration: 0.15 }
                      }}
                      className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-dark-light text-white px-3 py-2 rounded-lg text-sm font-hand whitespace-nowrap pointer-events-none z-50 sketch-border shadow-doodle"
                      style={{ minWidth: '160px' }}
                    >
                      <div className="flex items-center space-x-2">
                        <motion.span 
                          className="text-lg flex-shrink-0"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          🏠
                        </motion.span>
                        <div className="flex-1">
                          <div className="font-bold text-sm">Back to Rooms</div>
                          <div className="text-xs text-gray-300">Leave this room</div>
                        </div>
                      </div>
                      
                      {/* FIXED: Tooltip arrow */}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-dark-light"></div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>

              {/* FIXED: Ultra-Compact Room indicator */}
              <AnimatePresence mode="wait">
                {isExpanded ? (
                  <motion.div
                    key="expanded-room"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="border-t border-gray-700/50 pt-3"
                  >
                    <motion.div 
                      className="flex items-center space-x-3"
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      transition={{ 
                        delay: 0.1,
                        type: 'spring',
                        damping: 20
                      }}
                    >
                      <motion.div 
                        className="text-2xl sticker-element flex-shrink-0"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {currentRoom.avatar}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.div 
                          className="text-sm font-hand font-semibold text-white truncate"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {currentRoom.name}
                        </motion.div>
                        <motion.div 
                          className="text-xs text-gray-400 font-hand"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          Current Room
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed-room"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="border-t border-gray-700/50 pt-2"
                  >
                    <div className="flex justify-center">
                      <motion.div 
                        className="text-lg sticker-element" // FIXED: Smaller room avatar
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {currentRoom.avatar}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
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
      {/* Collapsible Vertical Sidebar - Fixed to Left Edge */}
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
            width: isExpanded ? 220 : 80
          }}
          transition={{ 
            type: 'spring',
            damping: 30,
            stiffness: 300,
            mass: 0.8
          }}
          className="bg-dark-card/90 backdrop-blur-lg rounded-2xl border border-gray-800/50 sketch-card paper-texture relative shadow-doodle overflow-hidden"
        >
          <motion.div
            animate={{ 
              padding: isExpanded ? '16px' : '12px'
            }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {/* Artistic doodle decorations */}
            <div className="absolute -top-2 -right-2 text-lg opacity-60 animate-bounce-doodle">✨</div>
            <div className="absolute -bottom-1 -left-1 text-sm opacity-40 animate-wiggle">🎭</div>
            
            {/* Toggle Button */}
            <div className="flex justify-end mb-4">
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all doodle-btn"
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
                  <ChevronLeft size={20} className="hand-drawn-icon" />
                </motion.div>
              </motion.button>
            </div>
            
            {/* Navigation Items */}
            <div className="space-y-3">
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
                        isExpanded ? 'w-full' : 'w-14 justify-center'
                      } ${
                        isActive
                          ? `${item.color} ${item.bgColor} shadow-doodle`
                          : `text-gray-400 ${item.hoverColor} hover:bg-gray-800/50`
                      }`}
                      animate={{
                        padding: isExpanded ? '12px' : '12px',
                        justifyContent: isExpanded ? 'flex-start' : 'center'
                      }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      whileHover={{ scale: 1.02, rotate: 1 }}
                      whileTap={{ scale: 0.98, rotate: -1 }}
                    >
                      {/* Emoji decoration for active state */}
                      <AnimatePresence>
                        {isActive && (
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
                        )}
                      </AnimatePresence>
                      
                      <motion.div
                        animate={{ 
                          marginRight: isExpanded ? '12px' : '0px'
                        }}
                        transition={{ 
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      >
                        <Icon size={24} className="hand-drawn-icon" />
                      </motion.div>
                      
                      {/* Label with staggered animation */}
                      <AnimatePresence mode="wait">
                        {isExpanded && (
                          <motion.span
                            initial={{ opacity: 0, x: -10, width: 0 }}
                            animate={{ 
                              opacity: 1, 
                              x: 0, 
                              width: 'auto'
                            }}
                            exit={{ 
                              opacity: 0, 
                              x: -10, 
                              width: 0
                            }}
                            transition={{ 
                              duration: 0.4,
                              ease: [0.4, 0, 0.2, 1],
                              delay: 0.1
                            }}
                            className="font-hand font-semibold text-sm whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    
                    {/* Enhanced Tooltip */}
                    <AnimatePresence>
                      {!isExpanded && (
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
                          className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-dark-light text-white px-4 py-3 rounded-lg text-sm font-hand whitespace-nowrap pointer-events-none z-50 sketch-border shadow-doodle"
                        >
                          <div className="flex items-center space-x-3">
                            <motion.span 
                              className="text-xl"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {item.emoji}
                            </motion.span>
                            <div>
                              <div className="font-bold text-base">{item.label}</div>
                              <div className="text-xs text-gray-300">{item.tooltip}</div>
                            </div>
                          </div>
                          
                          {/* Enhanced tooltip arrow */}
                          <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-dark-light"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              
              {/* Animated Separator */}
              <motion.div 
                className="my-4 relative"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ 
                  delay: 0.8,
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1]
                }}
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
              
              {/* Back to Rooms Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.9,
                  type: 'spring',
                  damping: 20
                }}
                className="relative group"
              >
                <motion.button
                  onClick={() => setActiveView('rooms')}
                  className="relative rounded-xl text-gray-400 hover:text-primary hover:bg-gray-800/50 transition-all duration-300 doodle-btn sketch-border flex items-center overflow-hidden"
                  animate={{
                    width: isExpanded ? '100%' : '56px',
                    padding: '12px',
                    justifyContent: isExpanded ? 'flex-start' : 'center'
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  whileHover={{ scale: 1.02, rotate: -1 }}
                  whileTap={{ scale: 0.98, rotate: 1 }}
                >
                  <motion.div
                    animate={{ 
                      marginRight: isExpanded ? '12px' : '0px'
                    }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <Home size={24} className="hand-drawn-icon" />
                  </motion.div>
                  
                  {/* Label with staggered animation */}
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10, width: 0 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0, 
                          width: 'auto'
                        }}
                        exit={{ 
                          opacity: 0, 
                          x: -10, 
                          width: 0
                        }}
                        transition={{ 
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1],
                          delay: 0.1
                        }}
                        className="font-hand font-semibold text-sm whitespace-nowrap"
                      >
                        Back to Rooms
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                
                {/* Enhanced Tooltip */}
                <AnimatePresence>
                  {!isExpanded && (
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
                      className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-dark-light text-white px-4 py-3 rounded-lg text-sm font-hand whitespace-nowrap pointer-events-none z-50 sketch-border shadow-doodle"
                    >
                      <div className="flex items-center space-x-3">
                        <motion.span 
                          className="text-xl"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          🏠
                        </motion.span>
                        <div>
                          <div className="font-bold text-base">Back to Rooms</div>
                          <div className="text-xs text-gray-300">Leave this room</div>
                        </div>
                      </div>
                      
                      {/* Enhanced tooltip arrow */}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-dark-light"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            
            {/* Room indicator with smooth transitions */}
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="expanded-room"
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.2
                  }}
                  className="mt-6 pt-4 border-t border-gray-700/50 overflow-hidden"
                >
                  <motion.div 
                    className="flex items-center space-x-3"
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    transition={{ 
                      delay: 0.3,
                      type: 'spring',
                      damping: 20
                    }}
                  >
                    <motion.div 
                      className="text-2xl sticker-element"
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
                        transition={{ delay: 0.4 }}
                      >
                        {currentRoom.name}
                      </motion.div>
                      <motion.div 
                        className="text-xs text-gray-400 font-hand"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
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
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.1
                  }}
                  className="mt-4 pt-3 border-t border-gray-700/50"
                >
                  <div className="text-center">
                    <motion.div 
                      className="text-xl sticker-element"
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
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};
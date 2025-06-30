import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Zap, Heart, ThumbsDown, Shuffle, Play, Volume2, Wand2, Crown, Star, VolumeX, Target, Users } from 'lucide-react';
import { Roast } from '../../types';
import toast from 'react-hot-toast';

export const RoastsView = () => {
  const { currentRoom, roasts, addRoast, likeRoast, dislikeRoast, updateUserPoints, userLikes, userDislikes } = useStore();
  const [roastText, setRoastText] = useState('');
  const [showEmergencyRoast, setShowEmergencyRoast] = useState(false);
  const [emergencyVictim, setEmergencyVictim] = useState<any>(null);
  const [showEmergencyInput, setShowEmergencyInput] = useState(false);
  const [emergencyRoastText, setEmergencyRoastText] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [currentVictim, setCurrentVictim] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  // Get room members excluding current user
  const getRoomMembers = () => {
    if (!currentRoom) return [];
    return currentRoom.members.filter(member => member.id !== 'user-1'); // Exclude current user
  };

  const aiRoasts = [
    "Your Wi-Fi password is probably '123456' because that's the level of creativity we're working with here 📡",
    "You're the human equivalent of a participation trophy - technically an achievement, but nobody's really proud of it 🏆",
    "If being extra was an Olympic sport, you'd still somehow find a way to come in fourth place 🥉",
    "Your selfie game is so weak, even your front camera is trying to flip to the back 📸",
    "You collect red flags like they're Pokémon cards - gotta catch 'em all! 🚩",
    "You're like a software update - nobody wants you, but you keep showing up anyway 💻",
    "Your personality has the same energy as a dead phone battery 🔋",
    "You're the reason they put instructions on shampoo bottles 🧴",
    "Your jokes are so bad, even dad jokes are embarrassed to be associated with you 👨‍👧‍👦",
    "You're like a broken pencil - completely pointless ✏️",
    "If stupidity was a superpower, you'd be unstoppable 🦸‍♂️",
    "You're proof that evolution can go in reverse 🐒",
  ];

  // Randomly select a victim when component loads
  React.useEffect(() => {
    const members = getRoomMembers();
    if (members.length > 0 && !currentVictim) {
      const randomVictim = members[Math.floor(Math.random() * members.length)];
      setCurrentVictim(randomVictim.id);
    }
  }, [currentRoom, currentVictim]);

  const handleSendRoast = () => {
    if (!roastText.trim()) {
      toast.error('Write a roast first! 🎯');
      return;
    }

    const newRoast: Roast = {
      id: `roast-${Date.now()}`,
      content: roastText,
      targetId: currentVictim,
      authorId: 'user-1',
      roomId: currentRoom?.id || 'room-1',
      votes: { fire: 0, brutal: 0, wholesome: 0 },
      likes: 0,
      dislikes: 0,
      createdAt: new Date(),
    };

    addRoast(newRoast);
    updateUserPoints(10);
    setRoastText('');
    
    // Select new random victim
    const members = getRoomMembers();
    if (members.length > 0) {
      const randomVictim = members[Math.floor(Math.random() * members.length)];
      setCurrentVictim(randomVictim.id);
    }
    
    toast.success('Roast delivered! 🔥 (+10 CP)');
  };

  const handleEmergencyRoastStart = () => {
    const members = getRoomMembers();
    
    if (members.length === 0) {
      toast.error('No other members in the room to roast! 😅');
      return;
    }

    // Randomly select a victim
    const randomVictim = members[Math.floor(Math.random() * members.length)];
    setEmergencyVictim(randomVictim);
    setShowEmergencyRoast(false);
    setShowEmergencyInput(true);
    setEmergencyRoastText('');
    
    toast.success(`🎯 Victim selected: ${randomVictim.username}! Now craft your roast!`);
  };

  const handleEmergencyRoastSubmit = () => {
    if (!emergencyRoastText.trim() || !emergencyVictim) {
      toast.error('Write your emergency roast first! 🚨');
      return;
    }

    const emergencyRoast: Roast = {
      id: `roast-${Date.now()}`,
      content: `🚨 EMERGENCY ROAST: ${emergencyRoastText}`,
      targetId: emergencyVictim.id,
      authorId: 'user-1',
      roomId: currentRoom?.id || 'room-1',
      votes: { fire: 0, brutal: 0, wholesome: 0 },
      likes: 0,
      dislikes: 0,
      createdAt: new Date(),
    };

    addRoast(emergencyRoast);
    updateUserPoints(15); // Bonus for emergency roast
    setShowEmergencyInput(false);
    setEmergencyVictim(null);
    setEmergencyRoastText('');
    
    toast.success(`🚨 Emergency roast delivered to ${emergencyVictim.username}! (+15 CP)`);
  };

  const generateEmergencyAIRoast = async () => {
    if (!emergencyVictim) return;
    
    setIsGeneratingAI(true);
    
    setTimeout(() => {
      const randomRoast = aiRoasts[Math.floor(Math.random() * aiRoasts.length)];
      setEmergencyRoastText(`Hey ${emergencyVictim.username}, ${randomRoast}`);
      setIsGeneratingAI(false);
      toast.success('🤖 AI emergency roast generated!');
    }, 2000);
  };

  const handleLike = (roastId: string) => {
    const hasLiked = userLikes[roastId];
    
    if (hasLiked) {
      // Toggle off like
      likeRoast(roastId, 'user-1', true); // true = remove
      updateUserPoints(-1); // Remove point
      toast.success('Like removed! 💔');
    } else {
      // Add like
      likeRoast(roastId, 'user-1');
      updateUserPoints(2);
      toast.success('Roast liked! ❤️ (+2 CP)');
    }
  };

  const handleDislike = (roastId: string) => {
    const hasDisliked = userDislikes[roastId];
    
    if (hasDisliked) {
      // Toggle off dislike
      dislikeRoast(roastId, 'user-1', true); // true = remove
      toast.success('Dislike removed! 😌');
    } else {
      // Add dislike
      dislikeRoast(roastId, 'user-1');
      updateUserPoints(1); // Small point for engagement
      toast.success('Roast disliked! 😠 (+1 CP)');
    }
  };

  const generateAIRoast = async () => {
    setIsGeneratingAI(true);
    
    setTimeout(() => {
      const randomRoast = aiRoasts[Math.floor(Math.random() * aiRoasts.length)];
      const members = getRoomMembers();
      const targetMember = members.find(m => m.id === currentVictim);
      const targetName = targetMember?.username || 'Someone';
      setRoastText(`Hey ${targetName}, ${randomRoast}`);
      setIsGeneratingAI(false);
      toast.success('AI roast generated! 🤖✨');
    }, 2000);
  };

  // ElevenLabs Text-to-Speech Integration
  const playRoastAudio = async (roastContent: string, roastId: string) => {
    if (isPlayingAudio === roastId) {
      // Stop current audio
      setIsPlayingAudio(null);
      toast.success('Audio stopped! 🔇');
      return;
    }

    setIsPlayingAudio(roastId);
    toast.success('🎵 Converting roast to speech...');

    try {
      // ElevenLabs API call would go here
      // For demo purposes, we'll simulate the API call
      const response = await simulateElevenLabsAPI(roastContent);
      
      if (response.success) {
        // Play the audio
        const audio = new Audio(response.audioUrl);
        audio.onended = () => setIsPlayingAudio(null);
        audio.onerror = () => {
          setIsPlayingAudio(null);
          toast.error('Audio playback failed! 😵');
        };
        
        await audio.play();
        toast.success('🔊 Playing roast audio!');
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      setIsPlayingAudio(null);
      toast.error('Voice generation failed! Using backup... 🤖');
      
      // Fallback: Use Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(roastContent);
        utterance.rate = 1.2;
        utterance.pitch = 0.8;
        utterance.volume = 0.8;
        utterance.onend = () => setIsPlayingAudio(null);
        
        speechSynthesis.speak(utterance);
        toast.success('🗣️ Playing with backup voice!');
      } else {
        toast.error('Voice not supported on this device! 😢');
      }
    }
  };

  // Simulate ElevenLabs API call
  const simulateElevenLabsAPI = async (text: string) => {
    return new Promise<{ success: boolean; audioUrl?: string }>((resolve) => {
      setTimeout(() => {
        // Simulate API response
        resolve({
          success: Math.random() > 0.3, // 70% success rate for demo
          audioUrl: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
        });
      }, 1500);
    });
  };

  // FIXED: Enhanced best roast calculation using net score (likes - dislikes)
  const getBestRoast = () => {
    if (roasts.length === 0) return null;
    
    return roasts.reduce((best, current) => {
      // Calculate net score: likes - dislikes + vote bonuses
      const bestNetScore = (best.likes || 0) - (best.dislikes || 0);
      const bestVoteBonus = (best.votes?.fire || 0) + (best.votes?.brutal || 0) + (best.votes?.wholesome || 0);
      const bestTotalScore = bestNetScore + bestVoteBonus;
      
      const currentNetScore = (current.likes || 0) - (current.dislikes || 0);
      const currentVoteBonus = (current.votes?.fire || 0) + (current.votes?.brutal || 0) + (current.votes?.wholesome || 0);
      const currentTotalScore = currentNetScore + currentVoteBonus;
      
      // Prioritize net positive reactions, then vote bonuses
      if (currentTotalScore > bestTotalScore) {
        return current;
      } else if (currentTotalScore === bestTotalScore) {
        // If tied, prefer the one with higher net score (likes - dislikes)
        return currentNetScore > bestNetScore ? current : best;
      }
      
      return best;
    });
  };

  const bestRoast = getBestRoast();
  const members = getRoomMembers();
  const currentVictimData = members.find(m => m.id === currentVictim);

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <Zap size={48} className="mx-auto mb-4 opacity-50 hand-drawn-icon" />
          <p className="font-hand">Select a room to start roasting! 🔥</p>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <Users size={48} className="mx-auto mb-4 opacity-50 hand-drawn-icon" />
          <p className="font-hand">No other members in this room to roast! 😅</p>
          <p className="font-hand text-sm mt-2">Invite some friends to start the chaos! 🎪</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark relative overflow-hidden paper-texture">
      {/* Stage Background with Artistic Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Stage Curtains - Hand-drawn style */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-red-900/40 via-red-800/30 to-transparent">
          <div className="absolute top-4 left-4 text-2xl opacity-30 animate-wiggle">🎭</div>
          <div className="absolute top-20 left-2 text-lg opacity-20 animate-bounce-doodle">🎪</div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-red-900/40 via-red-800/30 to-transparent">
          <div className="absolute top-4 right-4 text-2xl opacity-30 animate-wiggle">🎭</div>
          <div className="absolute top-20 right-2 text-lg opacity-20 animate-bounce-doodle">🎪</div>
        </div>
        
        {/* Spotlight Effect - More artistic */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-radial from-yellow-500/20 via-orange-500/10 to-transparent rounded-full">
          <div className="absolute top-4 left-1/3 text-lg opacity-40 animate-float">✨</div>
          <div className="absolute bottom-8 right-1/4 text-sm opacity-30 animate-wiggle">⭐</div>
        </div>
        
        {/* Stage Floor Lines */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/50 to-transparent">
          <svg className="absolute bottom-4 left-1/4 w-48 h-8 opacity-20" viewBox="0 0 200 20">
            <path d="M10,15 Q50,5 100,15 T190,15" stroke="currentColor" strokeWidth="2" fill="none" className="text-orange animate-scribble" strokeDasharray="100" strokeDashoffset="100" />
          </svg>
        </div>
        
        {/* Floating Doodles */}
        <div className="absolute top-10 left-10 text-2xl opacity-20 animate-float">🔥</div>
        <div className="absolute top-32 right-16 text-3xl opacity-15 animate-bounce-doodle">💀</div>
        <div className="absolute bottom-40 left-8 text-2xl opacity-20 animate-wiggle">⚡</div>
        <div className="absolute bottom-20 right-20 text-2xl opacity-15 animate-float">🎯</div>
        <div className="absolute top-1/2 left-1/4 text-lg opacity-10 animate-bounce-doodle">🎨</div>
        <div className="absolute top-2/3 right-1/3 text-xl opacity-15 animate-wiggle">🚀</div>
      </div>

      <div className="relative z-10 p-4 pb-20 pl-28">
        <div className="max-w-md mx-auto space-y-4">
          {/* Stage Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="inline-block bg-gradient-to-r from-orange via-red-500 to-red-600 text-white px-6 py-3 rounded-full shadow-doodle sketch-border sticker-element"
            >
              <h2 className="text-xl font-bold font-sketch">🎪 ROAST STAGE 🎪</h2>
              <div className="absolute -top-1 -right-1 text-sm opacity-70 animate-bounce-doodle">🔥</div>
            </motion.div>
          </div>

          {/* Current Victim Spotlight */}
          {currentVictimData && (
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              className="bg-gradient-to-r from-yellow-500/30 via-orange-500/20 to-red-500/30 rounded-2xl p-6 text-center border-2 border-dashed border-yellow-500/50 sketch-card paper-texture relative"
            >
              {/* Spotlight doodles */}
              <div className="absolute -top-2 -left-2 text-2xl opacity-60 animate-bounce-doodle">🎯</div>
              <div className="absolute -top-1 -right-1 text-lg opacity-50 animate-wiggle">✨</div>
              <div className="absolute -bottom-1 left-1/3 text-sm opacity-40 animate-float">⭐</div>
              
              <div className="text-6xl mb-2 sticker-element">{currentVictimData.avatar}</div>
              <h3 className="text-white font-bold text-xl mb-1 font-sketch scribble-underline">Today's Victim</h3>
              <p className="text-yellow-400 font-semibold text-lg font-hand">{currentVictimData.username}</p>
              <div className="mt-2 text-sm text-gray-300 font-hand">
                🎯 Currently in the hot seat
              </div>
            </motion.div>
          )}

          {/* Enhanced Best Roast Badge with Net Score Display */}
          {bestRoast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-xl p-4 text-white sketch-card sticker-element relative"
            >
              <div className="absolute -top-1 -right-1 text-lg opacity-70 animate-bounce-doodle">👑</div>
              <div className="absolute -bottom-1 -left-1 text-sm opacity-50 animate-wiggle">✨</div>
              
              <div className="flex items-center space-x-2 mb-2">
                <Crown size={20} className="text-yellow-400 hand-drawn-icon" />
                <span className="font-bold font-sketch crayon-text">Best Roast of the Day</span>
                <Star size={16} className="text-yellow-400 hand-drawn-icon" />
              </div>
              <p className="text-sm italic font-hand">"{bestRoast.content}"</p>
              
              {/* Enhanced stats showing net score calculation */}
              <div className="text-xs text-purple-200 mt-2 font-hand">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Heart size={12} className="text-pink-400" />
                      <span>{bestRoast.likes || 0} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsDown size={12} className="text-red-400" />
                      <span>{bestRoast.dislikes || 0} dislikes</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                    <Star size={12} className="text-yellow-400" />
                    <span className="font-bold text-yellow-400">
                      Net: +{((bestRoast.likes || 0) - (bestRoast.dislikes || 0)) + ((bestRoast.votes?.fire || 0) + (bestRoast.votes?.brutal || 0) + (bestRoast.votes?.wholesome || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Emergency Roast Button */}
          <motion.button
            onClick={() => setShowEmergencyRoast(true)}
            className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600 text-white rounded-2xl p-4 shadow-doodle relative overflow-hidden doodle-btn sketch-border sticker-element"
            whileHover={{ scale: 1.02, rotate: 1 }}
            whileTap={{ scale: 0.98, rotate: -1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/50 to-orange-600/50 animate-pulse" />
            <div className="absolute -top-1 -right-1 text-lg opacity-70 animate-bounce-doodle">🚨</div>
            <div className="absolute -bottom-1 -left-1 text-sm opacity-50 animate-wiggle">💥</div>
            
            <div className="relative flex items-center justify-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl"
              >
                🚨
              </motion.div>
              <span className="text-lg font-bold font-sketch">EMERGENCY ROAST BUTTON</span>
              <Shuffle size={20} className="hand-drawn-icon" />
            </div>
            <p className="relative text-sm text-white/80 mt-1 font-hand">Random victim, instant chaos</p>
          </motion.button>

          {/* Roast Composer */}
          <div className="bg-dark-card rounded-xl p-4 border border-gray-800 relative sketch-card paper-texture">
            {/* Doodle decorations */}
            <div className="absolute -top-2 -right-2 text-lg opacity-30 animate-bounce-doodle">✨</div>
            <div className="absolute -bottom-1 -left-1 text-sm opacity-20 animate-wiggle">🎨</div>
            
            <h3 className="text-white font-bold mb-3 font-sketch crayon-text scribble-underline">Craft Your Roast 🔥</h3>
            
            <div className="space-y-3">
              <div>
                <textarea
                  value={roastText}
                  onChange={(e) => setRoastText(e.target.value)}
                  placeholder="Unleash your creativity... 💀"
                  className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-orange focus:outline-none h-24 resize-none sketch-border font-hand"
                  maxLength={280}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400 font-hand">
                    {roastText.length}/280
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={generateAIRoast}
                      disabled={isGeneratingAI}
                      className="text-xs text-secondary hover:text-white transition-colors disabled:opacity-50 flex items-center space-x-1 doodle-btn"
                    >
                      <Wand2 size={12} className="hand-drawn-icon" />
                      <span className="font-hand">{isGeneratingAI ? 'Generating...' : 'AI Assist'}</span>
                    </button>
                    <button 
                      onClick={() => toast.success('Voice input coming soon! 🎵')}
                      className="text-xs text-accent hover:text-white transition-colors flex items-center space-x-1 doodle-btn"
                    >
                      <Volume2 size={12} className="hand-drawn-icon" />
                      <span className="font-hand">Voice</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <motion.button
                onClick={handleSendRoast}
                disabled={!roastText.trim()}
                className="w-full bg-gradient-to-r from-orange via-red-500 to-red-600 text-white rounded-lg py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed doodle-btn sketch-border"
                whileHover={{ scale: 1.02, rotate: 1 }}
                whileTap={{ scale: 0.98, rotate: -1 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Zap size={20} className="hand-drawn-icon" />
                  <span className="font-sketch">Deploy Roast</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Roasts Feed */}
          <div className="space-y-3">
            {roasts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Zap size={48} className="mx-auto mb-4 opacity-50 hand-drawn-icon animate-bounce-doodle" />
                <p className="font-hand text-lg">No roasts yet. Break the ice! 🧊</p>
                <div className="mt-4 flex justify-center space-x-2 text-2xl opacity-50">
                  <span className="animate-wiggle">🔥</span>
                  <span className="animate-bounce-doodle">💀</span>
                  <span className="animate-float">⚡</span>
                </div>
              </div>
            ) : (
              roasts.map((roast, index) => {
                const hasLiked = userLikes[roast.id];
                const hasDisliked = userDislikes[roast.id];
                const isPlaying = isPlayingAudio === roast.id;
                const targetMember = members.find(m => m.id === roast.targetId);
                
                // Calculate net score for display
                const netScore = (roast.likes || 0) - (roast.dislikes || 0);
                const voteBonus = (roast.votes?.fire || 0) + (roast.votes?.brutal || 0) + (roast.votes?.wholesome || 0);
                const totalScore = netScore + voteBonus;
                
                return (
                  <motion.div
                    key={roast.id}
                    initial={{ opacity: 0, y: 20, rotate: -1 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-dark-card rounded-xl p-4 border border-gray-800 relative sketch-card sticker-element"
                  >
                    {/* Artistic elements */}
                    <div className="absolute top-2 right-2 text-xs opacity-20 animate-float">💫</div>
                    <div className="absolute bottom-2 left-2 text-xs opacity-15 animate-wiggle">✨</div>
                    
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="text-2xl sticker-element">
                        {roast.authorId === 'ai-roaster' ? '🤖' : '😈'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-white font-semibold font-hand">
                            {roast.authorId === 'ai-roaster' ? 'AI Roaster' : 'You'}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-primary font-semibold font-hand flex items-center space-x-1">
                            <span>{targetMember?.avatar || '🎯'}</span>
                            <span>{targetMember?.username || 'Someone'}</span>
                          </span>
                        </div>
                        <p className="text-gray-200 font-hand">{roast.content}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Like Button with Animation */}
                        <motion.button
                          onClick={() => handleLike(roast.id)}
                          className={`flex items-center space-x-2 transition-all doodle-btn ${
                            hasLiked 
                              ? 'text-pink-500' 
                              : 'text-gray-400 hover:text-pink-500'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <motion.div
                            animate={hasLiked ? { 
                              scale: [1, 1.3, 1],
                              rotate: [0, 15, -15, 0]
                            } : {}}
                            transition={{ duration: 0.6 }}
                          >
                            <Heart 
                              size={18} 
                              className="hand-drawn-icon" 
                              fill={hasLiked ? 'currentColor' : 'none'}
                            />
                          </motion.div>
                          <span className="text-sm font-hand">{roast.likes || 0}</span>
                          
                          {/* Love emoji animation */}
                          <AnimatePresence>
                            {hasLiked && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0, y: 0 }}
                                animate={{ 
                                  scale: [0, 1.5, 1], 
                                  opacity: [0, 1, 0],
                                  y: [0, -20, -40]
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5 }}
                                className="absolute text-lg pointer-events-none"
                              >
                                ❤️
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>

                        {/* Dislike Button with Animation */}
                        <motion.button
                          onClick={() => handleDislike(roast.id)}
                          className={`flex items-center space-x-2 transition-all doodle-btn ${
                            hasDisliked 
                              ? 'text-red-500' 
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <motion.div
                            animate={hasDisliked ? { 
                              scale: [1, 1.2, 1],
                              rotate: [0, -10, 10, 0],
                              x: [0, -2, 2, 0]
                            } : {}}
                            transition={{ duration: 0.8 }}
                          >
                            <ThumbsDown 
                              size={18} 
                              className="hand-drawn-icon" 
                              fill={hasDisliked ? 'currentColor' : 'none'}
                            />
                          </motion.div>
                          <span className="text-sm font-hand">{roast.dislikes || 0}</span>
                          
                          {/* Angry emoji animation */}
                          <AnimatePresence>
                            {hasDisliked && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0, y: 0 }}
                                animate={{ 
                                  scale: [0, 1.3, 1], 
                                  opacity: [0, 1, 0],
                                  y: [0, -15, -30],
                                  rotate: [0, -15, 15, 0]
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2 }}
                                className="absolute text-lg pointer-events-none"
                              >
                                😠
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>

                        {/* Net Score Display */}
                        {totalScore !== 0 && (
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-hand ${
                            totalScore > 0 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            <Star size={12} />
                            <span className="font-bold">
                              {totalScore > 0 ? '+' : ''}{totalScore}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Voice Playback Button */}
                        <motion.button 
                          onClick={() => playRoastAudio(roast.content, roast.id)}
                          className={`p-2 rounded-lg transition-colors doodle-btn ${
                            isPlaying 
                              ? 'text-orange bg-orange/20' 
                              : 'text-secondary hover:text-white hover:bg-secondary/20'
                          }`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9, rotate: -5 }}
                        >
                          {isPlaying ? (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                            >
                              <VolumeX size={16} className="hand-drawn-icon" />
                            </motion.div>
                          ) : (
                            <Volume2 size={16} className="hand-drawn-icon" />
                          )}
                        </motion.button>
                        
                        <span className="text-xs text-gray-400 font-hand">
                          {new Date(roast.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Emergency Roast Modal */}
      <AnimatePresence>
        {showEmergencyRoast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotate: 5 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-sm text-center sketch-card paper-texture relative"
            >
              {/* Doodle decorations */}
              <div className="absolute -top-2 -right-2 text-2xl opacity-60 animate-bounce-doodle">💥</div>
              <div className="absolute -bottom-1 -left-1 text-lg opacity-40 animate-wiggle">⚡</div>
              
              <div className="text-6xl mb-4 animate-bounce-doodle">🚨</div>
              <h2 className="text-xl font-bold text-white mb-2 font-sketch crayon-text">Emergency Roast</h2>
              <p className="text-gray-300 mb-4 font-hand">
                Randomly select a victim from the room and deliver an instant roast?
              </p>
              
              {/* Show available targets */}
              <div className="bg-dark-light rounded-lg p-3 mb-4">
                <h3 className="text-accent font-semibold mb-2 text-sm">Available Targets:</h3>
                <div className="flex justify-center space-x-2">
                  {members.slice(0, 4).map((member) => (
                    <div key={member.id} className="text-center">
                      <div className="text-lg">{member.avatar}</div>
                      <div className="text-xs text-gray-400">{member.username}</div>
                    </div>
                  ))}
                  {members.length > 4 && (
                    <div className="text-center">
                      <div className="text-lg">➕</div>
                      <div className="text-xs text-gray-400">+{members.length - 4}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEmergencyRoast(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors doodle-btn sketch-border font-hand"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmergencyRoastStart}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-400 transition-colors doodle-btn sketch-border font-hand"
                >
                  🔥 ROAST!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Roast Input Modal */}
      <AnimatePresence>
        {showEmergencyInput && emergencyVictim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotate: 3 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotate: -3 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-sm sketch-card paper-texture relative"
            >
              {/* Doodle decorations */}
              <div className="absolute -top-2 -right-2 text-2xl opacity-60 animate-wiggle">🎯</div>
              <div className="absolute -bottom-1 -left-1 text-lg opacity-40 animate-bounce-doodle">🔥</div>
              
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{emergencyVictim.avatar}</div>
                <h2 className="text-xl font-bold text-white mb-1 font-sketch crayon-text">🔥 Victim Chosen</h2>
                <p className="text-red-400 font-semibold text-lg font-hand">{emergencyVictim.username}</p>
                <p className="text-gray-400 text-sm mt-1 font-hand">Now craft your emergency roast!</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <textarea
                    value={emergencyRoastText}
                    onChange={(e) => setEmergencyRoastText(e.target.value)}
                    placeholder={`Roast ${emergencyVictim.username}... 💀`}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-red-500 focus:outline-none h-24 resize-none sketch-border font-hand"
                    maxLength={280}
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400 font-hand">
                      {emergencyRoastText.length}/280
                    </span>
                    <button 
                      onClick={generateEmergencyAIRoast}
                      disabled={isGeneratingAI}
                      className="text-xs text-secondary hover:text-white transition-colors disabled:opacity-50 flex items-center space-x-1 doodle-btn"
                    >
                      <Wand2 size={12} className="hand-drawn-icon" />
                      <span className="font-hand">{isGeneratingAI ? 'Generating...' : 'AI Roast'}</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowEmergencyInput(false);
                      setEmergencyVictim(null);
                      setEmergencyRoastText('');
                    }}
                    className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors doodle-btn sketch-border font-hand"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEmergencyRoastSubmit}
                    disabled={!emergencyRoastText.trim()}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed doodle-btn sketch-border font-hand"
                  >
                    🚨 DEPLOY!
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
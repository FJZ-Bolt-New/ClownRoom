import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Trophy, Clock, Users, Star, Zap, Camera, MessageCircle, Play, Award, ArrowRight, Target, Eye, Crown } from 'lucide-react';
import { Challenge } from '../../types';
import toast from 'react-hot-toast';

export const ChallengesView = () => {
  const { joinChallenge, updateUserPoints, setActiveView } = useStore();
  const [activeTab, setActiveTab] = useState<'active' | 'leaderboard'>('active');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [gamePhase, setGamePhase] = useState<'lobby' | 'slap' | 'guess' | 'results'>('lobby');
  
  const mockChallenges: Challenge[] = [
    {
      id: 'challenge-1',
      title: 'Caption This Chaos',
      description: 'Create the most unhinged caption for this cursed image',
      type: 'caption',
      difficulty: 'easy',
      reward: 100,
      timeLimit: 60,
      participants: ['user-1', 'user-2'],
      submissions: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
    {
      id: 'challenge-2',
      title: 'Fake Apology Video',
      description: 'Record a dramatic apology for something ridiculous',
      type: 'voice',
      difficulty: 'medium',
      reward: 250,
      timeLimit: 120,
      participants: ['user-1'],
      submissions: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    {
      id: 'challenge-3',
      title: 'Anonymous Slap Challenge',
      description: 'Slap someone secretly and see if they can guess who did it!',
      type: 'roast',
      difficulty: 'hard',
      reward: 500,
      timeLimit: 30,
      participants: ['user-1', 'user-2', 'user-3', 'user-4'],
      submissions: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  ];

  const leaderboard = [
    { rank: 1, user: 'ChaosQueen', avatar: '👑', points: 2450, badges: ['🏆', '🔥', '💀'], streak: 7 },
    { rank: 2, user: 'MemeLord42', avatar: '😈', points: 2100, badges: ['🥈', '🎭', '⚡'], streak: 5 },
    { rank: 3, user: 'RoastKing', avatar: '🔥', points: 1890, badges: ['🥉', '👹', '💎'], streak: 3 },
    { rank: 4, user: 'ClownMaster', avatar: '🤡', points: 1337, badges: ['🎪', '🌟', '🎨'], streak: 2 },
  ];

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/20';
      case 'legendary': return 'text-purple-400 bg-purple-400/20';
    }
  };

  const getTypeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'caption': return MessageCircle;
      case 'roast': return Zap;
      case 'voice': return Camera;
      case 'photo': return Camera;
      default: return Trophy;
    }
  };

  const handleJoinChallenge = (challengeId: string) => {
    joinChallenge(challengeId, 'user-1');
    updateUserPoints(5);
    toast.success('Challenge joined! Time to get chaotic! 🎪 (+5 CP)');
  };

  const enterChallenge = (challenge: Challenge) => {
    setCurrentChallenge(challenge);
    setGamePhase('lobby');
    toast.success(`Entering ${challenge.title}! 🚀`);
  };

  const getTimeLeft = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500 border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-transparent';
      case 2: return 'text-gray-400 border-gray-400 bg-gradient-to-r from-gray-400/10 to-transparent';
      case 3: return 'text-orange-500 border-orange-500 bg-gradient-to-r from-orange-500/10 to-transparent';
      default: return 'text-gray-500 border-gray-800';
    }
  };

  // If in a challenge, show the challenge room
  if (currentChallenge) {
    return (
      <ChallengeRoom
        challenge={currentChallenge}
        gamePhase={gamePhase}
        setGamePhase={setGamePhase}
        onExit={() => {
          setCurrentChallenge(null);
          setGamePhase('lobby');
        }}
        updateUserPoints={updateUserPoints}
      />
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Tab Navigation */}
        <div className="flex bg-dark-card rounded-xl p-1 mb-4">
          {[
            { id: 'active', label: 'Active', icon: Trophy },
            { id: 'leaderboard', label: 'Leaderboard', icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent text-dark'
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
          {/* Active Challenges */}
          {activeTab === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {mockChallenges.map((challenge, index) => {
                const TypeIcon = getTypeIcon(challenge.type);
                const isParticipating = challenge.participants.includes('user-1');
                
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-dark-card rounded-xl p-4 border border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getDifficultyColor(challenge.difficulty)}`}>
                          <TypeIcon size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold">{challenge.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{challenge.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-accent">
                          <Star size={16} />
                          <span className="font-bold">{challenge.reward}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Clock size={16} />
                          <span className="text-sm">{getTimeLeft(challenge.expiresAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Users size={16} />
                          <span className="text-sm">{challenge.participants.length}</span>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!isParticipating ? (
                        <motion.button
                          onClick={() => handleJoinChallenge(challenge.id)}
                          className="flex-1 bg-gradient-to-r from-accent to-yellow-500 text-dark rounded-lg py-3 font-bold"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Join Challenge
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => enterChallenge(challenge)}
                          className="flex-1 bg-gradient-to-r from-primary to-purple text-white rounded-lg py-3 font-bold flex items-center justify-center space-x-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Play size={16} />
                          <span>Enter Challenge</span>
                          <ArrowRight size={16} />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {mockChallenges.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No active challenges. Check back soon! 🎯</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Leaderboard */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {leaderboard.map((player, index) => (
                <motion.div
                  key={player.user}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-dark-card rounded-xl p-4 border ${getRankColor(player.rank)}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold ${
                      player.rank === 1 ? 'text-yellow-500' :
                      player.rank === 2 ? 'text-gray-400' :
                      player.rank === 3 ? 'text-orange-500' :
                      'text-gray-500'
                    }`}>
                      #{player.rank}
                    </div>
                    
                    <div className="text-3xl">{player.avatar}</div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{player.user}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          {player.badges.map((badge, i) => (
                            <span key={i} className="text-lg">{badge}</span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-1 text-orange text-xs">
                          <Award size={12} />
                          <span>{player.streak} streak</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">
                        {player.points.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-sm">CP</div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Weekly Reset Notice */}
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 border border-purple-500/30 mt-6">
                <div className="text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="text-purple-400 font-bold">Weekly Reset</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Leaderboard resets in 3 days, 14 hours
                  </p>
                  <button className="mt-2 px-4 py-1 bg-purple-500/20 text-purple-400 rounded text-sm hover:bg-purple-500/30 transition-colors">
                    View Rewards
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Challenge Room Component
const ChallengeRoom = ({ 
  challenge, 
  gamePhase, 
  setGamePhase, 
  onExit, 
  updateUserPoints 
}: {
  challenge: Challenge;
  gamePhase: 'lobby' | 'slap' | 'guess' | 'results';
  setGamePhase: (phase: 'lobby' | 'slap' | 'guess' | 'results') => void;
  onExit: () => void;
  updateUserPoints: (points: number) => void;
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [slapAnimation, setSlapAnimation] = useState<string | null>(null);
  const [gameState, setGameState] = useState({
    slapper: '',
    victim: '',
    correctGuess: false,
    roundComplete: false,
  });

  // Mock participants
  const participants = [
    { id: 'user-1', username: 'ClownMaster', avatar: '🤡', isCurrentUser: true },
    { id: 'user-2', username: 'MemeLord42', avatar: '😈', isCurrentUser: false },
    { id: 'user-3', username: 'ChaosQueen', avatar: '👑', isCurrentUser: false },
    { id: 'user-4', username: 'RoastKing', avatar: '🔥', isCurrentUser: false },
  ];

  const handleSlap = (targetId: string) => {
    if (selectedTarget) return; // Already slapped
    
    setSelectedTarget(targetId);
    setSlapAnimation(targetId);
    
    // Simulate slap animation
    setTimeout(() => setSlapAnimation(null), 1000);
    
    // Update game state
    setGameState({
      slapper: 'user-1',
      victim: targetId,
      correctGuess: false,
      roundComplete: false,
    });
    
    toast.success('👋 Slap delivered! The victim will now guess who did it!');
    updateUserPoints(10);
    
    // Move to guess phase after animation
    setTimeout(() => {
      setGamePhase('guess');
    }, 2000);
  };

  const handleGuess = (guessId: string) => {
    setSelectedGuess(guessId);
    const correct = guessId === gameState.slapper;
    
    setGameState(prev => ({
      ...prev,
      correctGuess: correct,
      roundComplete: true,
    }));
    
    if (correct) {
      toast.success('🎯 Correct guess! You win this round!');
      updateUserPoints(25);
    } else {
      toast.error('❌ Wrong guess! The slapper gets the points!');
      updateUserPoints(5); // Consolation points
    }
    
    setTimeout(() => {
      setGamePhase('results');
    }, 2000);
  };

  const startNewRound = () => {
    setSelectedTarget(null);
    setSelectedGuess(null);
    setSlapAnimation(null);
    setGameState({
      slapper: '',
      victim: '',
      correctGuess: false,
      roundComplete: false,
    });
    setGamePhase('slap');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-red-900/20 to-dark relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">👋</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">💥</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🎯</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">⚡</div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Challenge Header */}
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-2xl p-4 mb-6 text-white relative overflow-hidden">
            <div className="absolute -top-1 -right-1 text-lg opacity-70 animate-bounce-doodle">🎪</div>
            <div className="absolute -bottom-1 -left-1 text-sm opacity-50 animate-wiggle">💥</div>
            
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold font-sketch">{challenge.title}</h1>
              <button
                onClick={onExit}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-white/80 text-sm font-hand">{challenge.description}</p>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users size={16} />
                  <span className="text-sm">{participants.length} players</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star size={16} />
                  <span className="text-sm">{challenge.reward} CP</span>
                </div>
              </div>
              <div className="text-sm font-mono bg-white/20 px-2 py-1 rounded">
                Phase: {gamePhase.toUpperCase()}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Lobby Phase */}
            {gamePhase === 'lobby' && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800 text-center">
                  <div className="text-4xl mb-3 animate-bounce-doodle">🎯</div>
                  <h2 className="text-white font-bold text-lg mb-2">Get Ready!</h2>
                  <p className="text-gray-300 text-sm mb-4 font-hand">
                    In this challenge, you'll secretly slap someone, and they'll try to guess who did it!
                  </p>
                  
                  <div className="bg-dark-light rounded-lg p-3 mb-4">
                    <h3 className="text-accent font-semibold mb-2">How to Play:</h3>
                    <div className="text-left text-sm text-gray-300 space-y-1 font-hand">
                      <div>1. 👋 Choose someone to slap secretly</div>
                      <div>2. 🤔 The victim tries to guess who slapped them</div>
                      <div>3. 🏆 Correct guess = victim wins, wrong = slapper wins</div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => setGamePhase('slap')}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg py-3 font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Slapping! 👋
                  </motion.button>
                </div>

                {/* Participants Preview */}
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <h3 className="text-white font-bold mb-3">Players in this round:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="bg-dark-light rounded-lg p-3 text-center"
                      >
                        <div className="text-2xl mb-1">{participant.avatar}</div>
                        <div className="text-white text-sm font-semibold">
                          {participant.isCurrentUser ? 'You' : participant.username}
                        </div>
                        {participant.isCurrentUser && (
                          <div className="text-primary text-xs mt-1">👑 You</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Slap Phase */}
            {gamePhase === 'slap' && (
              <motion.div
                key="slap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800 text-center">
                  <div className="text-4xl mb-3 animate-wiggle">👋</div>
                  <h2 className="text-white font-bold text-lg mb-2">Choose Your Target!</h2>
                  <p className="text-gray-300 text-sm mb-4 font-hand">
                    Select someone to slap secretly. They won't know it was you!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {participants
                    .filter(p => !p.isCurrentUser)
                    .map((participant) => (
                      <motion.button
                        key={participant.id}
                        onClick={() => handleSlap(participant.id)}
                        disabled={selectedTarget !== null}
                        className={`bg-dark-light rounded-xl p-4 border-2 transition-all relative overflow-hidden ${
                          selectedTarget === participant.id
                            ? 'border-red-500 bg-red-500/20'
                            : selectedTarget
                            ? 'border-gray-700 opacity-50 cursor-not-allowed'
                            : 'border-gray-700 hover:border-red-400 hover:bg-red-400/10'
                        }`}
                        whileHover={!selectedTarget ? { scale: 1.05 } : {}}
                        whileTap={!selectedTarget ? { scale: 0.95 } : {}}
                      >
                        {/* Slap Animation */}
                        <AnimatePresence>
                          {slapAnimation === participant.id && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ 
                                scale: [0, 1.5, 1], 
                                opacity: [0, 1, 0],
                                rotate: [0, 15, -15, 0]
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1 }}
                              className="absolute inset-0 flex items-center justify-center text-6xl pointer-events-none z-10"
                            >
                              👋
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="text-3xl mb-2">{participant.avatar}</div>
                        <div className="text-white font-semibold">{participant.username}</div>
                        
                        {selectedTarget === participant.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-red-500/30 rounded-xl flex items-center justify-center"
                          >
                            <div className="text-white font-bold">SLAPPED! 💥</div>
                          </motion.div>
                        )}
                        
                        {!selectedTarget && (
                          <div className="text-red-400 text-sm mt-1">👋 Slap</div>
                        )}
                      </motion.button>
                    ))}
                </div>

                {selectedTarget && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-4 border border-red-500/30 text-center"
                  >
                    <div className="text-2xl mb-2">💥</div>
                    <h3 className="text-red-400 font-bold">Slap Delivered!</h3>
                    <p className="text-gray-300 text-sm mt-1 font-hand">
                      Now they have to guess who did it...
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Guess Phase */}
            {gamePhase === 'guess' && (
              <motion.div
                key="guess"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800 text-center">
                  <div className="text-4xl mb-3 animate-bounce-doodle">🤔</div>
                  <h2 className="text-white font-bold text-lg mb-2">Who Slapped You?</h2>
                  <p className="text-gray-300 text-sm mb-4 font-hand">
                    Someone just slapped you! Can you guess who it was?
                  </p>
                  
                  <div className="bg-red-500/20 rounded-lg p-3 border border-red-500/30">
                    <div className="text-red-400 font-semibold">You got slapped by someone! 👋💥</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {participants
                    .filter(p => !p.isCurrentUser && p.id !== gameState.victim)
                    .map((participant) => (
                      <motion.button
                        key={participant.id}
                        onClick={() => handleGuess(participant.id)}
                        disabled={selectedGuess !== null}
                        className={`bg-dark-light rounded-xl p-4 border-2 transition-all ${
                          selectedGuess === participant.id
                            ? 'border-blue-500 bg-blue-500/20'
                            : selectedGuess
                            ? 'border-gray-700 opacity-50 cursor-not-allowed'
                            : 'border-gray-700 hover:border-blue-400 hover:bg-blue-400/10'
                        }`}
                        whileHover={!selectedGuess ? { scale: 1.05 } : {}}
                        whileTap={!selectedGuess ? { scale: 0.95 } : {}}
                      >
                        <div className="text-3xl mb-2">{participant.avatar}</div>
                        <div className="text-white font-semibold">{participant.username}</div>
                        
                        {selectedGuess === participant.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-blue-500/30 rounded-xl flex items-center justify-center"
                          >
                            <div className="text-white font-bold">GUESSED! 🎯</div>
                          </motion.div>
                        )}
                        
                        {!selectedGuess && (
                          <div className="text-blue-400 text-sm mt-1">🎯 Guess</div>
                        )}
                      </motion.button>
                    ))}
                </div>

                {selectedGuess && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30 text-center"
                  >
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="text-blue-400 font-bold">Guess Made!</h3>
                    <p className="text-gray-300 text-sm mt-1 font-hand">
                      Let's see if you're right...
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Results Phase */}
            {gamePhase === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className={`rounded-xl p-4 border text-center ${
                  gameState.correctGuess
                    ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30'
                    : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30'
                }`}>
                  <div className="text-4xl mb-3">
                    {gameState.correctGuess ? '🎉' : '😈'}
                  </div>
                  <h2 className={`font-bold text-lg mb-2 ${
                    gameState.correctGuess ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {gameState.correctGuess ? 'Correct Guess!' : 'Wrong Guess!'}
                  </h2>
                  <p className="text-gray-300 text-sm font-hand">
                    {gameState.correctGuess 
                      ? 'You successfully identified your slapper! +25 CP'
                      : 'The slapper got away with it! +5 CP for trying'
                    }
                  </p>
                </div>

                {/* Round Summary */}
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <h3 className="text-white font-bold mb-3">Round Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Slapper:</span>
                      <span className="text-white">
                        {participants.find(p => p.id === gameState.slapper)?.username || 'You'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Victim:</span>
                      <span className="text-white">
                        {participants.find(p => p.id === gameState.victim)?.username || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Guess:</span>
                      <span className="text-white">
                        {participants.find(p => p.id === selectedGuess)?.username || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Result:</span>
                      <span className={gameState.correctGuess ? 'text-green-400' : 'text-red-400'}>
                        {gameState.correctGuess ? 'Correct' : 'Wrong'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    onClick={startNewRound}
                    className="flex-1 bg-gradient-to-r from-primary to-purple text-white rounded-lg py-3 font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Play Again 🔄
                  </motion.button>
                  <motion.button
                    onClick={onExit}
                    className="flex-1 bg-gray-700 text-white rounded-lg py-3 font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Exit Challenge
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
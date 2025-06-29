import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Trophy, Clock, Users, Star, Zap, Camera, MessageCircle, Play, Award, ArrowRight, Target, Eye, Crown, Volume2, VolumeX, User, Users as UsersIcon, Mic, Video, Download, Share2, RotateCcw, Palette, Sparkles } from 'lucide-react';
import { Challenge } from '../../types';
import toast from 'react-hot-toast';

export const ChallengesView = () => {
  const { joinChallenge, updateUserPoints, setActiveView } = useStore();
  const [activeTab, setActiveTab] = useState<'active' | 'leaderboard'>('active');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [gamePhase, setGamePhase] = useState<'lobby' | 'slap' | 'guess' | 'results'>('lobby');
  
  // Fake Apology Challenge State
  const [showFakeApology, setShowFakeApology] = useState(false);
  const [apologyData, setApologyData] = useState({
    apologizerName: '',
    apologyText: '',
    characterGender: 'boy' as 'boy' | 'girl'
  });
  const [showApologyVideo, setShowApologyVideo] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isPlayingApologyAudio, setIsPlayingApologyAudio] = useState(false);
  
  // Meme Master Challenge State
  const [showMemeMaster, setShowMemeMaster] = useState(false);
  const [memeGameState, setMemeGameState] = useState({
    currentRound: 1,
    maxRounds: 3,
    phase: 'caption' as 'caption' | 'voting' | 'results' | 'gameEnd',
    currentMeme: null as any,
    selectedCaption: '',
    playerCaptions: [] as any[],
    votes: {} as Record<string, string>,
    scores: {} as Record<string, number>,
    roundWinner: '',
    gameWinner: ''
  });
  
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
      description: 'Create a dramatic apology video that would make YouTubers jealous',
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
      title: 'Meme Master',
      description: 'Choose the funniest captions for trending memes and vote for the best!',
      type: 'caption',
      difficulty: 'medium',
      reward: 300,
      timeLimit: 180,
      participants: ['user-1', 'user-2', 'user-3'],
      submissions: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
    },
    {
      id: 'challenge-4',
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

  // Trending Meme Templates with Pexels URLs
  const memeTemplates = [
    {
      id: 'doge',
      name: 'Doge',
      description: 'Much wow, very meme',
      imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '🐕'
    },
    {
      id: 'distracted-boyfriend',
      name: 'Distracted Boyfriend',
      description: 'When something better comes along',
      imageUrl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '👨‍💼'
    },
    {
      id: 'woman-yelling-cat',
      name: 'Woman Yelling at Cat',
      description: 'The eternal argument',
      imageUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '😾'
    },
    {
      id: 'drake-pointing',
      name: 'Drake Pointing',
      description: 'Nah vs Yeah',
      imageUrl: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '👉'
    },
    {
      id: 'surprised-pikachu',
      name: 'Surprised Pikachu',
      description: 'When the obvious happens',
      imageUrl: 'https://images.pexels.com/photos/1181319/pexels-photo-1181319.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '⚡'
    },
    {
      id: 'this-is-fine',
      name: 'This is Fine',
      description: 'Everything is totally fine',
      imageUrl: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '🔥'
    },
    {
      id: 'galaxy-brain',
      name: 'Galaxy Brain',
      description: 'Ascending levels of intelligence',
      imageUrl: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '🧠'
    },
    {
      id: 'stonks',
      name: 'Stonks',
      description: 'When investments go up',
      imageUrl: 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '📈'
    },
    {
      id: 'change-my-mind',
      name: 'Change My Mind',
      description: 'Controversial opinions welcome',
      imageUrl: 'https://images.pexels.com/photos/1181715/pexels-photo-1181715.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '🪑'
    },
    {
      id: 'two-buttons',
      name: 'Two Buttons',
      description: 'Difficult choices require strong wills',
      imageUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '🔴'
    },
    {
      id: 'expanding-brain',
      name: 'Expanding Brain',
      description: 'Evolution of thoughts',
      imageUrl: 'https://images.pexels.com/photos/1181712/pexels-photo-1181712.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '🧠'
    },
    {
      id: 'success-kid',
      name: 'Success Kid',
      description: 'When everything goes right',
      imageUrl: 'https://images.pexels.com/photos/1181724/pexels-photo-1181724.jpeg?auto=compress&cs=tinysrgb&w=800',
      fallback: '👶'
    }
  ];

  // Funny caption options for memes
  const captionOptions = [
    "When you realize it's Monday tomorrow...",
    "Me trying to explain my weekend plans",
    "When someone says pineapple belongs on pizza",
    "My brain at 3 AM thinking about embarrassing moments from 2015",
    "When you see your ex with someone uglier than you",
    "Me pretending to understand what's happening in the group chat",
    "When you accidentally open the front camera",
    "My wallet after online shopping",
    "When someone asks if I'm okay but I'm clearly not",
    "Me trying to be productive vs me actually being productive",
    "When you remember you have responsibilities",
    "My sleep schedule during quarantine",
    "When someone younger than you calls you 'sir' or 'ma'am'",
    "Me trying to adult but failing spectacularly",
    "When you realize you've been pronouncing a word wrong your whole life",
    "My motivation on Monday vs Friday",
    "When you see a spider but lose track of where it went",
    "Me trying to save money vs me seeing something I want",
    "When someone asks what I did all day and I can't remember",
    "My confidence before vs after looking in a mirror",
    "When you're home alone and hear a weird noise",
    "Me trying to be healthy vs me seeing pizza",
    "When you realize you've been talking to yourself out loud",
    "My expectations vs reality",
    "When someone says 'we need to talk'",
    "Me trying to remember where I put my keys",
    "When you accidentally like someone's old Instagram post",
    "My bank account after payday vs before payday",
    "When you're trying to be mysterious but you're just confused",
    "Me pretending to listen while thinking about food"
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
    if (challenge.title === 'Fake Apology Video') {
      setShowFakeApology(true);
      toast.success('🎬 Entering Fake Apology Studio!');
    } else if (challenge.title === 'Meme Master') {
      setShowMemeMaster(true);
      initializeMemeMasterGame();
      toast.success('🎭 Entering Meme Master Arena!');
    } else {
      setCurrentChallenge(challenge);
      setGamePhase('lobby');
      toast.success(`Entering ${challenge.title}! 🚀`);
    }
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

  // FAKE APOLOGY CHALLENGE FUNCTIONS
  const generateApologyVideo = async () => {
    if (!apologyData.apologizerName.trim()) {
      toast.error('Enter the name of the person apologizing! 📝');
      return;
    }

    if (!apologyData.apologyText.trim()) {
      toast.error('Write what they should say! ✍️');
      return;
    }

    setIsGeneratingVideo(true);
    toast.success('🎬 Generating dramatic apology video...');

    // Simulate video generation
    setTimeout(() => {
      setIsGeneratingVideo(false);
      setShowApologyVideo(true);
      toast.success('🎭 Apology video ready! Press play to watch the drama unfold!');
    }, 3000);
  };

  const playApologyAudio = async () => {
    if (isPlayingApologyAudio) {
      setIsPlayingApologyAudio(false);
      toast.success('Audio stopped! 🔇');
      return;
    }

    setIsPlayingApologyAudio(true);
    toast.success('🎵 Converting apology to speech...');

    try {
      // Use Web Speech API for text-to-speech (same as roast challenge)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(apologyData.apologyText);
        
        // Set voice based on character gender
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          apologyData.characterGender === 'girl' 
            ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman')
            : voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.rate = 0.9; // Slightly slower for dramatic effect
        utterance.pitch = apologyData.characterGender === 'girl' ? 1.2 : 0.8;
        utterance.volume = 0.8;
        
        utterance.onend = () => setIsPlayingApologyAudio(false);
        utterance.onerror = () => {
          setIsPlayingApologyAudio(false);
          toast.error('Voice generation failed! 😵');
        };
        
        speechSynthesis.speak(utterance);
        toast.success('🗣️ Playing dramatic apology!');
      } else {
        setIsPlayingApologyAudio(false);
        toast.error('Voice not supported on this device! 😢');
      }
    } catch (error) {
      setIsPlayingApologyAudio(false);
      toast.error('Voice generation failed! 😞');
    }
  };

  const resetApologyChallenge = () => {
    setApologyData({
      apologizerName: '',
      apologyText: '',
      characterGender: 'boy'
    });
    setShowApologyVideo(false);
    setIsGeneratingVideo(false);
    setIsPlayingApologyAudio(false);
  };

  const downloadApologyVideo = () => {
    toast.success('🎬 Video download feature coming soon! For now, enjoy the drama! 📹');
    updateUserPoints(10);
  };

  const shareApologyVideo = () => {
    toast.success('📤 Sharing this masterpiece with the world! 🌍');
    updateUserPoints(5);
  };

  // MEME MASTER CHALLENGE FUNCTIONS
  const initializeMemeMasterGame = () => {
    const randomMeme = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
    const shuffledCaptions = [...captionOptions].sort(() => Math.random() - 0.5).slice(0, 4);
    
    setMemeGameState({
      currentRound: 1,
      maxRounds: 3,
      phase: 'caption',
      currentMeme: randomMeme,
      selectedCaption: '',
      playerCaptions: [],
      votes: {},
      scores: { 'You': 0, 'MemeLord42': 0, 'ChaosQueen': 0 },
      roundWinner: '',
      gameWinner: ''
    });
  };

  const selectCaption = (caption: string) => {
    if (memeGameState.selectedCaption) return; // Already selected
    
    setMemeGameState(prev => ({ ...prev, selectedCaption: caption }));
    
    // Simulate other players selecting captions
    setTimeout(() => {
      const remainingCaptions = captionOptions.filter(c => c !== caption);
      const aiCaptions = remainingCaptions.sort(() => Math.random() - 0.5).slice(0, 2);
      
      const allCaptions = [
        { player: 'You', caption, isUser: true },
        { player: 'MemeLord42', caption: aiCaptions[0], isUser: false },
        { player: 'ChaosQueen', caption: aiCaptions[1], isUser: false }
      ];
      
      setMemeGameState(prev => ({
        ...prev,
        playerCaptions: allCaptions,
        phase: 'voting'
      }));
      
      toast.success('All players have chosen! Time to vote! 🗳️');
    }, 2000);
  };

  const voteForCaption = (player: string) => {
    if (player === 'You') {
      toast.error("You can't vote for your own caption! 😅");
      return;
    }
    
    if (memeGameState.votes['You']) {
      toast.error('You already voted! 🗳️');
      return;
    }
    
    setMemeGameState(prev => ({ ...prev, votes: { ...prev.votes, 'You': player } }));
    
    // Simulate AI votes
    setTimeout(() => {
      const aiVotes: Record<string, string> = {};
      
      // MemeLord42 votes (not for themselves or user's choice if user voted for ChaosQueen)
      const memeLordOptions = ['You', 'ChaosQueen'].filter(p => p !== 'MemeLord42');
      aiVotes['MemeLord42'] = memeLordOptions[Math.floor(Math.random() * memeLordOptions.length)];
      
      // ChaosQueen votes (not for themselves)
      const chaosQueenOptions = ['You', 'MemeLord42'].filter(p => p !== 'ChaosQueen');
      aiVotes['ChaosQueen'] = chaosQueenOptions[Math.floor(Math.random() * chaosQueenOptions.length)];
      
      const allVotes = { ...memeGameState.votes, 'You': player, ...aiVotes };
      
      // Calculate vote counts
      const voteCounts: Record<string, number> = { 'You': 0, 'MemeLord42': 0, 'ChaosQueen': 0 };
      Object.values(allVotes).forEach(votedFor => {
        voteCounts[votedFor]++;
      });
      
      // Find winner (highest votes, random if tie)
      const maxVotes = Math.max(...Object.values(voteCounts));
      const winners = Object.keys(voteCounts).filter(player => voteCounts[player] === maxVotes);
      const roundWinner = winners[Math.floor(Math.random() * winners.length)];
      
      // Update scores
      const newScores = { ...memeGameState.scores };
      newScores[roundWinner] += 10;
      
      setMemeGameState(prev => ({
        ...prev,
        votes: allVotes,
        scores: newScores,
        roundWinner,
        phase: 'results'
      }));
      
      toast.success(`🏆 ${roundWinner} wins this round!`);
      updateUserPoints(roundWinner === 'You' ? 15 : 5);
    }, 1500);
  };

  const nextMemeRound = () => {
    if (memeGameState.currentRound >= memeGameState.maxRounds) {
      // Game over
      const finalScores = memeGameState.scores;
      const maxScore = Math.max(...Object.values(finalScores));
      const gameWinners = Object.keys(finalScores).filter(player => finalScores[player] === maxScore);
      const gameWinner = gameWinners[Math.floor(Math.random() * gameWinners.length)];
      
      setMemeGameState(prev => ({
        ...prev,
        gameWinner,
        phase: 'gameEnd'
      }));
      
      if (gameWinner === 'You') {
        toast.success('🎉 You won the entire game! Meme Master achieved! 👑');
        updateUserPoints(50);
      } else {
        toast.success(`🎭 ${gameWinner} won the game! Better luck next time!`);
        updateUserPoints(10);
      }
    } else {
      // Next round
      const randomMeme = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
      
      setMemeGameState(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        phase: 'caption',
        currentMeme: randomMeme,
        selectedCaption: '',
        playerCaptions: [],
        votes: {},
        roundWinner: ''
      }));
      
      toast.success(`🎭 Round ${memeGameState.currentRound + 1} starting!`);
    }
  };

  const exitMemeMaster = () => {
    setShowMemeMaster(false);
    setMemeGameState({
      currentRound: 1,
      maxRounds: 3,
      phase: 'caption',
      currentMeme: null,
      selectedCaption: '',
      playerCaptions: [],
      votes: {},
      scores: {},
      roundWinner: '',
      gameWinner: ''
    });
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

  // Show Fake Apology Challenge
  if (showFakeApology) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-red-900/20 to-dark relative overflow-hidden">
        {/* Artistic Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎬</div>
          <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">🎭</div>
          <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">📹</div>
          <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🎪</div>
        </div>

        <div className="relative z-10 p-4 pb-20">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-2xl p-4 mb-6 text-white relative overflow-hidden">
              <div className="absolute -top-1 -right-1 text-lg opacity-70 animate-bounce-doodle">🎬</div>
              <div className="absolute -bottom-1 -left-1 text-sm opacity-50 animate-wiggle">🎭</div>
              
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold font-sketch">Fake Apology Studio</h1>
                <button
                  onClick={() => setShowFakeApology(false)}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-white/80 text-sm font-hand">Create dramatic YouTube-style apology videos</p>
            </div>

            <AnimatePresence mode="wait">
              {!showApologyVideo ? (
                /* Input Form */
                <motion.div
                  key="input-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Character Selection */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 font-sketch">Choose Character</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setApologyData(prev => ({ ...prev, characterGender: 'boy' }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          apologyData.characterGender === 'boy'
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-gray-700 bg-dark-light text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-4xl mb-2">👨</div>
                        <div className="font-hand font-semibold">Boy</div>
                        <div className="text-xs text-gray-400">Deeper voice</div>
                      </button>
                      
                      <button
                        onClick={() => setApologyData(prev => ({ ...prev, characterGender: 'girl' }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          apologyData.characterGender === 'girl'
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-gray-700 bg-dark-light text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-4xl mb-2">👩</div>
                        <div className="font-hand font-semibold">Girl</div>
                        <div className="text-xs text-gray-400">Higher voice</div>
                      </button>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-4 font-sketch">Apology Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-hand">
                          Name of person apologizing *
                        </label>
                        <input
                          type="text"
                          value={apologyData.apologizerName}
                          onChange={(e) => setApologyData(prev => ({ ...prev, apologizerName: e.target.value }))}
                          placeholder="e.g. Josh, Sarah, Alex..."
                          className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none font-hand"
                          maxLength={30}
                        />
                        <div className="text-xs text-gray-400 mt-1 font-hand">
                          This person will be doing the apologizing
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm mb-2 font-hand">
                          What you want them to say *
                        </label>
                        <textarea
                          value={apologyData.apologyText}
                          onChange={(e) => setApologyData(prev => ({ ...prev, apologyText: e.target.value }))}
                          placeholder="e.g. I'm sorry for lying to you about where I was last night. I know I hurt your trust and I want to make things right..."
                          className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none h-32 resize-none font-hand"
                          maxLength={500}
                        />
                        <div className="text-xs text-gray-400 mt-1 font-hand">
                          {apologyData.apologyText.length}/500 characters
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <motion.button
                    onClick={generateApologyVideo}
                    disabled={isGeneratingVideo || !apologyData.apologizerName.trim() || !apologyData.apologyText.trim()}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isGeneratingVideo ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Drama...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Video size={20} />
                        <span>Generate Apology Video</span>
                        <Sparkles size={20} />
                      </div>
                    )}
                  </motion.button>
                </motion.div>
              ) : (
                /* Video Output */
                <motion.div
                  key="video-output"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Video Player */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-4 font-sketch">🎬 Dramatic Apology Video</h3>
                    
                    {/* Video Area */}
                    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-lg overflow-hidden aspect-video mb-4">
                      {/* Dramatic Background */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                      
                      {/* Character Avatar */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{ 
                            scale: isPlayingApologyAudio ? [1, 1.05, 1] : 1,
                            rotate: isPlayingApologyAudio ? [0, 1, -1, 0] : 0
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: isPlayingApologyAudio ? Infinity : 0
                          }}
                          className="text-8xl filter drop-shadow-lg"
                        >
                          {apologyData.characterGender === 'boy' ? '👨' : '👩'}
                        </motion.div>
                      </div>
                      
                      {/* Dramatic Title */}
                      <div className="absolute top-4 left-4 right-4">
                        <div className="bg-black/70 rounded-lg p-3 text-center">
                          <h2 className="text-white font-bold text-lg font-sketch">
                            {apologyData.apologizerName}'s Apology
                          </h2>
                        </div>
                      </div>
                      
                      {/* Subtitles */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/80 rounded-lg p-3">
                          <p className="text-white text-center font-hand text-sm leading-relaxed">
                            "{apologyData.apologyText}"
                          </p>
                        </div>
                      </div>
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.button
                          onClick={playApologyAudio}
                          className={`p-4 rounded-full transition-all ${
                            isPlayingApologyAudio 
                              ? 'bg-red-500/80 text-white' 
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {isPlayingApologyAudio ? (
                            <VolumeX size={32} />
                          ) : (
                            <Play size={32} />
                          )}
                        </motion.button>
                      </div>
                      
                      {/* Rain Effect (Optional) */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/30 to-transparent animate-pulse" />
                        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="bg-dark-light rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold font-hand">
                            {apologyData.apologizerName}'s Dramatic Apology
                          </h4>
                          <p className="text-gray-400 text-sm font-hand">
                            Character: {apologyData.characterGender === 'boy' ? 'Male' : 'Female'} Voice
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">✓ Generated</div>
                          <div className="text-gray-400 text-xs">Ready to play</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={downloadApologyVideo}
                      className="flex items-center justify-center space-x-2 p-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      <Download size={20} />
                      <span className="font-hand">Download</span>
                    </button>
                    
                    <button
                      onClick={shareApologyVideo}
                      className="flex items-center justify-center space-x-2 p-3 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <Share2 size={20} />
                      <span className="font-hand">Share</span>
                    </button>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={resetApologyChallenge}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <RotateCcw size={20} />
                    <span className="font-hand">Create Another Apology</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Show Meme Master Challenge
  if (showMemeMaster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-purple-900/20 to-dark relative overflow-hidden">
        {/* Artistic Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎭</div>
          <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">😂</div>
          <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🏆</div>
          <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">👑</div>
        </div>

        <div className="relative z-10 p-4 pb-20">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-4 mb-6 text-white relative overflow-hidden">
              <div className="absolute -top-1 -right-1 text-lg opacity-70 animate-bounce-doodle">🎭</div>
              <div className="absolute -bottom-1 -left-1 text-sm opacity-50 animate-wiggle">👑</div>
              
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold font-sketch">Meme Master Arena</h1>
                <button
                  onClick={exitMemeMaster}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-white/80 text-sm font-hand">Round {memeGameState.currentRound}/{memeGameState.maxRounds}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Crown size={16} />
                    <span>You: {memeGameState.scores['You'] || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Caption Selection Phase */}
              {memeGameState.phase === 'caption' && (
                <motion.div
                  key="caption-phase"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Meme Display */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 font-sketch text-center">
                      🖼️ {memeGameState.currentMeme?.name}
                    </h3>
                    <p className="text-gray-400 text-sm text-center mb-4 font-hand">
                      {memeGameState.currentMeme?.description}
                    </p>
                    
                    <div className="relative bg-white rounded-lg overflow-hidden aspect-square mb-4">
                      <img
                        src={memeGameState.currentMeme?.imageUrl}
                        alt={memeGameState.currentMeme?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full bg-gray-200 items-center justify-center text-6xl">
                        {memeGameState.currentMeme?.fallback}
                      </div>
                    </div>
                  </div>

                  {/* Caption Options */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-4 font-sketch">
                      🧠 Choose the Best Caption:
                    </h3>
                    
                    <div className="space-y-3">
                      {captionOptions.slice(0, 4).map((caption, index) => (
                        <motion.button
                          key={caption}
                          onClick={() => selectCaption(caption)}
                          disabled={!!memeGameState.selectedCaption}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            memeGameState.selectedCaption === caption
                              ? 'border-primary bg-primary/20 text-primary'
                              : memeGameState.selectedCaption
                              ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
                              : 'border-gray-700 bg-dark-light text-white hover:border-gray-600 hover:bg-gray-700'
                          }`}
                          whileHover={!memeGameState.selectedCaption ? { scale: 1.02 } : {}}
                          whileTap={!memeGameState.selectedCaption ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              memeGameState.selectedCaption === caption
                                ? 'bg-primary text-white'
                                : 'bg-gray-600 text-gray-300'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <div className="flex-1 font-hand">
                              {caption}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    
                    {memeGameState.selectedCaption && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-primary/20 rounded-lg border border-primary/30 text-center"
                      >
                        <div className="text-primary font-bold font-hand">✓ Caption Selected!</div>
                        <div className="text-gray-300 text-sm font-hand">Waiting for other players...</div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Voting Phase */}
              {memeGameState.phase === 'voting' && (
                <motion.div
                  key="voting-phase"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Meme with Captions */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-4 font-sketch text-center">
                      🗳️ Vote for the Funniest Caption!
                    </h3>
                    
                    <div className="relative bg-white rounded-lg overflow-hidden aspect-square mb-4">
                      <img
                        src={memeGameState.currentMeme?.imageUrl}
                        alt={memeGameState.currentMeme?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full bg-gray-200 items-center justify-center text-6xl">
                        {memeGameState.currentMeme?.fallback}
                      </div>
                    </div>
                  </div>

                  {/* Caption Voting */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-4 font-sketch">All Player Captions:</h3>
                    
                    <div className="space-y-3">
                      {memeGameState.playerCaptions.map((entry, index) => (
                        <motion.button
                          key={entry.player}
                          onClick={() => voteForCaption(entry.player)}
                          disabled={entry.isUser || !!memeGameState.votes['You']}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            entry.isUser
                              ? 'border-blue-500 bg-blue-500/20 text-blue-400 cursor-not-allowed'
                              : memeGameState.votes['You'] === entry.player
                              ? 'border-green-500 bg-green-500/20 text-green-400'
                              : memeGameState.votes['You']
                              ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
                              : 'border-gray-700 bg-dark-light text-white hover:border-gray-600 hover:bg-gray-700'
                          }`}
                          whileHover={!entry.isUser && !memeGameState.votes['You'] ? { scale: 1.02 } : {}}
                          whileTap={!entry.isUser && !memeGameState.votes['You'] ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-hand text-sm mb-1">
                                {entry.caption}
                              </div>
                              <div className={`text-xs font-bold ${
                                entry.isUser ? 'text-blue-400' : 'text-gray-400'
                              }`}>
                                - {entry.player} {entry.isUser ? '(Your Caption)' : ''}
                              </div>
                            </div>
                            
                            {memeGameState.votes['You'] === entry.player && (
                              <div className="text-green-400 ml-2">
                                ✓ Voted
                              </div>
                            )}
                            
                            {entry.isUser && (
                              <div className="text-blue-400 ml-2">
                                👤 You
                              </div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    
                    {memeGameState.votes['You'] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30 text-center"
                      >
                        <div className="text-green-400 font-bold font-hand">✓ Vote Cast!</div>
                        <div className="text-gray-300 text-sm font-hand">Waiting for final results...</div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Results Phase */}
              {memeGameState.phase === 'results' && (
                <motion.div
                  key="results-phase"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Winner Announcement */}
                  <div className={`rounded-xl p-6 border text-center ${
                    memeGameState.roundWinner === 'You'
                      ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30'
                      : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'
                  }`}>
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity
                      }}
                      className="text-6xl mb-3"
                    >
                      {memeGameState.roundWinner === 'You' ? '🎉' : '👑'}
                    </motion.div>
                    <h2 className={`font-bold text-xl mb-2 font-sketch ${
                      memeGameState.roundWinner === 'You' ? 'text-green-400' : 'text-purple-400'
                    }`}>
                      {memeGameState.roundWinner === 'You' ? 'You Win This Round!' : `${memeGameState.roundWinner} Wins!`}
                    </h2>
                    <p className="text-gray-300 text-sm font-hand">
                      {memeGameState.roundWinner === 'You' 
                        ? 'Your caption was the funniest! +15 CP'
                        : 'Better luck next round! +5 CP for participating'
                      }
                    </p>
                  </div>

                  {/* Final Meme with Winning Caption */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-4 font-sketch text-center">
                      🏆 Winning Combination:
                    </h3>
                    
                    <div className="relative bg-white rounded-lg overflow-hidden aspect-square mb-4">
                      <img
                        src={memeGameState.currentMeme?.imageUrl}
                        alt={memeGameState.currentMeme?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full bg-gray-200 items-center justify-center text-6xl">
                        {memeGameState.currentMeme?.fallback}
                      </div>
                      
                      {/* Winning Caption Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                        <div className="text-white font-bold text-center font-hand">
                          "{memeGameState.playerCaptions.find(c => c.player === memeGameState.roundWinner)?.caption}"
                        </div>
                        <div className="text-yellow-400 text-center text-sm mt-1">
                          - {memeGameState.roundWinner} 👑
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Scores */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 font-sketch">Current Scores:</h3>
                    <div className="space-y-2">
                      {Object.entries(memeGameState.scores)
                        .sort(([,a], [,b]) => b - a)
                        .map(([player, score], index) => (
                          <div
                            key={player}
                            className={`flex items-center justify-between p-2 rounded ${
                              player === 'You' ? 'bg-blue-500/20' : 'bg-dark-light'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="text-lg">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                              </div>
                              <span className="text-white font-hand">
                                {player} {player === 'You' ? '(You)' : ''}
                              </span>
                            </div>
                            <div className="text-accent font-bold">{score} pts</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Next Round Button */}
                  <motion.button
                    onClick={nextMemeRound}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-4 font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {memeGameState.currentRound >= memeGameState.maxRounds ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Trophy size={20} />
                        <span>See Final Results</span>
                        <Crown size={20} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <ArrowRight size={20} />
                        <span>Next Round ({memeGameState.currentRound + 1}/{memeGameState.maxRounds})</span>
                      </div>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Game End Phase */}
              {memeGameState.phase === 'gameEnd' && (
                <motion.div
                  key="game-end-phase"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Game Winner */}
                  <div className={`rounded-xl p-6 border text-center ${
                    memeGameState.gameWinner === 'You'
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                      : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'
                  }`}>
                    <motion.div
                      animate={{ 
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity
                      }}
                      className="text-8xl mb-4"
                    >
                      {memeGameState.gameWinner === 'You' ? '🏆' : '👑'}
                    </motion.div>
                    <h1 className={`font-bold text-2xl mb-3 font-sketch ${
                      memeGameState.gameWinner === 'You' ? 'text-yellow-400' : 'text-purple-400'
                    }`}>
                      {memeGameState.gameWinner === 'You' ? 'MEME MASTER ACHIEVED!' : `${memeGameState.gameWinner} is the Meme Master!`}
                    </h1>
                    <p className="text-gray-300 font-hand">
                      {memeGameState.gameWinner === 'You' 
                        ? 'You dominated the meme game! +50 CP'
                        : 'Great effort! You earned participation points! +10 CP'
                      }
                    </p>
                  </div>

                  {/* Final Scores */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-4 font-sketch text-center">🏆 Final Leaderboard</h3>
                    <div className="space-y-3">
                      {Object.entries(memeGameState.scores)
                        .sort(([,a], [,b]) => b - a)
                        .map(([player, score], index) => (
                          <motion.div
                            key={player}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                              index === 0 
                                ? 'border-yellow-500 bg-yellow-500/20' 
                                : player === 'You'
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-gray-700 bg-dark-light'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                              </div>
                              <div>
                                <div className="text-white font-bold font-hand">
                                  {player} {player === 'You' ? '(You)' : ''}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {index === 0 ? 'Meme Master' : 'Meme Apprentice'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-accent font-bold text-xl">{score}</div>
                              <div className="text-gray-400 text-sm">points</div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      onClick={() => {
                        initializeMemeMasterGame();
                        toast.success('🎭 New game started!');
                      }}
                      className="flex items-center justify-center space-x-2 p-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RotateCcw size={20} />
                      <span className="font-hand">Play Again</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={exitMemeMaster}
                      className="flex items-center justify-center space-x-2 p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowRight size={20} />
                      <span className="font-hand">Exit Game</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
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

// Challenge Room Component (existing slap challenge)
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
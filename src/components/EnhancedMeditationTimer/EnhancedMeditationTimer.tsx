import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, RotateCcw, Bell, X, Wind } from 'lucide-react';
import { Modal } from '../Modal/Modal';

interface EnhancedMeditationTimerProps {
  onClose: () => void;
}

export function EnhancedMeditationTimer({ onClose }: EnhancedMeditationTimerProps) {
  const [duration, setDuration] = useState(10);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const intervalRef = useRef<number | null>(null);
  const breathIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  // A single interval runs for as long as the timer is running. It never
  // depends on `timeLeft`, so it is not torn down and recreated every tick;
  // the functional updater handles the countdown and completion.
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          playChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Breathing exercise cycle
  useEffect(() => {
    if (showBreathing) {
      let phase: 'inhale' | 'hold' | 'exhale' = 'inhale';
      let count = 0;

      breathIntervalRef.current = window.setInterval(() => {
        count++;
        if (phase === 'inhale' && count >= 4) {
          phase = 'hold';
          count = 0;
        } else if (phase === 'hold' && count >= 4) {
          phase = 'exhale';
          count = 0;
        } else if (phase === 'exhale' && count >= 4) {
          phase = 'inhale';
          count = 0;
        }
        setBreathPhase(phase);
      }, 1000);
    } else {
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
      }
    }

    return () => {
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
      }
    };
  }, [showBreathing]);

  // Release the shared AudioContext when the timer unmounts.
  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, []);

  const playChime = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 528;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setIsComplete(false);
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  const getBreathingInstruction = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'Breathe In...';
      case 'hold':
        return 'Hold...';
      case 'exhale':
        return 'Breathe Out...';
    }
  };

  const getBreathingCircleScale = () => {
    switch (breathPhase) {
      case 'inhale':
        return 1.3;
      case 'hold':
        return 1.3;
      case 'exhale':
        return 0.7;
    }
  };

  return (
    <Modal
      onClose={onClose}
      ariaLabel="Meditation timer"
      panelClassName="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-2xl text-srf-blue">Meditation</h3>
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Breathing Toggle */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowBreathing(!showBreathing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            showBreathing
              ? 'bg-srf-blue text-white hover:bg-srf-blue-700'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span className="text-sm">Breathing Exercise</span>
        </button>
      </div>

      {/* Breathing Circle (when enabled) */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex flex-col items-center"
          >
            <motion.div
              animate={prefersReducedMotion ? undefined : { scale: getBreathingCircleScale() }}
              transition={prefersReducedMotion ? undefined : { duration: 4, ease: 'easeInOut' }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-srf-blue to-srf-blue-700 shadow-2xl flex items-center justify-center"
            >
              <div className="text-white text-lg font-medium">{getBreathingInstruction()}</div>
            </motion.div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Inhale for 4s, Hold for 4s, Exhale for 4s
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Display */}
      <div className="relative mb-8">
        <svg className="w-full h-64" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#E8D5C4"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="12"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
            transform="rotate(-90 100 100)"
            className="transition-all duration-1000"
          />
          <text
            x="100"
            y="110"
            textAnchor="middle"
            className="font-heading text-4xl fill-srf-blue"
          >
            {formatTime(timeLeft)}
          </text>
        </svg>
      </div>

      {/* Duration Selection */}
      {!isRunning && timeLeft === duration * 60 && (
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">Duration (minutes)</label>
          <div className="grid grid-cols-5 gap-2">
            {[5, 10, 15, 20, 30].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`py-2 rounded-lg font-medium transition-all ${
                  duration === mins
                    ? 'bg-srf-blue text-white'
                    : 'bg-srf-lotus/20 text-srf-blue hover:bg-srf-lotus/40'
                }`}
              >
                {mins}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-2 px-8 py-4 bg-srf-blue text-white rounded-full font-medium hover:bg-srf-blue-700 transition-colors"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {timeLeft === duration * 60 ? 'Start' : 'Resume'}
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-4 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 p-4 bg-srf-gold/10 border-2 border-srf-gold rounded-lg text-center"
          >
            <Bell className="w-8 h-8 text-gold-accent mx-auto mb-2" />
            <p className="font-heading text-lg text-srf-blue">Meditation Complete</p>
            <p className="text-sm text-gray-600 mt-1">May peace be with you</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote */}
      <div className="mt-6 p-4 bg-srf-blue/5 rounded-lg">
        <p className="text-sm text-gray-600 italic text-center">
          "Calmness is the ideal state in which we should receive all life's experiences."
        </p>
        <p className="text-xs text-gray-500 text-center mt-2">— Paramahansa Yogananda</p>
      </div>
    </Modal>
  );
}

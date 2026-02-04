import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface CelebrationOptions {
  points?: number;
  badge?: { name: string; icon: string };
  streak?: number;
  type: 'points' | 'badge' | 'streak' | 'milestone';
}

// Celebration toast with optional confetti
export const celebrate = (options: CelebrationOptions) => {
  const { type, points, badge, streak } = options;

  // Fire confetti for significant achievements
  if (type === 'badge' || type === 'milestone' || (streak && streak % 7 === 0)) {
    fireConfetti();
  }

  // Show toast based on type
  switch (type) {
    case 'points':
      if (points && points > 0) {
        toast.success(
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <div>
              <p className="font-semibold">+{points} points!</p>
              <p className="text-xs text-muted-foreground">Keep contributing to earn more</p>
            </div>
          </div>,
          { duration: 3000 }
        );
      }
      break;

    case 'badge':
      if (badge) {
        toast.success(
          <div className="flex items-center gap-3">
            <span className="text-2xl">{badge.icon}</span>
            <div>
              <p className="font-semibold">Badge Earned!</p>
              <p className="text-sm">{badge.name}</p>
            </div>
          </div>,
          { duration: 5000 }
        );
      }
      break;

    case 'streak':
      if (streak) {
        const message = streak === 7 
          ? "Week Warrior! 🎉"
          : streak === 30
          ? "Monthly Champion! 🏆"
          : `${streak} day streak! 🔥`;
        
        toast.success(
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <div>
              <p className="font-semibold">{message}</p>
              {streak >= 7 && <p className="text-xs text-muted-foreground">+25 bonus points!</p>}
            </div>
          </div>,
          { duration: 4000 }
        );
      }
      break;

    case 'milestone':
      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-lg">🎉</span>
          <div>
            <p className="font-semibold">Milestone Reached!</p>
            <p className="text-xs text-muted-foreground">{points} total points</p>
          </div>
        </div>,
        { duration: 5000 }
      );
      break;
  }
};

// Fire confetti animation
const fireConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

// First contribution celebration
export const celebrateFirstContribution = () => {
  fireConfetti();
  toast.success(
    <div className="flex items-center gap-3">
      <span className="text-2xl">🎊</span>
      <div>
        <p className="font-semibold">Welcome to the community!</p>
        <p className="text-sm">+50 bonus points for your first contribution</p>
      </div>
    </div>,
    { duration: 6000 }
  );
};

export default celebrate;

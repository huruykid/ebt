import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface OnboardingTask {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  points: number;
}

const ONBOARDING_STORAGE_KEY = 'ebt-finder-onboarding';

const DEFAULT_TASKS: Omit<OnboardingTask, 'completed'>[] = [
  {
    id: 'account',
    label: 'Create an account',
    description: 'Sign up to unlock all features',
    points: 0,
  },
  {
    id: 'favorite',
    label: 'Save your first store',
    description: 'Tap the heart on any store to save it',
    points: 5,
  },
  {
    id: 'review',
    label: 'Leave a review',
    description: 'Share your experience at a store you\'ve visited',
    points: 15,
  },
  {
    id: 'price',
    label: 'Report a price',
    description: 'Help others by sharing product prices',
    points: 5,
  },
  {
    id: 'follow',
    label: 'Follow a store',
    description: 'Get updates when stores add new info',
    points: 5,
  },
];

export const useOnboardingProgress = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const loadProgress = () => {
      try {
        const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setIsDismissed(data.dismissed || false);
          
          // Merge stored progress with default tasks
          const completedIds = new Set(data.completed || []);
          const loadedTasks = DEFAULT_TASKS.map(task => ({
            ...task,
            completed: task.id === 'account' ? !!user : completedIds.has(task.id),
          }));
          setTasks(loadedTasks);
        } else {
          // Initialize with defaults
          const initialTasks = DEFAULT_TASKS.map(task => ({
            ...task,
            completed: task.id === 'account' ? !!user : false,
          }));
          setTasks(initialTasks);
        }
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
        const initialTasks = DEFAULT_TASKS.map(task => ({
          ...task,
          completed: task.id === 'account' ? !!user : false,
        }));
        setTasks(initialTasks);
      }
      setIsLoaded(true);
    };

    loadProgress();
  }, [user]);

  // Update account task when user logs in
  useEffect(() => {
    if (user && isLoaded) {
      setTasks(prev => prev.map(task => 
        task.id === 'account' ? { ...task, completed: true } : task
      ));
    }
  }, [user, isLoaded]);

  // Save progress to localStorage
  const saveProgress = useCallback((newTasks: OnboardingTask[], dismissed: boolean) => {
    try {
      const completed = newTasks.filter(t => t.completed).map(t => t.id);
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({
        completed,
        dismissed,
      }));
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  }, []);

  // Mark a task as complete
  const completeTask = useCallback((taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      );
      saveProgress(updated, isDismissed);
      return updated;
    });
  }, [isDismissed, saveProgress]);

  // Dismiss the checklist
  const dismissChecklist = useCallback(() => {
    setIsDismissed(true);
    saveProgress(tasks, true);
  }, [tasks, saveProgress]);

  // Calculate progress
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = completedCount === totalCount;

  // Don't show if dismissed, complete, or user not logged in
  const shouldShow = isLoaded && user && !isDismissed && !isComplete;

  return {
    tasks,
    completedCount,
    totalCount,
    progressPercentage,
    isComplete,
    isDismissed,
    shouldShow,
    completeTask,
    dismissChecklist,
  };
};

import React from 'react';
import { CheckCircle2, Circle, X, Sparkles, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useOnboardingProgress, type OnboardingTask } from '@/hooks/useOnboardingProgress';

interface TaskItemProps {
  task: OnboardingTask;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  return (
    <div className={`flex items-start gap-3 py-2 ${task.completed ? 'opacity-60' : ''}`}>
      {task.completed ? (
        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.label}
          </span>
          {task.points > 0 && !task.completed && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              +{task.points} pts
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {task.description}
        </p>
      </div>
    </div>
  );
};

interface GettingStartedChecklistProps {
  className?: string;
}

export const GettingStartedChecklist: React.FC<GettingStartedChecklistProps> = ({ className = '' }) => {
  const { 
    tasks, 
    completedCount, 
    totalCount, 
    progressPercentage, 
    shouldShow, 
    dismissChecklist 
  } = useOnboardingProgress();

  if (!shouldShow) {
    return null;
  }

  const remainingPoints = tasks
    .filter(t => !t.completed)
    .reduce((sum, t) => sum + t.points, 0);

  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 to-transparent ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Getting Started</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={dismissChecklist}
            aria-label="Dismiss checklist"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Complete these tasks to get the most out of EBT Finder
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              {completedCount} of {totalCount} complete
            </span>
            <span className="font-medium text-primary">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Points incentive */}
        {remainingPoints > 0 && (
          <div className="flex items-center gap-2 mb-3 p-2 rounded-md bg-success/10 border border-success/20">
            <Gift className="h-4 w-4 text-success" />
            <span className="text-xs text-success font-medium">
              Earn up to {remainingPoints} points by completing tasks!
            </span>
          </div>
        )}

        {/* Tasks list */}
        <div className="space-y-1 divide-y divide-border/50">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

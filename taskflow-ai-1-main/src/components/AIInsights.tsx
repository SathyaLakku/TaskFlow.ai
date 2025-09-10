import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { generateProductivityInsights, suggestNextActions } from '@/services/aiService';

interface AIInsightsProps {
  tasks: Task[];
}

export function AIInsights({ tasks }: AIInsightsProps) {
  const [insights, setInsights] = useState<string>('');
  const [nextActions, setNextActions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tasks.length > 0) {
      generateInsights();
    }
  }, [tasks]);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const [insightsResult, actionsResult] = await Promise.all([
        generateProductivityInsights(tasks),
        suggestNextActions(tasks)
      ]);
      
      setInsights(insightsResult);
      setNextActions(actionsResult);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights('Keep up the great work! Focus on completing your tasks one by one.');
      setNextActions(['Review your task priorities', 'Complete one task at a time', 'Take breaks when needed']);
    } finally {
      setIsLoading(false);
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  const completionRate = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
  const overdueTasks = tasks.filter(t => !t.completed && t.deadline && t.deadline < new Date());
  
  // Tasks by priority
  const lowPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'low');
  const mediumPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'medium');
  const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'high');
  
  // Tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tasksDueToday = tasks.filter(t => 
    !t.completed && 
    t.deadline && 
    t.deadline >= today && 
    t.deadline < tomorrow
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Productivity Stats */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="text-xs text-muted-foreground mb-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="w-4 h-4 text-primary" />
            Productivity Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {completionRate}%
              </Badge>
            </div>
            {tasksDueToday.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Due Today</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {tasksDueToday.length}
                </Badge>
              </div>
            )}
            {overdueTasks.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Overdue Tasks</span>
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                  {overdueTasks.length}
                </Badge>
              </div>
            )}
            {highPriorityTasks.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">High Priority</span>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                  {highPriorityTasks.length}
                </Badge>
              </div>
            )}
            {mediumPriorityTasks.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Medium Priority</span>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                  {mediumPriorityTasks.length}
                </Badge>
              </div>
            )}
            {lowPriorityTasks.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Low Priority</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                  {lowPriorityTasks.length}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Brain className="w-4 h-4 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing your productivity...</span>
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">{insights}</p>
          )}
        </CardContent>
      </Card>

      {/* Next Actions */}
      <Card className="bg-card border-border md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Target className="w-4 h-4 text-primary" />
            Suggested Next Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Getting suggestions...</span>
            </div>
          ) : (
            <ul className="space-y-1">
              {nextActions.map((action, index) => (
                <li key={index} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
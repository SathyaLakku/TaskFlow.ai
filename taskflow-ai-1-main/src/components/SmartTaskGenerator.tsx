import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { generateSmartTasks, getApiKey } from '@/services/aiService';
import { generateOfflineTasks } from '@/services/offlineTaskService';
import { toast } from 'sonner';

interface SmartTaskGeneratorProps {
  existingTasks: Task[];
  onTasksGenerated: (tasks: Task[]) => void;
}

export function SmartTaskGenerator({ existingTasks, onTasksGenerated }: SmartTaskGeneratorProps) {
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!goal.trim()) return;

    setIsGenerating(true);
    try {
      let tasks;
      if (getApiKey()) {
        // Try AI generation first
        try {
          tasks = await generateSmartTasks(goal.trim(), existingTasks);
        } catch (error) {
          console.error('AI generation failed, falling back to offline mode:', error);
          tasks = generateOfflineTasks(goal.trim(), existingTasks);
          toast.success(`Generated ${tasks.length} tasks using offline mode!`);
        }
      } else {
        // Use offline generation when no API key
        tasks = generateOfflineTasks(goal.trim(), existingTasks);
        toast.success(`Generated ${tasks.length} tasks using offline mode!`);
      }
      
      setGeneratedTasks(tasks);
      setShowPreview(true);
      if (getApiKey()) {
        toast.success(`Generated ${tasks.length} smart tasks!`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate tasks');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTasks = () => {
    onTasksGenerated(generatedTasks);
    setGeneratedTasks([]);
    setShowPreview(false);
    setGoal('');
    toast.success('Smart tasks added successfully!');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-secondary';
    }
  };

  if (showPreview) {
    return (
      <Card className="w-full bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generated Smart Tasks
          </CardTitle>
          <CardDescription>
            Review and add these AI-generated tasks to your list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            {generatedTasks.map((task) => (
              <div key={task.id} className="p-3 bg-secondary rounded-lg border border-border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground">{task.title}</h4>
                  <Badge variant="outline" className={getPriorityColor(task.priority!)}>
                    {task.priority}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{task.category}</span>
                  {task.deadline && (
                    <>
                      <span>•</span>
                      <span>Due: {task.deadline.toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleAddTasks}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              Add All Tasks
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPreview(false);
                setGeneratedTasks([]);
              }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Smart Task Generator
        </CardTitle>
        <CardDescription>
          Tell me your goal and I'll generate actionable tasks to help you achieve it
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal">What do you want to accomplish?</Label>
            <Input
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Launch my personal website, Learn Spanish, Get fit..."
              className="bg-secondary border-border"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating && goal.trim()) {
                  handleGenerate();
                }
              }}
            />
          </div>
          <Button 
            onClick={handleGenerate}
            disabled={!goal.trim() || isGenerating}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Smart Tasks...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Smart Tasks
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
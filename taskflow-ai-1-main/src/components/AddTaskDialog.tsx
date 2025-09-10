import { useState } from 'react';
import { Plus, Sparkles, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Task, TaskCategory, TASK_CATEGORIES } from '@/types/task';
import { categorizeTasks, getApiKey } from '@/services/aiService';
import { toast } from 'sonner';

interface AddTaskDialogProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddTaskDialog({ onAddTask }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deadline, setDeadline] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const hasAIKey = Boolean(getApiKey());

  const handleAIAnalysis = async () => {
    if (!title.trim() || !hasAIKey || !useAI) return;

    setIsAnalyzing(true);
    try {
      const result = await categorizeTasks(title.trim(), description.trim() || undefined);
      setCategory(result.category);
      setPriority(result.priority);
      
      if (result.deadline) {
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + result.deadline);
        setDeadline(deadlineDate.toISOString().split('T')[0]);
      }
      
      toast.success('Task analyzed with AI!');
    } catch (error) {
      toast.error('AI analysis failed. Using default values.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      category,
      priority,
      deadline: deadline ? new Date(deadline) : undefined,
    });

    setTitle('');
    setDescription('');
    setCategory('personal');
    setPriority('medium');
    setDeadline('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elegant">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI Toggle */}
          {hasAIKey && (
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Auto-Analysis</span>
              </div>
              <Switch checked={useAI} onCheckedChange={setUseAI} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (hasAIKey && useAI && e.target.value.trim()) {
                  const debounce = setTimeout(handleAIAnalysis, 1000);
                  return () => clearTimeout(debounce);
                }
              }}
              placeholder="Enter task title..."
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="bg-secondary border-border resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value: TaskCategory) => setCategory(value)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                      Low
                    </Badge>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                      Medium
                    </Badge>
                  </SelectItem>
                  <SelectItem value="high">
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                      High
                    </Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Deadline (optional)
            </Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-secondary border-border"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {isAnalyzing && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse text-primary" />
              AI is analyzing your task...
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={!title.trim()}
            >
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
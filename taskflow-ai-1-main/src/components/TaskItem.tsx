import { useState } from 'react';
import { Check, Edit2, Trash2, X, Calendar, Flag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, TaskCategory, TASK_CATEGORIES } from '@/types/task';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskItem({ task, onUpdateTask, onDeleteTask }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editCategory, setEditCategory] = useState<TaskCategory>(task.category);
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>(task.priority || 'medium');
  const [editDeadline, setEditDeadline] = useState(
    task.deadline ? task.deadline.toISOString().split('T')[0] : ''
  );

  const category = TASK_CATEGORIES.find(cat => cat.value === task.category);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const isOverdue = task.deadline && task.deadline < new Date() && !task.completed;
  const isDueSoon = task.deadline && !task.completed && task.deadline > new Date() && 
    task.deadline.getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

  const handleSave = () => {
    if (!editTitle.trim()) return;
    
    onUpdateTask(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      category: editCategory,
      priority: editPriority,
      deadline: editDeadline ? new Date(editDeadline) : undefined,
      updatedAt: new Date(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditCategory(task.category);
    setEditPriority(task.priority || 'medium');
    setEditDeadline(task.deadline ? task.deadline.toISOString().split('T')[0] : '');
    setIsEditing(false);
  };

  const toggleComplete = () => {
    onUpdateTask(task.id, {
      completed: !task.completed,
      updatedAt: new Date(),
    });
  };

  return (
    <Card className={cn(
      "group hover:shadow-soft transition-all duration-200 border-border",
      task.completed && "opacity-60",
      isOverdue && !task.completed && "border-red-500/30 bg-red-500/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={toggleComplete}
            className={cn(
              "flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 mt-0.5",
              "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
              task.completed
                ? "bg-gradient-primary border-primary"
                : "border-muted-foreground hover:border-primary"
            )}
          >
            {task.completed && <Check className="w-3 h-3 text-primary-foreground mx-auto" />}
          </button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-xs">Title</Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="Task title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-xs">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="bg-secondary border-border resize-none"
                    placeholder="Description (optional)..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category" className="text-xs">Category</Label>
                    <Select value={editCategory} onValueChange={(value: TaskCategory) => setEditCategory(value)}>
                      <SelectTrigger className="bg-secondary border-border h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority" className="text-xs">Priority</Label>
                    <Select value={editPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setEditPriority(value)}>
                      <SelectTrigger className="bg-secondary border-border h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <span className="text-green-400">Low</span>
                        </SelectItem>
                        <SelectItem value="medium">
                          <span className="text-yellow-400">Medium</span>
                        </SelectItem>
                        <SelectItem value="high">
                          <span className="text-red-400">High</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-deadline" className="text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Deadline
                  </Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="bg-secondary border-border h-8"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSave} className="h-8">
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="h-8">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn(
                        "font-medium text-foreground transition-colors",
                        task.completed && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </h3>
                      <div className={cn("w-2 h-2 rounded-full", category?.color)} />
                    </div>
                    {task.description && (
                      <p className={cn(
                        "text-sm text-muted-foreground",
                        task.completed && "line-through"
                      )}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Badges */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {task.aiGenerated && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs h-5">
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        AI
                      </Badge>
                    )}
                    {task.priority && (
                      <Badge variant="outline" className={`text-xs h-5 ${getPriorityColor(task.priority)}`}>
                        <Flag className="w-2.5 h-2.5 mr-1" />
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">
                      {category?.label}
                    </span>
                    
                    {task.deadline && (
                      <div className={cn(
                        "flex items-center gap-1",
                        isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-muted-foreground'
                      )}>
                        <Calendar className="w-3 h-3" />
                        <span>
                          {isOverdue ? 'Overdue' : isDueSoon ? 'Due today' : 'Due'} {task.deadline.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="h-8 w-8 p-0 hover:bg-secondary"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteTask(task.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
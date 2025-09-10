import { useState, useMemo } from 'react';
import { CheckSquare, Filter, Search, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { TaskItem } from '@/components/TaskItem';
import { AIKeyInput } from '@/components/AIKeyInput';
import { SmartTaskGenerator } from '@/components/SmartTaskGenerator';
import { AIInsights } from '@/components/AIInsights';
import { Task, TaskCategory, TASK_CATEGORIES } from '@/types/task';
import { getApiKey } from '@/services/aiService';
import { toast } from 'sonner';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Design new landing page',
      description: 'Create a modern, responsive design for the company website',
      completed: false,
      category: 'work',
      priority: 'high',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      title: 'Buy groceries',
      description: 'Milk, bread, eggs, and vegetables for the week',
      completed: true,
      category: 'shopping',
      priority: 'medium',
      createdAt: new Date('2024-01-09'),
      updatedAt: new Date('2024-01-09'),
    },
    {
      id: '3',
      title: 'Learn React hooks',
      description: 'Complete the advanced React course section on hooks',
      completed: false,
      category: 'learning',
      priority: 'medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 1 week
      aiGenerated: true,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-08'),
    },
    {
      id: '4',
      title: 'Morning workout routine',
      description: 'Complete 30-minute cardio and strength training session',
      completed: false,
      category: 'health',
      priority: 'high',
      deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue by 1 day
      createdAt: new Date('2024-01-07'),
      updatedAt: new Date('2024-01-07'),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [showAISetup, setShowAISetup] = useState(!getApiKey());
  const [showSmartGenerator, setShowSmartGenerator] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || 
                             (filterStatus === 'active' && !task.completed) ||
                             (filterStatus === 'completed' && task.completed);
        
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        // Sort incomplete tasks first, then completed tasks
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        // Within each group, sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, searchQuery, filterCategory, filterStatus]);

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prev => [task, ...prev]);
  };

  const addMultipleTasks = (newTasks: Task[]) => {
    setTasks(prev => [...newTasks, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const hasAIKey = Boolean(getApiKey());

  // Show AI setup if no key is set
  if (showAISetup && !hasAIKey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AIKeyInput onKeySet={() => setShowAISetup(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-2xl shadow-elegant">
              <CheckSquare className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Stay organized and productive with your personal task manager
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{totalCount} total tasks</span>
            <span>•</span>
            <span>{completedCount} completed</span>
            <span>•</span>
            <span>{totalCount - completedCount} remaining</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterCategory} onValueChange={(value: TaskCategory | 'all') => setFilterCategory(value)}>
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TASK_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'completed') => setFilterStatus(value)}>
              <SelectTrigger className="w-[120px] bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {hasAIKey && (
              <Button
                variant="outline"
                onClick={() => setShowSmartGenerator(!showSmartGenerator)}
                className="border-primary/20 text-primary hover:bg-primary/10"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            )}
            <AddTaskDialog onAddTask={addTask} />
          </div>
        </div>

        {/* Smart Task Generator */}
        {hasAIKey && showSmartGenerator && (
          <div className="mb-6">
            <SmartTaskGenerator 
              existingTasks={tasks} 
              onTasksGenerated={(newTasks) => {
                addMultipleTasks(newTasks);
                setShowSmartGenerator(false);
              }} 
            />
          </div>
        )}

        {/* AI Insights */}
        {hasAIKey && (
          <div className="mb-8">
            <AIInsights tasks={tasks} />
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters to see more tasks.'
                  : 'Get started by adding your first task!'}
              </p>
              {!searchQuery && filterCategory === 'all' && filterStatus === 'all' && (
                <AddTaskDialog onAddTask={addTask} />
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: TaskCategory;
  priority?: 'low' | 'medium' | 'high';
  deadline?: Date;
  aiGenerated?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskCategory = 'work' | 'personal' | 'shopping' | 'health' | 'learning';

export const TASK_CATEGORIES: { value: TaskCategory; label: string; color: string }[] = [
  { value: 'work', label: 'Work', color: 'bg-gradient-primary' },
  { value: 'personal', label: 'Personal', color: 'bg-gradient-accent' },
  { value: 'shopping', label: 'Shopping', color: 'bg-warning' },
  { value: 'health', label: 'Health', color: 'bg-success' },
  { value: 'learning', label: 'Learning', color: 'bg-info' },
];
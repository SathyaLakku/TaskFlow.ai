import { Task, TaskCategory } from '@/types/task';

const taskTemplates = {
  work: [
    { title: 'Review emails', description: 'Check and respond to important emails', priority: 'medium' as const },
    { title: 'Prepare presentation', description: 'Create slides for upcoming meeting', priority: 'high' as const },
    { title: 'Team standup meeting', description: 'Daily team sync meeting', priority: 'medium' as const },
    { title: 'Update project documentation', description: 'Document recent changes and progress', priority: 'low' as const },
    { title: 'Code review', description: 'Review team member\'s pull request', priority: 'medium' as const },
  ],
  personal: [
    { title: 'Plan weekend activities', description: 'Decide on activities for the weekend', priority: 'low' as const },
    { title: 'Call family', description: 'Catch up with family members', priority: 'medium' as const },
    { title: 'Organize home office', description: 'Clean and organize workspace', priority: 'low' as const },
    { title: 'Pay bills', description: 'Review and pay monthly bills', priority: 'high' as const },
    { title: 'Book appointment', description: 'Schedule necessary appointments', priority: 'medium' as const },
  ],
  shopping: [
    { title: 'Buy groceries', description: 'Weekly grocery shopping', priority: 'medium' as const },
    { title: 'Replace household items', description: 'Buy necessary household supplies', priority: 'low' as const },
    { title: 'Get gift for occasion', description: 'Find and purchase appropriate gift', priority: 'medium' as const },
    { title: 'Pharmacy pickup', description: 'Collect prescriptions from pharmacy', priority: 'high' as const },
  ],
  health: [
    { title: 'Schedule workout', description: 'Plan and complete exercise routine', priority: 'medium' as const },
    { title: 'Drink more water', description: 'Stay hydrated throughout the day', priority: 'low' as const },
    { title: 'Take vitamins', description: 'Remember daily vitamin supplements', priority: 'low' as const },
    { title: 'Prepare healthy meal', description: 'Cook nutritious meal at home', priority: 'medium' as const },
    { title: 'Get enough sleep', description: 'Maintain healthy sleep schedule', priority: 'high' as const },
  ],
  learning: [
    { title: 'Read article/book', description: 'Continue reading current book or article', priority: 'low' as const },
    { title: 'Practice new skill', description: 'Spend time practicing recently learned skill', priority: 'medium' as const },
    { title: 'Take online course', description: 'Complete next lesson in online course', priority: 'medium' as const },
    { title: 'Research topic', description: 'Learn about interesting new topic', priority: 'low' as const },
    { title: 'Practice language', description: 'Study foreign language for 30 minutes', priority: 'medium' as const },
  ],
};

const getRandomDeadlineDays = (): number => {
  const options = [1, 2, 3, 7, 14];
  return options[Math.floor(Math.random() * options.length)];
};

export const generateOfflineTasks = (goal: string, existingTasks: Task[]): Task[] => {
  const goalLower = goal.toLowerCase();
  const existingTitles = existingTasks.map(t => t.title.toLowerCase());
  
  // Determine relevant categories based on goal keywords
  let relevantCategories: TaskCategory[] = [];
  
  if (goalLower.includes('work') || goalLower.includes('job') || goalLower.includes('office') || goalLower.includes('meeting')) {
    relevantCategories.push('work');
  }
  if (goalLower.includes('health') || goalLower.includes('fitness') || goalLower.includes('exercise') || goalLower.includes('workout')) {
    relevantCategories.push('health');
  }
  if (goalLower.includes('learn') || goalLower.includes('study') || goalLower.includes('course') || goalLower.includes('skill')) {
    relevantCategories.push('learning');
  }
  if (goalLower.includes('buy') || goalLower.includes('shop') || goalLower.includes('purchase') || goalLower.includes('groceries')) {
    relevantCategories.push('shopping');
  }
  if (goalLower.includes('personal') || goalLower.includes('family') || goalLower.includes('home') || relevantCategories.length === 0) {
    relevantCategories.push('personal');
  }
  
  // If no specific categories found, include all
  if (relevantCategories.length === 0) {
    relevantCategories = ['work', 'personal', 'shopping', 'health', 'learning'];
  }
  
  const generatedTasks: Task[] = [];
  
  // Generate 3-5 tasks from relevant categories
  const taskCount = Math.floor(Math.random() * 3) + 3; // 3-5 tasks
  
  for (let i = 0; i < taskCount; i++) {
    const category = relevantCategories[Math.floor(Math.random() * relevantCategories.length)];
    const templates = taskTemplates[category];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Skip if similar task already exists
    if (existingTitles.some(title => title.includes(template.title.toLowerCase()) || template.title.toLowerCase().includes(title))) {
      continue;
    }
    
    const task: Task = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: template.title,
      description: template.description,
      completed: false,
      category,
      priority: template.priority,
      deadline: new Date(Date.now() + getRandomDeadlineDays() * 24 * 60 * 60 * 1000),
      aiGenerated: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    generatedTasks.push(task);
  }
  
  return generatedTasks;
};
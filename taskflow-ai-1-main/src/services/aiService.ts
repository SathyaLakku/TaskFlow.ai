import { Task, TaskCategory } from '@/types/task';

let apiKey: string = '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';

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const getApiKey = () => apiKey;

const makeGroqRequest = async (messages: any[], temperature: number = 0.7) => {
  if (!apiKey) {
    throw new Error('Groq API key not set');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages,
      temperature,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const generateSmartTasks = async (goal: string, existingTasks: Task[]): Promise<Task[]> => {
  const taskTitles = existingTasks.map(t => t.title).join(', ');
  
  const messages = [
    {
      role: 'system',
      content: `You are a productivity assistant. Generate 3-5 actionable tasks to help achieve the given goal. Consider existing tasks to avoid duplicates. Return ONLY a JSON array with objects containing: title, description, category (one of: work, personal, shopping, health, learning), priority (low, medium, high), and estimated deadline in days from now.`
    },
    {
      role: 'user',
      content: `Goal: "${goal}". Existing tasks: ${taskTitles || 'None'}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, 0.8);
    // Remove markdown code blocks if present
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const tasks = JSON.parse(cleanedResponse);
    
    return tasks.map((task: any) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: task.title,
      description: task.description,
      completed: false,
      category: task.category as TaskCategory,
      priority: task.priority,
      deadline: task.deadline ? new Date(Date.now() + task.deadline * 24 * 60 * 60 * 1000) : undefined,
      aiGenerated: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  } catch (error) {
    console.error('Error generating smart tasks:', error);
    throw new Error('Failed to generate smart tasks. Please check your API key and try again.');
  }
};

export const categorizeTasks = async (title: string, description?: string): Promise<{ category: TaskCategory; priority: 'low' | 'medium' | 'high'; deadline: number | null }> => {
  const messages = [
    {
      role: 'system',
      content: `Analyze the task and return JSON with: category (work, personal, shopping, health, learning), priority (low, medium, high), and deadline (days from now, or null if no clear deadline). Be concise and accurate.`
    },
    {
      role: 'user',
      content: `Task: "${title}"${description ? ` - ${description}` : ''}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, 0.3);
    // Remove markdown code blocks if present
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error categorizing task:', error);
    return { category: 'personal', priority: 'medium', deadline: null };
  }
};

export const generateProductivityInsights = async (tasks: Task[]): Promise<string> => {
  const completedTasks = tasks.filter(t => t.completed);
  const activeTasks = tasks.filter(t => !t.completed);
  const overdueTasks = activeTasks.filter(t => t.deadline && t.deadline < new Date());
  
  const stats = {
    total: tasks.length,
    completed: completedTasks.length,
    active: activeTasks.length,
    overdue: overdueTasks.length,
    categories: tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    priorities: tasks.reduce((acc, task) => {
      if (task.priority) acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const messages = [
    {
      role: 'system',
      content: `You are a productivity coach. Analyze the task statistics and provide 2-3 concise, actionable insights to improve productivity. Be encouraging and specific.`
    },
    {
      role: 'user',
      content: `Task Statistics: ${JSON.stringify(stats)}`
    }
  ];

  try {
    return await makeGroqRequest(messages, 0.6);
  } catch (error) {
    console.error('Error generating insights:', error);
    return 'Focus on completing your high-priority tasks and maintaining steady progress on your goals.';
  }
};

export const suggestNextActions = async (tasks: Task[]): Promise<string[]> => {
  const activeTasks = tasks.filter(t => !t.completed);
  const highPriorityTasks = activeTasks.filter(t => t.priority === 'high');
  const overdueTasks = activeTasks.filter(t => t.deadline && t.deadline < new Date());

  const messages = [
    {
      role: 'system',
      content: `Based on the active tasks, suggest 2-3 specific next actions. Prioritize overdue and high-priority tasks. Return as a JSON array of strings.`
    },
    {
      role: 'user',
      content: `Active tasks: ${JSON.stringify(activeTasks.map(t => ({ title: t.title, priority: t.priority, deadline: t.deadline, overdue: t.deadline ? t.deadline < new Date() : false })))}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, 0.4);
    // Remove markdown code blocks if present
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error suggesting next actions:', error);
    return ['Review your high-priority tasks', 'Complete overdue items first', 'Plan your day ahead'];
  }
};
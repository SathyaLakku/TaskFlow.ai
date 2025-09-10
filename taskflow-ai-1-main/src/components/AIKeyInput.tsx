import { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { setApiKey, getApiKey } from '@/services/aiService';

interface AIKeyInputProps {
  onKeySet: () => void;
}

export function AIKeyInput({ onKeySet }: AIKeyInputProps) {
  const [key, setKey] = useState(getApiKey());
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      setApiKey(key.trim());
      onKeySet();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card border-border">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Key className="w-5 h-5" />
          AI Features Setup
        </CardTitle>
        <CardDescription>
          Enter your Groq API key to unlock smart task management features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Groq API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="gsk_..."
                className="bg-secondary border-border pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            disabled={!key.trim()}
          >
            Enable AI Features
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Your API key is stored locally and never sent to our servers
        </p>
      </CardContent>
    </Card>
  );
}
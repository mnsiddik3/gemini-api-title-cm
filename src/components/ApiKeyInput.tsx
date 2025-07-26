import { useState } from 'react';
import { Eye, EyeOff, Key, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const ApiKeyInput = ({ apiKey, onApiKeyChange }: ApiKeyInputProps) => {
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      toast({
        title: "API Key Saved",
        description: "Your Google Gemini API key has been saved successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid API key before saving.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-gradient-subtle border-brand-primary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-primary" />
          <Label className="text-sm font-medium">Google Gemini API Key</Label>
        </div>
        
        <div className="relative">
          <Input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Enter your Google Gemini API Key..."
            className="pr-10 border-brand-primary/30 focus:border-brand-primary"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        
        <div className="bg-brand-primary/10 rounded-lg p-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs text-muted-foreground flex-1">
              💡 <strong>Tips:</strong> Keep your API key secure. It will only be stored in your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="brand"
                size="sm"
                onClick={handleSaveKey}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-1" />
                Save API Key
              </Button>
              <Button
                variant="brandOutline"
                size="sm"
                onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
                className="w-full sm:w-auto"
              >
                Generate API Key
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
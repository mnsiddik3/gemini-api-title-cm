import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Copy, Star, Check, Plus, X, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageWithMetadataProps {
  image: File;
  title: string;
  alternativeTitles?: string[];
  description: string;
  keywords: string[];
  category: string;
  index: number;
  onRegenerate?: () => void;
  processing?: boolean;
  progress?: number;
  totalImages?: number;
}

export const ImageWithMetadata = ({ image, title, alternativeTitles, description, keywords, category, index, onRegenerate, processing = false, progress = 0, totalImages = 1 }: ImageWithMetadataProps) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [topKeywords, setTopKeywords] = useState<string[]>(() => keywords.slice(0, 45));
  const [customKeywordInput, setCustomKeywordInput] = useState('');
  const [editingKeywordIndex, setEditingKeywordIndex] = useState<number | null>(null);
  const [editKeywordValue, setEditKeywordValue] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const { toast } = useToast();

  // Create image URL when component mounts
  React.useEffect(() => {
    try {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn('Failed to revoke object URL:', error);
        }
      };
    } catch (error) {
      console.error('Failed to create object URL:', error);
      setImageUrl('');
    }
  }, [image]);

  // Update top keywords when keywords change
  React.useEffect(() => {
    setTopKeywords(keywords.slice(0, 45));
  }, [keywords]);

  const remainingKeywords = keywords.slice(45);

  const addToTopKeywords = (keyword: string) => {
    if (!topKeywords.includes(keyword)) {
      setTopKeywords([...topKeywords, keyword]);
      toast({
        title: "Added!",
        description: `"${keyword}" added to Top Keywords.`,
      });
    }
  };

  const addCustomKeywords = () => {
    if (!customKeywordInput.trim()) return;
    
    const newKeywords = customKeywordInput
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0 && !topKeywords.includes(k));
    
    if (newKeywords.length > 0) {
      setTopKeywords(prev => [...prev, ...newKeywords]);
      setCustomKeywordInput('');
      toast({
        title: "Keywords Added!",
        description: `${newKeywords.length} keyword(s) added to Top Keywords.`,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomKeywords();
    }
  };

  const deleteKeyword = (keywordIndex: number) => {
    const updatedKeywords = topKeywords.filter((_, index) => index !== keywordIndex);
    setTopKeywords(updatedKeywords);
    toast({
      title: "Deleted!",
      description: "Keyword removed from Top Keywords.",
    });
  };

  const startEditKeyword = (keywordIndex: number) => {
    setEditingKeywordIndex(keywordIndex);
    setEditKeywordValue(topKeywords[keywordIndex]);
  };

  const saveEditKeyword = () => {
    if (editingKeywordIndex !== null && editKeywordValue.trim()) {
      const keywords = editKeywordValue
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      
      const updatedKeywords = [...topKeywords];
      updatedKeywords.splice(editingKeywordIndex, 1, ...keywords);
      setTopKeywords(updatedKeywords);
      setEditingKeywordIndex(null);
      setEditKeywordValue('');
      toast({
        title: "Updated!",
        description: keywords.length > 1 ? `${keywords.length} keywords added successfully.` : "Keyword updated successfully.",
      });
    }
  };

  const cancelEditKeyword = () => {
    setEditingKeywordIndex(null);
    setEditKeywordValue('');
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditKeyword();
    } else if (e.key === 'Escape') {
      cancelEditKeyword();
    }
  };

  const copyToClipboard = (text: string, copyIndex?: string) => {
    navigator.clipboard.writeText(text);
    if (copyIndex !== undefined) {
      setCopiedIndex(copyIndex);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  // Show loading state for processing
  if (processing) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6 bg-gradient-subtle">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">Image {index + 1}: {image.name}</h3>
            <div className="flex justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`Uploaded image ${index + 1}`}
                  className="max-w-full max-h-64 sm:max-h-80 lg:max-h-96 rounded-lg shadow-lg object-contain"
                  onError={(e) => {
                    console.error('Image failed to load:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Image failed to load</p>
                </div>
              )}
            </div>
            <div className="text-center py-3 sm:py-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm sm:text-base text-brand-primary font-medium">Processing metadata...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Image Display */}
      <Card className="p-4 sm:p-6 bg-gradient-subtle">
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">Image {index + 1}: {image.name}</h3>
          <div className="flex justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`Uploaded image ${index + 1}`}
                className="max-w-full max-h-64 sm:max-h-80 lg:max-h-96 rounded-lg shadow-lg object-contain"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Image failed to load</p>
              </div>
              )}
            </div>
            
            {/* Category Display */}
            {category && (
              <div className="text-center mt-3 sm:mt-4">
                <Badge 
                  variant="outline" 
                  className="text-brand-primary border-brand-primary/50 bg-brand-primary/5 px-3 py-1 text-sm font-medium"
                >
                  {category}
                </Badge>
              </div>
            )}
            
            {/* Regenerate Button */}
            {onRegenerate && (
              <div className="flex justify-center mt-3 sm:mt-4">
                <Button
                  variant="brandOutline"
                  onClick={onRegenerate}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Copy className="w-4 h-4" />
                  Regenerate Metadata
                </Button>
              </div>
            )}
        </div>
      </Card>

      {/* Title & Description */}
      <Card className="p-4 sm:p-6 bg-gradient-subtle">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Primary Adobe Stock Title</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <p className="text-sm sm:text-base text-muted-foreground flex-1 font-medium">{title}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(title)}
                className="h-8 w-8 shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Alternative Titles */}
          {alternativeTitles && alternativeTitles.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Alternative Title Variations</h3>
              <div className="space-y-2">
                {alternativeTitles.map((altTitle, altIndex) => (
                  <div key={altIndex} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-sm text-brand-primary font-medium">#{altIndex + 1}</span>
                    <p className="text-sm sm:text-base text-muted-foreground flex-1 font-medium">{altTitle}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(altTitle)}
                      className="h-8 w-8 shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Description</h3>
            <div className="flex flex-col sm:flex-row items-start gap-2">
              <p className="text-sm sm:text-base text-muted-foreground flex-1">{description}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(description)}
                className="h-8 w-8 shrink-0 mt-1"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Keywords */}
      <Card className="p-4 sm:p-6 border-brand-primary/20 bg-gradient-primary/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-brand-accent" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Microstock Keywords ({keywords.length} total)</h3>
          </div>
          <Button
            variant="brand"
            size="sm"
            onClick={() => copyToClipboard(keywords.join(', '))}
            className="w-full sm:w-auto"
          >
            Copy All Keywords
          </Button>
        </div>
        
        {/* Top Keywords - Enhanced */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3">
            <h4 className="text-sm sm:text-md font-medium text-foreground flex items-center gap-2">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-brand-accent fill-current" />
              Top Keywords ({topKeywords.length})
            </h4>
            <Button
              variant="brand"
              size="sm"
              onClick={() => copyToClipboard(topKeywords.join(', '))}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Copy All Top Keywords
            </Button>
          </div>
           <div className="flex flex-wrap gap-1 sm:gap-2">
            {topKeywords.map((keyword, keywordIndex) => (
              <div key={keywordIndex} className="group relative">
                {editingKeywordIndex === keywordIndex ? (
                  <div className="flex items-center gap-1 bg-muted/20 rounded-md p-1 border border-brand-primary/30">
                    <Input
                      value={editKeywordValue}
                      onChange={(e) => setEditKeywordValue(e.target.value)}
                      onKeyPress={handleEditKeyPress}
                      className="h-6 sm:h-7 px-2 text-xs sm:text-sm w-24 sm:w-32 border-0 bg-transparent focus:ring-1 focus:ring-brand-primary"
                      autoFocus
                      placeholder="keyword1, keyword2"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                      onClick={saveEditKeyword}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 sm:h-7 sm:w-7 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={cancelEditKeyword}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-brand-primary/50 text-brand-primary transition-all duration-300 text-xs sm:text-sm py-1.5 px-3 sm:px-4 flex items-center gap-2 hover:bg-brand-primary hover:text-white hover:border-brand-primary hover:shadow-md cursor-default group-hover:pr-14 sm:group-hover:pr-16"
                  >
                    <span className="truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">{keyword}</span>
                    <div className="absolute right-1 sm:right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex gap-0.5 sm:gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-0 rounded-sm hover:scale-110 transition-all duration-200"
                        onClick={() => startEditKeyword(keywordIndex)}
                        title="Edit keyword"
                      >
                        <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 p-0 rounded-sm hover:scale-110 transition-all duration-200"
                        onClick={() => deleteKeyword(keywordIndex)}
                        title="Delete keyword"
                      >
                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  </Badge>
                )}
              </div>
            ))}
          </div>
          
          {/* Custom Keyword Input */}
          <div className="mt-4 space-y-2">
            <h5 className="text-sm font-medium text-foreground">Add Custom Keywords</h5>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Enter keywords separated by commas (e.g., nature, beautiful, landscape)"
                value={customKeywordInput}
                onChange={(e) => setCustomKeywordInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-sm"
              />
              <Button
                variant="brandOutline"
                size="sm"
                onClick={addCustomKeywords}
                disabled={!customKeywordInput.trim()}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Keywords with Add Button */}
        {remainingKeywords.length > 0 && (
          <div>
            <h4 className="text-sm sm:text-md font-medium text-foreground mb-3">Additional Keywords</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {remainingKeywords.map((keyword, keywordIndex) => (
                <div
                  key={`remaining-keyword-${keywordIndex}`}
                  className="group p-2 border rounded-lg hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span 
                      className="text-xs text-foreground truncate cursor-pointer flex-1"
                      onClick={() => copyToClipboard(keyword, `additional-${index}-${keywordIndex}`)}
                      title="Click to copy"
                    >
                      {keyword}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-brand-accent hover:text-white"
                        onClick={() => addToTopKeywords(keyword)}
                        title="Add to Top Keywords"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      {copiedIndex === `additional-${index}-${keywordIndex}` ? (
                        <Check className="w-3 h-3 text-brand-accent flex-shrink-0" />
                      ) : (
                        <Copy 
                          className="w-3 h-3 text-muted-foreground group-hover:text-brand-primary flex-shrink-0 cursor-pointer" 
                          onClick={() => copyToClipboard(keyword, `additional-${index}-${keywordIndex}`)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
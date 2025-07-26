import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ImageUpload } from '@/components/ImageUpload';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { ImageWithMetadata } from '@/components/ImageWithMetadata';
import { CsvExport } from '@/components/CsvExport';
import { useGeminiApi } from '@/hooks/useGeminiApi';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini-api-key') || '');
  const [results, setResults] = useState<{
    title: string;
    alternativeTitles?: string[];
    description: string;
    keywords: string[];
    category: string;
    image: File;
    processing?: boolean;
  }[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);

  const { generateBulkMetadata, generateMetadata, loading } = useGeminiApi();

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini-api-key', key);
  };

  const handleGenerate = async () => {
    if (!selectedImages.length || !apiKey) return;

    // Clear previous results and reset progress
    setResults([]);
    setProcessingProgress(0);
    
    for (let i = 0; i < selectedImages.length; i++) {
      const imageFile = selectedImages[i];
      
      // Add a placeholder result while processing
      setResults(prev => [
        ...prev,
        {
          title: 'Processing...',
          description: 'Generating metadata...',
          keywords: [],
          category: '',
          image: imageFile,
          processing: true
        }
      ]);

      const result = await generateMetadata(imageFile, apiKey);
      if (result) {
        // Update the result for this specific image
        setResults(prev => 
          prev.map((item, index) => 
            index === i 
              ? { ...result, image: imageFile, processing: false }
              : item
          )
        );
        // Update progress
        setProcessingProgress(((i + 1) / selectedImages.length) * 100);
      } else {
        // Remove failed processing result
        setResults(prev => prev.filter((_, index) => index !== i));
        // Update progress even for failed results
        setProcessingProgress(((i + 1) / selectedImages.length) * 100);
      }
    }
  };

  const handleSingleRegenerate = async (image: File, index: number) => {
    const result = await generateMetadata(image, apiKey);
    if (result) {
      const updatedResults = [...results];
      updatedResults[index] = { image, ...result };
      setResults(updatedResults);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 lg:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 lg:px-4 lg:py-2">
                <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm font-medium">AI-Powered Metadata Generator</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold leading-tight">
                Microstock Image
                <br />
                <span className="bg-gradient-to-r from-brand-accent to-yellow-300 bg-clip-text text-transparent">
                  Metadata Generator
                </span>
              </h1>
              
              <p className="text-base lg:text-xl text-white/90 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Generate SEO-optimized titles, descriptions and 50 keywords for your microstock photos using AI. 
                Get instant results with Google Gemini AI for maximum sales potential.
              </p>
              
              <div className="flex flex-wrap gap-3 lg:gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-white/80 text-sm lg:text-base">
                  <Zap className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Instant Generation</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm lg:text-base">
                  <ImageIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Multiple Formats</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm lg:text-base">
                  <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>50+ Keywords</span>
                </div>
              </div>
            </div>
            
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-secondary rounded-2xl lg:rounded-3xl blur-2xl lg:blur-3xl opacity-30 animate-pulse-glow"></div>
              <img
                src={heroImage}
                alt="Stock Image Metadata Generator"
                className="relative rounded-2xl lg:rounded-3xl shadow-2xl animate-float w-full max-w-md mx-auto lg:max-w-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12 space-y-6 lg:space-y-8">
        {/* API Key Input */}
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />

        {/* Image Upload */}
        <ImageUpload 
          selectedImages={selectedImages} 
          onImagesSelect={setSelectedImages} 
        />

        {/* Generate Button */}
        {selectedImages.length > 0 && apiKey && (
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button
                variant="brand"
                size="lg"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Generating Metadata...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Generate Metadata
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-brand-primary/20 text-brand-primary hover:bg-brand-primary/10"
              >
                <a 
                  href="https://ai.google.dev/gemini-api/docs/api-key" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Get API Key
                </a>
              </Button>
            </div>
            
            {/* Overall Progress Bar */}
            {(loading || processingProgress > 0) && (
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Processing Images</span>
                  <span className="text-brand-primary font-medium">{Math.round(processingProgress)}%</span>
                </div>
                <Progress value={processingProgress} className="h-3" />
                <p className="text-sm text-center text-muted-foreground">
                  {Math.floor((processingProgress / 100) * selectedImages.length)} of {selectedImages.length} images completed
                </p>
              </div>
            )}
          </div>
        )}

        {/* CSV Export Button */}
        {results.length > 0 && !results.some(r => r.processing) && (
          <div className="flex justify-center py-4 sm:py-6">
            <CsvExport results={results} />
          </div>
        )}

        {/* Results */}
        {(results.length > 0 || loading) && (
          <div className="space-y-8 sm:space-y-12">
            {results.map((result, index) => (
              <ImageWithMetadata
                key={`${result.image.name}-${result.image.size}-${index}`}
                image={result.image}
                title={result.title}
                alternativeTitles={result.alternativeTitles}
                description={result.description}
                keywords={result.keywords}
                category={result.category}
                index={index}
                onRegenerate={() => handleSingleRegenerate(result.image, index)}
                processing={result.processing}
              />
            ))}
            {loading && (
              <div className="text-center py-6 sm:py-8">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm sm:text-base text-muted-foreground">Generating metadata...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 border-t mt-12 sm:mt-20">
        <div className="container mx-auto px-4 py-6 sm:py-8 text-center">
          <p className="text-sm sm:text-base text-muted-foreground">
            Made with ❤️ using Google Gemini AI | 
            <span className="block sm:inline ml-0 sm:ml-2 text-brand-primary font-medium">Microstock Metadata Generator</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

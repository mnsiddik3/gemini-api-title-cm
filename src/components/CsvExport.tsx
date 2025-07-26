import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CsvData {
  filename: string;
  title: string;
  description: string;
  keywords: string;
  category: string;
}

interface CsvExportProps {
  results: Array<{
    image: File;
    title: string;
    description: string;
    keywords: string[];
    category: string;
  }>;
}

export const CsvExport = ({ results }: CsvExportProps) => {
  const { toast } = useToast();

  const generateCsv = () => {
    if (results.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please generate metadata for images first.",
        variant: "destructive",
      });
      return;
    }

    // Prepare CSV data
    const csvData: CsvData[] = results.map((result) => ({
      filename: result.image.name,
      title: result.title,
      description: result.description,
      keywords: result.keywords.join(', '),
      category: result.category
    }));

    // Create CSV content
    const headers = ['filename', 'title', 'description', 'keywords', 'category'];
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof CsvData];
          // Escape quotes and wrap in quotes if contains comma or quote
          const escapedValue = value.replace(/"/g, '""');
          return value.includes(',') || value.includes('"') || value.includes('\n') 
            ? `"${escapedValue}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `microstock-metadata-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Exported Successfully",
      description: `Exported metadata for ${results.length} images.`,
    });
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <Button
      onClick={generateCsv}
      variant="brand"
      className="w-full sm:w-auto"
    >
      <Download className="w-4 h-4 mr-2" />
      Export CSV for Microstock
    </Button>
  );
};
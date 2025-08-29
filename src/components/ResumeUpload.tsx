import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import GoogleDrivePicker from '@/components/GoogleDrivePicker';
import { Upload, FileJson, CheckCircle, Loader2 } from 'lucide-react';

interface ResumeUploadProps {
  onSuccess: () => void;
}

const ResumeUpload = ({ onSuccess }: ResumeUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
    toast({
      title: 'File Selected',
      description: `${file.name} is ready to be processed.`,
    });
  };

  const handleProcessResume = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a resume from Google Drive first.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    toast({ title: 'Processing Resume',
      description: 'Sending to the LLM for optimization...'
    });

    try {
      // Here you would typically send the file ID to your backend
      // which then uses the Google Drive API to fetch the file,
      // convert it to JSON, and send it to the Hugging Face LLM.
      console.log('Simulating processing for file:', selectedFile.id);

      // Mock processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // The backend would then receive the JSON output and store it.
      // For now, we'll just simulate a success.

      setIsProcessing(false);
      toast({
        title: 'Processing Complete!',
        description: 'Your new resume is ready.',
      });
      onSuccess();
    } catch (error) {
      setIsProcessing(false);
      console.error('Processing error:', error);
      toast({
        title: 'Processing Failed',
        description: 'Could not process the resume.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='min-h-screen bg-gradient-card py-12 px-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold mb-4'>Optimize Your Resume</h1>
          <p className='text-xl text-muted-foreground'>
            Connect to Google Drive and select your resume to begin the AI optimization process.
          </p>
        </div>

        <Card className='p-6'>
          <h2 className='text-2xl font-semibold mb-6 flex items-center gap-2'>
            <Upload className='h-6 w-6 text-primary' />
            Select Resume from Google Drive
          </h2>

          {selectedFile ? (
            <div className='text-center space-y-4 p-8 bg-success/5 rounded-lg'>
              <CheckCircle className='h-12 w-12 text-success mx-auto' />
              <div>
                <p className='font-semibold text-success'>File Selected!</p>
                <p className='text-sm text-muted-foreground'>{selectedFile.name}</p>
              </div>
              <Button variant='outline' size='sm' onClick={() => setSelectedFile(null)}>
                Choose a Different File
              </Button>
            </div>
          ) : (
            <div className='text-center'>
              <GoogleDrivePicker onFileSelect={handleFileSelect} />
            </div>
          )}
        </Card>

        <div className='mt-8 text-center'>
          <Button
            size='lg'
            disabled={!selectedFile || isProcessing}
            onClick={handleProcessResume}
            className='bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary px-8 py-3 text-lg font-semibold transition-smooth'
          >
            {isProcessing ? (
              <>
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                Processing...
              </>
            ) : (
              <>
                <FileJson className='mr-2 h-5 w-5' />
                Optimize Resume
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;

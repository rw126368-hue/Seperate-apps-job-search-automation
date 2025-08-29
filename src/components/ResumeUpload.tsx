import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  HardDrive,
  Cloud,
  XCircle,
  HelpCircle
} from "lucide-react";

interface ResumeUploadProps {
  onSuccess: () => void;
}

const ResumeUpload = ({ onSuccess }: ResumeUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [driveStatus, setDriveStatus] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [masterResumeId, setMasterResumeId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkDriveStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('google-drive-service', {
          body: { action: 'check_status' }
        });
        if (error) {
          // The function returned a non-2xx status code
          if (error.context && error.context.status === 400) {
            setDriveStatus(error.context.json.status);
            setDriveError(error.context.json.error);
          } else {
            throw error;
          }
        } else {
          setDriveStatus(data.status);
          setDriveError(data.error || null);
        }
      } catch (error: any) {
        console.error("Error checking Google Drive status:", error);
        setDriveStatus('AUTH_FAILED');
        setDriveError(error.message || "An unexpected error occurred.");
      }
    };
    checkDriveStatus();
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
        toast({ title: "Invalid file type", description: "Please select a PDF or DOCX file.", variant: "destructive" });
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select a file smaller than 10MB.", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
    }
  }, [toast]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
        if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(droppedFile.type)) {
            toast({ title: "Invalid file type", description: "Please select a PDF or DOCX file.", variant: "destructive" });
            return;
        }
        if (droppedFile.size > 10 * 1024 * 1024) {
            toast({ title: "File too large", description: "Please select a file smaller than 10MB.", variant: "destructive" });
            return;
        }
        setFile(droppedFile);
    }
  }, [toast]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const uploadToGoogleDrive = async () => {
    if (!file) {
      toast({ title: "Missing file", description: "Please select a resume file to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const base64Content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      setUploadProgress(30);

      const { data, error } = await supabase.functions.invoke('google-drive-service', {
        body: { action: 'upload_master_resume', file: base64Content, fileName: file.name }
      });

      if (error) throw error;

      setUploadProgress(70);

      setMasterResumeId(data.masterResumeId);
      setUploadProgress(100);

      toast({ title: "Upload successful!", description: "Your master resume has been uploaded and processed." });
      setTimeout(() => onSuccess(), 1500);

    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const renderStatus = () => {
    switch (driveStatus) {
      case null:
        return (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Checking Google Drive integration...</p>
          </div>
        );
      case 'SUCCESS':
        return renderUploadUI();
      case 'NOT_SET':
        return renderErrorCard(
          'Google Drive Not Configured',
          'The `GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY` is not set in your Supabase project secrets.',
          'Please add the secret in your project settings to continue.',
        );
      case 'INVALID_JSON':
        return renderErrorCard(
          'Invalid Service Account Key',
          'The provided service account key is not valid JSON. Please check for syntax errors.',
          `Details: ${driveError}`,
        );
      case 'AUTH_FAILED':
        return renderErrorCard(
          'Google Drive Authentication Failed',
          'The application could not authenticate with Google Drive using the provided credentials.',
          `This might be due to incorrect permissions on your service account. Details: ${driveError}`,
        );
      default:
        return renderErrorCard(
          'Unknown Error',
          'An unexpected error occurred while checking the Google Drive integration.',
          `Details: ${driveError || 'No additional information available.'}`,
        );
    }
  };

  const renderErrorCard = (title: string, description: string, details: string) => (
    <Card className="p-6 text-center bg-destructive/5 border-destructive/20">
      <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h2 className="text-2xl font-semibold mb-2 text-destructive-foreground">{title}</h2>
      <p className="text-muted-foreground mb-4">{description}</p>
      <p className="text-xs text-muted-foreground bg-background p-2 rounded">{details}</p>
      <a href="https://supabase.com/dashboard/project/_/settings/secrets" target="_blank" rel="noopener noreferrer" className="mt-6 inline-block">
        <Button variant="outline">Go to Supabase Secrets <HelpCircle className="ml-2 h-4 w-4"/></Button>
      </a>
    </Card>
  );

  const renderUploadUI = () => (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upload Your Master Resume</h1>
          <p className="text-xl text-muted-foreground">
            Upload your resume to Google Drive and let AI optimize it for every job application
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* File Upload Card */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              Master Resume File
            </h2>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file ? 'border-success bg-success/5' : 'border-border hover:border-primary bg-accent/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {file ? (
                <div className="space-y-4">
                  <CheckCircle className="h-12 w-12 text-success mx-auto" />
                  <div>
                    <p className="font-semibold text-success">File selected successfully!</p>
                    <p className="text-sm text-muted-foreground">{file.name}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-semibold">Drop your resume here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                  <Input type="file" accept=".pdf,.docx" onChange={handleFileSelect} className="hidden" id="file-upload" />
                  <Label htmlFor="file-upload" className="cursor-pointer inline-block">
                    <Button variant="outline" className="mt-2" asChild><span>Browse Files</span></Button>
                  </Label>
                </div>
              )}
            </div>
          </Card>

          {/* Google Drive Info Card */}
          <Card className="p-6">
             <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <HardDrive className="h-6 w-6 text-primary" />
                Google Drive Integration
             </h2>
             <div className="space-y-4">
                <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                   <p className="font-semibold text-success">Successfully Connected</p>
                </div>
             </div>
          </Card>
        </div>

        {isUploading && (
          <Card className="mt-8 p-6">
            <Progress value={uploadProgress} className="h-2" />
          </Card>
        )}

        <div className="mt-8 text-center">
          <Button
            size="lg"
            disabled={!file || isUploading}
            onClick={uploadToGoogleDrive}
          >
            {isUploading ? 'Processing...' : 'Upload to Google Drive & Continue'}
          </Button>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gradient-card py-12 px-6">
      {renderStatus()}
    </div>
  );
};

export default ResumeUpload;
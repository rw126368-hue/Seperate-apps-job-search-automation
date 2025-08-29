import { useState, useCallback } from "react";
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
  Loader2,
  Github
} from "lucide-react";

interface ResumeUploadProps {
  onSuccess: () => void;
}

const ResumeUpload = ({ onSuccess }: ResumeUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!['application/pdf'].includes(selectedFile.type)) {
        toast({ title: "Invalid file type", description: "Please select a PDF file.", variant: "destructive" });
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File too large", description: "Please select a file smaller than 5MB.", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
    }
  }, [toast]);

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select your master resume to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      setUploadProgress(50);

      // This function will be created in the next step
      const { error } = await supabase.functions.invoke('github-service', {
        body: {
          action: 'upload_resume',
          filePath: `resumes/${file.name}`,
          fileContent: base64Content,
        }
      });

      if (error) throw error;

      setUploadProgress(100);
      
      toast({
        title: "Upload Successful!",
        description: "Your resume has been saved to your GitHub repository.",
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred while uploading to GitHub.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <Github className="h-12 w-12 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold">Upload Your Master Resume</h1>
            <p className="text-muted-foreground mt-2">
              This resume will be stored in your GitHub repository at <code>resumes/</code> and used as the basis for all tailored applications.
            </p>
          </div>

          <div
            className="border-2 border-dashed rounded-lg p-8 text-center bg-accent/50 hover:border-primary transition-colors"
          >
            {file ? (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-success mx-auto" />
                <div>
                  <p className="font-semibold text-success">File Ready for Upload</p>
                  <p className="text-sm text-muted-foreground">{file.name}</p>
                </div>
                <Button variant="link" size="sm" onClick={() => setFile(null)}>
                  Choose a different file
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-semibold">Drop your resume here (PDF only)</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="resume-upload"
                />
                <Label htmlFor="resume-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>Browse Files</span>
                  </Button>
                </Label>
              </div>
            )}
          </div>

          {isUploading && (
            <div className="mt-6 space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">Uploading to GitHub...</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Button
              size="lg"
              disabled={!file || isUploading}
              onClick={handleUpload}
              className="w-full"
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Upload className="mr-2 h-5 w-5" />
              )}
              Upload Resume to GitHub
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResumeUpload;

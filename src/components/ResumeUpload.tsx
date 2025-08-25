import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Github,
  Key
} from "lucide-react";

interface ResumeUploadProps {
  onSuccess: () => void;
}

const ResumeUpload = ({ onSuccess }: ResumeUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const { toast } = useToast();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF or DOCX file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  }, [toast]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      // Validate file type and size directly
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(droppedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF or DOCX file.",
          variant: "destructive",
        });
        return;
      }
      
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(droppedFile);
    }
  }, [toast]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const uploadToGitHub = async () => {
    if (!file || !githubToken || !githubRepo) {
      toast({
        title: "Missing information",
        description: "Please provide file, GitHub token, and repository name.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert file to base64
      const base64Content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.readAsDataURL(file);
      });

      setUploadProgress(30);

      // Upload to GitHub
      const response = await fetch(`https://api.github.com/repos/${githubRepo}/contents/resumes/${file.name}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload master resume: ${file.name}`,
          content: base64Content,
          branch: 'main'
        })
      });

      setUploadProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload to GitHub');
      }

      setUploadProgress(100);

      // Store GitHub credentials in localStorage for future use
      localStorage.setItem('githubToken', githubToken);
      localStorage.setItem('githubRepo', githubRepo);

      toast({
        title: "Upload successful!",
        description: "Your master resume has been uploaded to GitHub.",
      });

      // Proceed to next step after a short delay
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload resume to GitHub.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upload Your Master Resume</h1>
          <p className="text-xl text-muted-foreground">
            Upload your resume to start automating your job search with AI-powered optimization
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* File Upload Card */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              Resume File
            </h2>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file 
                  ? 'border-success bg-success/5' 
                  : 'border-border hover:border-primary bg-accent/50'
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
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-semibold">Drop your resume here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports PDF and DOCX files (max 10MB)
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label 
                    htmlFor="file-upload" 
                    className="cursor-pointer inline-block"
                  >
                    <Button variant="outline" className="mt-2" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>
          </Card>

          {/* GitHub Configuration Card */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Github className="h-6 w-6 text-primary" />
              GitHub Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="github-token" className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4" />
                  Personal Access Token
                </Label>
                <Input
                  id="github-token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required permissions: repo (full control)
                </p>
              </div>

              <div>
                <Label htmlFor="github-repo" className="flex items-center gap-2 mb-2">
                  <Github className="h-4 w-4" />
                  Repository Name
                </Label>
                <Input
                  id="github-repo"
                  placeholder="username/skill-sync-automator"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: username/repository-name
                </p>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-warning">Security Note</p>
                    <p className="text-muted-foreground mt-1">
                      Your GitHub token is stored locally and never sent to our servers. 
                      Consider using a dedicated repository for this automation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <Card className="mt-8 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading to GitHub...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </Card>
        )}

        {/* Action Button */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            disabled={!file || !githubToken || !githubRepo || isUploading}
            onClick={uploadToGitHub}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary px-8 py-3 text-lg font-semibold transition-smooth"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Upload & Continue
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
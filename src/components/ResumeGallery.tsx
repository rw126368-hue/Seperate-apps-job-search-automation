import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Calendar, 
  Building, 
  Target,
  CheckCircle,
  AlertCircle,
  Search
} from "lucide-react";

interface GeneratedResume {
  id: string;
  jobTitle: string;
  company: string;
  generatedDate: string;
  matchScore: number;
  auditScore: number;
  status: 'approved' | 'pending' | 'needs_revision';
  fileName: string;
  keywords: string[];
}

const ResumeGallery = () => {
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mockResumes: GeneratedResume[] = [
    {
      id: "1",
      jobTitle: "Senior Software Engineer",
      company: "TechCorp Inc.",
      generatedDate: "2024-01-15",
      matchScore: 95,
      auditScore: 98,
      status: 'approved',
      fileName: "resume_techcorp_senior_swe.pdf",
      keywords: ["React", "Node.js", "AWS", "TypeScript", "GraphQL"]
    },
    {
      id: "2", 
      jobTitle: "Full Stack Developer",
      company: "StartupXYZ",
      generatedDate: "2024-01-14",
      matchScore: 87,
      auditScore: 96,
      status: 'approved',
      fileName: "resume_startupxyz_fullstack.pdf",
      keywords: ["JavaScript", "Python", "Docker", "PostgreSQL"]
    },
    {
      id: "3",
      jobTitle: "Frontend Engineer", 
      company: "Design Studios",
      generatedDate: "2024-01-13",
      matchScore: 82,
      auditScore: 85,
      status: 'needs_revision',
      fileName: "resume_designstudios_frontend.pdf",
      keywords: ["React", "TypeScript", "CSS", "Figma"]
    },
    {
      id: "4",
      jobTitle: "DevOps Engineer",
      company: "CloudTech Solutions",
      generatedDate: "2024-01-12",
      matchScore: 78,
      auditScore: 92,
      status: 'pending',
      fileName: "resume_cloudtech_devops.pdf",
      keywords: ["Kubernetes", "Docker", "AWS", "CI/CD"]
    }
  ];

  const filteredResumes = mockResumes.filter(resume =>
    resume.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: GeneratedResume['status']) => {
    const statusConfig = {
      approved: { 
        variant: 'default' as const, 
        className: 'bg-success text-success-foreground',
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        text: 'Approved'
      },
      pending: { 
        variant: 'secondary' as const, 
        className: 'bg-warning text-warning-foreground',
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        text: 'Pending Review'
      },
      needs_revision: { 
        variant: 'destructive' as const, 
        className: 'bg-destructive text-destructive-foreground',
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        text: 'Needs Revision'
      }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  const handleDownload = (resume: GeneratedResume) => {
    // Simulate download
    console.log(`Downloading ${resume.fileName}`);
    // In real implementation, this would download from GitHub repository
  };

  const handlePreview = (resumeId: string) => {
    setSelectedResume(resumeId);
    // In real implementation, this would open a preview modal
  };

  const handleDelete = (resumeId: string) => {
    // Simulate deletion
    console.log(`Deleting resume ${resumeId}`);
    // In real implementation, this would delete from GitHub repository
  };

  return (
    <div className="min-h-screen bg-gradient-card py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Resume Gallery</h1>
          <p className="text-xl text-muted-foreground">
            Manage your AI-generated, ATS-optimized resumes for each job application
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by job title, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredResumes.length} of {mockResumes.length} resumes
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {mockResumes.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Resumes</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1">
              {mockResumes.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-warning mb-1">
              {mockResumes.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary mb-1">
              {Math.round(mockResumes.reduce((acc, r) => acc + r.matchScore, 0) / mockResumes.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Match Score</div>
          </Card>
        </div>

        {/* Resume Grid */}
        {filteredResumes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => (
              <Card key={resume.id} className="p-6 hover:shadow-lg transition-smooth">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                      {resume.jobTitle}
                    </h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {resume.company}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(resume.status)}
                  </div>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-accent/50 rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {resume.matchScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Match Score</div>
                  </div>
                  <div className="text-center p-3 bg-accent/50 rounded-lg">
                    <div className={`text-lg font-bold ${
                      resume.auditScore >= 95 ? 'text-success' : 
                      resume.auditScore >= 90 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {resume.auditScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Audit Score</div>
                  </div>
                </div>

                {/* Keywords */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {resume.keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {resume.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{resume.keywords.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <Calendar className="h-3 w-3" />
                  Generated: {new Date(resume.generatedDate).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreview(resume.id)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(resume)}
                    className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(resume.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? 'No Matching Resumes' : 'No Resumes Generated Yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms to find the resume you\'re looking for.'
                : 'Start by uploading your master resume and running a job search to generate ATS-optimized resumes.'
              }
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResumeGallery;
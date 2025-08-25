import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Eye,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  Search
} from "lucide-react";

interface AuditIssue {
  id: string;
  type: 'hallucination' | 'inconsistency' | 'missing_info' | 'formatting';
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
  section: string;
}

interface AuditReport {
  id: string;
  resumeId: string;
  jobTitle: string;
  company: string;
  auditDate: string;
  overallScore: number;
  hallucinationScore: number;
  status: 'passed' | 'failed' | 'warning';
  issues: AuditIssue[];
  corrections: number;
  fileName: string;
}

const AuditReports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mockReports: AuditReport[] = [
    {
      id: "1",
      resumeId: "res_001",
      jobTitle: "Senior Software Engineer",
      company: "TechCorp Inc.",
      auditDate: "2024-01-15T10:30:00Z",
      overallScore: 98,
      hallucinationScore: 0.5,
      status: 'passed',
      issues: [],
      corrections: 2,
      fileName: "resume_techcorp_senior_swe.pdf"
    },
    {
      id: "2",
      resumeId: "res_002", 
      jobTitle: "Full Stack Developer",
      company: "StartupXYZ",
      auditDate: "2024-01-14T15:45:00Z",
      overallScore: 96,
      hallucinationScore: 0.8,
      status: 'passed',
      issues: [
        {
          id: "issue_1",
          type: 'inconsistency',
          severity: 'low',
          description: 'Years of experience mismatch between summary and work history',
          suggestion: 'Ensure consistent experience years throughout the resume',
          section: 'Professional Summary'
        }
      ],
      corrections: 1,
      fileName: "resume_startupxyz_fullstack.pdf"
    },
    {
      id: "3",
      resumeId: "res_003",
      jobTitle: "Frontend Engineer",
      company: "Design Studios", 
      auditDate: "2024-01-13T09:15:00Z",
      overallScore: 85,
      hallucinationScore: 2.3,
      status: 'warning',
      issues: [
        {
          id: "issue_2",
          type: 'hallucination',
          severity: 'medium',
          description: 'Added technology skills not present in master resume',
          suggestion: 'Remove or verify the accuracy of added skills: Vue.js, Angular',
          section: 'Technical Skills'
        },
        {
          id: "issue_3",
          type: 'missing_info',
          severity: 'low',
          description: 'Missing certification mentioned in master resume',
          suggestion: 'Include AWS Certification from master resume',
          section: 'Certifications'
        }
      ],
      corrections: 3,
      fileName: "resume_designstudios_frontend.pdf"
    },
    {
      id: "4",
      resumeId: "res_004",
      jobTitle: "DevOps Engineer", 
      company: "CloudTech Solutions",
      auditDate: "2024-01-12T14:20:00Z",
      overallScore: 78,
      hallucinationScore: 4.2,
      status: 'failed',
      issues: [
        {
          id: "issue_4",
          type: 'hallucination',
          severity: 'high',
          description: 'Fabricated work experience at company not in master resume',
          suggestion: 'Remove the fabricated position at "CloudFirst Technologies"',
          section: 'Work Experience'
        },
        {
          id: "issue_5",
          type: 'hallucination',
          severity: 'medium',
          description: 'Added programming languages not demonstrated in master resume',
          suggestion: 'Remove or verify: Rust, Go programming languages',
          section: 'Technical Skills'
        }
      ],
      corrections: 5,
      fileName: "resume_cloudtech_devops.pdf"
    }
  ];

  const filteredReports = mockReports.filter(report =>
    report.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: AuditReport['status'], score: number) => {
    const statusConfig = {
      passed: { 
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        className: 'bg-success text-success-foreground',
        text: 'Passed'
      },
      warning: { 
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        className: 'bg-warning text-warning-foreground',
        text: 'Warning'
      },
      failed: { 
        icon: <XCircle className="h-3 w-3 mr-1" />,
        className: 'bg-destructive text-destructive-foreground',
        text: 'Failed'
      }
    };

    const config = statusConfig[status];
    return (
      <Badge className={config.className}>
        {config.icon}
        {config.text} ({score}%)
      </Badge>
    );
  };

  const getSeverityBadge = (severity: AuditIssue['severity']) => {
    const severityConfig = {
      high: 'bg-destructive text-destructive-foreground',
      medium: 'bg-warning text-warning-foreground', 
      low: 'bg-secondary text-secondary-foreground'
    };

    return (
      <Badge className={severityConfig[severity]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getIssueTypeIcon = (type: AuditIssue['type']) => {
    const iconMap = {
      hallucination: <XCircle className="h-4 w-4 text-destructive" />,
      inconsistency: <AlertCircle className="h-4 w-4 text-warning" />,
      missing_info: <FileText className="h-4 w-4 text-secondary" />,
      formatting: <Eye className="h-4 w-4 text-muted-foreground" />
    };
    
    return iconMap[type];
  };

  return (
    <div className="min-h-screen bg-gradient-card py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Audit Reports</h1>
          <p className="text-xl text-muted-foreground">
            AI-powered accuracy verification and hallucination detection for generated resumes
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8 p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search audit reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredReports.length} reports
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {mockReports.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Audits</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1">
              {mockReports.filter(r => r.status === 'passed').length}
            </div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-warning mb-1">
              {mockReports.filter(r => r.status === 'warning').length}
            </div>
            <div className="text-sm text-muted-foreground">Warnings</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive mb-1">
              {mockReports.filter(r => r.status === 'failed').length}
            </div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary mb-1">
              {Math.round(mockReports.reduce((acc, r) => acc + r.overallScore, 0) / mockReports.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </Card>
        </div>

        {/* Reports Grid */}
        {filteredReports.length > 0 ? (
          <div className="space-y-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="p-6 hover:shadow-lg transition-smooth">
                {/* Report Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{report.jobTitle}</h3>
                      {getStatusBadge(report.status, report.overallScore)}
                    </div>
                    <p className="text-muted-foreground mb-2">{report.company}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(report.auditDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {report.fileName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scores */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Score</span>
                      <span className="font-medium">{report.overallScore}%</span>
                    </div>
                    <Progress 
                      value={report.overallScore} 
                      className={`h-2 ${
                        report.overallScore >= 95 ? '[&>div]:bg-success' :
                        report.overallScore >= 85 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'
                      }`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Hallucination Score</span>
                      <span className={`font-medium ${
                        report.hallucinationScore <= 1 ? 'text-success' :
                        report.hallucinationScore <= 3 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {report.hallucinationScore}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(report.hallucinationScore * 20, 100)} 
                      className={`h-2 ${
                        report.hallucinationScore <= 1 ? '[&>div]:bg-success' :
                        report.hallucinationScore <= 3 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Corrections Made</span>
                    <div className="flex items-center gap-1">
                      {report.corrections > 0 ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{report.corrections}</span>
                    </div>
                  </div>
                </div>

                {/* Issues */}
                {report.issues.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Issues Found ({report.issues.length})
                    </h4>
                    <div className="space-y-3">
                      {report.issues.map((issue) => (
                        <div key={issue.id} className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
                          <div className="mt-0.5">
                            {getIssueTypeIcon(issue.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{issue.type.replace('_', ' ')}</span>
                              {getSeverityBadge(issue.severity)}
                              <span className="text-sm text-muted-foreground">in {issue.section}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{issue.description}</p>
                            <p className="text-sm text-primary font-medium">💡 {issue.suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    View Full Report
                  </Button>
                  {report.status === 'failed' && (
                    <Button
                      size="sm"
                      className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                    >
                      <ShieldCheck className="h-3 w-3 mr-2" />
                      Regenerate Resume
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="p-12 text-center">
            <ShieldCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? 'No Matching Reports' : 'No Audit Reports Yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms to find the report you\'re looking for.'
                : 'Audit reports will appear here after generating ATS-optimized resumes.'
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

export default AuditReports;
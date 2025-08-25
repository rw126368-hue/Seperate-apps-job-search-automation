import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Brain, 
  Loader2, 
  MapPin, 
  DollarSign, 
  Clock,
  ExternalLink,
  Filter,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  postedDate: string;
  description: string;
  keywords: string[];
  matchScore: number;
}

const JobSearchDashboard = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [analyzedSkills, setAnalyzedSkills] = useState<string[]>([]);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [isAutoSearchEnabled, setIsAutoSearchEnabled] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockJobs: JobListing[] = [
    {
      id: "1",
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      salary: "$150,000 - $200,000",
      postedDate: "2 days ago",
      description: "We're looking for a senior software engineer with experience in React, Node.js, and cloud platforms...",
      keywords: ["React", "Node.js", "AWS", "TypeScript", "GraphQL"],
      matchScore: 95
    },
    {
      id: "2",
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Remote",
      salary: "$120,000 - $160,000",
      postedDate: "1 day ago",
      description: "Join our fast-growing startup as a full stack developer. Experience with modern web technologies required...",
      keywords: ["JavaScript", "Python", "Docker", "PostgreSQL", "Git"],
      matchScore: 87
    },
    {
      id: "3",
      title: "Frontend Engineer",
      company: "Design Studios",
      location: "New York, NY",
      salary: "$130,000 - $170,000",
      postedDate: "3 days ago",
      description: "We need a frontend engineer passionate about creating beautiful user experiences...",
      keywords: ["React", "TypeScript", "CSS", "Figma", "Jest"],
      matchScore: 82
    }
  ];

  const mockSkills = ["React", "TypeScript", "Node.js", "AWS", "GraphQL", "Python", "Docker", "PostgreSQL"];

  const analyzeResume = async () => {
    setIsSearching(true);
    setSearchProgress(0);
    
    try {
      // Simulate AI analysis of uploaded resume
      setSearchProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalyzedSkills(mockSkills);
      setSearchProgress(50);
      
      // Simulate job search
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSearchProgress(75);
      
      // Simulate job matching
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJobListings(mockJobs);
      setSearchProgress(100);
      
      toast({
        title: "Analysis Complete!",
        description: `Found ${mockJobs.length} matching job opportunities.`,
      });
      
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze resume and search for jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const generateResume = async (jobId: string) => {
    const job = jobListings.find(j => j.id === jobId);
    if (!job) return;

    toast({
      title: "Generating Resume",
      description: `Creating ATS-optimized resume for ${job.title} position...`,
    });

    // Simulate resume generation
    setTimeout(() => {
      toast({
        title: "Resume Generated!",
        description: "ATS-optimized resume created and saved to your gallery.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-card py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Job Search Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Intelligent job matching powered by AI analysis of your resume
          </p>
        </div>

        {/* Resume Analysis Card */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Resume Analysis & Job Search
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={isAutoSearchEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAutoSearchEnabled(!isAutoSearchEnabled)}
                className={isAutoSearchEnabled ? "bg-gradient-success" : ""}
              >
                {isAutoSearchEnabled ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Auto Search {isAutoSearchEnabled ? "ON" : "OFF"}
              </Button>
            </div>
          </div>

          {/* Search Controls */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <Input
                placeholder="Add specific keywords to refine search..."
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={analyzeResume}
              disabled={isSearching}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze & Search
                </>
              )}
            </Button>
          </div>

          {/* Progress */}
          {isSearching && (
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>AI Analysis in Progress...</span>
                <span>{searchProgress}%</span>
              </div>
              <Progress value={searchProgress} className="h-2" />
            </div>
          )}

          {/* Analyzed Skills */}
          {analyzedSkills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Extracted Skills & Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analyzedSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Job Listings */}
        {jobListings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Matching Job Opportunities</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                Found {jobListings.length} matches
              </div>
            </div>

            <div className="grid gap-6">
              {jobListings.map((job) => (
                <Card key={job.id} className="p-6 hover:shadow-lg transition-smooth">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`
                            ${job.matchScore >= 90 ? 'bg-success text-success-foreground' : ''}
                            ${job.matchScore >= 80 && job.matchScore < 90 ? 'bg-warning text-warning-foreground' : ''}
                            ${job.matchScore < 80 ? 'bg-primary text-primary-foreground' : ''}
                          `}
                        >
                          {job.matchScore}% Match
                        </Badge>
                      </div>
                      <p className="text-lg text-muted-foreground mb-2">{job.company}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.postedDate}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => generateResume(job.id)}
                      className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Resume
                    </Button>
                    <Button variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Job
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && jobListings.length === 0 && (
          <Card className="p-12 text-center">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Job Search Yet</h3>
            <p className="text-muted-foreground mb-6">
              Click "Analyze & Search" to start finding jobs that match your resume
            </p>
            <Button
              onClick={analyzeResume}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Brain className="mr-2 h-4 w-4" />
              Start AI Analysis
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobSearchDashboard;
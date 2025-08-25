import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import ResumeUpload from "@/components/ResumeUpload";
import JobSearchDashboard from "@/components/JobSearchDashboard";
import ResumeGallery from "@/components/ResumeGallery";
import AuditReports from "@/components/AuditReports";
import SettingsPanel from "@/components/SettingsPanel";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type ActiveSection = 'hero' | 'upload' | 'dashboard' | 'gallery' | 'audit' | 'settings';

const Index = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('hero');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth for protected sections
  useEffect(() => {
    const protectedSections: ActiveSection[] = ['upload', 'dashboard', 'gallery', 'audit', 'settings'];
    
    if (!loading && !user && protectedSections.includes(activeSection)) {
      navigate('/auth');
    }
  }, [user, loading, activeSection, navigate]);

  const renderActiveSection = () => {
    if (loading) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card className="p-8">
            <CardContent className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    switch (activeSection) {
      case 'hero':
        return <HeroSection onGetStarted={() => user ? setActiveSection('upload') : navigate('/auth')} />;
      case 'upload':
        return user ? <ResumeUpload onSuccess={() => setActiveSection('dashboard')} /> : null;
      case 'dashboard':
        return user ? <JobSearchDashboard /> : null;
      case 'gallery':
        return user ? <ResumeGallery /> : null;
      case 'audit':
        return user ? <AuditReports /> : null;
      case 'settings':
        return user ? <SettingsPanel /> : null;
      default:
        return <HeroSection onGetStarted={() => user ? setActiveSection('upload') : navigate('/auth')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="transition-smooth">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default Index;
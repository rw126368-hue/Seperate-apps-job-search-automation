import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import ResumeUpload from "@/components/ResumeUpload";
import JobSearchDashboard from "@/components/JobSearchDashboard";
import ResumeGallery from "@/components/ResumeGallery";
import AuditReports from "@/components/AuditReports";
import SettingsPanel from "@/components/SettingsPanel";

type ActiveSection = 'hero' | 'upload' | 'dashboard' | 'gallery' | 'audit' | 'settings';

const Index = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('hero');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'hero':
        return <HeroSection onGetStarted={() => setActiveSection('upload')} />;
      case 'upload':
        return <ResumeUpload onSuccess={() => setActiveSection('dashboard')} />;
      case 'dashboard':
        return <JobSearchDashboard />;
      case 'gallery':
        return <ResumeGallery />;
      case 'audit':
        return <AuditReports />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <HeroSection onGetStarted={() => setActiveSection('upload')} />;
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
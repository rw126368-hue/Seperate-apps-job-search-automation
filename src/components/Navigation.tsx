import { Button } from "@/components/ui/button";
import { 
  Home, 
  Upload, 
  Search, 
  FileText, 
  ShieldCheck, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

type ActiveSection = 'hero' | 'upload' | 'dashboard' | 'gallery' | 'audit' | 'settings';

interface NavigationProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'hero' as const, label: 'Home', icon: Home },
    { id: 'upload' as const, label: 'Upload Resume', icon: Upload },
    { id: 'dashboard' as const, label: 'Job Search', icon: Search },
    { id: 'gallery' as const, label: 'Resumes', icon: FileText },
    { id: 'audit' as const, label: 'Audit Reports', icon: ShieldCheck },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SkillSync
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 transition-smooth ${
                      isActive 
                        ? 'bg-gradient-primary text-primary-foreground shadow-primary' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => onSectionChange(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:block">{item.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-16 left-0 right-0 bg-background border-b border-border shadow-lg">
            <div className="px-6 py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start flex items-center space-x-3 transition-smooth ${
                      isActive 
                        ? 'bg-gradient-primary text-primary-foreground shadow-primary' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
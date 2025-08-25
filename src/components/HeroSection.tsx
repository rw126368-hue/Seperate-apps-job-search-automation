import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, FileSearch, Zap, Shield, Target, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "AI Resume Optimization",
      description: "Smart ATS optimization powered by advanced LLMs"
    },
    {
      icon: <FileSearch className="h-8 w-8 text-secondary" />,
      title: "Automated Job Search",
      description: "Find and apply to relevant positions automatically"
    },
    {
      icon: <Shield className="h-8 w-8 text-success" />,
      title: "Hallucination Detection",
      description: "AI-powered accuracy verification and content audit"
    },
    {
      icon: <Target className="h-8 w-8 text-warning" />,
      title: "Smart Matching",
      description: "Intelligent job-to-resume matching algorithms"
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      
      {/* Main Hero Content */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Job Automation Platform
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
              Land Your Dream Job
              <br />
              <span className="text-foreground">While You Sleep</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Automate your entire job search with AI-powered resume optimization, 
              intelligent job matching, and ATS compliance verification. 
              <span className="text-primary font-semibold">Get hired 5x faster.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary px-8 py-3 text-lg font-semibold transition-bounce"
                onClick={onGetStarted}
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Automating Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg transition-smooth"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Get Hired
            </h2>
            <p className="text-xl text-muted-foreground">
              Powered by cutting-edge AI and automation technologies
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-smooth border-0 bg-gradient-card">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 bg-gradient-card">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-8">Join Thousands Getting Hired Faster</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5x</div>
              <div className="text-muted-foreground">Faster Job Applications</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">89%</div>
              <div className="text-muted-foreground">ATS Pass Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success mb-2">24/7</div>
              <div className="text-muted-foreground">Automated Job Search</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
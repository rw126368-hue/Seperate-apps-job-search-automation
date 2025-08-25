import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Key, 
  Github, 
  Mail, 
  Brain, 
  Clock,
  Shield,
  Bell,
  Save,
  TestTube,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    // GitHub Settings
    githubToken: localStorage.getItem('githubToken') || '',
    githubRepo: localStorage.getItem('githubRepo') || '',
    
    // Hugging Face Settings
    hfToken: localStorage.getItem('hfToken') || '',
    hfModel: 'microsoft/DialoGPT-medium',
    
    // Email Settings
    emailProvider: 'sendgrid',
    emailApiKey: localStorage.getItem('emailApiKey') || '',
    userEmail: localStorage.getItem('userEmail') || '',
    
    // Automation Settings
    autoSearchEnabled: JSON.parse(localStorage.getItem('autoSearchEnabled') || 'false'),
    searchFrequency: localStorage.getItem('searchFrequency') || 'daily',
    maxApplications: parseInt(localStorage.getItem('maxApplications') || '5'),
    
    // Audit Settings
    hallucinationThreshold: parseFloat(localStorage.getItem('hallucinationThreshold') || '1.0'),
    auditEnabled: JSON.parse(localStorage.getItem('auditEnabled') || 'true'),
    
    // Notification Settings
    emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') || 'true'),
    webhookUrl: localStorage.getItem('webhookUrl') || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      Object.entries(settings).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });

      // In a real app, you would also save to a backend/database
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Settings Saved",
        description: "Your configuration has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async (type: 'github' | 'huggingface' | 'email') => {
    setTestingConnection(type);
    
    try {
      let success = false;
      
      switch (type) {
        case 'github':
          // Test GitHub API connection
          const response = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `token ${settings.githubToken}`,
              'Content-Type': 'application/json',
            }
          });
          success = response.ok;
          break;
          
        case 'huggingface':
          // Test Hugging Face API connection
          success = settings.hfToken.length > 0; // Simplified for demo
          break;
          
        case 'email':
          // Test email service connection
          success = settings.emailApiKey.length > 0; // Simplified for demo
          break;
      }

      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? `${type} connection is working properly.`
          : `Failed to connect to ${type}. Please check your credentials.`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: `Unable to test ${type} connection.`,
        variant: "destructive",
      });
    } finally {
      setTestingConnection(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Settings & Configuration</h1>
          <p className="text-xl text-muted-foreground">
            Configure your API keys, automation preferences, and notification settings
          </p>
        </div>

        <div className="space-y-8">
          {/* GitHub Configuration */}
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
                <div className="flex gap-2">
                  <Input
                    id="github-token"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={settings.githubToken}
                    onChange={(e) => handleInputChange('githubToken', e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => testConnection('github')}
                    disabled={!settings.githubToken || testingConnection === 'github'}
                  >
                    {testingConnection === 'github' ? (
                      <TestTube className="h-4 w-4 animate-pulse" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Test
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="github-repo">Repository Name</Label>
                <Input
                  id="github-repo"
                  placeholder="username/skill-sync-automator"
                  value={settings.githubRepo}
                  onChange={(e) => handleInputChange('githubRepo', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Hugging Face Configuration */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Hugging Face AI Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="hf-token" className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4" />
                  API Token
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="hf-token"
                    type="password"
                    placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                    value={settings.hfToken}
                    onChange={(e) => handleInputChange('hfToken', e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => testConnection('huggingface')}
                    disabled={!settings.hfToken || testingConnection === 'huggingface'}
                  >
                    {testingConnection === 'huggingface' ? (
                      <TestTube className="h-4 w-4 animate-pulse" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Test
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="hf-model">Model Selection</Label>
                <select 
                  id="hf-model"
                  value={settings.hfModel}
                  onChange={(e) => handleInputChange('hfModel', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="microsoft/DialoGPT-medium">DialoGPT-Medium (Recommended)</option>
                  <option value="microsoft/DialoGPT-large">DialoGPT-Large (Higher Quality)</option>
                  <option value="facebook/blenderbot-400M-distill">BlenderBot-400M</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Email Configuration */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Email Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-email">Your Email Address</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={settings.userEmail}
                  onChange={(e) => handleInputChange('userEmail', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email-provider">Email Service Provider</Label>
                <select 
                  id="email-provider"
                  value={settings.emailProvider}
                  onChange={(e) => handleInputChange('emailProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="smtp">Custom SMTP</option>
                </select>
              </div>

              <div>
                <Label htmlFor="email-api-key" className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4" />
                  API Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email-api-key"
                    type="password"
                    placeholder="SG.xxxxxxxxxxxxxxxxxxxx"
                    value={settings.emailApiKey}
                    onChange={(e) => handleInputChange('emailApiKey', e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => testConnection('email')}
                    disabled={!settings.emailApiKey || testingConnection === 'email'}
                  >
                    {testingConnection === 'email' ? (
                      <TestTube className="h-4 w-4 animate-pulse" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Test
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Automation Settings */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Automation Settings
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable Auto Job Search</Label>
                  <p className="text-sm text-muted-foreground">Automatically search for new jobs daily</p>
                </div>
                <Switch
                  checked={settings.autoSearchEnabled}
                  onCheckedChange={(checked) => handleInputChange('autoSearchEnabled', checked)}
                />
              </div>

              <div>
                <Label htmlFor="search-frequency">Search Frequency</Label>
                <select 
                  id="search-frequency"
                  value={settings.searchFrequency}
                  onChange={(e) => handleInputChange('searchFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  disabled={!settings.autoSearchEnabled}
                >
                  <option value="daily">Daily</option>
                  <option value="twice-daily">Twice Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <Label htmlFor="max-applications">Maximum Applications Per Day</Label>
                <Input
                  id="max-applications"
                  type="number"
                  min="1"
                  max="20"
                  value={settings.maxApplications}
                  onChange={(e) => handleInputChange('maxApplications', parseInt(e.target.value))}
                  disabled={!settings.autoSearchEnabled}
                />
              </div>
            </div>
          </Card>

          {/* Audit Settings */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Audit & Quality Control
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable Resume Auditing</Label>
                  <p className="text-sm text-muted-foreground">AI-powered hallucination detection</p>
                </div>
                <Switch
                  checked={settings.auditEnabled}
                  onCheckedChange={(checked) => handleInputChange('auditEnabled', checked)}
                />
              </div>

              <div>
                <Label htmlFor="hallucination-threshold">Hallucination Threshold (%)</Label>
                <Input
                  id="hallucination-threshold"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={settings.hallucinationThreshold}
                  onChange={(e) => handleInputChange('hallucinationThreshold', parseFloat(e.target.value))}
                  disabled={!settings.auditEnabled}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Resumes with hallucination scores above this threshold will be rejected
                </p>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Notifications
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about job applications</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                />
              </div>

              <div>
                <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-webhook.com/endpoint"
                  value={settings.webhookUrl}
                  onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Receive real-time notifications via webhook
                </p>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-primary px-8 py-3 text-lg font-semibold"
            >
              {isSaving ? (
                <>
                  <Save className="mr-2 h-5 w-5 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save All Settings
                </>
              )}
            </Button>
          </div>

          {/* Configuration Status */}
          <Card className="p-6 bg-accent/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration Status
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {settings.githubToken && settings.githubRepo ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning" />
                )}
                <span className="text-sm">GitHub Integration</span>
              </div>
              
              <div className="flex items-center gap-2">
                {settings.hfToken ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning" />
                )}
                <span className="text-sm">Hugging Face AI</span>
              </div>
              
              <div className="flex items-center gap-2">
                {settings.emailApiKey && settings.userEmail ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning" />
                )}
                <span className="text-sm">Email Service</span>
              </div>
              
              <div className="flex items-center gap-2">
                {settings.auditEnabled ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning" />
                )}
                <span className="text-sm">Audit System</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
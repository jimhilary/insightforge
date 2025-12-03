import { useState } from 'react';
import { X, Sparkles, ArrowRight, Bot, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const OnboardingGuide = ({ onCreateProject }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to InsightForge! 👋",
      message: "I'm your AI research assistant. Let me show you around and help you get started with your first project.",
      action: null,
      icon: Bot,
    },
    {
      title: "What can you do here?",
      message: "With InsightForge, you can:\n• Run AI-powered research on any topic\n• Upload and summarize PDF documents\n• Generate comprehensive reports\n\nLet's create your first project!",
      action: "create",
      icon: Sparkles,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsMinimized(true);
    }
  };

  const handleCreateProject = () => {
    setIsMinimized(true);
    if (onCreateProject) onCreateProject();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleExpand = () => {
    setIsMinimized(false);
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  // Minimized floating assistant
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
        <Card className="bg-card text-card-foreground shadow-2xl border-2 border-border max-w-xs">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">
                  Need assistance?
                </p>
                <p className="text-xs text-muted-foreground">
                  I can help you get started
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="shrink-0 p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <Button
              onClick={handleExpand}
              size="sm"
              className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Sparkles className="w-3 h-3 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expanded guide
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 zoom-in-95 duration-300">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-2xl border-2 border-border">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="shrink-0 h-8 w-8"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="shrink-0 h-8 w-8"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
              {step.message}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-6 bg-gradient-to-r from-blue-600 to-purple-600'
                    : index < currentStep
                    ? 'w-1.5 bg-green-500'
                    : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                size="sm"
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step.action === 'create' ? (
              <Button
                onClick={handleCreateProject}
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Create Project
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Next
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingGuide;


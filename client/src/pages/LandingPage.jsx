import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, FileText, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '../hooks/useDarkMode';
import DarkModeToggle from '../components/DarkModeToggle';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDark, toggleDark] = useDarkMode();
  const navigate = useNavigate();

  const slides = [
    {
      icon: Sparkles,
      title: "AI-Powered Research",
      description: "Leverage cutting-edge AI to conduct comprehensive research on any topic. Get detailed insights, key findings, and actionable recommendations in minutes.",
      gradient: "from-blue-600 to-cyan-600",
      image: "🔬",
    },
    {
      icon: FileText,
      title: "Smart Document Analysis",
      description: "Upload PDFs and let our AI extract key information, generate summaries, and identify important topics. Save hours of manual reading and analysis.",
      gradient: "from-purple-600 to-pink-600",
      image: "📄",
    },
    {
      icon: BarChart3,
      title: "Comprehensive Reports",
      description: "Combine your research and documents into professional, exportable reports. Share insights with your team and make data-driven decisions.",
      gradient: "from-orange-600 to-red-600",
      image: "📊",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/auth');
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    navigate('/auth');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--grad-1))] via-[hsl(var(--grad-2))] to-[hsl(var(--grad-3))] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle isDark={isDark} toggle={toggleDark} />
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 left-4 z-10 text-sm font-medium text-white/80 hover:text-white transition-colors"
      >
        Skip
      </button>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Slider content */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
          {/* Icon/Image */}
          <div className="mb-8 flex justify-center">
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300`}>
              <span className="text-6xl">{slide.image}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-3">
            <Icon className="w-10 h-10" />
            {slide.title}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-12 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <Button
            onClick={handlePrev}
            variant="outline"
            size="lg"
            disabled={currentSlide === 0}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            size="lg"
            className="flex-1 bg-white text-blue-600 hover:bg-white/90 font-semibold shadow-xl"
          >
            {currentSlide === slides.length - 1 ? (
              <>
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Brand */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-white font-bold text-lg">InsightForge</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;


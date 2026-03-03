import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Lightbulb, 
  Flame, 
  Zap, 
  Users, 
  Timer, 
  Bell,
  Search,
  BarChart3,
  CheckCircle
} from "lucide-react";
import { User } from "../utils/local/storage";

interface OnboardingTourProps {
  user: User | null;
  onComplete: () => void;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  tips: string[];
}

export function OnboardingTour({ user, onComplete }: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to UniBites! 🎉',
      description: 'Get ready to experience the most advanced campus dining platform with AI-powered features designed for modern students and staff.',
      icon: Lightbulb,
      color: 'text-blue-500',
      tips: [
        'Real-time order tracking with witty updates',
        'Smart scheduling and group ordering',
        'Flash sales based on kitchen efficiency',
        'Express menu for quick breaks between classes'
      ]
    },
    {
      id: 'flash-sales',
      title: 'Flash Sales - Kitchen Batch Magic! 🔥',
      description: 'When our kitchen is already preparing batches (oil heated, water boiling), we offer instant discounts to optimize efficiency.',
      icon: Flame,
      color: 'text-red-500',
      tips: [
        'Get 15-25% off when kitchen batches are in progress',
        'Limited quantities available per batch',
        'Countdown timers show remaining time',
        'Perfect for saving money on your favorites!'
      ]
    },
    {
      id: 'express-menu',
      title: 'Express Menu - Lightning Fast! ⚡',
      description: 'Items ready in 5 minutes or less! Perfect for those quick breaks between classes when you need food fast.',
      icon: Zap,
      color: 'text-yellow-500',
      tips: [
        'Chai, Coffee, Samosa, Maggi ready in ≤5 minutes',
        'Pre-prepared items for instant satisfaction',
        'No long waits during busy periods',
        'Look for the lightning bolt icon!'
      ]
    },
    {
      id: 'group-cart',
      title: 'Group Cart & Split Payment 👥',
      description: 'Order with friends and split the bill! Create group carts, invite friends with share codes, and pay individually via UPI.',
      icon: Users,
      color: 'text-purple-500',
      tips: [
        'Share 6-digit codes with friends to join',
        'Everyone adds their own items',
        'Individual UPI payment for each person',
        'No more "who owes what?" confusion!'
      ]
    },
    {
      id: 'preorder',
      title: 'Smart Preorder Scheduling 🕐',
      description: 'Schedule your meals ahead of time! Help the kitchen prepare efficiently and skip the wait during peak hours.',
      icon: Timer,
      color: 'text-green-500',
      tips: [
        'Schedule pickup times up to 7 days ahead',
        'Special instructions for custom preparation',
        'Helps kitchen manage workflow efficiently',
        'Perfect for lunch planning between classes'
      ]
    },
    {
      id: 'live-tracking',
      title: 'Live Order Tracking with Personality! 📱',
      description: 'Track your orders with real-time updates and witty messages that make waiting fun.',
      icon: Bell,
      color: 'text-blue-500',
      tips: [
        '"Your chicken is being roasted - chicken looks mad 😤"',
        'Real-time kitchen status updates',
        'Estimated pickup times',
        'Notifications when your food is ready'
      ]
    },
    {
      id: 'search-filters',
      title: 'Smart Search & Filters 🔍',
      description: 'Find exactly what you want with powerful search and filtering options.',
      icon: Search,
      color: 'text-gray-500',
      tips: [
        'Search by name, description, or category',
        'Filter by price range, availability, rating',
        'Sort by popularity, price, or rating',
        'Quick access to search results'
      ]
    },
    {
      id: 'dashboard-stats',
      title: 'Live Stats & Analytics 📊',
      description: 'Get insights into UniBites performance, popular items, and real-time kitchen status.',
      icon: BarChart3,
      color: 'text-orange-500',
      tips: [
        'Real-time kitchen load percentage',
        'Popular items and trending foods',
        'Flash sale notifications',
        'Average wait times and satisfaction ratings'
      ]
    }
  ];

  // Show onboarding for new users
  useEffect(() => {
    if (user) {
      const hasSeenTour = localStorage.getItem(`onboarding-seen-${user.id}`);
      if (!hasSeenTour) {
        setIsOpen(true);
      }
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    if (user) {
      localStorage.setItem(`onboarding-seen-${user.id}`, 'true');
    }
    setIsOpen(false);
    onComplete();
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isOpen || !user) return null;

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl w-[95vw]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gray-100 rounded-lg ${step.color}`}>
                <StepIcon className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-left">{step.title}</DialogTitle>
                <DialogDescription className="text-left">
                  Step {currentStep + 1} of {tourSteps.length}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={skipTour}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Skip Tour
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>

          {/* Step Content */}
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              {step.description}
            </p>
          </div>

          {/* Feature Tips */}
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-orange-600" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {step.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-orange-800">{tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {tourSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
            >
              {currentStep === tourSteps.length - 1 ? 'Get Started!' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Welcome Message for Final Step */}
        {currentStep === tourSteps.length - 1 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">You're all set!</h4>
                <p className="text-sm text-green-700">
                  Welcome to the future of campus dining, {user.name.split(' ')[0]}! 
                  Enjoy exploring all the smart features we've built for you at UniBites.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
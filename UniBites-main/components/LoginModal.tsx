import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { User, Mail, Lock, Phone, Hash, Eye, EyeOff, UserPlus, LogIn, GraduationCap } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { localApi } from "../utils/local/storage.tsx";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  rollNumber: string;
  phone: string;
  userType: 'student' | 'staff' | 'admin';
}

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const feedback = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Include numbers');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('Include special characters');

  return {
    score,
    feedback: score < 3 ? feedback.slice(0, 2) : [], // Show only top 2 suggestions
    strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
  };
};

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    phone: '',
    userType: 'student'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await localApi.auth.login({
        email: loginData.email,
        password: loginData.password
      });

      onLogin(result);
      toast.success('Login successful!');
      resetForms();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Enhanced password validation
    if (signupData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    const passwordStrength = checkPasswordStrength(signupData.password);
    if (passwordStrength.score < 2) {
      toast.error(`Password is too weak: ${passwordStrength.feedback.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      const result = await localApi.auth.signup({
        email: signupData.email,
        password: signupData.password,
        name: signupData.name,
        phone: signupData.phone,
        userType: signupData.userType,
        rollNumber: signupData.rollNumber // Pass rollNumber to signup
      });

      onLogin(result);
      toast.success('Account created and logged in successfully!');
      resetForms();
    } catch (error) {
      console.error('Signup error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.includes('already exists') || errorMessage.includes('already been registered')) {
        toast.error('This email is already registered. Please sign in instead.');
        // Switch to login tab and prefill email
        setActiveTab('login');
        setLoginData(prev => ({
          ...prev,
          email: signupData.email
        }));
      } else if (errorMessage.includes('roll number already exists')) {
        toast.error('This roll number is already registered. Please use a different roll number.');
      } else if (errorMessage.includes('weak password')) {
        toast.error('Password is too weak. Please use a stronger password with at least 8 characters.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    setLoginData({ email: '', password: '' });
    setSignupData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      rollNumber: '',
      phone: '',
      userType: 'student'
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto mx-3 sm:mx-auto">
        <DialogHeader className="text-center">
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-3 rounded-full mx-auto mb-4 w-fit">
            <GraduationCap className="h-8 w-8 text-orange-600" />
          </div>
          <DialogTitle className="text-2xl">Welcome Back!</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to get started
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Up</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 min-h-[44px] touch-manipulation"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className="text-primary hover:underline font-medium"
              >
                Create one here
              </button>
            </div>

            <Separator />

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-2 text-center">Demo Credentials</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Admin:</span>
                  <code className="bg-background px-2 py-1 rounded">admin@unibites.com</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Password:</span>
                  <code className="bg-background px-2 py-1 rounded">Admin@123</code>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Student:</span>
                  <code className="bg-background px-2 py-1 rounded">student@college.edu</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Password:</span>
                  <code className="bg-background px-2 py-1 rounded">Student@123</code>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* User Type Selection */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={signupData.userType === 'student' ? 'default' : 'outline'}
                  onClick={() => setSignupData(prev => ({ ...prev, userType: 'student' }))}
                  className="h-12 text-xs"
                >
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Student
                </Button>
                <Button
                  type="button"
                  variant={signupData.userType === 'staff' ? 'default' : 'outline'}
                  onClick={() => setSignupData(prev => ({ ...prev, userType: 'staff' }))}
                  className="h-12 text-xs"
                >
                  <User className="h-4 w-4 mr-1" />
                  Staff
                </Button>
                <Button
                  type="button"
                  variant={signupData.userType === 'admin' ? 'default' : 'outline'}
                  onClick={() => setSignupData(prev => ({ ...prev, userType: 'admin' }))}
                  className="h-12 text-xs"
                >
                  <User className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your name"
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-roll">
                    {signupData.userType === 'student' ? 'Roll Number' : 'Employee ID'}
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-roll"
                      type="text"
                      placeholder={signupData.userType === 'student' ? 'e.g., CS21001' : 'e.g., EMP001'}
                      value={signupData.rollNumber}
                      onChange={(e) => setSignupData(prev => ({ ...prev, rollNumber: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={signupData.phone}
                    onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {signupData.password && (
                    <div className="space-y-1">
                      {(() => {
                        const strength = checkPasswordStrength(signupData.password);
                        return (
                          <>
                            <div className="flex gap-1">
                              <div className={`h-1 flex-1 rounded ${strength.score >= 1 ? 'bg-red-500' : 'bg-gray-200'}`} />
                              <div className={`h-1 flex-1 rounded ${strength.score >= 2 ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                              <div className={`h-1 flex-1 rounded ${strength.score >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                              <div className={`h-1 flex-1 rounded ${strength.score >= 4 ? 'bg-green-500' : 'bg-gray-200'}`} />
                              <div className={`h-1 flex-1 rounded ${strength.score >= 5 ? 'bg-green-600' : 'bg-gray-200'}`} />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Password strength: <span className={`font-medium ${
                                strength.strength === 'weak' ? 'text-red-500' :
                                strength.strength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                              }`}>
                                {strength.strength}
                              </span>
                              {strength.feedback.length > 0 && (
                                <span className="block mt-1">{strength.feedback.join(', ')}</span>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 min-h-[44px] touch-manipulation"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-primary hover:underline font-medium"
              >
                Sign in here
              </button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  );
}

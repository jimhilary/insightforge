import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import useAuthStore from '../store/authStore';
import { useDarkMode } from '../hooks/useDarkMode';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import DarkModeToggle from '../components/DarkModeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, Lock, WifiOff, ArrowRight, Zap } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, toggleDark] = useDarkMode();
  const isOnline = useOnlineStatus();
  
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isOnline) {
      setError('You are offline. Please check your internet connection.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let userCredential;
      
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;
      const token = await user.getIdToken();

      // Store in Zustand
      setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
      setToken(token);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      // User-friendly error messages
      let errorMessage = 'An error occurred. Please try again.';
      
      if (err.code) {
        switch (err.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address. Please check your email or create a new account.';
            break;
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Incorrect password. Please try again or reset your password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists. Please sign in instead.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use at least 6 characters.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          default:
            // Try to extract a readable message
            errorMessage = err.message
              .replace('Firebase: ', '')
              .replace('FirebaseError: ', '')
              .replace(/\(auth\/.*?\)\.?/g, '')
              .trim();
            if (!errorMessage || errorMessage.length < 10) {
              errorMessage = 'An error occurred. Please try again.';
            }
        }
      } else if (err.message) {
        errorMessage = err.message
          .replace('Firebase: ', '')
          .replace('FirebaseError: ', '')
          .replace(/\(auth\/.*?\)\.?/g, '')
          .trim() || 'An error occurred. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-4 relative overflow-hidden transition-colors duration-300">
      {/* Animated background blobs - light mode only */}
      <div className="absolute inset-0 overflow-hidden dark:hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle isDark={isDark} toggle={toggleDark} />
      </div>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-amber-500/90 dark:bg-amber-600/90 text-white px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
        </div>
      )}

      {/* Main auth card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] backdrop-blur-xl border border-[hsl(var(--border))] transition-colors duration-300">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3 hover:rotate-6 transition-transform duration-300">
            <Sparkles className="w-9 h-9 text-white" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              InsightForge
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 h-11"
                  disabled={loading}
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters long
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 text-sm text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 group" 
              disabled={loading || !isOnline}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center text-xs uppercase text-muted-foreground">
              {isLogin ? 'New here?' : 'Already have an account?'}
            </div>
            <div className="w-full border-t border-border"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="w-full h-11 border-2"
            disabled={loading}
          >
            {isLogin ? 'Create a new account' : 'Sign in instead'}
          </Button>

          {!isLogin && (
            <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1 text-blue-900 dark:text-blue-100">Why InsightForge?</p>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• AI-powered research assistant</li>
                  <li>• Smart document summarization</li>
                  <li>• Generate comprehensive reports</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;


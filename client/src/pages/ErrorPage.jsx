import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertTriangle, WifiOff, RefreshCw, Home, ArrowLeft } from 'lucide-react';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnlineStatus();

  // Get error details from location state or sessionStorage
  const getErrorFromStorage = () => {
    try {
      const stored = sessionStorage.getItem('lastError');
      if (stored) {
        const parsed = JSON.parse(stored);
        sessionStorage.removeItem('lastError'); // Clear after reading
        return parsed;
      }
    } catch (e) {
      console.error('Error reading error from storage:', e);
    }
    return null;
  };

  const storedError = getErrorFromStorage();
  const error = location.state?.error || storedError || {};
  const {
    title = 'Something went wrong',
    message = 'We encountered an issue while processing your request.',
    type = 'general',
    canRetry = true,
  } = error;

  // Determine if it's an offline error
  const isOfflineError = !isOnline || type === 'offline' || type === 'network';

  // Get user-friendly messages based on error type
  const getErrorDetails = () => {
    if (isOfflineError) {
      return {
        icon: WifiOff,
        title: 'You\'re Offline',
        message: 'It looks like you\'ve lost your internet connection. Please check your network and try again.',
        actionLabel: 'Check Connection',
        action: () => {
          if (isOnline) {
            navigate(-1);
          } else {
            window.location.reload();
          }
        },
      };
    }

    switch (type) {
      case 'server':
        return {
          icon: AlertTriangle,
          title: 'Server Error',
          message: 'Our servers are having trouble right now. Please try again in a few moments.',
          actionLabel: 'Try Again',
          action: () => navigate(-1),
        };
      case 'timeout':
        return {
          icon: AlertTriangle,
          title: 'Request Timed Out',
          message: 'The request took too long to complete. This might be due to a slow connection.',
          actionLabel: 'Retry',
          action: () => navigate(-1),
        };
      case 'unauthorized':
        return {
          icon: AlertTriangle,
          title: 'Session Expired',
          message: 'Your session has expired. Please sign in again to continue.',
          actionLabel: 'Go to Sign In',
          action: () => navigate('/auth'),
        };
      case 'notfound':
        return {
          icon: AlertTriangle,
          title: 'Not Found',
          message: 'The resource you\'re looking for doesn\'t exist or has been removed.',
          actionLabel: 'Go Home',
          action: () => navigate('/dashboard'),
        };
      default:
        return {
          icon: AlertTriangle,
          title,
          message,
          actionLabel: 'Go Back',
          action: () => navigate(-1),
        };
    }
  };

  const errorDetails = getErrorDetails();
  const Icon = errorDetails.icon;

  const handleRetry = () => {
    if (errorDetails.action) {
      errorDetails.action();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-4 relative transition-colors duration-300">
      {/* Main error card */}
      <Card className="w-full max-w-lg relative z-10 shadow-2xl bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))]">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center">
            <Icon className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              {errorDetails.title}
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400">
              {errorDetails.message}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Connection status */}
          {isOfflineError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                <WifiOff className="w-4 h-4" />
                <span>No internet connection detected</span>
              </div>
            </div>
          )}

          {/* Error code for debugging (only in development) */}
          {import.meta.env.DEV && error.code && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                Error Code: {error.code}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {canRetry && (
              <Button
                onClick={handleRetry}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isOfflineError && !isOnline}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {errorDetails.actionLabel}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Helpful tips */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              <strong className="text-slate-900 dark:text-white">What you can do:</strong>
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              {isOfflineError ? (
                <>
                  <li>Check your internet connection</li>
                  <li>Try refreshing the page</li>
                  <li>Check if other websites are working</li>
                </>
              ) : (
                <>
                  <li>Wait a moment and try again</li>
                  <li>Check your internet connection</li>
                  <li>If the problem persists, contact support</li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;


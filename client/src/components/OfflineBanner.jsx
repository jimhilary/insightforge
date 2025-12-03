import { useState } from 'react';
import { WifiOff, X } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const OfflineBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert className="fixed top-0 left-0 right-0 z-50 rounded-none border-b-2 border-red-500 bg-red-50 dark:bg-red-900/50 backdrop-blur-sm animate-in slide-in-from-top shadow-lg">
      <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
      <AlertDescription className="text-red-800 dark:text-red-200 font-medium flex items-center justify-between flex-1">
        <span>You are offline. Some features may not be available.</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 p-1 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </AlertDescription>
    </Alert>
  );
};

export default OfflineBanner;


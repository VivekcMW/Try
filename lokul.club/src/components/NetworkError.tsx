'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

/**
 * Network Error component for web
 * Shows when API calls fail or network is unavailable
 */
export function NetworkError({ 
  onRetry, 
  message = "Check your internet connection and try again." 
}: NetworkErrorProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gray-100 p-6">
            <WifiOff className="h-16 w-16 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {isOnline ? "Connection Error" : "You're Offline"}
        </h2>

        {/* Description */}
        <p className="text-base text-gray-600 mb-6 max-w-sm mx-auto">
          {message}
        </p>

        {/* Status indicator */}
        <div className="mb-6 flex items-center justify-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-500">
            {isOnline ? 'Internet Connected' : 'No Internet Connection'}
          </span>
        </div>

        {/* Action */}
        <button
          onClick={handleRetry}
          disabled={!isOnline}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#1D65AF] text-white font-medium hover:bg-[#165499] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </button>
      </div>
    </div>
  );
}

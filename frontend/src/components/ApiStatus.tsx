import React from 'react';
import { CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface ApiStatusProps {
  connected: boolean;
  className?: string;
}

export function ApiStatus({ connected, className = '' }: ApiStatusProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {connected ? (
        <>
          <div className="flex items-center space-x-1 text-green-600">
            <Wifi className="h-4 w-4" />
            <CheckCircle className="h-4 w-4" />
          </div>
          <span className="text-sm text-green-700 font-medium">
            AI Backend Connected
          </span>
        </>
      ) : (
        <>
          <div className="flex items-center space-x-1 text-amber-600">
            <WifiOff className="h-4 w-4" />
            <AlertCircle className="h-4 w-4" />
          </div>
          <span className="text-sm text-amber-700 font-medium">
            Demo Mode (Backend Offline)
          </span>
        </>
      )}
    </div>
  );
}
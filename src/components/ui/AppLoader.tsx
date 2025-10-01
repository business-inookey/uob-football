import React from 'react';
import { CustomLoaderCSS } from './CustomLoader';

interface AppLoaderProps {
  message?: string;
  showLogo?: boolean;
}

export function AppLoader({ 
  message = "Loading UoB Football...", 
  showLogo = true 
}: AppLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
      <div className="text-center space-y-8">
        {showLogo && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">UoB</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              UoB Football
            </h1>
          </div>
        )}
        
        <div className="space-y-4">
          <CustomLoaderCSS size="lg" color="#3B82F6" />
          <p className="text-muted-foreground text-lg">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export function InitialAppLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-xl">
            <span className="text-3xl font-bold text-white">UoB</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              UoB Football
            </h1>
            <p className="text-muted-foreground">
              Team Management System
            </p>
          </div>
        </div>
        
        {/* Loader */}
        <div className="space-y-4">
          <CustomLoaderCSS size="lg" color="#3B82F6" />
          <p className="text-muted-foreground text-lg">
            Initializing application...
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppLoader;

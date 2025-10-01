import React from 'react';
import { CustomLoaderCSS } from './CustomLoader';
import { AppLoader } from './AppLoader';
import { LoadingSpinner } from './LoadingSpinner';

// This component showcases all the different loader implementations
// It's for development/testing purposes only
export function LoaderShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-8 space-y-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Custom Loader Showcase</h1>
        
        {/* Different sizes */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Different Sizes</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <CustomLoaderCSS size="sm" />
              <p className="text-sm text-muted-foreground mt-2">Small</p>
            </div>
            <div className="text-center">
              <CustomLoaderCSS size="md" />
              <p className="text-sm text-muted-foreground mt-2">Medium</p>
            </div>
            <div className="text-center">
              <CustomLoaderCSS size="lg" />
              <p className="text-sm text-muted-foreground mt-2">Large</p>
            </div>
          </div>
        </div>

        {/* Different colors */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Different Colors</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <CustomLoaderCSS color="#3B82F6" />
              <p className="text-sm text-muted-foreground mt-2">Primary</p>
            </div>
            <div className="text-center">
              <CustomLoaderCSS color="#10B981" />
              <p className="text-sm text-muted-foreground mt-2">Success</p>
            </div>
            <div className="text-center">
              <CustomLoaderCSS color="#F59E0B" />
              <p className="text-sm text-muted-foreground mt-2">Warning</p>
            </div>
            <div className="text-center">
              <CustomLoaderCSS color="#EF4444" />
              <p className="text-sm text-muted-foreground mt-2">Error</p>
            </div>
          </div>
        </div>

        {/* LoadingSpinner component */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">LoadingSpinner Component</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <LoadingSpinner size="sm" />
              <p className="text-sm text-muted-foreground mt-2">Small</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="md" />
              <p className="text-sm text-muted-foreground mt-2">Medium</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-muted-foreground mt-2">Large</p>
            </div>
          </div>
        </div>

        {/* App Loader */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">App Loader</h2>
          <div className="space-y-4">
            <AppLoader message="Loading application..." showLogo={true} />
          </div>
        </div>

        {/* Usage Examples */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">Basic Usage:</h3>
              <pre className="bg-muted p-2 rounded mt-1">
{`import { CustomLoaderCSS } from '@/components/ui/CustomLoader';

<CustomLoaderCSS size="md" color="#3B82F6" />`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium">With LoadingSpinner:</h3>
              <pre className="bg-muted p-2 rounded mt-1">
{`import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="md" useCustom={true} />`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium">Full Page Loader:</h3>
              <pre className="bg-muted p-2 rounded mt-1">
{`import { AppLoader } from '@/components/ui/AppLoader';

<AppLoader message="Loading..." showLogo={true} />`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

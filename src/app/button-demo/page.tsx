"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
// import { AnimatedButton } from '@/components/ui/AnimatedButton';

export default function ButtonDemoPage() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Animated Button Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Experience the new animated button system with hover effects and transitions
          </p>
        </div>

        {/* Button Variants */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-foreground">Button Variants</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-medium">Primary Button</h3>
              <Button 
                dataTitle="Primary Action"
                dataText="Processing..."
                dataStart="Completed!"
              >
                Click Me
              </Button>
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-medium">Success Button</h3>
              <Button 
                variant="success"
                dataTitle="Success Action"
                dataText="Saving..."
                dataStart="Saved!"
              >
                Save Changes
              </Button>
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-medium">Destructive Button</h3>
              <Button 
                variant="destructive"
                dataTitle="Delete Item"
                dataText="Deleting..."
                dataStart="Deleted!"
              >
                Delete
              </Button>
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-medium">Outline Button</h3>
              <Button 
                variant="outline"
                dataTitle="Secondary Action"
                dataText="Loading..."
                dataStart="Done!"
              >
                Cancel
              </Button>
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-medium">Ghost Button</h3>
              <Button 
                variant="ghost"
                dataTitle="Ghost Action"
                dataText="Working..."
                dataStart="Finished!"
              >
                Ghost Button
              </Button>
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-medium">Active State</h3>
              <Button 
                isActive={isActive}
                onClick={() => setIsActive(!isActive)}
                dataTitle="Toggle Active"
                dataText="Toggling..."
                dataStart="Toggled!"
              >
                {isActive ? 'Active' : 'Inactive'}
              </Button>
            </div>
          </div>
        </div>

        {/* Button Sizes */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-foreground">Button Sizes</h2>
          
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              size="sm"
              dataTitle="Small Button"
              dataText="Small Action..."
              dataStart="Small Done!"
            >
              Small
            </Button>
            
            <Button 
              size="md"
              dataTitle="Medium Button"
              dataText="Medium Action..."
              dataStart="Medium Done!"
            >
              Medium
            </Button>
            
            <Button 
              size="lg"
              dataTitle="Large Button"
              dataText="Large Action..."
              dataStart="Large Done!"
            >
              Large
            </Button>
          </div>
        </div>

        {/* Interactive Examples */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-foreground">Interactive Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-medium">Form Actions</h3>
              <div className="space-y-3">
                <Button 
                  dataTitle="Submit Form"
                  dataText="Submitting..."
                  dataStart="Form Submitted!"
                >
                  Submit
                </Button>
                <Button 
                  variant="outline"
                  dataTitle="Reset Form"
                  dataText="Resetting..."
                  dataStart="Form Reset!"
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-medium">Navigation Actions</h3>
              <div className="space-y-3">
                <Button 
                  dataTitle="Next Page"
                  dataText="Loading..."
                  dataStart="Page Loaded!"
                >
                  Next
                </Button>
                <Button 
                  variant="outline"
                  dataTitle="Previous Page"
                  dataText="Going Back..."
                  dataStart="Back!"
                >
                  Previous
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900">Button Features</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Hover Effects:</strong> Expanding border animations with color transitions</li>
                <li>• <strong>Text Animation:</strong> Smooth text transitions on hover</li>
                <li>• <strong>Active States:</strong> Special animations for active/loading states</li>
                <li>• <strong>Multiple Variants:</strong> Primary, success, destructive, outline, ghost</li>
                <li>• <strong>Size Options:</strong> Small, medium, and large button sizes</li>
                <li>• <strong>Accessibility:</strong> Proper focus states and keyboard navigation</li>
                <li>• <strong>Custom Data:</strong> Support for custom hover text and states</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="card p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-2">
              <h3 className="font-medium text-green-900">How to Use</h3>
              <p className="text-sm text-green-800">
                Hover over any button to see the animated border effects and text transitions. 
                The buttons use CSS animations for smooth performance and include data attributes 
                for custom hover text and completion messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

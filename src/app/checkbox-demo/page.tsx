"use client";
import { useState } from 'react';
import NeonCheckbox from '@/components/ui/NeonCheckbox';

export default function CheckboxDemo() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Neon Checkbox Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Interactive demonstration of the neon checkbox component
          </p>
        </div>

        {/* Demo Section */}
        <div className="card p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Examples */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Basic Examples</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <NeonCheckbox
                    checked={checked1}
                    onChange={setChecked1}
                  />
                  <div>
                    <div className="font-medium text-foreground">Unchecked State</div>
                    <div className="text-sm text-muted-foreground">Click to toggle</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <NeonCheckbox
                    checked={checked2}
                    onChange={setChecked2}
                  />
                  <div>
                    <div className="font-medium text-foreground">Checked State</div>
                    <div className="text-sm text-muted-foreground">Pre-checked example</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <NeonCheckbox
                    checked={checked3}
                    onChange={setChecked3}
                    disabled={disabled}
                  />
                  <div>
                    <div className="font-medium text-foreground">Disabled State</div>
                    <div className="text-sm text-muted-foreground">Toggle disabled state below</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Controls */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Interactive Controls</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setDisabled(!disabled)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {disabled ? 'Enable' : 'Disable'} Checkbox
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {disabled ? 'Checkbox is disabled' : 'Checkbox is enabled'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setChecked1(!checked1);
                      setChecked2(!checked2);
                      setChecked3(!checked3);
                    }}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Toggle All
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Toggle all checkboxes at once
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Neon Glow Effect</h3>
                <p className="text-sm text-blue-800">
                  Beautiful neon glow animation when checked with particle effects
                </p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Smooth Animations</h3>
                <p className="text-sm text-green-800">
                  Fluid transitions and hover effects for enhanced user experience
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Accessible</h3>
                <p className="text-sm text-purple-800">
                  Full keyboard navigation and screen reader support
                </p>
              </div>
            </div>
          </div>

          {/* Usage Example */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Usage Example</h2>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`import NeonCheckbox from '@/components/ui/NeonCheckbox';

function MyComponent() {
  const [checked, setChecked] = useState(false);
  
  return (
    <NeonCheckbox
      checked={checked}
      onChange={setChecked}
      disabled={false}
      className="optional-custom-class"
    />
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

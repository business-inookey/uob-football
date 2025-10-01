"use client";
import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';

export default function NavDemoPage() {
  const { isNavOpen, toggleNav, closeNav, openNav } = useNavigation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Navigation Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Test the new floating navigation toggle and menu system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Navigation Controls</h2>
            <div className="space-y-3">
              <button 
                onClick={toggleNav}
                className="btn btn-primary w-full"
              >
                Toggle Navigation
              </button>
              <button 
                onClick={openNav}
                className="btn btn-outline w-full"
              >
                Open Navigation
              </button>
              <button 
                onClick={closeNav}
                className="btn btn-outline w-full"
              >
                Close Navigation
              </button>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Current State</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Navigation Open:</span>
                <span className={`badge ${isNavOpen ? 'badge-primary' : 'badge-outline'}`}>
                  {isNavOpen ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Navigation Toggle</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fixed position in top-right corner</li>
                <li>• Animated toggle switch design</li>
                <li>• Hover effects and transitions</li>
                <li>• Dark mode support</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Navigation Menu</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Dropdown menu with all pages</li>
                <li>• Active page highlighting</li>
                <li>• Smooth animations</li>
                <li>• Backdrop blur effect</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">User Experience</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Escape key to close</li>
                <li>• Click outside to close</li>
                <li>• Auto-close on navigation</li>
                <li>• Prevents body scroll when open</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Responsive Design</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Works on all screen sizes</li>
                <li>• Touch-friendly on mobile</li>
                <li>• Consistent across pages</li>
                <li>• Accessible design</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-1">
              <h3 className="font-medium text-blue-900">How to Use</h3>
              <p className="text-sm text-blue-800">
                Click the toggle switch in the top-right corner to open the navigation menu. 
                The menu will show all available pages with the current page highlighted. 
                You can close it by clicking the toggle again, pressing Escape, or clicking outside the menu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

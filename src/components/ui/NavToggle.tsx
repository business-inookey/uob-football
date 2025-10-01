"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface NavToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function NavToggle({ isOpen, onToggle, className }: NavToggleProps) {
  return (
    <div className={cn("fixed top-4 right-4 z-50", className)}>
      <label className="nav-switch">
        <input 
          type="checkbox" 
          checked={isOpen}
          onChange={onToggle}
          className="sr-only"
        />
        <span className="nav-wrapper">
          <span className="nav-row">
            <span className="nav-dot" />
            <span className="nav-dot" />
          </span>
          <span className="nav-row nav-row-bottom">
            <span className="nav-dot" />
            <span className="nav-dot" />
          </span>
          <span className="nav-row-vertical">
            <span className="nav-dot" />
            <span className="nav-dot nav-middle-dot" />
            <span className="nav-dot" />
          </span>
          <span className="nav-row-horizontal">
            <span className="nav-dot" />
            <span className="nav-dot nav-middle-dot-horizontal" />
            <span className="nav-dot" />
          </span>
        </span>
      </label>
    </div>
  );
}

export default NavToggle;

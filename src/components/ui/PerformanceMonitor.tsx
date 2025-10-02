"use client";
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export function PerformanceMonitor({ 
  componentName 
}: { 
  componentName: string;
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    
    // Monitor memory usage if available
    const memoryInfo = (performance as PerformanceEntry).memory;
    
    const measureRender = () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics({
        loadTime: renderTime,
        renderTime,
        memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize : undefined
      });
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measureRender);
  }, [componentName]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-50">
      <div className="font-mono">
        <div>{componentName}</div>
        <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
        {metrics.memoryUsage && (
          <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
        )}
      </div>
    </div>
  );
}

export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    return (
      <>
        <Component {...props} />
        <PerformanceMonitor componentName={componentName} />
      </>
    );
  };
}

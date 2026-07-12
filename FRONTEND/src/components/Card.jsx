import React from 'react';
import { cn } from '../utils/cn';

export const Card = ({ 
  children, 
  className, 
  glass = false, 
  hoverable = false, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-200",
        glass && "glass border-white/5 shadow-lg",
        hoverable && "hover:shadow-md hover:border-primary/25 hover:-translate-y-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn("text-xl font-semibold leading-none tracking-tight font-display text-foreground", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn("flex items-center p-6 pt-0 border-t border-border/50 mt-4", className)} {...props}>
    {children}
  </div>
);

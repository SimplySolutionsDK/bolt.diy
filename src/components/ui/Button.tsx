import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export default function Button({ 
  children, 
  className, 
  variant = 'primary', 
  isLoading = false,
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
         className={clsx(
            'w-auto flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
            variant === 'primary' && 'border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
            variant === 'secondary' && 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
            (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
            className
          )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
}
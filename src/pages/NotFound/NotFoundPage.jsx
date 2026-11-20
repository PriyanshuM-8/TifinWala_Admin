import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-light-main text-light-text">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
        <h2 className="text-base font-semibold">Page Not Found</h2>
        <p className="text-xs text-light-muted leading-relaxed">
          The administration route you are seeking does not exist or has been relocated.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-xs hover:bg-brand-primary-dark transition-colors cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

import React from 'react';

interface PageTemplateProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ title, description, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
          {description && (
            <p className="text-gray-600 mb-6">{description}</p>
          )}
          {children || (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚧</div>
              <p className="text-gray-500">This page is under construction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageTemplate;

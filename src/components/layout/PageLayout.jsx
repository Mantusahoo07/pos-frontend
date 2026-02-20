import React from 'react';
import BottomNav from '../shared/BottomNav';

const PageLayout = ({ children, title }) => {
  return (
    <div className="bg-[#1f1f1f] min-h-screen flex flex-col">
      {/* Optional Header */}
      {title && (
        <div className="flex-shrink-0 px-4 py-3 bg-[#1a1a1a] border-b border-[#333]">
          <h1 className="text-white text-xl font-bold">{title}</h1>
        </div>
      )}
      
      {/* Main Content with bottom padding for BottomNav */}
      <div className="flex-1 overflow-auto pb-16">
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default PageLayout;

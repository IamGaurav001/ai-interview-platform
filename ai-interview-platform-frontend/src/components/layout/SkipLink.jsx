import React from 'react';

const SkipLink = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-lg outline-none ring-2 ring-white"
    >
      Skip to content
    </a>
  );
};

export default SkipLink;

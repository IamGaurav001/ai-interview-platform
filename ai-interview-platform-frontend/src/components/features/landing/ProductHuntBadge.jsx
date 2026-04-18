import React from 'react';

const ProductHuntBadge = ({ className = "", darkMode = false }) => {
  // TODO: Replace 'YOUR_POST_ID' with your actual Product Hunt Post ID
  // TODO: Replace 'prephire' with your actual Product Hunt post slug if different
  const postId = "YOUR_POST_ID"; 
  const postSlug = "prephire";
  const theme = darkMode ? "dark" : "light";

  return (
    <a 
      href={`https://www.producthunt.com/posts/${postSlug}?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-${postSlug}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-block hover:opacity-90 transition-opacity ${className}`}
    >
      <img 
        src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${postId}&theme=${theme}`} 
        alt="PrepHire - AI Interview Coach | Product Hunt" 
        style={{ width: '250px', height: '54px' }} 
        width="250" 
        height="54" 
      />
    </a>
  );
};

export default ProductHuntBadge;

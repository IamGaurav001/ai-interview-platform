import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, url, image }) => {
  const siteTitle = 'PrepHire - Practice & Ace Your Interviews';
  const defaultDescription = 'PrepHire is an AI-powered interview preparation platform that helps you practice and ace your interviews with real-time feedback.';
  const defaultKeywords = 'AI interview, interview practice, mock interview, interview preparation, career growth';
  const siteUrl = 'https://prephire.co';
  const defaultImage = 'https://prephire.co/og-image.png'; // Make sure this exists or update to a valid URL

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title ? `${title} | PrepHire` : siteTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={url || siteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || siteUrl} />
      <meta property="twitter:title" content={title || siteTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};

export default SEO;

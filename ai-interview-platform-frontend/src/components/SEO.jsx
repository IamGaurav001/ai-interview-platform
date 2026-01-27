import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { logEvent, logPageView } from '../config/amplitude';

const SEO = ({ title, description, keywords, url, image }) => {
  const location = useLocation();
  const siteTitle = 'PrepHire - Practice & Ace Your Interviews';
  const defaultDescription = 'PrepHire is an AI-powered interview preparation platform that helps you practice and ace your interviews with real-time feedback.';
  const defaultKeywords = 'AI interview, interview practice, mock interview, interview preparation, career growth';
  const siteUrl = 'https://prephire.co';
  const defaultImage = 'https://prephire.co/og-image.png';

  const PAGE_NAMES = {
    '/': 'Landing Page',
    '/login': 'Login',
    '/register': 'Register',
    '/dashboard': 'Dashboard',
    '/sequential-interview': 'Sequential Interview',
    '/interview-flow': 'Interview Flow',
    '/history': 'History',
    '/upload-resume': 'Resume Upload',
    '/settings': 'Settings',
    '/forgot-password': 'Forgot Password',
    '/demo': 'Watch Demo',
    '/about': 'About Us',
    '/contact': 'Contact Us',
    '/privacy': 'Privacy Policy',
    '/terms': 'Terms of Service',
    '/features': 'Features',
    '/pricing': 'Pricing',
    '/refund': 'Refund Policy',
    '/shipping': 'Shipping Policy',
    '/verify-email': 'Verify Email'
  };

  useEffect(() => {
    const pageName = PAGE_NAMES[location.pathname] || title || 'Unknown Page';
    logPageView(pageName, { 
      path: location.pathname,
      title: title ? `${title} | PrepHire` : siteTitle
    });
  }, [location.pathname, title]);

  return (
    <Helmet>
      <title>{title ? `${title} | PrepHire` : siteTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={url || siteUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || siteUrl} />
      <meta property="twitter:title" content={title || siteTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};

export default SEO;

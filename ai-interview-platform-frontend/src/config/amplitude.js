import * as amplitude from '@amplitude/analytics-browser';

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY || 'YOUR_AMPLITUDE_API_KEY';

const isAmplitudeEnabled = () => {
  return AMPLITUDE_API_KEY && AMPLITUDE_API_KEY !== 'YOUR_AMPLITUDE_API_KEY';
};

export const initAmplitude = () => {
  if (!isAmplitudeEnabled()) return;
  
  amplitude.init(AMPLITUDE_API_KEY, {
    defaultTracking: false,
    logLevel: 0, // Disable logging to prevent console noise from ad blockers
  });
};

export const logEvent = (eventName, eventProperties) => {
  if (!isAmplitudeEnabled()) return;
  amplitude.track(eventName, eventProperties);
};

export const setUserId = (userId) => {
  if (!isAmplitudeEnabled()) return;
  
  if (userId) {
    amplitude.setUserId(userId);
  } else {
    amplitude.setUserId(null);
  }
};

export const setUserProperties = (properties) => {
  if (!isAmplitudeEnabled()) return;

  const identify = new amplitude.Identify();
  Object.keys(properties).forEach((key) => {
    identify.set(key, properties[key]);
  });
  amplitude.identify(identify);
};

let lastPagePath = null;
let lastPageLogTime = 0;

export const logPageView = (pageName, properties) => {
  const now = Date.now();
  const path = properties.path;

  if (path === lastPagePath && (now - lastPageLogTime < 1000)) {
    console.log('Duplicate Page View ignored:', path);
    return;
  }

  lastPagePath = path;
  lastPageLogTime = now;
  
  logEvent(`Page View: ${pageName}`, properties);
};

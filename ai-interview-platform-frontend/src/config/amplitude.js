import * as amplitude from '@amplitude/analytics-browser';

// Replace 'YOUR_AMPLITUDE_API_KEY' with your actual Amplitude API Key
const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY || 'YOUR_AMPLITUDE_API_KEY';

export const initAmplitude = () => {
  amplitude.init(AMPLITUDE_API_KEY, {
    defaultTracking: false,
  });
};

export const logEvent = (eventName, eventProperties) => {
  amplitude.track(eventName, eventProperties);
};

export const setUserId = (userId) => {
  if (userId) {
    amplitude.setUserId(userId);
    console.log('Amplitude User ID set:', userId);
  } else {
    amplitude.setUserId(null);
    console.log('Amplitude User ID cleared');
  }
};

export const setUserProperties = (properties) => {
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

  // Debounce: Ignore if same path within 1000ms
  if (path === lastPagePath && (now - lastPageLogTime < 1000)) {
    console.log('Duplicate Page View ignored:', path);
    return;
  }

  lastPagePath = path;
  lastPageLogTime = now;
  
  logEvent(`Page View: ${pageName}`, properties);
};

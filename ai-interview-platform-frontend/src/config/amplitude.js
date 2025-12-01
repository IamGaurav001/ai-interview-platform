import * as amplitude from '@amplitude/analytics-browser';

// Replace 'YOUR_AMPLITUDE_API_KEY' with your actual Amplitude API Key
const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY || 'YOUR_AMPLITUDE_API_KEY';

export const initAmplitude = () => {
  amplitude.init(AMPLITUDE_API_KEY, {
    defaultTracking: true,
  });
};

export const logEvent = (eventName, eventProperties) => {
  amplitude.track(eventName, eventProperties);
};

export const setUserId = (userId) => {
  amplitude.setUserId(userId);
};

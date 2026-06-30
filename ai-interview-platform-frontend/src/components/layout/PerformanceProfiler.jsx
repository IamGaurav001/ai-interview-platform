import React, { Profiler } from "react";
import { logEvent } from "../../config/amplitude";

/**
 * PerformanceProfiler wraps its children in a React Profiler to track rendering timing.
 * In development, it prints nicely styled performance logs to the console.
 * In production/analytics mode, it logs slow renders (exceeding `threshold` ms) to Amplitude.
 *
 * @param {string} id - Unique identifier for the component tree being profiled.
 * @param {React.ReactNode} children - Component tree to profile.
 * @param {number} threshold - Duration in milliseconds; renders exceeding this are flagged (default: 16ms, representing ~60fps frame budget).
 * @param {boolean} logToAnalytics - Whether to log slow render events to Amplitude.
 */
export const PerformanceProfiler = ({ id, children, threshold = 16, logToAnalytics = false }) => {
  const onRenderCallback = (
    profilerId,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    // Premium color-coded console logging in development mode
    if (import.meta.env.DEV) {
      const phaseColor = phase === "mount" ? "#10B981" : "#3B82F6"; // Green for mount, Blue for update
      const durationColor = actualDuration > threshold ? "#EF4444" : "#10B981"; // Red for slow, Green for fast
      
      console.log(
        `%c[React Profiler: ${profilerId}]%c ${phase.toUpperCase()} | Actual: %c${actualDuration.toFixed(2)}ms%c | Base: ${baseDuration.toFixed(2)}ms`,
        `color: ${phaseColor}; font-weight: bold; background: #f1f5f9; padding: 2px 4px; border-radius: 4px;`,
        "color: inherit;",
        `color: ${durationColor}; font-weight: bold;`,
        "color: inherit;"
      );
    }

    // Report slow rendering in production if analytics integration is requested
    if (logToAnalytics && actualDuration > threshold) {
      logEvent("React Performance Alert", {
        componentId: profilerId,
        phase,
        actualDuration: parseFloat(actualDuration.toFixed(2)),
        baseDuration: parseFloat(baseDuration.toFixed(2)),
        threshold,
        path: window.location.pathname
      });
    }
  };

  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
};

export default PerformanceProfiler;

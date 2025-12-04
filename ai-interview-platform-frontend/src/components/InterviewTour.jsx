import React, { useState, useEffect, useMemo } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const InterviewTour = ({ start, onFinish, type = 'sequential' }) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (start) {
      setRun(true);
    }
  }, [start]);

  const steps = useMemo(() => {
    const sequentialSteps = [
      {
        target: '[data-tour="question-area"]',
        title: 'Question Display',
        content: 'Here you will see the interview question. Read it carefully before answering.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="audio-control"]',
        title: 'Audio Control',
        content: 'Prefer listening? Click here to hear the AI read the question aloud.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="answer-input"]',
        title: 'Your Answer',
        content: 'Type your detailed response here. Make sure to be specific and provide examples.',
        placement: 'top',
      },
      {
        target: '[data-tour="voice-input"]',
        title: 'Voice Input',
        content: 'Want to practice speaking? Use this button to record your answer instead of typing.',
        placement: 'top',
      },
      {
        target: '[data-tour="submit-answer"]',
        title: 'Submit',
        content: 'When you are ready, click here to submit your answer and get instant AI feedback.',
        placement: 'top',
      },
      {
        target: '[data-tour="exit-session"]',
        title: 'Exit Session',
        content: 'Need to leave early? You can exit the session here. Note that progress might not be saved.',
        placement: 'bottom',
      },
    ];

    const flowSteps = [
      {
        target: '[data-tour="question-display"]',
        title: 'Prism AI Interviewer',
        content: 'Prism will present questions here. It adapts based on your responses!',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="tts-control"]',
        title: 'Listen to Question',
        content: 'Click here to listen to the question. Great for practicing listening skills.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="voice-settings"]',
        title: 'Voice Settings',
        content: 'Customize your interviewer! Click here to choose between different AI voices.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="answer-area"]',
        title: 'Answer Area',
        content: 'Type your answer here. The AI looks for clarity, confidence, and correctness.',
        placement: 'top',
      },
      {
        target: '[data-tour="mic-button"]',
        title: 'Voice Mode',
        content: 'Practice your speaking skills! Click to record your answer.',
        placement: 'top',
      },
      {
        target: '[data-tour="pause-interview"]',
        title: 'Pause & Resume',
        content: 'Need a break? Click here to pause the interview. You can resume whenever you are ready.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="reset-interview"]',
        title: 'Reset Interview',
        content: 'Made a mistake? Click here to reset the interview and start fresh. Note: This can only be done once!',
        placement: 'bottom',
      },
      {
        target: '[data-tour="end-interview"]',
        title: 'Finish',
        content: 'Click here when you want to end the interview. Your results will be saved and a credit will be deducted. If you haven\'t answered any questions, no credit will be deducted.',
        placement: 'bottom',
      },
    ];

    return type === 'sequential' ? sequentialSteps : flowSteps;
  }, [type]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (onFinish) onFinish();
    }
  };

  const Tooltip = ({
    continuous,
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    tooltipProps,
  }) => (
    <div
      {...tooltipProps}
      className="bg-white rounded-2xl shadow-2xl border border-indigo-100 p-5 sm:p-6 max-w-[90vw] sm:max-w-sm mx-auto relative overflow-hidden"
    >
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full bg-indigo-50 blur-xl"></div>
      
      <div className="relative z-10">
        {step.title && (
          <h4 className="text-lg font-bold text-indigo-900 mb-2">{step.title}</h4>
        )}
        <div className="text-sm text-slate-600 leading-relaxed mb-6">
          {step.content}
        </div>

        <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
          <div className="flex gap-2">
            {index > 0 && (
              <button
                {...backProps}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
             {!continuous && (
               <button {...closeProps} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600">
                 Close
               </button>
             )}
            {continuous && (
              <button
                {...primaryProps}
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {index === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      tooltipComponent={Tooltip}
      disableScrolling={true}
      floaterProps={{
        disableAnimation: true,
      }}
      styles={{
        options: {
          zIndex: 10000,
        },
        spotlight: {
          borderRadius: '16px',
        }
      }}
    />
  );
};

export default InterviewTour;

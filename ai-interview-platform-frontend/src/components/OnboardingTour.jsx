import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../api/userAPI';

const OnboardingTour = ({ start, onFinish }) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (start) {
      setRun(true);
    }
  }, [start]);

  const isMobile = window.innerWidth < 768;

  const steps = [
    {
      target: 'body',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2 text-indigo-900">Welcome to PrepHire! 👋</h3>
          <p className="text-slate-600">
            Your personal AI interview coach. We're here to help you practice, improve, and land your dream job.
            Let's show you around your new command center.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    // Only show navbar steps on desktop
    ...(!isMobile ? [
      {
        target: '[data-tour="nav-dashboard"]',
        title: 'Dashboard',
        content: 'Your central hub. Return here anytime to see your stats and start new interviews.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="nav-history"]',
        title: 'Interview History',
        content: 'Access all your past sessions, detailed feedback, and performance trends.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="nav-resume"]',
        title: 'Resume Management',
        content: 'Keep your resume updated to ensure the AI asks relevant questions.',
        placement: 'bottom',
      },
    ] : []),
    {
      target: '[data-tour="start-interview"]',
      title: 'Start Your Practice Session',
      content: (
        <div className="space-y-2">
          <p>This is where the magic happens. Click here to begin a new AI-led interview.</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Personalized:</strong> Questions are tailored to your uploaded resume.</li>
            <li><strong>Real-time:</strong> Experience a realistic interview environment.</li>
            <li><strong>AI Feedback:</strong> Get instant analysis on your answers.</li>
          </ul>
        </div>
      ),
    },
    {
      target: '[data-tour="stats-cards"]',
      title: 'Your Performance Dashboard',
      content: (
        <div className="space-y-2">
          <p>Keep track of your growth and resources here:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Total Interviews:</strong> See how many sessions you've completed.</li>
            <li><strong>Average Score:</strong> Watch your skills improve over time.</li>
            <li><strong>Credits:</strong> You get <strong>2 free interviews</strong> every month! Need more? You can easily purchase additional credits here.</li>
          </ul>
        </div>
      ),
    },
    {
      target: '[data-tour="recent-interviews"]',
      title: 'Review & Improve',
      content: (
        <div className="space-y-2">
          <p>Don't just practice—learn. This section shows your recent Q&A history.</p>
          <p>Review the <strong>AI's feedback</strong> on your clarity, confidence, and technical accuracy to understand exactly where you can do better next time.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="pro-tips"]',
      title: 'Expert Advice',
      content: (
        <p>Stuck or need motivation? Check this section for rotating pro tips on interview etiquette, resume building, and soft skills to give you that extra edge.</p>
      ),
    },
    // Only show profile step on desktop
    ...(!isMobile ? [
      {
        target: '[data-tour="nav-profile"]',
        title: 'Your Profile',
        content: 'Manage your account settings, subscription, and sign out from here.',
        placement: 'bottom',
      },
    ] : []),
    {
      target: 'body',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2 text-indigo-900">Ready to Ace It? 🚀</h3>
          <p className="text-slate-600">
            You're all set! Remember, consistency is key. Start your first interview now and take the first step towards your next career milestone.
          </p>
        </div>
      ),
      placement: 'center',
    }
  ];

  const handleJoyrideCallback = async (data) => {
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

export default OnboardingTour;

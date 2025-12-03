import React from "react";
import PageLayout from "../components/PageLayout";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "../components/SEO";

const Pricing = () => {

  return (
    <PageLayout>
      <SEO title="Pricing" description="Simple, transparent pricing for your interview preparation. Pay-as-you-go or value bundles." />
      <div className="bg-slate-50 min-h-screen flex flex-col justify-center py-12 sm:py-16">
        <div className="mx-auto max-w-screen-2xl px-6 lg:px-8 w-full">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Invest in your career with <span className="text-blue-600">PrepHire</span>
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Pay as you use Header */}
          <div className="mt-8 flex justify-center">
            <div className="relative flex bg-blue-50 rounded-full px-4 py-1.5 shadow-sm border border-blue-100">
              <span className="text-sm font-semibold text-blue-700">
                Simple Pay-As-You-Go Pricing
              </span>
            </div>
          </div>

          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-y-8 sm:mt-12 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
            {/* Single Interview Tier */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="rounded-3xl p-8 ring-1 ring-slate-200 bg-white/60 backdrop-blur-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-slate-900">Single Interview</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">Perfect for a quick practice session.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">₹19</span>
                  <span className="text-sm font-semibold leading-6 text-slate-600">/interview</span>
                </p>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                  {['1 AI Interview', 'Instant Feedback', 'Standard Analysis'].map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/dashboard"
                className="mt-8 block rounded-xl py-2.5 px-3 text-center text-sm font-semibold leading-6 text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
              >
                Buy Now
              </Link>
            </motion.div>

            {/* Pro Tier (Highlighted) */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="rounded-3xl p-8 ring-2 ring-blue-600 bg-white shadow-xl relative flex flex-col justify-between transform scale-105 z-10"
            >
              <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-blue-600 px-3 py-1 text-center text-xs font-semibold leading-5 text-white shadow-sm">
                Most Popular
              </div>
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-blue-600">Value Bundle</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">Best value for serious preparation.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">₹49</span>
                  <span className="text-sm font-semibold leading-6 text-slate-600">/3 interviews</span>
                </p>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                  {['3 Premium Interviews', 'Detailed Voice Analysis', 'Resume-Tailored Questions', 'Priority Support'].map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/dashboard"
                className="mt-8 block rounded-xl bg-blue-600 py-2.5 px-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all hover:shadow-lg"
              >
                Buy Credits
              </Link>
            </motion.div>

            {/* Enterprise Tier */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="rounded-3xl p-8 ring-1 ring-slate-200 bg-white/60 backdrop-blur-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-slate-900">Enterprise</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">Custom solutions for organizations.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">Custom</span>
                </p>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                  {['Unlimited Interviews', 'Admin Dashboard', 'Custom Question Banks', 'API Access', 'Dedicated Account Manager'].map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/contact"
                className="mt-8 block rounded-xl py-2.5 px-3 text-center text-sm font-semibold leading-6 text-slate-600 ring-1 ring-inset ring-slate-200 hover:ring-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
              >
                Contact Sales
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Pricing;

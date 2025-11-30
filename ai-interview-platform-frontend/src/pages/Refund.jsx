import React from "react";
import PageLayout from "../components/PageLayout";
import { RefreshCcw } from "lucide-react";

const Refund = () => {
  return (
    <PageLayout>
      <div className="bg-slate-50 min-h-screen py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <RefreshCcw className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
              Cancellation & Refund Policy
            </h1>
            <p className="text-lg text-slate-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 prose prose-lg prose-blue max-w-none">
            <p className="lead">
              At PrepHire, we strive to provide the best possible experience for our users. If you are not entirely satisfied with your purchase, we're here to help.
            </p>

            <h3>1. Subscription Cancellation</h3>
            <p>
              You may cancel your subscription at any time. Your subscription will remain active until the end of the current billing period, after which it will not renew. To cancel, please go to your account settings or contact our support team.
            </p>

            <h3>2. Refund Eligibility</h3>
            <p>
              We offer a 7-day money-back guarantee for all new subscriptions. If you are not satisfied with our service within the first 7 days of your initial purchase, you may request a full refund.
            </p>
            <p>
              Refunds are not available for:
            </p>
            <ul>
              <li>Renewals of existing subscriptions.</li>
              <li>Partial billing periods.</li>
              <li>Accounts that have violated our Terms of Service.</li>
            </ul>

            <h3>3. Requesting a Refund</h3>
            <p>
              To request a refund, please contact our support team at support@prephire.co.in with your order details and the reason for your request. We will review your request and process it within 5-7 business days if approved.
            </p>

            <h3>4. Processing Time</h3>
            <p>
              Once your refund is approved, it will be processed, and a credit will automatically be applied to your original method of payment within a certain amount of days, depending on your card issuer's policies.
            </p>

            <h3>5. Contact Us</h3>
            <p>
              If you have any questions about our Cancellation & Refund Policy, please contact us.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Refund;

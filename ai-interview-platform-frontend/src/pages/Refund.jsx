import React from "react";
import PageLayout from "../components/PageLayout";
import { RefreshCw } from "lucide-react";
import SEO from "../components/SEO";
import Footer from "../components/landing/Footer";

const Refund = () => {
  return (
    <PageLayout>
      <SEO title="Refund Policy" description="Read PrepHire's Refund Policy. We strive for customer satisfaction with our AI interview preparation services." />
      <div className="bg-slate-50 min-h-screen py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
              Refund Policy
            </h1>
            <p className="text-lg text-slate-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 prose prose-lg prose-blue max-w-none">
            <p className="lead">
              At PrepHire, we strive to provide the best AI interview preparation experience. If you are not satisfied with our services, please review our refund policy below.
            </p>

            <h3>1. Refund Eligibility</h3>
            <p>
              We offer refunds under the following circumstances:
            </p>
            <ul>
              <li><strong>Technical Issues:</strong> If you experience persistent technical issues that prevent you from using the platform and our support team is unable to resolve them within a reasonable timeframe.</li>
              <li><strong>Accidental Purchase:</strong> If you made a purchase by mistake and have not used any of the purchased credits or features. You must contact us within 24 hours of the transaction.</li>
              <li><strong>Service Not Delivered:</strong> If you were charged but did not receive the credits or features you purchased.</li>
            </ul>

            <h3>2. Non-Refundable Circumstances</h3>
            <p>
              Refunds are generally not provided in the following cases:
            </p>
            <ul>
              <li><strong>Change of Mind:</strong> If you simply change your mind after purchasing credits or a subscription.</li>
              <li><strong>Used Credits:</strong> If you have already used the purchased credits or completed interview sessions.</li>
              <li><strong>Dissatisfaction with AI Feedback:</strong> While we strive for high-quality AI analysis, subjective dissatisfaction with the feedback provided is not a valid ground for a refund, as AI models are constantly evolving.</li>
            </ul>

            <h3>3. How to Request a Refund</h3>
            <p>
              To request a refund, please contact our support team at <a href="mailto:support@prephire.co.in">support@prephire.co.in</a> with the following details:
            </p>
            <ul>
              <li>Your registered email address.</li>
              <li>Transaction ID or Order ID.</li>
              <li>A detailed explanation of the reason for the refund request.</li>
            </ul>

            <h3>4. Processing Time</h3>
            <p>
              Once your refund request is approved, it will be processed within 5-7 business days. The refund will be credited back to the original payment method used for the purchase.
            </p>

            <h3>5. Contact Us</h3>
            <p>
              If you have any questions about our refund policy, please contact us at <a href="mailto:support@prephire.co.in">support@prephire.co.in</a>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </PageLayout>
  );
};

export default Refund;

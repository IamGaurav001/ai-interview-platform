import React from "react";
import PageLayout from "../components/PageLayout";
import { Truck } from "lucide-react";
import SEO from "../components/SEO";

const Shipping = () => {
  return (
    <PageLayout>
      <SEO title="Shipping & Delivery" description="Read PrepHire's Shipping & Delivery Policy. As a digital platform, we do not ship physical products." />
      <div className="bg-slate-50 min-h-screen py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
              Shipping & Delivery
            </h1>
            <p className="text-lg text-slate-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 prose prose-lg prose-blue max-w-none">
            <p className="lead">
              PrepHire is a digital platform, and as such, we do not ship physical products. All our services are delivered electronically.
            </p>

            <h3>1. Digital Delivery</h3>
            <p>
              Upon successful payment and registration, you will receive immediate access to the PrepHire platform and its features. Confirmation of your purchase will be sent to the email address you provided during registration.
            </p>

            <h3>2. Access Issues</h3>
            <p>
              If you experience any issues accessing your account or the purchased features after payment, please check your spam folder for the confirmation email. If you still cannot access your account, please contact our support team immediately.
            </p>

            <h3>3. International Access</h3>
            <p>
              PrepHire is accessible globally. However, you are responsible for ensuring that your internet connection and device meet the minimum requirements to use our platform effectively.
            </p>

            <h3>4. Contact Us</h3>
            <p>
              If you have any questions about our delivery policy, please contact us at support@prephire.co.in.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Shipping;

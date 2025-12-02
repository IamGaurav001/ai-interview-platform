import React from "react";
import PageLayout from "../components/PageLayout";
import { FileText } from "lucide-react";
import SEO from "../components/SEO";

const TermsOfService = () => {
  return (
    <PageLayout>
      <SEO title="Terms of Service" description="Read PrepHire's Terms of Service to understand the rules and regulations for using our website." />
      <div className="bg-slate-50 min-h-screen py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-slate-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 prose prose-lg prose-blue max-w-none">
            <p className="lead">
              Please read these terms carefully before using PrepHire. By using our service, you agree to be bound by these terms.
            </p>

            <h3>1. Agreement to Terms</h3>
            <p>
              By accessing our website at PrepHire, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>

            <h3>2. Use License</h3>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on PrepHire's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained on PrepHire's website;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>

            <h3>3. Disclaimer</h3>
            <p>
              The materials on PrepHire's website are provided on an 'as is' basis. PrepHire makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h3>4. Limitations</h3>
            <p>
              In no event shall PrepHire or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PrepHire's website, even if PrepHire or a PrepHire authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>

            <h3>5. Accuracy of Materials</h3>
            <p>
              The materials appearing on PrepHire's website could include technical, typographical, or photographic errors. PrepHire does not warrant that any of the materials on its website are accurate, complete or current. PrepHire may make changes to the materials contained on its website at any time without notice. However PrepHire does not make any commitment to update the materials.
            </p>

            <h3>6. Governing Law</h3>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of California and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TermsOfService;

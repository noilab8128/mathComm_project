import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - MathComm',
  description: 'Terms of Service for using the MathComm platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center mb-4">
            <ShieldCheck className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
              Terms of Service
            </h1>
          </div>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Effective Date: {/* [INSERT EFFECTIVE DATE HERE] */} (e.g., June 1, 2026)
            <br />
            Last Updated: {/* [INSERT LAST UPDATED DATE HERE] */} (e.g., June 3, 2026)
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
            
            <p>
              Welcome to MathComm. These Terms of Service ("Terms") govern your access to and use of the MathComm website, services, and applications (collectively, the "Service"). Please read these Terms carefully. By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy.
            </p>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p>
                By creating an account, accessing, or using the Service, you confirm that you can form a binding contract with {/* [INSERT COMPANY NAME HERE] e.g., noi.lab */}, and that you accept these Terms. If you are under the age of majority in your jurisdiction, your parent or legal guardian must consent to these Terms on your behalf.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Description of Service</h2>
              <p>
                MathComm provides an online platform for learning mathematics, solving problems, and engaging with a community of learners globally. We continuously update our Service, meaning features may be added, modified, or removed over time.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. User Accounts</h2>
              <p>
                To access certain features, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain the security of your password and accept all risks of unauthorized access to your account.</li>
                <li>Promptly notify us if you discover or suspect any security breaches related to your account.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Intellectual Property Rights</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">4.1 Platform Content</h3>
              <p>
                The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of {/* [INSERT COMPANY NAME HERE] */} and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
              </p>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">4.2 User Content</h3>
              <p>
                You retain your rights to any content you submit, post, or display on or through the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content in any media or distribution methods.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Acceptable Use Policy</h2>
              <p>
                You agree not to engage in any of the following prohibited activities:
              </p>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 mt-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    <span>Using the Service for any illegal purpose or in violation of any local, state, national, or international law.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    <span>Harassing, threatening, demeaning, or discriminating against other users.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    <span>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    <span>Spamming, phishing, pharming, pretexting, spidering, crawling, or scraping.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, in no event shall {/* [INSERT COMPANY NAME HERE] */}, its affiliates, directors, employees, or licensors be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses, arising out of or relating to the use of, or inability to use, this Service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of {/* [INSERT JURISDICTION HERE, e.g., the State of California, United States] */}, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of significant changes by posting an announcement on our website or sending an email. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-2">10. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul className="mt-2 text-gray-700 font-medium">
                <li>Email: {/* [INSERT LEGAL/SUPPORT EMAIL HERE, e.g., legal@mathcomm.example.com] */}</li>
                <li>Address: {/* [INSERT COMPANY ADDRESS HERE] */}</li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

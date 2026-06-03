import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Eye } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - MathComm',
  description: 'How MathComm collects, uses, and protects your data.',
};

export default function PrivacyPage() {
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
            <Lock className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
              Privacy Policy
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
              At MathComm, we take your privacy seriously. This Privacy Policy describes how {/* [INSERT COMPANY NAME HERE] */} ("we", "us", or "our") collects, uses, and shares your personal information when you use our website, mobile applications, and services (collectively, the "Service").
            </p>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
              <p>We collect information to provide better services to all our users. The types of information we collect include:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li><strong>Information you provide to us:</strong> When you create an account, we collect your name, email address, password, and profile information (such as your chosen nickname).</li>
                <li><strong>Information we get from your use of our Service:</strong> We collect data about the problems you solve, your learning progress, XP/Ranking points, and your interactions within community discussions.</li>
                <li><strong>Device and Usage Information:</strong> We may collect information about your device type, IP address, browser type, operating system, and pages visited.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Information</h2>
              <p>We use the information we collect for various purposes, including to:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Provide, maintain, and improve our Service.</li>
                <li>Personalize your learning experience and recommend appropriate math problems.</li>
                <li>Calculate your ranking, streaks, and achievements on the platform.</li>
                <li>Communicate with you, including sending technical notices, updates, security alerts, and support messages.</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our Service.</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Sharing of Information</h2>
              <p>We do not sell your personal data. We may share your information in the following circumstances:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li><strong>With your consent:</strong> We may share data when you explicitly authorize us to do so.</li>
                <li><strong>Service Providers:</strong> We employ third-party companies and individuals to facilitate our Service (e.g., Supabase for database hosting, Vercel for web hosting). These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</li>
                <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Global Data Transfers</h2>
              <p>
                Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those from your jurisdiction. By consenting to this Privacy Policy, you agree to that transfer.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Your Data Protection Rights</h2>
              <p>
                Depending on your location (e.g., under GDPR or CCPA), you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>The right to access, update, or delete the information we have on you.</li>
                <li>The right of rectification if your information is inaccurate or incomplete.</li>
                <li>The right to object to or restrict our processing of your personal data.</li>
                <li>The right to data portability.</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the information in Section 8.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Children's Privacy</h2>
              <p>
                Our Service may be used by individuals under the age of 13 only with the consent of a parent or guardian. We do not knowingly collect personally identifiable information from children under 13 without verifiable parental consent. If we become aware that we have collected Personal Data from a child without verification of parental consent, we take steps to remove that information from our servers.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mt-8 flex items-start">
              <Eye className="h-6 w-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">8. Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer:
                </p>
                <ul className="mt-2 text-gray-700 font-medium">
                  <li>Email: {/* [INSERT PRIVACY/DPO EMAIL HERE, e.g., privacy@mathcomm.example.com] */}</li>
                  <li>Address: {/* [INSERT COMPANY ADDRESS HERE] */}</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

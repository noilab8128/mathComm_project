import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Cookie, Settings } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy - MathComm',
  description: 'Information about how MathComm uses cookies and similar technologies.',
};

export default function CookiePolicyPage() {
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
            <Cookie className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
              Cookie Policy
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
              This Cookie Policy explains how {/* [INSERT COMPANY NAME HERE] */} ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit MathComm. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. What are cookies?</h2>
              <p>
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
              <p className="mt-2">
                Cookies set by the website owner (in this case, {/* [INSERT COMPANY NAME HERE] */}) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., analytics).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Why do we use cookies?</h2>
              <p>We use first and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-6">Essential Cookies</h3>
              <p>
                These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website to you, you cannot refuse them.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-6">Performance and Functionality Cookies</h3>
              <p>
                These cookies are used to enhance the performance and functionality of our website but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-6">Analytics and Customization Cookies</h3>
              <p>
                These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. How can I control cookies?</h2>
              <p>
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
              </p>
              <p className="mt-2">
                You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mt-8 flex items-start">
              <Settings className="h-6 w-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">5. Updates and Contact</h2>
                <p className="text-gray-700">
                  We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed.
                </p>
                <p className="mt-4 text-gray-700">
                  If you have any questions about our use of cookies or other technologies, please email us at:
                </p>
                <p className="mt-2 text-gray-800 font-medium">
                  {/* [INSERT PRIVACY/SUPPORT EMAIL HERE, e.g., privacy@mathcomm.example.com] */}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

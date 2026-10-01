import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Contact & Support - MathComm',
  description: 'Get in touch with the MathComm team for support, inquiries, or feedback.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight mb-4">
            Contact & Support
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            We are here to help. Whether you have a question about a problem, need technical assistance, or want to partner with us, reach out!
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: General Inquiries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-lg mr-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Email Us</h2>
            </div>
            <p className="text-gray-600 mb-6">
              For general questions, partnerships, or business inquiries, please send us an email. We aim to respond within 24-48 hours.
            </p>
            <div className="space-y-3">
              {/* [INSERT CONTACT EMAILS HERE] */}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">General Inquiries</span>
                <a href="mailto:hello@mathcomm.example.com" className="text-lg font-medium text-blue-600 hover:underline">hello@mathcomm.example.com</a>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Support</span>
                <a href="mailto:support@mathcomm.example.com" className="text-lg font-medium text-blue-600 hover:underline">support@mathcomm.example.com</a>
              </div>
            </div>
          </div>

          {/* Card 2: Community & Feedback */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-lg mr-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Community Feedback</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Found a bug? Have an idea for a new feature? Join our community discussions or submit a feedback form directly to our development team.
            </p>
            <div className="space-y-4">
              {/* [INSERT COMMUNITY LINKS HERE] */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Submit Feedback Form
              </button>
              <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
                Join our Discord Server
              </button>
            </div>
          </div>

          {/* Card 3: FAQ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-lg mr-4">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-6">
              {/* FAQ Item 1 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I report an incorrect math problem?</h3>
                <p className="text-gray-600">
                  Every problem page has a "Report Issue" button. Click it, describe the error (e.g., typo, incorrect solution), and our moderation team will review it.
                </p>
              </div>
              {/* FAQ Item 2 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">I forgot my password. How can I reset it?</h3>
                <p className="text-gray-600">
                  You can reset your password by clicking the "Forgot Password" link on the login page. An email with instructions will be sent to your registered address.
                </p>
              </div>
              {/* FAQ Item 3 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How is my ranking calculated?</h3>
                <p className="text-gray-600">
                  Rankings are based on your total Ranking Points (RP). You earn RP by solving problems correctly, participating in discussions, and maintaining daily streaks.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, ChevronRight, BookOpen, User, CreditCard, Shield } from 'lucide-react';

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) - MathComm',
  description: 'Find answers to common questions about MathComm, account setup, pricing, security, and more.',
};

export default function FAQPage() {
  const categories = [
    {
      title: 'General',
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      faqs: [
        {
          question: 'What is MathComm?',
          answer: 'MathComm (Math Quest) is a collaborative platform designed for students, educators, and researchers to share, solve, and discuss mathematics. We focus on enhancing mathematical communication through interactive tools and active community engagement.'
        },
        {
          question: 'How do I report an incorrect math problem?',
          answer: 'Every problem page has a "Report Issue" button. Click it, describe the error (e.g., typo, incorrect solution), and our moderation team will review and update it.'
        },
        {
          question: 'Can I use MathComm for free?',
          answer: 'Yes! MathComm offers a comprehensive free tier that allows access to standard math problem sets, community discussions, and personal progress tracking.'
        }
      ]
    },
    {
      title: 'Account & Profile',
      icon: <User className="h-5 w-5 text-blue-600" />,
      faqs: [
        {
          question: 'I forgot my password. How can I reset it?',
          answer: 'You can reset your password by clicking the "Forgot Password" link on the login page. An email with password reset instructions will be sent to your registered address.'
        },
        {
          question: 'How is my ranking calculated?',
          answer: 'Rankings are based on your total Ranking Points (RP). You earn RP by solving problems correctly, participating in discussions, and maintaining daily streaks.'
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: <Shield className="h-5 w-5 text-blue-600" />,
      faqs: [
        {
          question: 'Is my data secure on MathComm?',
          answer: 'Absolutely. We prioritize your privacy and implement industry-standard encryption protocols. Your personal information is never sold, and you have full control over what profile data is displayed publicly.'
        },
        {
          question: 'Where can I read the full Privacy Policy?',
          answer: 'You can view our complete privacy guidelines on the Privacy Policy page at the bottom of the footer, which aligns with GDPR and standard global regulations.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <HelpCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
              FAQ & Help Center
            </h1>
          </div>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Have questions about MathComm? Find answers to frequently asked questions and learn how to get the most out of our platform.
          </p>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="space-y-12">
          {categories.map((category, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                {category.icon}
                <h2 className="text-xl font-bold text-gray-800">{category.title}</h2>
              </div>
              <div className="space-y-4">
                {category.faqs.map((faq, faqIdx) => (
                  <div 
                    key={faqIdx}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-start gap-2">
                      <span className="text-blue-600 font-bold">Q.</span>
                      <span>{faq.question}</span>
                    </h3>
                    <div className="text-base font-normal text-gray-600 pl-6 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-16 bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            If you couldn't find the answer you were looking for, please contact our support team directly.
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center justify-center bg-blue-600 text-white font-medium py-2.5 px-6 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            Contact Support
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Heart, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Community Guidelines - MathComm',
  description: 'Rules and expectations for participating in the MathComm community.',
};

export default function CommunityGuidelinesPage() {
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
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
              Community Guidelines
            </h1>
          </div>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            MathComm is a global community dedicated to learning, collaboration, and the joy of mathematics. These guidelines help ensure a positive environment for everyone.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="space-y-8">
          
          {/* Card 1: Core Principles */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-lg mr-4">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">1. Core Principles</h2>
            </div>
            <div className="prose prose-lg text-gray-600 max-w-none space-y-4">
              <ul className="list-disc list-inside space-y-3">
                <li><strong className="text-gray-900">Be Respectful:</strong> Treat everyone with kindness. We are a diverse global community with varying skill levels. What is trivial to you may be a massive hurdle for someone else.</li>
                <li><strong className="text-gray-900">Foster Learning:</strong> Our primary goal is education. When helping others, guide them toward the answer rather than just giving it away. Use the spoiler tag for direct solutions.</li>
                <li><strong className="text-gray-900">Assume Good Intent:</strong> Online communication can be easily misinterpreted. Give others the benefit of the doubt before reacting defensively.</li>
              </ul>
            </div>
          </div>

          {/* Card 2: Unacceptable Behavior */}
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 md:p-10">
            <div className="flex items-center mb-6">
              <div className="bg-red-50 p-3 rounded-lg mr-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">2. Unacceptable Behavior</h2>
            </div>
            <div className="prose prose-lg text-gray-600 max-w-none space-y-4">
              <p>We do not tolerate the following on MathComm:</p>
              <ul className="list-disc list-inside space-y-3">
                <li><strong className="text-gray-900">Harassment & Bullying:</strong> Name-calling, targeted attacks, or making others feel unwelcome.</li>
                <li><strong className="text-gray-900">Hate Speech:</strong> Discrimination or slurs based on race, ethnicity, national origin, religion, gender identity, sexual orientation, age, or disability.</li>
                <li><strong className="text-gray-900">Cheating & Plagiarism:</strong> Copying solutions from external sources without attribution, or using the platform to cheat on active school assignments or competitions.</li>
                <li><strong className="text-gray-900">Spam & Self-Promotion:</strong> Posting irrelevant links, commercial advertising, or repetitive content.</li>
              </ul>
            </div>
          </div>

          {/* Card 3: Academic Integrity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">3. Academic Integrity</h2>
            <div className="prose prose-lg text-gray-600 max-w-none space-y-4">
              <p>
                MathComm relies on the integrity of its users to maintain the value of Rankings and XP. 
                Using bots to farm XP, sharing direct answers in discussion threads without spoiler warnings to farm upvotes, or exploiting bugs in the platform will result in a permanent ban and stripping of all achievements.
              </p>
            </div>
          </div>

          {/* Card 4: Reporting & Enforcement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">4. Reporting & Enforcement</h2>
            <div className="prose prose-lg text-gray-600 max-w-none space-y-4">
              <p>
                If you see a post or user violating these guidelines, please use the "Report" button. Our moderation team reviews all reports.
              </p>
              <p>
                Violations may result in:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>A warning and removal of the offending content.</li>
                <li>Temporary suspension from posting or using the platform.</li>
                <li>Permanent account ban.</li>
              </ul>
              <p className="mt-4 italic">
                {/* [INSERT COMPANY NAME HERE] */} reserves the right to enforce these guidelines at our discretion.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

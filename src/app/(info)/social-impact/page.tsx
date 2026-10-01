import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe2, BookOpen, HeartHandshake } from 'lucide-react';

export const metadata = {
  title: 'Social Impact - MathComm',
  description: 'How MathComm is making a positive difference in global education.',
};

export default function SocialImpactPage() {
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
            <Globe2 className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
              Social Impact
            </h1>
          </div>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Technology is only as good as the positive change it brings. Discover how MathComm is democratizing math education worldwide.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="space-y-8">
          
          {/* Card 1: Our Commitment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Commitment to Equity</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Quality mathematics education is often gated by geographical, financial, or institutional barriers. Our foundational belief is that mathematical talent is distributed equally across the globe, but opportunity is not. MathComm exists to bridge that gap by providing a free, high-quality, and community-driven learning platform accessible to anyone with an internet connection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 2: Open Knowledge */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 p-3 rounded-lg mr-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Open Knowledge</h3>
              </div>
              <p className="text-gray-600">
                We are building an open repository of high-quality mathematical problems and solutions. By allowing users to collaboratively solve and explain concepts, we ensure that knowledge is not locked behind expensive textbooks or paywalls.
              </p>
            </div>

            {/* Card 3: Community Support */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 p-3 rounded-lg mr-4">
                  <HeartHandshake className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Community Empowerment</h3>
              </div>
              <p className="text-gray-600">
                Through our discussion forums and mentorship features, students in remote or under-resourced areas can connect with global math experts and peers. We believe peer-to-peer teaching is one of the most powerful tools for social mobility.
              </p>
            </div>
          </div>

          {/* Card 4: Future Goals Placeholder */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-8 md:p-10 text-center mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tracking Our Impact</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              As MathComm grows, we plan to publish an annual <strong>Social Impact Report</strong> detailing the number of students reached, hours of free education provided, and partnerships established with public schools and NGOs.
            </p>
            <p className="text-sm text-gray-500 mt-6">
              * Detailed impact metrics and partnership data will be updated here in the near future.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

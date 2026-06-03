import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Handshake } from 'lucide-react';

export const metadata = {
  title: 'Partners - MathComm',
  description: 'Our trusted partners and collaborators.',
};

export default function PartnersPage() {
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
            <Handshake className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
              Partners
            </h1>
          </div>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Collaborating to build a better future for education.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We are currently in the process of establishing exciting new partnerships with educational institutions, technology providers, and academic content creators.
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
            Details about our official partners will be announced on this page soon. If you are interested in partnering with MathComm, please reach out via our Contact page!
          </p>
        </div>
      </section>
    </div>
  );
}

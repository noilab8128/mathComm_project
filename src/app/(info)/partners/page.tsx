import React from 'react';
import Link from 'next/link';
import { Handshake } from 'lucide-react';

export const metadata = {
  title: 'Partners - Math Quest',
  description: 'Our trusted partners and collaborators.',
};

export default function PartnersPage() {
  return (
    <div className="bg-slate-50 flex flex-col">
      {/* Header Section */}
      <section className="bg-white border-b border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-4">
            <Handshake className="h-8 w-8 text-slate-600 mr-3" />
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-800 tracking-tight">
              Partners
            </h1>
          </div>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            Collaborating to build a better future for education.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="bg-white rounded-lg border border-slate-100 p-8 md:p-12 text-center">
          <h2 className="font-serif text-2xl font-bold text-slate-800 mb-4">Coming Soon</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We are currently in the process of establishing exciting new partnerships with educational institutions, technology providers, and academic content creators.
          </p>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-4">
            Details about our official partners will be announced on this page soon. If you are interested in partnering with Math Quest, please reach out via our Contact page!
          </p>
        </div>
      </section>
    </div>
  );
}

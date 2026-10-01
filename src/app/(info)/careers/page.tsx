import React from 'react';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export const metadata = {
  title: 'Careers - Math Quest',
  description: 'Join the Math Quest team and help build the future of math education.',
};

export default function CareersPage() {
  return (
    <div className="bg-slate-50 flex flex-col">
      {/* Header Section */}
      <section className="bg-white border-b border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-4">
            <Briefcase className="h-8 w-8 text-slate-600 mr-3" />
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-800 tracking-tight">
              Careers
            </h1>
          </div>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            Help us build the future of math education.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="bg-white rounded-lg border border-slate-100 p-8 md:p-12 text-center">
          <h2 className="font-serif text-2xl font-bold text-slate-800 mb-4">No Open Positions Currently</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-4">
            Thank you for your interest in joining Math Quest! At this time, we do not have any active hiring plans. However, as our platform and community grow, we will be looking for passionate individuals to join our team.
          </p>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Future career opportunities and hiring schedules will be announced here and through our community channels. Please check back later!
          </p>
        </div>
      </section>
    </div>
  );
}

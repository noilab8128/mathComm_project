import React from 'react';
import Link from 'next/link';
import { Map, CheckCircle2, Clock, ListTodo } from 'lucide-react';

export const metadata = {
  title: 'Roadmap - Math Quest',
  description: 'Our development timeline and upcoming features for Math Quest.',
};

export default function RoadmapPage() {
  return (
    <div className="bg-slate-50 flex flex-col">
      {/* Header Section */}
      <section className="bg-white border-b border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-4">
            <Map className="h-8 w-8 text-slate-600 mr-3" />
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-800 tracking-tight">
              Product Roadmap
            </h1>
          </div>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            See what we're working on, what's coming next, and what we've already accomplished. Our roadmap is driven by community feedback.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
          
          {/* Phase 1: Completed */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-lg">Phase 1: Foundation</h3>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Completed</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
                <li>Core problem database architecture</li>
                <li>User authentication and profiles</li>
                <li>Basic category system and difficulty tags</li>
                <li>KaTeX integration for rendering math formulas</li>
              </ul>
            </div>
          </div>

          {/* Phase 2: In Progress */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-700 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <Clock className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-lg border border-slate-200 ring-1 ring-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-lg">Phase 2: Gamification & AI</h3>
                <span className="text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded animate-pulse">Current</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
                <li>Ranking Points (RP) and Tier system</li>
                <li>AI-assisted problem generation</li>
                <li>Admin review dashboard for AI content</li>
                <li>Daily streaks and user progress tracking</li>
              </ul>
            </div>
          </div>

          {/* Phase 3: Planned */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <ListTodo className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-lg border border-slate-100 opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-lg">Phase 3: Community & Social</h3>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Planned</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
                <li>Problem-specific discussion forums</li>
                <li>User-to-user mentoring system</li>
                <li>Team competitions and leaderboards</li>
                <li>Interactive geometry tool integration</li>
              </ul>
            </div>
          </div>

          {/* Phase 4: Future Vision */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <Map className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-lg border border-slate-100 opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-lg">Phase 4: Global Expansion</h3>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Future</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
                <li>Multi-language support</li>
                <li>Mobile application launch</li>
                <li>School and educator portal</li>
                <li>Advanced analytics dashboard for teachers</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Feedback Call to Action */}
        <div className="mt-16 bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-slate-800 mb-2">Have a feature request?</h2>
          <p className="text-slate-600 mb-6">We'd love to hear from you. The best ideas come directly from our community.</p>
          <Link href="/contact" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Submit Feedback
          </Link>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { Lightbulb, Mountain, Rocket } from 'lucide-react';

export const metadata = {
  title: 'Vision & Mission - Math Quest',
  description: 'Our vision for the future of mathematical education and our mission to get there.',
};

export default function VisionPage() {
  return (
    <div className="bg-slate-50 flex flex-col">
      {/* Header Section */}
      <section className="bg-white border-b border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-800 tracking-tight mb-4">
            Vision & Mission
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            Discover what drives us. We believe in unlocking human potential through the universal language of mathematics.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="space-y-8">
          
          {/* Card 1: Our Vision */}
          <div className="bg-white rounded-lg border border-slate-100 p-8 md:p-10">
            <div className="flex items-center mb-6">
              <div className="bg-slate-50 p-3 rounded-lg mr-4">
                <Lightbulb className="h-6 w-6 text-slate-600" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-slate-800">Our Vision</h2>
            </div>
            <div className="prose prose-lg text-slate-600 max-w-none space-y-4">
              <p className="text-2xl font-light text-slate-800 italic border-l-4 border-slate-900 pl-6 my-8">
                "A world where mathematical thinking is accessible, engaging, and collaborative for everyone, regardless of their background."
              </p>
              <p>
                We envision a global community where learning math is no longer a solitary struggle, but a shared adventure. By breaking down complex concepts into engaging, interactive challenges, we hope to foster a generation of critical thinkers who can solve the world's most pressing problems.
              </p>
            </div>
          </div>

          {/* Card 2: Our Mission */}
          <div className="bg-white rounded-lg border border-slate-100 p-8 md:p-10">
            <div className="flex items-center mb-6">
              <div className="bg-slate-50 p-3 rounded-lg mr-4">
                <Mountain className="h-6 w-6 text-slate-600" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-slate-800">Our Mission</h2>
            </div>
            <div className="prose prose-lg text-slate-600 max-w-none space-y-4">
              <p>
                Our mission is to build the most comprehensive, intelligent, and motivating platform for mathematical practice and discovery. To achieve this, we focus on:
              </p>
              <ul className="list-disc list-inside space-y-3 mt-4 text-slate-700">
                <li><strong className="text-slate-900">Democratizing Access:</strong> Providing high-quality math resources to anyone with an internet connection.</li>
                <li><strong className="text-slate-900">Gamified Learning:</strong> Using modern progression systems to keep students motivated and focused.</li>
                <li><strong className="text-slate-900">AI-Powered Personalization:</strong> Utilizing advanced AI to generate tailored problems and provide instantaneous, constructive feedback.</li>
                <li><strong className="text-slate-900">Community Driven:</strong> Creating a safe space for learners to discuss, debate, and share solutions.</li>
              </ul>
            </div>
          </div>

          {/* Card 3: Core Values */}
          <div className="bg-white rounded-lg border border-slate-100 p-8 md:p-10">
            <div className="flex items-center mb-6">
              <div className="bg-slate-50 p-3 rounded-lg mr-4">
                <Rocket className="h-6 w-6 text-slate-600" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-slate-800">Core Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Curiosity First</h3>
                <p className="text-slate-600">We prioritize the \"why\" over the \"how\", encouraging deep understanding rather than rote memorization.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Inclusivity</h3>
                <p className="text-slate-600">Mathematics belongs to everyone. We design our platform to be welcoming to learners of all levels and backgrounds.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Integrity</h3>
                <p className="text-slate-600">We maintain academic rigor. Our problem sets are accurate, properly sourced, and meticulously reviewed.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Innovation</h3>
                <p className="text-slate-600">We constantly explore new technologies like AI and interactive visualizations to enhance the learning experience.</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Globe, BookOpen, Target } from 'lucide-react';

export const metadata = {
  title: 'About Us - MathComm',
  description: 'Learn about our journey, our team, and what drives us to revolutionize math education globally.',
};

export default function AboutPage() {
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
            About MathComm.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            We are building the next generation of mathematical learning platforms, empowering students worldwide through interactive challenges and a thriving community.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="space-y-8">
          
          {/* Card 1: Our Story */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-lg mr-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Our Story</h2>
            </div>
            <div className="prose prose-lg text-gray-600 max-w-none space-y-4">
              <p>
                MathComm started with a simple observation: traditional math education often leaves students feeling isolated and uninspired. We wanted to change that by combining rigorous academic standards with the engaging dynamics of modern digital platforms.
              </p>
              <p>
                {/* [INSERT COMPANY BACKGROUND INFO HERE] e.g., Founded in [Year] by a team of educators and engineers... */}
                Since our inception, we have been dedicated to creating an environment where mathematical problem-solving is not just a solitary task, but a collaborative and rewarding journey.
              </p>
            </div>
          </div>

          {/* Card 2: What We Do */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-lg mr-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">What We Do</h2>
            </div>
            <div className="prose prose-lg text-gray-600 max-w-none space-y-4">
              <p>
                We provide a comprehensive platform that offers curated math problems across various difficulty levels and categories. By integrating competitive elements like rankings, experience points (XP), and badges, we make learning highly engaging.
              </p>
              <p>
                Our AI-driven tools help personalize the learning experience, offering hints, generating relevant practice problems, and reviewing user submissions to ensure a high-quality educational environment.
              </p>
            </div>
          </div>

          {/* Card 3: Global Community */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-lg mr-4">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Our Global Community</h2>
            </div>
            <div className="prose prose-lg text-gray-600 max-w-none space-y-4">
              <p>
                Math is a universal language, and our platform is built for a global audience. We welcome students, educators, and math enthusiasts from all over the world to share their knowledge, discuss solutions, and grow together.
              </p>
            </div>
          </div>

          {/* Card 4: The Team */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-lg mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">The Team</h2>
            </div>
            <div className="prose prose-lg text-gray-600 max-w-none space-y-4">
              <p>
                {/* [INSERT TEAM INFO HERE] e.g., We are a diverse group of mathematicians, software developers, and designers... */}
                Behind MathComm is a passionate group of professionals dedicated to educational technology. We continuously iterate on our product, listening to user feedback to provide the best possible learning experience.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

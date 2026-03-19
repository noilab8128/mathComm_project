"use client";

import React from "react";
import { Sparkles, Target, Lightbulb, Users, Rocket, Brain, Zap, Globe, Heart } from "lucide-react";

const AboutPage = () => {
    const features = [
        {
            icon: <Brain className="h-8 w-8" />,
            title: "AI-Powered Innovation",
            description: "Leveraging cutting-edge AI technologies to create intuitive and intelligent web experiences"
        },
        {
            icon: <Zap className="h-8 w-8" />,
            title: "User-Centric Design",
            description: "Making web navigation and interaction seamless and convenient for everyone"
        },
        {
            icon: <Globe className="h-8 w-8" />,
            title: "Accessible Solutions",
            description: "Building platforms that empower users worldwide with innovative technology"
        },
        {
            icon: <Lightbulb className="h-8 w-8" />,
            title: "Novel Approaches",
            description: "Developing creative and groundbreaking solutions to modern web challenges"
        }
    ];

    const stats = [
        { number: "100+", label: "Projects Delivered" },
        { number: "50K+", label: "Users Helped" },
        { number: "15+", label: "AI Technologies" },
        { number: "98%", label: "User Satisfaction" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                            <Sparkles className="h-5 w-5" />
                            <span className="text-sm font-semibold">About noi.lab</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Innovating the Future of
                            <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                                Web Experiences
                            </span>
                        </h1>
                        <p className="text-xl text-indigo-100 leading-relaxed">
                            noi.lab is dedicated to developing novel solutions and helping people use web pages conveniently using AI technologies. We create intelligent, user-friendly platforms that transform how people interact with the digital world.
                        </p>
                    </div>
                </div>
                {/* Wave decoration */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248, 250, 252)" />
                    </svg>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Mission */}
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                            <Target className="h-7 w-7 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            To empower individuals and organizations by developing innovative AI-driven web solutions that make digital experiences more intuitive, accessible, and efficient for everyone.
                        </p>
                    </div>

                    {/* Vision */}
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                        <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-6">
                            <Rocket className="h-7 w-7 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            To be the leading innovator in AI-powered web technologies, creating a future where technology seamlessly adapts to human needs and enhances everyday digital interactions.
                        </p>
                    </div>
                </div>
            </section>

            {/* What We Do */}
            <section className="bg-gradient-to-b from-slate-50 to-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Do</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We combine artificial intelligence with innovative design to create web experiences that are not just functional, but transformative.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
                            <p className="text-xl text-indigo-100">
                                Making a difference through innovation and dedication
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                                        {stat.number}
                                    </div>
                                    <div className="text-indigo-100 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="bg-gradient-to-b from-slate-50 to-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                        <p className="text-xl text-gray-600">Principles that guide everything we do</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lightbulb className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Innovation</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Continuously pushing boundaries and exploring new possibilities in AI and web technology
                            </p>
                        </div>

                        <div className="text-center p-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">User-First</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Prioritizing user experience and convenience in every solution we create
                            </p>
                        </div>

                        <div className="text-center p-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Excellence</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Delivering high-quality, reliable solutions that exceed expectations
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Ready to Experience the Future?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join us in revolutionizing how people interact with web technologies
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            Get in Touch
                        </a>
                        <a
                            href="/team"
                            className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all"
                        >
                            Meet Our Team
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;

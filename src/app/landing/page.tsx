"use client";

import React from "react";
import LandingSidebar from "@/components/LandingSidebar";
import LandingHeader from "@/components/LandingHeader";
import FooterSeo from "@/components/footer_seo";
import { ArrowRight, BookOpen, GraduationCap, Layers, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-900">
            {/* Sidebar Navigation */}
            <LandingSidebar active="main" />

            {/* Main Content Layout */}
            <div className="flex-1 flex flex-col overflow-x-hidden">
                <LandingHeader />

                <main className="flex-1">
                    {/* Top Banner / Hero Section */}
                    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-white">
                        <div className="max-w-4xl">
                            <h1 className="text-4xl font-bold mb-4 tracking-tight">Master Mathematics with Personalized Precision</h1>
                            <p className="text-lg text-blue-50/90 mb-8 max-w-2xl leading-relaxed">
                                Experience a revolutionary way to learn. From foundational algebra to advanced differential geometry, our platform guides you through adaptive problem sets designed just for you.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/">
                                    <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-6 rounded-xl transition-all shadow-lg hover:shadow-xl h-auto">
                                        Get Started Free
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Category List Section */}
                    <section className="p-8 max-w-7xl mx-auto w-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                                Explore Categories
                            </h2>
                            <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">View all categories</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Algebra Column */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="bg-gray-900 text-white p-4 font-bold text-lg text-center tracking-wide">
                                    Algebra
                                </div>
                                <div className="p-2 divide-y divide-gray-100">
                                    {["Elementary Algebra", "Linear Algebra", "Abstract Algebra"].map((sub) => (
                                        <Link key={sub} href="/" className="block p-4 text-gray-700 hover:bg-gray-50 transition-colors font-medium hover:text-blue-600">
                                            {sub}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Geometry Column */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="bg-gray-900 text-white p-4 font-bold text-lg text-center tracking-wide">
                                    Geometry
                                </div>
                                <div className="p-2 divide-y divide-gray-100">
                                    {["Euclidean Geometry", "Analytic Geometry", "Differential Geometry", "Topology"].map((sub) => (
                                        <Link key={sub} href="/" className="block p-4 text-gray-700 hover:bg-gray-50 transition-colors font-medium hover:text-blue-600">
                                            {sub}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Analysis Column */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="bg-gray-900 text-white p-4 font-bold text-lg text-center tracking-wide">
                                    Analysis
                                </div>
                                <div className="p-2 divide-y divide-gray-100">
                                    {["Calculus", "Complex Analysis", "Real Analysis", "Differential Equations"].map((sub) => (
                                        <Link key={sub} href="/" className="block p-4 text-gray-700 hover:bg-gray-50 transition-colors font-medium hover:text-blue-600">
                                            {sub}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Number Theory Column */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="bg-gray-900 text-white p-4 font-bold text-lg text-center tracking-wide">
                                    Number Theory
                                </div>
                                <div className="p-2 divide-y divide-gray-100">
                                    {["Elementary Number Theory", "Analytic Number Theory"].map((sub) => (
                                        <Link key={sub} href="/" className="block p-4 text-gray-700 hover:bg-gray-50 transition-colors font-medium hover:text-blue-600">
                                            {sub}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Discrete Mathematics Column */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="bg-gray-900 text-white p-4 font-bold text-lg text-center tracking-wide">
                                    Discrete Math
                                </div>
                                <div className="p-2 divide-y divide-gray-100">
                                    {["Enumeration", "Graph Theory", "Logic and Set Theory"].map((sub) => (
                                        <Link key={sub} href="/" className="block p-4 text-gray-700 hover:bg-gray-50 transition-colors font-medium hover:text-blue-600">
                                            {sub}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Applied Mathematics Column */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="bg-gray-900 text-white p-4 font-bold text-lg text-center tracking-wide">
                                    Applied Math
                                </div>
                                <div className="p-2 divide-y divide-gray-100">
                                    {["Probability & Statistics", "Game Theory", "Cryptography"].map((sub) => (
                                        <Link key={sub} href="/" className="block p-4 text-gray-700 hover:bg-gray-50 transition-colors font-medium hover:text-blue-600">
                                            {sub}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* USP / Features Area */}
                    <section className="bg-gray-50 py-16 px-8 border-y border-gray-200">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why MathQuest?</h2>
                                <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="flex flex-col items-center text-center p-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                        <GraduationCap className="h-8 w-8" />
                                    </div>
                                    <h3 className="font-bold text-xl mb-3">Adaptive Learning</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Our intelligent framework analyzes your performance in real-time to suggest problems that perfectly match your current skill level.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center text-center p-6">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                                        <Brain className="h-8 w-8" />
                                    </div>
                                    <h3 className="font-bold text-xl mb-3">Smart Explanations</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Get step-by-step guidance from our advanced tutoring engine that doesn't just give answers, but teaches core concepts.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center text-center p-6">
                                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                                        <Layers className="h-8 w-8" />
                                    </div>
                                    <h3 className="font-bold text-xl mb-3">Structured Curricula</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Follow carefully curated skill trees designed by experts to take you from beginner to advanced mastery.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <FooterSeo />
            </div>
        </div>
    );
}

"use client";

import React from "react";
import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/footer";
import { ArrowRight, BookOpen, GraduationCap, Layers, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
            <LandingHeader />

            <main className="flex-1">
                {/* Top Banner / Hero Section */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-20 text-white">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h1 className="text-5xl font-bold mb-6 tracking-tight leading-tight">
                                Master Mathematics with <br /> Personalized Precision
                            </h1>
                            <p className="text-xl text-blue-50/90 mb-10 max-w-2xl leading-relaxed">
                                Experience a revolutionary way to learn. From foundational algebra to advanced differential geometry, our platform guides you through adaptive problem sets designed just for you.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/login">
                                    <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-6 rounded-xl transition-all shadow-lg hover:shadow-xl h-auto text-lg">
                                        Get Started Free
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="#features">
                                    <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 font-semibold px-8 py-6 rounded-xl transition-all h-auto text-lg">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        {/* Hero Image / Visual Placeholder */}
                        <div className="hidden md:flex flex-1 justify-center">
                            <div className="relative w-full max-w-md aspect-square bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                                <div className="absolute inset-4 rounded-full border border-dashed border-white/30 animate-spin-slow"></div>
                                <Brain className="w-32 h-32 text-white/90" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Category List Section */}
                <section className="p-8 max-w-7xl mx-auto w-full py-16">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore our Curriculum</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">Dive into our comprehensive catalog of mathematical disciplines, structured for every level of learner.</p>
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            Popular Categories
                        </h2>
                        <Link href="/login" className="text-sm font-semibold text-blue-600 hover:underline">View all categories</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Algebra Column */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            <div className="bg-gray-50 p-4 font-bold text-lg border-b border-gray-100 flex justify-between items-center">
                                <span>Algebra</span>
                                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">12 Topics</span>
                            </div>
                            <div className="p-2">
                                {["Elementary Algebra", "Linear Algebra", "Abstract Algebra"].map((sub) => (
                                    <Link key={sub} href="/login" className="block p-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 transition-colors font-medium hover:text-blue-700 flex justify-between items-center group-hover:pl-5 transition-all">
                                        {sub}
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Geometry Column */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            <div className="bg-gray-50 p-4 font-bold text-lg border-b border-gray-100 flex justify-between items-center">
                                <span>Geometry</span>
                                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">8 Topics</span>
                            </div>
                            <div className="p-2">
                                {["Euclidean Geometry", "Analytic Geometry", "Differential Geometry"].map((sub) => (
                                    <Link key={sub} href="/login" className="block p-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 transition-colors font-medium hover:text-blue-700 flex justify-between items-center group-hover:pl-5 transition-all">
                                        {sub}
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Analysis Column */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            <div className="bg-gray-50 p-4 font-bold text-lg border-b border-gray-100 flex justify-between items-center">
                                <span>Analysis</span>
                                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">15 Topics</span>
                            </div>
                            <div className="p-2">
                                {["Calculus", "Complex Analysis", "Real Analysis"].map((sub) => (
                                    <Link key={sub} href="/login" className="block p-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 transition-colors font-medium hover:text-blue-700 flex justify-between items-center group-hover:pl-5 transition-all">
                                        {sub}
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Number Theory Column */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            <div className="bg-gray-50 p-4 font-bold text-lg border-b border-gray-100 flex justify-between items-center">
                                <span>Number Theory</span>
                                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">6 Topics</span>
                            </div>
                            <div className="p-2">
                                {["Elementary Number Theory", "Analytic Number Theory"].map((sub) => (
                                    <Link key={sub} href="/login" className="block p-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 transition-colors font-medium hover:text-blue-700 flex justify-between items-center group-hover:pl-5 transition-all">
                                        {sub}
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Discrete Mathematics Column */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            <div className="bg-gray-50 p-4 font-bold text-lg border-b border-gray-100 flex justify-between items-center">
                                <span>Discrete Math</span>
                                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">9 Topics</span>
                            </div>
                            <div className="p-2">
                                {["Enumeration", "Graph Theory", "Logic and Set Theory"].map((sub) => (
                                    <Link key={sub} href="/login" className="block p-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 transition-colors font-medium hover:text-blue-700 flex justify-between items-center group-hover:pl-5 transition-all">
                                        {sub}
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Applied Mathematics Column */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            <div className="bg-gray-50 p-4 font-bold text-lg border-b border-gray-100 flex justify-between items-center">
                                <span>Applied Math</span>
                                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">10 Topics</span>
                            </div>
                            <div className="p-2">
                                {["Probability & Statistics", "Game Theory", "Cryptography"].map((sub) => (
                                    <Link key={sub} href="/login" className="block p-3 px-4 rounded-lg text-gray-600 hover:bg-blue-50 transition-colors font-medium hover:text-blue-700 flex justify-between items-center group-hover:pl-5 transition-all">
                                        {sub}
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* USP / Features Area */}
                <section id="features" className="bg-gray-50 py-24 px-8 border-y border-gray-200">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why MathQuest?</h2>
                            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mb-6"></div>
                            <p className="text-gray-500 max-w-2xl mx-auto">We combine cutting-edge technology with pedagogical expertise to deliver the most effective learning experience.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                    <GraduationCap className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-gray-900">Adaptive Learning</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Our intelligent framework analyzes your performance in real-time to suggest problems that perfectly match your current skill level.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                                    <Brain className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-gray-900">Smart Explanations</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Get step-by-step guidance from our advanced tutoring engine that doesn&apos;t just give answers, but teaches core concepts.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                                    <Layers className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-gray-900">Structured Curricula</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Follow carefully curated skill trees designed by experts to take you from beginner to advanced mastery.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

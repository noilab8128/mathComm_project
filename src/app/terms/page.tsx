"use client";

import React from "react";
import { FileText, AlertCircle } from 'lucide-react';

const TermsPage = () => {
    const lastUpdated = "November 21, 2025";

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-90" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
                        <p className="text-xl text-indigo-100">
                            Last updated: {lastUpdated}
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12">
                    <div className="prose prose-lg max-w-none">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            By accessing and using noi.lab&apos;s services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">2. Use License</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Permission is granted to temporarily access the materials on noi.lab&apos;s platform for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-start gap-3 text-gray-600">
                                <AlertCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                <span>Modify or copy the materials</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <AlertCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                <span>Use the materials for any commercial purpose or public display</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <AlertCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                <span>Attempt to reverse engineer any software contained on noi.lab&apos;s platform</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <AlertCircle className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                <span>Remove any copyright or other proprietary notations from the materials</span>
                            </li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Content and Intellectual Property</h2>

                        <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">4.1 Platform Content</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            All content on MathQuest, including but not limited to algorithms, curricula, problem sets, designs, and text, is owned by or licensed to noi.lab and is protected by intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the platform without explicit written permission. It&apos;s illegal to copy content.
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">4. Intellectual Property</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            The service and its original content, features, and functionality are and will remain the exclusive property of noi.lab and its licensors. The service is protected by copyright, trademark, and other laws.
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">5. User Content</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You may choose to, or we may invite you to submit comments, feedback, or ideas about MathQuest (&quot;Feedback&quot;). By submitting Feedback, you agree that we are free to use it without any restriction or compensation to you. We don&apos;t waive any rights to use similar or related ideas previously known to us, developed by our employees, or obtained from other sources.
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">6. Prohibited Activities</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            You agree not to engage in any of the following prohibited activities:
                        </p>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-start gap-3 text-gray-600">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                                <span>Violating laws or regulations</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                                <span>Impersonating another person or entity</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                                <span>Interfering with the security features of the service</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                                <span>Harassing, threatening, or abusing other users</span>
                            </li>
                        </ul>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">7. Termination</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">8. Limitation of Liability</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            In no event shall noi.lab, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">9. Changes to Terms</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect.
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">10. Contact Us</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            If you have any questions about these Terms, please contact us:
                        </p>
                        <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                            <p className="text-gray-700 font-medium mb-2">Email: legal@noilab.com</p>
                            <p className="text-gray-700 font-medium">Website: www.noilab.com/contact</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsPage;

"use client";

import React from "react";
import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

const PrivacyPage = () => {
    const lastUpdated = "November 21, 2025";

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <Shield className="h-16 w-16 mx-auto mb-4 opacity-90" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-xl text-indigo-100">
                            Last updated: {lastUpdated}
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Overview */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                        <Lock className="h-10 w-10 mx-auto mb-4 text-indigo-600" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Data</h3>
                        <p className="text-gray-600 text-sm">Your information is encrypted and protected</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                        <Eye className="h-10 w-10 mx-auto mb-4 text-indigo-600" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Transparency</h3>
                        <p className="text-gray-600 text-sm">Clear about what data we collect and why</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                        <UserCheck className="h-10 w-10 mx-auto mb-4 text-indigo-600" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Your Control</h3>
                        <p className="text-gray-600 text-sm">You can access, update, or delete your data</p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12">
                    <div className="prose prose-lg max-w-none">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Information We Collect</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-start gap-3 text-gray-600">
                                <Database className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                <span><strong>Account Information:</strong> Name, email address, and password when you create an account</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <Database className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                <span><strong>Profile Information:</strong> Additional information you may provide such as profile photo and preferences</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <Database className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                <span><strong>Usage Data:</strong> Information about how you use our service, including pages visited and features used</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <Database className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                <span><strong>Communication Data:</strong> Information from your communications with us, including support requests</span>
                            </li>
                        </ul>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">2. How We Use Your Information</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            We use the information we collect to:
                        </p>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-start gap-3 text-gray-600">
                                <UserCheck className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                <span>Provide, maintain, and improve our services</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <UserCheck className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                <span>Personalize your experience and provide content tailored to your interests</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <UserCheck className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                <span>Communicate with you about products, services, and promotional offers</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <UserCheck className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                <span>Monitor and analyze trends, usage, and activities</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <UserCheck className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                <span>Detect, prevent, and address technical issues and security threats</span>
                            </li>
                        </ul>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">3. Information Sharing</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We do not sell your personal information. We may share your information only in the following circumstances:
                        </p>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="font-semibold text-gray-900">With your consent:</span>
                                <span>When you explicitly agree to share your information</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="font-semibold text-gray-900">Service providers:</span>
                                <span>With third parties who provide services on our behalf</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600">
                                <span className="font-semibold text-gray-900">Legal requirements:</span>
                                <span>When required by law or to protect our rights</span>
                            </li>
                        </ul>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">4. Data Security</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">5. Your Rights</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            You have the following rights regarding your personal information:
                        </p>
                        <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100 mb-6">
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-gray-700">
                                    <Lock className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                    <span><strong>Access:</strong> Request a copy of your personal data</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-700">
                                    <Lock className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                    <span><strong>Correction:</strong> Request correction of inaccurate data</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-700">
                                    <Lock className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                    <span><strong>Deletion:</strong> Request deletion of your personal data</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-700">
                                    <Lock className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                    <span><strong>Opt-out:</strong> Unsubscribe from marketing communications</span>
                                </li>
                            </ul>
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">6. Cookies and Tracking</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings and other tools.
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">7. Children&apos;s Privacy</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">8. Changes to Privacy Policy</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer at:
                        </p>
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-6">
                            <p className="font-semibold text-gray-900 mb-2">noi.lab Privacy Team</p>
                            <p className="text-gray-600">Email: privacy@noilab.com</p>
                            <p className="text-gray-600">Address: 123 Education Way, Suite 400, Tech District</p>
                            <p className="text-gray-600 mt-4 text-sm italic">Please include &quot;Privacy Inquiry&quot; in your subject line for faster routing.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPage;

"use client";

import React, { useState } from "react";
import { Mail, Send, MessageCircle, Clock } from "lucide-react";

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add your form submission logic here
        console.log("Form submitted:", formData);
        alert("Thank you for your message! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
                        <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                                <Mail className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Us</h3>
                            <p className="text-gray-600 mb-2">info@noilab.com</p>
                            <p className="text-gray-600">support@noilab.com</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
                                <MessageCircle className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Community</h3>
                            <p className="text-gray-600 mb-2">Join our support community</p>
                            <a href="/community" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Visit Community →
                            </a>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Response Time</h3>
                            <p className="text-gray-600">We typically respond within 24 hours during business days.</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <Send className="h-5 w-5" />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;

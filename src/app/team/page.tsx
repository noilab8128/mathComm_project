"use client";

import React from "react";
import { Mail, Linkedin, Github, Award, BookOpen, Users } from "lucide-react";

const TeamPage = () => {
    const teamMembers = [
        {
            name: "Mookwon Seo",
            role: "Co-Founder & Lead Developer",
            image: "/team/mookwon.jpg", // You can replace with actual image path
            bio: "Blah blah blah, passionate about mathematics education and technology. Blah blah creating innovative learning experiences. Blah blah empowering students worldwide through accessible education. Blah blah years of experience in educational technology and curriculum development.",
            email: "mookwon@noilab.com",
            linkedin: "https://linkedin.com",
            github: "https://github.com",
            expertise: ["Educational Technology", "Curriculum Design", "Full-Stack Development"],
            achievements: [
                "Developed innovative math learning platforms",
                "Published research in educational technology",
                "Mentored 100+ students in mathematics"
            ]
        },
        {
            name: "Sangin Oh",
            role: "Co-Founder & Education Director",
            image: "/team/sangin.jpg", // You can replace with actual image path
            bio: "Blah blah blah, dedicated to revolutionizing mathematics education. Blah blah extensive background in pedagogy and instructional design. Blah blah creating engaging content that makes complex concepts accessible. Blah blah commitment to educational equity and student success.",
            email: "sangin@noilab.com",
            linkedin: "https://linkedin.com",
            github: "https://github.com",
            expertise: ["Mathematics Education", "Instructional Design", "Student Engagement"],
            achievements: [
                "Designed comprehensive math curricula",
                "Trained educators in modern teaching methods",
                "Improved student outcomes by 40%"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Meet Our Team
                        </h1>
                        <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
                            Passionate educators and technologists dedicated to transforming mathematics education
                        </p>
                    </div>
                </div>
                {/* Decorative wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248, 250, 252)" />
                    </svg>
                </div>
            </section>

            {/* Team Members Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                        >
                            {/* Profile Header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-32"></div>

                            {/* Profile Image */}
                            <div className="relative px-8 -mt-16">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-indigo-400 to-purple-400 shadow-lg flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                            </div>

                            {/* Profile Content */}
                            <div className="px-8 py-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {member.name}
                                </h2>
                                <p className="text-indigo-600 font-semibold mb-4">
                                    {member.role}
                                </p>

                                {/* Bio */}
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    {member.bio}
                                </p>

                                {/* Expertise */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-indigo-500" />
                                        Expertise
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {member.expertise.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Achievements */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Award className="h-4 w-4 text-indigo-500" />
                                        Key Achievements
                                    </h3>
                                    <ul className="space-y-2">
                                        {member.achievements.map((achievement, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="text-indigo-500 mt-1">•</span>
                                                <span>{achievement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Contact Links */}
                                <div className="pt-6 border-t border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <a
                                            href={`mailto:${member.email}`}
                                            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                                            aria-label="Email"
                                        >
                                            <Mail className="h-5 w-5" />
                                        </a>
                                        <a
                                            href={member.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                                            aria-label="LinkedIn"
                                        >
                                            <Linkedin className="h-5 w-5" />
                                        </a>
                                        <a
                                            href={member.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                                            aria-label="GitHub"
                                        >
                                            <Github className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Join Our Team Section */}
                <div className="mt-20 text-center">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-12 text-white">
                        <Users className="h-16 w-16 mx-auto mb-4 opacity-90" />
                        <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
                        <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
                            We&apos;re always looking for passionate individuals who share our vision of making mathematics education accessible to everyone.
                        </p>
                        <a
                            href="/careers"
                            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
                        >
                            View Open Positions
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TeamPage;

"use client";

import React from "react";
import { Mail, Linkedin, Github, Award, BookOpen } from "lucide-react";

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
        <div className="bg-white">
            {/* Hero Section */}
            <section className="border-b border-slate-200 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-4">
                            Meet Our Team
                        </h1>
                        <p className="text-lg leading-relaxed text-slate-600">
                            Passionate educators and technologists dedicated to transforming mathematics education
                        </p>
                    </div>
                </div>
                {/* Decorative wave */}
            </section>

            {/* Team Members Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="rounded-lg border border-slate-200 bg-white"
                        >
                            {/* Profile Header */}
                            
                            {/* Profile Image */}
                            <div className="px-8 pt-8">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                                    <span className="font-serif text-xl font-semibold text-slate-700">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                            </div>

                            {/* Profile Content */}
                            <div className="px-8 py-6">
                                <h2 className="font-serif text-2xl font-semibold text-slate-900 mb-1">
                                    {member.name}
                                </h2>
                                <p className="text-sm text-slate-500 mb-4">
                                    {member.role}
                                </p>

                                {/* Bio */}
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {member.bio}
                                </p>

                                {/* Expertise */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-slate-500" />
                                        Expertise
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {member.expertise.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-700"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Achievements */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <Award className="h-4 w-4 text-slate-500" />
                                        Key Achievements
                                    </h3>
                                    <ul className="space-y-2">
                                        {member.achievements.map((achievement, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <span className="text-slate-500 mt-1">•</span>
                                                <span>{achievement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Contact Links */}
                                <div className="pt-6 border-t border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <a
                                            href={`mailto:${member.email}`}
                                            className="flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-900"
                                            aria-label="Email"
                                        >
                                            <Mail className="h-4 w-4" />
                                        </a>
                                        <a
                                            href={member.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-900"
                                            aria-label="LinkedIn"
                                        >
                                            <Linkedin className="h-4 w-4" />
                                        </a>
                                        <a
                                            href={member.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-900"
                                            aria-label="GitHub"
                                        >
                                            <Github className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Join Our Team Section */}
                <div className="mt-20 text-center">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-10">
                        <h2 className="font-serif text-3xl font-semibold text-slate-900 mb-3">Join our mission</h2>
                        <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                            We&apos;re always looking for passionate individuals who share our vision of making mathematics education accessible to everyone.
                        </p>
                        <a
                            href="/careers"
                            className="inline-block rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
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

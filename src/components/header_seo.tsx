"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Home, Settings, HelpCircle, LogOut, X, Search, Heart } from "lucide-react";

const HeaderSeo = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex justify-center items-center h-16">
                    {/* Search Bar - Absolute Left */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search problems..."
                                className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            />
                        </div>
                    </div>

                    {/* Logo and Team Name - Centered */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <img
                                src="/noilab_logo.png"
                                alt="NOI.LAB Logo"
                                className="object-contain w-full h-full mix-blend-multiply"
                            />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">
                            NOI.LAB
                        </span>
                    </div>

                    {/* Right Side Actions - Absolute Right */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
                        {/* Donate Button */}
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-sm hover:shadow-md font-medium text-sm"
                            onClick={() => {
                                // Add donate logic here
                                console.log("Donate clicked");
                            }}
                        >
                            <Heart className="h-4 w-4" />
                            Donate
                        </button>

                        {/* Menu Toggle Button */}
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                            aria-label="Open menu"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
                                <div className="py-1">
                                    <Link
                                        href="/"
                                        className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Home className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                        Home
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                        Setting
                                    </Link>
                                    <Link
                                        href="/faq"
                                        className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <HelpCircle className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                        FAQ/Help
                                    </Link>
                                </div>
                                <div className="py-1">
                                    <button
                                        className="group flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            // Add logout logic here
                                            console.log("Logout clicked");
                                        }}
                                    >
                                        <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderSeo;

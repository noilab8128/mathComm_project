"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    // Profile State
    const [nickname, setNickname] = useState("");
    const [gender, setGender] = useState("");
    const [country, setCountry] = useState("");
    const [language, setLanguage] = useState("en");

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Initialize state from session
    useEffect(() => {
        if (session?.user) {
            setNickname(session.user.nickname || "");
            setGender(session.user.gender || "");
            setCountry(session.user.country || "");
            setLanguage(session.user.language || "en");
        }
    }, [session]);

    if (!session) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nickname,
                    gender,
                    country,
                    language
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            setMessage({ text: "Profile updated successfully!", type: "success" });

            // Force session refresh so header updates
            await update({
                nickname,
                gender,
                country,
                language
            });

        } catch (error: unknown) {
            const err = error as Error;
            setMessage({ text: err.message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage({ text: "Passwords do not match.", type: "error" });
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
            setMessage({ text: "Password must be at least 8 characters with uppercase, lowercase, and a number.", type: "error" });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update password");
            }

            setMessage({ text: "Password updated successfully!", type: "success" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (error: unknown) {
            const err = error as Error;
            setMessage({ text: err.message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetOnboarding = async () => {
        if (!confirm("Are you sure you want to reset your onboarding state? This will clear your math category levels and you'll be redirected to the onboarding flow.")) return;

        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user/reset-onboarding", {
                method: "POST",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to reset onboarding");
            }

            // Update session so is_onboarded becomes false contextually
            await update({ is_onboarded: false });
            
            setMessage({ text: "Onboarding reset successfully! Redirecting...", type: "success" });
            
            setTimeout(() => {
                router.push("/onboarding");
            }, 1000);

        } catch (error: unknown) {
            const err = error as Error;
            setMessage({ text: err.message, type: "error" });
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Account Settings</h1>

            {message && (
                <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'} border`}>
                    {message.text}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="relative w-32 h-32 mb-4">
                            {session.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt="Profile"
                                    fill
                                    className="rounded-full object-cover border-4 border-indigo-50"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-4xl font-bold border-4 border-white shadow-sm">
                                    {session.user?.email?.[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-semibold mb-1">{nickname || session.user?.name || "User"}</h2>
                        <p className="text-gray-500 text-sm">{session.user?.email}</p>

                        <div className="mt-6 w-full pt-6 border-t border-gray-100">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Role</span>
                                <span className="font-medium text-indigo-600 capitalize">{session.user?.role || 'User'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className="font-medium text-green-600">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Forms */}
                <div className="md:col-span-2 space-y-8">
                    {/* Profile Information Form */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Profile Information</h3>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email / ID</label>
                                <input
                                    type="email"
                                    value={session.user?.email || ""}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                                <input
                                    type="text"
                                    placeholder="MathGenius99"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender (Optional)</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Prefer not to say</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="en">English</option>
                                        <option value="ko">Korean</option>
                                        <option value="ja">Japanese</option>
                                        <option value="zh">Chinese</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country / Region (Optional)</label>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a country...</option>
                                    <option value="US">United States</option>
                                    <option value="KR">South Korea</option>
                                    <option value="JP">Japan</option>
                                    <option value="GB">United Kingdom</option>
                                    <option value="CA">Canada</option>
                                    <option value="AU">Australia</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Saving...' : 'Save Profile Settings'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Password Change Form */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Change Password</h3>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="minimum 6 characters"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="minimum 6 characters"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Danger Zone: Testing / Reset */}
                    <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100 mt-8">
                        <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone / Testing</h3>
                        <p className="text-sm text-red-700 mb-4">
                            For testing purposes, you can reset your onboarding state. 
                            This will clear your selected goals, roles, and math categories, returning you to the onboarding flow.
                        </p>
                        <button
                            onClick={handleResetOnboarding}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? 'Processing...' : 'Reset Onboarding State'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
    GraduationCap, BookOpen, Calculator, Users, Plus, X, 
    ArrowRight, ArrowLeft, CheckCircle2, Target, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import { Category } from "@/lib/categories";

// --- Static Data ---
const ROLES = [
    { id: "Student", label: "Student", icon: GraduationCap },
    { id: "Teacher", label: "Teacher / Tutor", icon: BookOpen },
    { id: "Parent", label: "Parent", icon: Users },
    { id: "Enthusiast", label: "Math Enthusiast", icon: Calculator },
    { id: "Other", label: "Other", icon: Target },
];

const PREDEFINED_GOALS: Record<string, { category: string; goals: string[] }> = {
    Student: {
        category: "student",
        goals: ["IMO / National Olympiads", "AMC 10/12 / AIME", "SAT / ACT", "AP / IB / A-Levels", "School Exams / GPA", "Personal Interest / Fun"]
    },
    Default: {
        category: "general",
        goals: ["Classroom Teaching", "Creating Assignments", "Brain Training / Hobby", "Helping my child", "Personal Interest / Fun"]
    }
};

export default function OnboardingPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [role, setRole] = useState<string>("");
    const [goals, setGoals] = useState<string[]>([]);
    const [customGoal, setCustomGoal] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [levels, setLevels] = useState<Record<string, number>>({});
    
    // DB Categories State
    const [dbCategories, setDbCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setDbCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const level1Categories = dbCategories.filter(c => c.level === 1);
    const getLevel2Categories = (parentId: number) => dbCategories.filter(c => c.parent_id === parentId && c.level === 2);

    // Step 1: Role & Goals Handlers
    const toggleGoal = (goal: string) => {
        setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
    };

    const addCustomGoal = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customGoal.trim() !== '') {
            e.preventDefault();
            if (!goals.includes(customGoal.trim())) {
                setGoals([...goals, customGoal.trim()]);
            }
            setCustomGoal("");
        }
    };

    // Step 2: Categories Handlers
    const handleToggleCategory = (cat: Category, isParent: boolean, parentCat?: Category) => {
        setCategories(prev => {
            let newCats = [...prev];
            
            if (isParent) {
                if (newCats.includes(cat.name)) {
                    // Deselect
                    newCats = newCats.filter(c => c !== cat.name);
                } else {
                    // Select Parent: remove all children first for deduplication
                    const subCats = getLevel2Categories(cat.id).map(c => c.name);
                    newCats = newCats.filter(c => !subCats.includes(c));
                    if (newCats.length < 5) newCats.push(cat.name);
                    else return prev; // Limit reached
                }
            } else {
                if (newCats.includes(cat.name)) {
                    // Deselect
                    newCats = newCats.filter(c => c !== cat.name);
                } else {
                    // Select Child: remove parent first for deduplication
                    if (parentCat && newCats.includes(parentCat.name)) {
                        newCats = newCats.filter(c => c !== parentCat.name);
                    }
                    if (newCats.length < 5) newCats.push(cat.name);
                    else return prev; // Limit reached
                }
            }

            // Sync levels state
            const newLevels = { ...levels };
            Object.keys(newLevels).forEach(key => {
                if (!newCats.includes(key)) delete newLevels[key];
            });
            newCats.forEach(c => {
                if (!(c in newLevels)) newLevels[c] = 5;
            });
            setLevels(newLevels);
            
            return newCats;
        });
    };

    // Step 3: Level Handlers
    const handleLevelChange = (cat: string, value: number) => {
        setLevels(prev => ({ ...prev, [cat]: value }));
    };

    // Final Save
    const handleCompleteOnboarding = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    onboarding_data: {
                        role_type: role,
                        goals,
                        interested_categories: categories,
                        category_levels: levels,
                    },
                    is_onboarded: true
                })
            });

            if (!res.ok) {
                throw new Error("Failed to save onboarding data. Please try again.");
            }

            await update({ is_onboarded: true });
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
            alert("Oops! There was an issue saving your details. Please check the backend logs or try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Render Steps
    const renderStep1 = () => {
        const goalList = role === "Student" ? PREDEFINED_GOALS.Student.goals : PREDEFINED_GOALS.Default.goals;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                    <h2 className="text-base font-semibold text-slate-900">Which best describes you?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {ROLES.map(r => {
                            const Icon = r.icon;
                            const isSelected = role === r.id;
                            return (
                                <button
                                    key={r.id}
                                    onClick={() => setRole(r.id)}
                                    className={`flex flex-col items-center justify-center rounded-md border p-4 transition-colors ${
                                        isSelected 
                                        ? "border-slate-900 bg-slate-50 text-slate-900" 
                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                    <Icon className={`mb-2 h-6 w-6 ${isSelected ? "text-slate-900" : "text-slate-400"}`} />
                                    <span className="font-medium">{r.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {role && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h2 className="text-base font-semibold text-slate-900">What are your goals? <span className="ml-1 text-sm font-normal text-slate-500">Select all that apply.</span></h2>
                        <div className="flex flex-wrap gap-2">
                            {goalList.map(goal => {
                                const isSelected = goals.includes(goal);
                                return (
                                    <button
                                        key={goal}
                                        onClick={() => toggleGoal(goal)}
                                        className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                            isSelected 
                                            ? "bg-slate-800 text-white border-slate-800" 
                                            : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                                        }`}
                                    >
                                        {goal}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Custom Goal Input */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {goals.filter(g => !goalList.includes(g)).map(custom => (
                                <span key={custom} className="flex items-center gap-2 rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-sm text-white">
                                    {custom}
                                    <button onClick={() => toggleGoal(custom)} className="hover:text-slate-300"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder="Add another goal and press Enter"
                                value={customGoal}
                                onChange={e => setCustomGoal(e.target.value)}
                                onKeyDown={addCustomGoal}
                                className="h-9 w-64 rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderStep2 = () => {
        if (isLoadingCategories) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-500 gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    <p className="text-sm">Loading topics…</p>
                </div>
            );
        }

        return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-base font-semibold text-slate-900">Which areas interest you most?</h2>
                <p className="mt-1 text-sm text-slate-500">Choose up to five, broad or specific. We use them to recommend problems.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                {level1Categories.map((parentCat) => {
                    const isParentSelected = categories.includes(parentCat.name);
                    const isParentDisabled = !isParentSelected && categories.length >= 5;
                    const subCategories = getLevel2Categories(parentCat.id);
                    
                    return (
                        <div key={parentCat.id} className={`flex flex-col rounded-md border p-4 transition-colors ${
                            isParentSelected ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
                        }`}>
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    disabled={isParentDisabled}
                                    onClick={() => handleToggleCategory(parentCat, true)}
                                    className={`flex-1 flex items-center gap-3 font-semibold transition-colors focus:outline-none text-left ${
                                        isParentSelected ? "text-slate-900" : isParentDisabled ? "text-slate-400" : "text-slate-700 hover:text-slate-900"
                                    }`}
                                >
                                    <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                                        isParentSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
                                    }`}>
                                        {isParentSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </div>
                                    <span>{parentCat.name}</span>
                                </button>
                            </div>

                            {subCategories.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 pl-8">
                                    {subCategories.map(subCat => {
                                        const isSubSelected = categories.includes(subCat.name);
                                        const isSubDisabled = !isSubSelected && categories.length >= 5;
                                        
                                        return (
                                            <button
                                                key={subCat.id}
                                                type="button"
                                                disabled={isSubDisabled}
                                                onClick={() => handleToggleCategory(subCat, false, parentCat)}
                                                className={`rounded border px-2 py-1 text-xs transition-colors ${
                                                    isSubSelected
                                                    ? "border-slate-900 bg-slate-900 text-white"
                                                    : isSubDisabled
                                                        ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400"
                                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                }`}
                                            >
                                                {subCat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="flex justify-between items-center text-sm font-medium pt-2 border-t border-slate-100">
                <span className="hidden text-xs font-normal text-slate-500 sm:inline-block">Picking a specific area replaces its broad area.</span>
                <span className={`tnum ml-auto ${categories.length === 5 ? "text-slate-900" : "text-slate-500"}`}>
                    {categories.length} of 5 selected
                </span>
            </div>
        </div>
        );
    };

    const renderStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-base font-semibold text-slate-900">How strong are you in each area?</h2>
                <p className="mt-1 text-sm text-slate-500">A rough guess is fine. It sets your starting difficulty.</p>
            </div>

            <div className="space-y-6 rounded-md border border-slate-200 bg-white p-6">
                {categories.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        Please go back and select at least one category.
                    </div>
                ) : (
                    categories.map(cat => (
                        <div key={cat} className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-slate-700">{cat}</span>
                                <span className="tnum rounded border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                                    {levels[cat] || 5} / 10
                                </span>
                            </div>
                            <div className="relative pt-2">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    step="1"
                                    value={levels[cat] || 5}
                                    onChange={(e) => handleLevelChange(cat, parseInt(e.target.value))}
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded bg-slate-200 accent-slate-900"
                                />
                                <div className="relative h-6 text-xs font-medium text-slate-400 mt-2">
                                    <span className="absolute left-0">1 (Beginner)</span>
                                    {/* 4/9 of the width is exact position of value=5 on 1-10 scale */}
                                    <span className="absolute left-[44.4%] -translate-x-1/2">5</span>
                                    <span className="absolute right-0">10 (Expert)</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const canProceed = () => {
        if (step === 1) return role !== "" && goals.length > 0;
        if (step === 2) return categories.length > 0;
        return true;
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                {/* Progress Bar */}
                <div className="flex h-1 w-full bg-slate-100">
                    <div className="h-full bg-slate-900 transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
                </div>

                <div className="p-8 md:p-10">
                    {/* Header */}
                    <div className="mb-8">
                        <p className="tnum text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Step {step} of 3</p>
                        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">Set up your Math Quest</h1>
                    </div>

                    {/* Dynamic Content */}
                    <div className="min-h-[360px]">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </div>

                    {/* Footer / Navigation */}
                    <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-100">
                        <button 
                            onClick={() => setStep(Math.max(1, step - 1))}
                            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
                                step === 1 ? "invisible" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            }`}
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        
                        {step < 3 ? (
                            <button 
                                onClick={() => setStep(step + 1)}
                                disabled={!canProceed()}
                                className="flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                Continue <ArrowRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button 
                                onClick={handleCompleteOnboarding}
                                disabled={isSaving || !canProceed()}
                                className="flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-70"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving…
                                    </>
                                ) : (
                                    <>
                                        Finish and start solving <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

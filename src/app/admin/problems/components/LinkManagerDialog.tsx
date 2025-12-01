import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Problem } from "../types";

interface LinkManagerDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    problemId: string | null;
    problems: Problem[];
    onDeleteLink: (sourceId: string, targetId: string) => void;
}

export function LinkManagerDialog({
    isOpen,
    onOpenChange,
    problemId,
    problems,
    onDeleteLink
}: LinkManagerDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl">🔗 문제 링크 관리</DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    {problemId && (
                        <div className="space-y-4 py-4">
                            {/* Current Problem Info */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-sm text-gray-700 mb-2">현재 문제</h3>
                                <p className="font-medium">{problems.find(p => p.id === problemId)?.title}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    난이도: D{problems.find(p => p.id === problemId)?.difficulty}
                                </p>
                            </div>

                            {/* Outgoing Links (from this problem) */}
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700 mb-3">나가는 링크 (이 문제에서 →)</h3>
                                {(() => {
                                    const currentProblem = problems.find(p => p.id === problemId);
                                    const outgoingLinks = currentProblem?.linkedProblems || [];

                                    if (outgoingLinks.length === 0) {
                                        return <p className="text-sm text-gray-500 italic">링크가 없습니다</p>;
                                    }

                                    return (
                                        <div className="space-y-2">
                                            {outgoingLinks.map((targetId) => {
                                                const targetProblem = problems.find(p => p.id === targetId);
                                                if (!targetProblem) return null;

                                                return (
                                                    <div key={targetId} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{targetProblem.title}</p>
                                                            <p className="text-xs text-gray-500">난이도: D{targetProblem.difficulty}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => onDeleteLink(problemId, targetId)}
                                                            className="text-xs text-red-600 hover:text-red-800 hover:underline px-3 py-1"
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Incoming Links (to this problem) */}
                            <div>
                                <h3 className="font-semibold text-sm text-gray-700 mb-3">들어오는 링크 (→ 이 문제로)</h3>
                                {(() => {
                                    const incomingProblems = problems.filter(p =>
                                        p.linkedProblems?.includes(problemId) ||
                                        p.id !== problemId && p.parentProblemId === problemId
                                    );

                                    if (incomingProblems.length === 0) {
                                        return <p className="text-sm text-gray-500 italic">링크가 없습니다</p>;
                                    }

                                    return (
                                        <div className="space-y-2">
                                            {incomingProblems.map((sourceProblem) => (
                                                <div key={sourceProblem.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{sourceProblem.title}</p>
                                                        <p className="text-xs text-gray-500">난이도: D{sourceProblem.difficulty}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => onDeleteLink(sourceProblem.id, problemId)}
                                                        className="text-xs text-red-600 hover:text-red-800 hover:underline px-3 py-1"
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </ScrollArea>

                <div className="flex justify-end pt-4 border-t">
                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                    >
                        닫기
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface CreateLinkDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    draggedProblemId: string | null;
    dropTargetId: string | null;
    problems: Problem[];
    linkType: 'prerequisite' | 'derived' | 'related' | 'next' | 'alternative';
    setLinkType: (type: 'prerequisite' | 'derived' | 'related' | 'next' | 'alternative') => void;
    linkConcept: string;
    setLinkConcept: (concept: string) => void;
    onCreateLink: () => void;
    onCancel: () => void;
}

export function CreateLinkDialog({
    isOpen,
    onOpenChange,
    draggedProblemId,
    dropTargetId,
    problems,
    linkType,
    setLinkType,
    linkConcept,
    setLinkConcept,
    onCreateLink,
    onCancel
}: CreateLinkDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl">🔗 문제 링크 생성</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Link Information Display */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        {draggedProblemId && dropTargetId && (
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-600 font-semibold text-sm">출발:</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{problems.find(p => p.id === draggedProblemId)?.title || 'Unknown'}</p>
                                        <p className="text-xs text-gray-600">
                                            난이도: D{problems.find(p => p.id === draggedProblemId)?.difficulty}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <span className="text-2xl text-blue-500">↓</span>
                                </div>

                                <div className="flex items-start gap-2">
                                    <span className="text-green-600 font-semibold text-sm">도착:</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{problems.find(p => p.id === dropTargetId)?.title || 'Unknown'}</p>
                                        <p className="text-xs text-gray-600">
                                            난이도: D{problems.find(p => p.id === dropTargetId)?.difficulty}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Link Type Selection */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            링크 타입 선택
                        </label>
                        <div className="space-y-2">
                            {[
                                { value: 'derived', label: '🌱 파생 문제', desc: '도착 문제가 출발 문제로부터 파생됨' },
                                { value: 'prerequisite', label: '📚 선수 학습', desc: '출발 문제를 먼저 풀어야 도착 문제를 풀 수 있음' },
                                { value: 'related', label: '🔗 관련 문제', desc: '비슷한 개념을 다루는 문제들' },
                                { value: 'next', label: '➡️ 다음 문제', desc: '도착 문제가 출발 문제 다음에 추천되는 문제' },
                                { value: 'alternative', label: '🔄 대체 문제', desc: '같은 개념의 다른 난이도 문제' },
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`
                        flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${linkType === option.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                      `}
                                >
                                    <input
                                        type="radio"
                                        name="linkType"
                                        value={option.value}
                                        checked={linkType === option.value}
                                        onChange={(e) => setLinkType(e.target.value as any)}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{option.label}</div>
                                        <div className="text-xs text-gray-500">{option.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Concept/Tag Input */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            개념/태그 (선택사항)
                        </label>
                        <Input
                            value={linkConcept}
                            onChange={(e) => setLinkConcept(e.target.value)}
                            placeholder="예: 대수학, 기하학, 등차수열..."
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            이 링크와 관련된 수학 개념을 입력하면 학습 경로를 더 잘 구성할 수 있습니다.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                        onClick={onCancel}
                        variant="outline"
                    >
                        취소
                    </Button>
                    <Button
                        onClick={onCreateLink}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        ✅ 링크 생성
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

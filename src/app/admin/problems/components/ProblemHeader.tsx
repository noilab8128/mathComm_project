import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Database, RefreshCw } from "lucide-react";

interface ProblemHeaderProps {
    isDbConnected: boolean;
    onSync: () => void;
    onExport: () => void;
    onNewProblem: () => void;
    onManageLinks: () => void;
    isLoadingFromDb: boolean;
}

export function ProblemHeader({
    isDbConnected,
    onSync,
    onExport,
    onNewProblem,
    onManageLinks,
    isLoadingFromDb
}: ProblemHeaderProps) {
    return (
        <>
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Problem Content Management</h1>
                    <p className="text-sm text-gray-500">Create, edit, and manage math problems</p>
                    {/* DB Connection Status */}
                    <div className="mt-2 flex items-center gap-2">
                        {isLoadingFromDb ? (
                            <Badge variant="outline" className="gap-1">
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Loading from DB...
                            </Badge>
                        ) : isDbConnected ? (
                            <Badge className="gap-1 bg-green-600">
                                <Database className="h-3 w-3" />
                                Connected to Supabase
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="gap-1">
                                <Database className="h-3 w-3" />
                                Local Mode
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={onSync}
                        variant="outline"
                        size="sm"
                        disabled={isLoadingFromDb}
                        className="gap-1"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoadingFromDb ? 'animate-spin' : ''}`} />
                        Sync from DB
                    </Button>
                    <Button
                        onClick={onExport}
                        variant="outline"
                        size="sm"
                        className="gap-1"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button
                        onClick={onNewProblem}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        size="sm"
                    >
                        <span className="text-lg leading-none">+</span>
                        New Problem
                    </Button>
                    <Button onClick={onManageLinks} variant="outline" className="gap-2" size="sm">
                        🔗 Manage Links
                    </Button>
                </div>
            </header>
            <Separator />
        </>
    );
}

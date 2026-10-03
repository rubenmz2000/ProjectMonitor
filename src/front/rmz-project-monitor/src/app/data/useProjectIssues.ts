import { useCallback, useEffect, useState } from 'react';
import type { Issue } from '../../models/IssueModel.ts';
import { getProjectIssues } from '../../serivces/ApiService.ts';

export interface ProjectIssues {
    issues: Issue[];
    /** True until the first load for the current project finishes; refetches keep the old list. */
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface Loaded {
    projectId: string;
    issues: Issue[];
    error: string | null;
}

async function fetchIssues(projectId: string): Promise<Loaded> {
    try {
        return { projectId, issues: await getProjectIssues(projectId), error: null };
    } catch {
        return { projectId, issues: [], error: 'Failed to load issues' };
    }
}

/** Loads the issues of one project. Results are tied to the project id they were loaded for. */
export function useProjectIssues(projectId: string | null): ProjectIssues {
    const [loaded, setLoaded] = useState<Loaded | null>(null);

    useEffect(() => {
        if (!projectId) return;
        let cancelled = false;
        fetchIssues(projectId).then((result) => { if (!cancelled) setLoaded(result); });
        return () => { cancelled = true; };
    }, [projectId]);

    const refetch = useCallback(async () => {
        if (projectId) setLoaded(await fetchIssues(projectId));
    }, [projectId]);

    const current = projectId && loaded?.projectId === projectId ? loaded : null;
    return {
        issues: current?.issues ?? [],
        loading: !!projectId && current === null,
        error: current?.error ?? null,
        refetch,
    };
}

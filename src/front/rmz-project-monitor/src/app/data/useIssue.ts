import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import type { IssueDetailData } from '../../models/IssueDetailModel.ts';
import { getIssueByIdentifier } from '../../serivces/ApiService.ts';

export interface IssueState {
    issue: IssueDetailData | null;
    loading: boolean;
    notFound: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    /** Replaces the loaded issue (e.g. with the response of a mutation). */
    setIssue: (issue: IssueDetailData) => void;
}

interface Loaded {
    identifier: string;
    issue: IssueDetailData | null;
    notFound: boolean;
    error: string | null;
}

async function fetchIssue(identifier: string): Promise<Loaded> {
    try {
        return { identifier, issue: await getIssueByIdentifier(identifier), notFound: false, error: null };
    } catch (e) {
        // 404: no such project/issue; 400: the identifier is not PREFIX-NNN
        const status = isAxiosError(e) ? e.response?.status : undefined;
        if (status === 404 || status === 400) return { identifier, issue: null, notFound: true, error: null };
        return { identifier, issue: null, notFound: false, error: 'Failed to load the issue' };
    }
}

/** Loads one issue by its human identifier. Results are tied to the identifier they were loaded for. */
export function useIssue(identifier: string | undefined): IssueState {
    const [loaded, setLoaded] = useState<Loaded | null>(null);

    useEffect(() => {
        if (!identifier) return;
        let cancelled = false;
        fetchIssue(identifier).then((result) => { if (!cancelled) setLoaded(result); });
        return () => { cancelled = true; };
    }, [identifier]);

    const refetch = useCallback(async () => {
        if (identifier) setLoaded(await fetchIssue(identifier));
    }, [identifier]);

    const setIssue = useCallback((issue: IssueDetailData) => {
        if (identifier) setLoaded({ identifier, issue, notFound: false, error: null });
    }, [identifier]);

    const current = identifier && loaded?.identifier === identifier ? loaded : null;
    return {
        issue: current?.issue ?? null,
        loading: !!identifier && current === null,
        notFound: current?.notFound ?? false,
        error: current?.error ?? null,
        refetch,
        setIssue,
    };
}

import { useCallback, useEffect, useState } from 'react';
import type { IssueActivity } from '../../models/IssueActivityModel.ts';
import { getIssueActivity } from '../../serivces/ApiService.ts';

export interface IssueActivityState {
    activities: IssueActivity[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    /** Adds an activity the API just returned, without reloading the whole history. */
    append: (activity: IssueActivity) => void;
}

interface Loaded {
    identifier: string;
    activities: IssueActivity[];
    error: string | null;
}

async function fetchActivity(identifier: string): Promise<Loaded> {
    try {
        return { identifier, activities: await getIssueActivity(identifier), error: null };
    } catch {
        return { identifier, activities: [], error: 'Failed to load activity' };
    }
}

/** Loads the chronological activity (history and comments) of one issue. */
export function useIssueActivity(identifier: string | undefined): IssueActivityState {
    const [loaded, setLoaded] = useState<Loaded | null>(null);

    useEffect(() => {
        if (!identifier) return;
        let cancelled = false;
        fetchActivity(identifier).then((result) => { if (!cancelled) setLoaded(result); });
        return () => { cancelled = true; };
    }, [identifier]);

    const refetch = useCallback(async () => {
        if (identifier) setLoaded(await fetchActivity(identifier));
    }, [identifier]);

    const append = useCallback((activity: IssueActivity) => {
        setLoaded((prev) => (prev && prev.identifier === identifier
            ? { ...prev, activities: [...prev.activities, activity] }
            : prev));
    }, [identifier]);

    const current = identifier && loaded?.identifier === identifier ? loaded : null;
    return {
        activities: current?.activities ?? [],
        loading: !!identifier && current === null,
        error: current?.error ?? null,
        refetch,
        append,
    };
}

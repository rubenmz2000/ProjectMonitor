import { createContext } from 'react';
import type { Project } from '../../models/ProjectModel.ts';

export interface RouteProjectState {
    /** Prefix derived from the current URL (project routes or an issue identifier), or null. */
    prefix: string | null;
    project: Project | null;
    loading: boolean;
    /** Set when the prefix exists in the URL but no project matches it. */
    notFound: boolean;
}

export const RouteProjectContext = createContext<RouteProjectState>({
    prefix: null,
    project: null,
    loading: false,
    notFound: false,
});

/** Extracts the project prefix from an issue identifier such as "PM-007". */
export function prefixFromIssueIdentifier(issueIdentifier: string): string | null {
    const lastDash = issueIdentifier.lastIndexOf('-');
    if (lastDash <= 0) return null;
    return issueIdentifier.slice(0, lastDash).toUpperCase();
}

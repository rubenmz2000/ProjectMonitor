import { useEffect, useState, type ReactNode } from 'react';
import { useMatch } from 'react-router-dom';
import type { Project } from '../../models/ProjectModel.ts';
import { getProjectByPrefix } from '../../serivces/ApiService.ts';
import { RouteProjectContext, prefixFromIssueIdentifier, type RouteProjectState } from './RouteProjectContext.ts';

interface Lookup {
    prefix: string;
    project: Project | null;
    notFound: boolean;
}

/**
 * Resolves the project the current route belongs to, so the shell (sidebar, breadcrumbs) and the
 * pages share one lookup. Routes considered: /projects/:prefix/* and /issues/:issueIdentifier.
 */
function RouteProjectProvider({ children }: { children: ReactNode }) {
    const projectMatch = useMatch('/projects/:prefix/*');
    const issueMatch = useMatch('/issues/:issueIdentifier');

    const prefix = projectMatch?.params.prefix
        ? projectMatch.params.prefix.toUpperCase()
        : issueMatch?.params.issueIdentifier
            ? prefixFromIssueIdentifier(issueMatch.params.issueIdentifier)
            : null;

    // The last completed lookup; derived state below compares it with the current prefix
    const [lookup, setLookup] = useState<Lookup | null>(null);

    useEffect(() => {
        if (!prefix) return;
        let cancelled = false;
        getProjectByPrefix(prefix)
            .then((project) => { if (!cancelled) setLookup({ prefix, project, notFound: false }); })
            .catch(() => { if (!cancelled) setLookup({ prefix, project: null, notFound: true }); });
        return () => { cancelled = true; };
    }, [prefix]);

    const current = prefix && lookup?.prefix === prefix ? lookup : null;
    const value: RouteProjectState = {
        prefix,
        project: current?.project ?? null,
        loading: !!prefix && current === null,
        notFound: current?.notFound ?? false,
    };

    return <RouteProjectContext.Provider value={value}>{children}</RouteProjectContext.Provider>;
}

export default RouteProjectProvider;

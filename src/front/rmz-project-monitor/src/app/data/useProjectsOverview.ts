import { useCallback, useEffect, useState } from 'react';
import type { Project } from '../../models/ProjectModel.ts';
import type { Issue } from '../../models/IssueModel.ts';
import { IssueStatus } from '../../models/enums/IssueStatus.ts';
import { ProjectStatus } from '../../models/enums/ProjectStatus.ts';
import { getAllProjects, getProjectIssues } from '../../serivces/ApiService.ts';

export interface ProjectWithIssueStats extends Project {
    issueCounts: Record<IssueStatus, number>;
    totalIssues: number;
}

export interface ProjectsOverviewTotals {
    projectCount: number;
    projectsByStatus: Record<ProjectStatus, number>;
    issueCount: number;
    issuesByStatus: Record<IssueStatus, number>;
}

export interface ProjectsOverview {
    projects: ProjectWithIssueStats[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    totals: ProjectsOverviewTotals;
}

function emptyIssueCounts(): Record<IssueStatus, number> {
    return { ToDo: 0, InProgress: 0, Blocked: 0, Done: 0, Cancelled: 0 };
}

function emptyProjectCounts(): Record<ProjectStatus, number> {
    return { NotStarted: 0, InProgress: 0, Paused: 0, Completed: 0, Archived: 0 };
}

/**
 * Loads every project and, for each, its issues, and derives the aggregates the Home dashboard
 * and the Projects list need (issue counts per project, totals by status). There is no aggregate
 * endpoint yet (see docs/current-state.md), so this fetches per project; fine while the number
 * of projects stays small.
 */
export function useProjectsOverview(): ProjectsOverview {
    const [projects, setProjects] = useState<ProjectWithIssueStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(0);

    const refetch = useCallback(() => setVersion((v) => v + 1), []);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const baseProjects = await getAllProjects();
                const issuesByProject = await Promise.all(
                    baseProjects.map((p) => getProjectIssues(p.id).catch((): Issue[] => []))
                );
                if (cancelled) return;

                const enriched = baseProjects.map((project, index) => {
                    const counts = emptyIssueCounts();
                    for (const issue of issuesByProject[index]) {
                        const status = issue.status as IssueStatus;
                        if (status in counts) counts[status] += 1;
                    }
                    return { ...project, issueCounts: counts, totalIssues: issuesByProject[index].length };
                });

                setProjects(enriched);
            } catch {
                if (!cancelled) {
                    setError('Failed to load the projects overview');
                    setProjects([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [version]);

    const projectsByStatus = emptyProjectCounts();
    const issuesByStatus = emptyIssueCounts();
    let issueCount = 0;
    for (const project of projects) {
        const status = project.status as ProjectStatus;
        if (status in projectsByStatus) projectsByStatus[status] += 1;
        (Object.keys(issuesByStatus) as IssueStatus[]).forEach((key) => {
            issuesByStatus[key] += project.issueCounts[key];
        });
        issueCount += project.totalIssues;
    }

    return {
        projects,
        loading,
        error,
        refetch,
        totals: {
            projectCount: projects.length,
            projectsByStatus,
            issueCount,
            issuesByStatus,
        },
    };
}

import { useOutletContext } from 'react-router-dom';
import type { Project } from '../../models/ProjectModel.ts';
import type { Issue } from '../../models/IssueModel.ts';

/** What the project workspace layout shares with the project pages rendered inside it. */
export interface ProjectWorkspaceContext {
    project: Project;
    issues: Issue[];
    issuesLoading: boolean;
    issuesError: string | null;
    refetchIssues: () => Promise<void>;
    openCreateIssue: () => void;
    /** Identifier of the issue created last from this workspace, to point it out in lists. */
    lastCreatedIssue: string | null;
}

/** Access to the project workspace from a page rendered in its outlet. */
export function useProjectWorkspace(): ProjectWorkspaceContext {
    return useOutletContext<ProjectWorkspaceContext>();
}

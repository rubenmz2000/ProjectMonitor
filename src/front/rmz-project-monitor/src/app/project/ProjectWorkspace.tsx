import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';
import { EmptyState, useAlert } from '../../rmz-ui/index.ts';
import { useRouteProject } from '../shell/useRouteProject.ts';
import { useProjectIssues } from '../data/useProjectIssues.ts';
import CreateIssueDialog from '../../components/Dialogs/CreateIssue/CreateIssueDialog.tsx';
import ProjectHeader from './ProjectHeader.tsx';
import type { ProjectWorkspaceContext } from './useProjectWorkspace.ts';
import './ProjectWorkspace.css';

interface CreatedIssue {
    projectId: string;
    identifier: string;
}

/**
 * Layout of every page that belongs to a project (/projects/:prefix/*): the project header and
 * the issue creation flow, with the page itself in the outlet. Future project areas are new
 * child routes plus a sidebar entry; they inherit this header.
 */
function ProjectWorkspace() {
    const navigate = useNavigate();
    const { notify } = useAlert();
    const { prefix, project, loading, notFound } = useRouteProject();
    const { issues, loading: issuesLoading, error: issuesError, refetch } = useProjectIssues(project?.id ?? null);
    const [createOpen, setCreateOpen] = useState(false);
    const [lastCreated, setLastCreated] = useState<CreatedIssue | null>(null);

    if (loading) {
        return (
            <div className="rmz-project-workspace__loading">
                <CircularProgress />
            </div>
        );
    }

    if (notFound || !project) {
        return (
            <EmptyState
                icon={<FolderOffOutlinedIcon />}
                title="Project not found"
                description={`No project uses the prefix "${prefix}".`}
                action={<Button variant="outlined" onClick={() => navigate('/projects')}>Go to projects</Button>}
            />
        );
    }

    const handleCreateClose = async (result: string, issueIdentifier?: string) => {
        setCreateOpen(false);
        if (result === 'submit' && issueIdentifier) {
            notify(`Issue ${issueIdentifier} created`, 'success');
            await refetch();
            setLastCreated({ projectId: project.id, identifier: issueIdentifier });
        } else if (result === 'error') {
            notify('An error occurred while creating the issue', 'error');
        }
    };

    const context: ProjectWorkspaceContext = {
        project,
        issues,
        issuesLoading,
        issuesError,
        refetchIssues: refetch,
        openCreateIssue: () => setCreateOpen(true),
        lastCreatedIssue: lastCreated?.projectId === project.id ? lastCreated.identifier : null,
    };

    return (
        <div className="rmz-project-workspace">
            <ProjectHeader
                project={project}
                issues={issues}
                issuesLoading={issuesLoading}
                onCreateIssue={() => setCreateOpen(true)}
            />
            <Outlet context={context} />
            <CreateIssueDialog
                open={createOpen}
                projectId={project.id}
                issuePrefix={project.issuePrefix}
                onClose={handleCreateClose}
            />
        </div>
    );
}

export default ProjectWorkspace;

import { useLayoutEffect, useRef, useState } from 'react';
import { Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PageHeader, StatusBar, StatusDot } from '../../rmz-ui/index.ts';
import type { Project } from '../../models/ProjectModel.ts';
import type { Issue } from '../../models/IssueModel.ts';
import type { IssueStatus } from '../../models/enums/IssueStatus.ts';
import type { ProjectStatus } from '../../models/enums/ProjectStatus.ts';
import {
    ISSUE_STATUS_COLORS,
    ISSUE_STATUS_LABELS,
    ISSUE_STATUS_ORDER,
    PROJECT_STATUS_COLORS,
    PROJECT_STATUS_LABELS,
} from '../domain/statusPresentation.ts';

dayjs.extend(utc);
dayjs.extend(relativeTime);

/** The description, limited to two lines with a toggle when it is longer than that. */
function ProjectDescription({ text }: { text: string }) {
    const ref = useRef<HTMLParagraphElement>(null);
    const [expanded, setExpanded] = useState(false);
    const [overflows, setOverflows] = useState(false);

    useLayoutEffect(() => {
        const element = ref.current;
        // Measured only while clamped; once expanded the toggle must stay to collapse it again
        if (!element || expanded) return;
        const observer = new ResizeObserver(() => {
            setOverflows(element.scrollHeight > element.clientHeight + 1);
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [expanded, text]);

    return (
        <div className="rmz-project-header__description-block">
            <p
                ref={ref}
                className={`rmz-project-header__description${expanded ? '' : ' rmz-project-header__description--clamped'}`}
            >
                {text}
            </p>
            {overflows && (
                <button type="button" className="rmz-project-header__more" onClick={() => setExpanded((v) => !v)}>
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}
        </div>
    );
}

interface ProjectHeaderProps {
    project: Project;
    issues: Issue[];
    issuesLoading: boolean;
    onCreateIssue: () => void;
}

/** Context of the project shared by every page of its workspace. */
function ProjectHeader({ project, issues, issuesLoading, onCreateIssue }: ProjectHeaderProps) {
    const status = project.status as ProjectStatus;
    const counts = ISSUE_STATUS_ORDER.map((s) => ({
        key: s,
        label: ISSUE_STATUS_LABELS[s],
        value: issues.filter((i) => (i.status as IssueStatus) === s).length,
        color: ISSUE_STATUS_COLORS[s],
    }));

    return (
        <PageHeader
            leading={<Chip size="small" variant="outlined" label={project.issuePrefix} className="rmz-project-header__prefix" />}
            title={project.name}
            titleAdornment={
                <StatusDot
                    label={PROJECT_STATUS_LABELS[status] ?? project.status}
                    color={PROJECT_STATUS_COLORS[status] ?? 'var(--neutral)'}
                />
            }
            actions={
                <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateIssue}>
                    New issue
                </Button>
            }
        >
            {project.description && <ProjectDescription text={project.description} />}
            <div className="rmz-project-header__summary">
                <span className="rmz-project-header__meta">
                    Updated {dayjs.utc(project.updatedAt).local().fromNow()}
                    {!issuesLoading && <> · {issues.length} issue{issues.length === 1 ? '' : 's'}</>}
                </span>
                {!issuesLoading && issues.length > 0 && (
                    <div className="rmz-project-header__breakdown">
                        <StatusBar segments={counts} />
                    </div>
                )}
            </div>
        </PageHeader>
    );
}

export default ProjectHeader;

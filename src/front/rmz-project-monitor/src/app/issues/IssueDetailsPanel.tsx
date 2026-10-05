import { Link } from 'react-router-dom';
import { Card, Chip } from '@mui/material';
import { PropertyList, StatusDot } from '../../rmz-ui/index.ts';
import type { PropertyListItem } from '../../rmz-ui/index.ts';
import type { IssueDetailData } from '../../models/IssueDetailModel.ts';
import type { Actor } from '../../models/ActorModel.ts';
import type { IssueStatus } from '../../models/enums/IssueStatus.ts';
import type { Priority } from '../../models/enums/Priority.ts';
import { ISSUE_STATUS_COLORS, ISSUE_STATUS_LABELS, PRIORITY_LABELS } from '../domain/statusPresentation.ts';
import { issueDueDate } from '../domain/issueDueDate.ts';
import ActorLabel from '../actors/ActorLabel.tsx';
import RelativeTime from '../time/RelativeTime.tsx';
import AssigneeEditor from './AssigneeEditor.tsx';
import './IssueDetailsPanel.css';

interface IssueDetailsPanelProps {
    issue: IssueDetailData;
    actors: Actor[];
    onAssign: (assigneeId: string | null, note: string) => Promise<boolean>;
}

/**
 * What state the issue is in. Only the assignee can be changed today; the rest is read-only
 * until the backend supports changing it.
 */
function IssueDetailsPanel({ issue, actors, onAssign }: IssueDetailsPanelProps) {
    const status = issue.status as IssueStatus;
    const due = issueDueDate(issue);

    const items: PropertyListItem[] = [
        {
            key: 'status',
            label: 'Status',
            value: (
                <StatusDot
                    label={ISSUE_STATUS_LABELS[status] ?? issue.status}
                    color={ISSUE_STATUS_COLORS[status] ?? 'var(--neutral)'}
                />
            ),
        },
        {
            key: 'assignee',
            label: 'Assignee',
            value: <ActorLabel actor={issue.assignee} />,
            action: <AssigneeEditor current={issue.assignee} actors={actors} onAssign={onAssign} />,
        },
        { key: 'priority', label: 'Priority', value: PRIORITY_LABELS[issue.priority as Priority] ?? issue.priority },
        {
            key: 'due',
            label: 'Due',
            value: due ? due.format('DD/MM/YYYY') : <span className="rmz-issue-details__muted">—</span>,
        },
        { key: 'reporter', label: 'Reporter', value: <ActorLabel actor={issue.createdBy} /> },
        {
            key: 'project',
            label: 'Project',
            value: (
                <Link to={`/projects/${issue.issuePrefix}/issues`} className="rmz-issue-details__project">
                    <Chip size="small" variant="outlined" label={issue.issuePrefix} className="rmz-issue-details__prefix" />
                    <span className="rmz-issue-details__project-name">{issue.projectName}</span>
                </Link>
            ),
        },
        { key: 'created', label: 'Created', value: <RelativeTime value={issue.creationDate} /> },
        { key: 'updated', label: 'Updated', value: <RelativeTime value={issue.updatedAt} /> },
    ];

    return (
        <Card className="rmz-issue-details">
            <h2 className="rmz-issue-details__title">Details</h2>
            <PropertyList items={items} />
        </Card>
    );
}

export default IssueDetailsPanel;

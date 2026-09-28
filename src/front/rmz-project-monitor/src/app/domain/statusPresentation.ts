/**
 * Human labels and theme colors for the status enums, in one place so the Projects list and the
 * Home dashboard render them consistently. Colors come from rmzTokens, never hardcoded.
 */
import { rmzTokens } from '../../rmz-ui/index.ts';
import { ProjectStatus } from '../../models/enums/ProjectStatus.ts';
import { IssueStatus } from '../../models/enums/IssueStatus.ts';

const c = rmzTokens.color;

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
    ProjectStatus.NotStarted,
    ProjectStatus.InProgress,
    ProjectStatus.Paused,
    ProjectStatus.Completed,
    ProjectStatus.Archived,
];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    NotStarted: 'Not started',
    InProgress: 'In progress',
    Paused: 'Paused',
    Completed: 'Completed',
    Archived: 'Archived',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
    NotStarted: c.neutral,
    InProgress: c.info,
    Paused: c.warning,
    Completed: c.success,
    Archived: c.blue,
};

export const ISSUE_STATUS_ORDER: IssueStatus[] = [
    IssueStatus.ToDo,
    IssueStatus.InProgress,
    IssueStatus.Blocked,
    IssueStatus.Done,
    IssueStatus.Cancelled,
];

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
    ToDo: 'To do',
    InProgress: 'In progress',
    Blocked: 'Blocked',
    Done: 'Done',
    Cancelled: 'Cancelled',
};

export const ISSUE_STATUS_COLORS: Record<IssueStatus, string> = {
    ToDo: c.neutral,
    InProgress: c.info,
    Blocked: c.warning,
    Done: c.success,
    Cancelled: c.danger,
};

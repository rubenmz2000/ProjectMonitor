import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Alert,
    Button,
    Card,
    CircularProgress,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import { EmptyState, MultiSelectFilter, StatusDot } from '../../rmz-ui/index.ts';
import type { MultiSelectFilterOption } from '../../rmz-ui/index.ts';
import type { Issue } from '../../models/IssueModel.ts';
import type { IssueStatus } from '../../models/enums/IssueStatus.ts';
import type { Priority } from '../../models/enums/Priority.ts';
import {
    ISSUE_STATUS_COLORS,
    ISSUE_STATUS_LABELS,
    ISSUE_STATUS_ORDER,
    PRIORITY_LABELS,
    PRIORITY_ORDER,
} from '../../app/domain/statusPresentation.ts';
import { issueDueDate } from '../../app/domain/issueDueDate.ts';
import { useIssueListState, UNASSIGNED, type IssueSortField } from '../../app/issues/useIssueListState.ts';
import { useProjectWorkspace } from '../../app/project/useProjectWorkspace.ts';
import ActorLabel from '../../app/actors/ActorLabel.tsx';
import './ProjectIssues.css';

dayjs.extend(utc);
dayjs.extend(relativeTime);

function countBy(issues: Issue[], key: (issue: Issue) => string): Map<string, number> {
    const counts = new Map<string, number>();
    for (const issue of issues) counts.set(key(issue), (counts.get(key(issue)) ?? 0) + 1);
    return counts;
}

/** The issues of the current project: a dense, searchable, filterable and sortable table. */
function ProjectIssues() {
    const navigate = useNavigate();
    const { issues, issuesLoading, issuesError, refetchIssues, openCreateIssue, lastCreatedIssue } = useProjectWorkspace();
    const list = useIssueListState();

    const { apply, search, setSearch } = list;

    // The search box keeps its own draft and writes it to the URL after a short pause; it adopts
    // the URL value whenever that changes from outside (clear filters, sidebar navigation...)
    const [searchDraft, setSearchDraft] = useState(search);
    const [seenSearch, setSeenSearch] = useState(search);
    const [writtenSearch, setWrittenSearch] = useState(search);
    if (search !== seenSearch) {
        setSeenSearch(search);
        if (search !== writtenSearch) setSearchDraft(search);
    }
    useEffect(() => {
        if (searchDraft === search) return;
        const timer = setTimeout(() => {
            setWrittenSearch(searchDraft.trim() ? searchDraft : '');
            setSearch(searchDraft);
        }, 200);
        return () => clearTimeout(timer);
    }, [searchDraft, search, setSearch]);

    const visible = useMemo(() => apply(issues), [apply, issues]);

    const statusOptions: MultiSelectFilterOption[] = useMemo(() => {
        const counts = countBy(issues, (i) => i.status);
        return ISSUE_STATUS_ORDER.map((s) => ({
            value: s,
            label: ISSUE_STATUS_LABELS[s],
            color: ISSUE_STATUS_COLORS[s],
            count: counts.get(s) ?? 0,
        }));
    }, [issues]);

    const assigneeOptions: MultiSelectFilterOption[] = useMemo(() => {
        const counts = countBy(issues, (i) => i.assignee?.identifier ?? UNASSIGNED);
        const actors = new Map(issues.flatMap((i) => (i.assignee ? [[i.assignee.identifier, i.assignee] as const] : [])));
        return [
            ...[...actors.values()]
                .sort((a, b) => a.displayName.localeCompare(b.displayName))
                .map((a) => ({ value: a.identifier, label: a.displayName, count: counts.get(a.identifier) ?? 0 })),
            { value: UNASSIGNED, label: 'Unassigned', count: counts.get(UNASSIGNED) ?? 0 },
        ];
    }, [issues]);

    const priorityOptions: MultiSelectFilterOption[] = useMemo(() => {
        const counts = countBy(issues, (i) => i.priority);
        return [...PRIORITY_ORDER].reverse().map((p) => ({
            value: p,
            label: PRIORITY_LABELS[p],
            count: counts.get(p) ?? 0,
        }));
    }, [issues]);

    const createdIsHidden = lastCreatedIssue !== null
        && issues.some((i) => i.issueIdentifier === lastCreatedIssue)
        && !visible.some((i) => i.issueIdentifier === lastCreatedIssue);

    const openIssue = (issue: Issue) => navigate(`/issues/${issue.issueIdentifier}`);

    const sortHeader = (field: IssueSortField, label: string, align?: 'right') => (
        <TableCell align={align} sortDirection={list.sort.field === field ? list.sort.direction : false}>
            <TableSortLabel
                active={list.sort.field === field}
                direction={list.sort.field === field ? list.sort.direction : 'asc'}
                onClick={() => list.toggleSort(field)}
            >
                {label}
            </TableSortLabel>
        </TableCell>
    );

    const renderBody = () => {
        if (issuesLoading) {
            return (
                <div className="rmz-issues-page__loading">
                    <CircularProgress />
                </div>
            );
        }
        if (issuesError) {
            return (
                <Alert
                    severity="error"
                    action={<Button color="inherit" size="small" onClick={() => refetchIssues()}>Retry</Button>}
                >
                    {issuesError}
                </Alert>
            );
        }
        if (issues.length === 0) {
            return (
                <EmptyState
                    icon={<ListAltOutlinedIcon />}
                    title="No issues yet"
                    description="Create the first issue of this project."
                    action={<Button variant="outlined" startIcon={<AddIcon />} onClick={openCreateIssue}>New issue</Button>}
                />
            );
        }
        if (visible.length === 0) {
            return (
                <EmptyState
                    icon={<SearchIcon />}
                    title="No issues match the current filters"
                    action={<Button variant="outlined" onClick={list.clearFilters}>Clear filters</Button>}
                />
            );
        }
        return (
            <Table className="rmz-issues-table" size="small">
                <TableHead>
                    <TableRow>
                        {sortHeader('key', 'Key')}
                        <TableCell>Title</TableCell>
                        {sortHeader('status', 'Status')}
                        {sortHeader('priority', 'Priority')}
                        <TableCell>Assignee</TableCell>
                        {sortHeader('due', 'Due')}
                        {sortHeader('updated', 'Updated', 'right')}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {visible.map((issue) => {
                        const due = issueDueDate(issue);
                        const isNew = issue.issueIdentifier === lastCreatedIssue;
                        return (
                            <TableRow
                                key={issue.id}
                                hover
                                tabIndex={0}
                                className={`rmz-issues-table__row${isNew ? ' rmz-issues-table__row--new' : ''}`}
                                onClick={() => openIssue(issue)}
                                onKeyDown={(e) => { if (e.key === 'Enter') openIssue(issue); }}
                            >
                                <TableCell className="rmz-issues-table__key">
                                    <Link to={`/issues/${issue.issueIdentifier}`} onClick={(e) => e.stopPropagation()} tabIndex={-1}>
                                        {issue.issueIdentifier}
                                    </Link>
                                </TableCell>
                                <TableCell className="rmz-issues-table__title" title={issue.title}>
                                    {issue.title}
                                </TableCell>
                                <TableCell>
                                    <StatusDot
                                        label={ISSUE_STATUS_LABELS[issue.status as IssueStatus] ?? issue.status}
                                        color={ISSUE_STATUS_COLORS[issue.status as IssueStatus] ?? 'var(--neutral)'}
                                    />
                                </TableCell>
                                <TableCell className="rmz-issues-table__priority">
                                    {PRIORITY_LABELS[issue.priority as Priority] ?? issue.priority}
                                </TableCell>
                                <TableCell className="rmz-issues-table__assignee">
                                    <ActorLabel actor={issue.assignee} />
                                </TableCell>
                                <TableCell className="rmz-issues-table__muted">
                                    {due ? due.format('DD/MM/YYYY') : '—'}
                                </TableCell>
                                <TableCell align="right" className="rmz-issues-table__muted">
                                    {dayjs.utc(issue.updatedAt).local().fromNow()}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        );
    };

    const showToolbar = !issuesLoading && !issuesError && issues.length > 0;

    return (
        <section className="rmz-issues-page" aria-label="Issues">
            {showToolbar && (
                <div className="rmz-issues-page__toolbar">
                    <div className="rmz-issues-page__filters">
                        <TextField
                            size="small"
                            placeholder="Search by key or title…"
                            value={searchDraft}
                            onChange={(e) => setSearchDraft(e.target.value)}
                            className="rmz-issues-page__search"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <MultiSelectFilter label="Status" options={statusOptions} selected={list.statuses} onChange={list.setStatuses} />
                        <MultiSelectFilter label="Assignee" options={assigneeOptions} selected={list.assignees} onChange={list.setAssignees} />
                        <MultiSelectFilter label="Priority" options={priorityOptions} selected={list.priorities} onChange={list.setPriorities} />
                        {list.hasFilters && (
                            <Button size="small" onClick={list.clearFilters}>Clear</Button>
                        )}
                    </div>
                    <span className="rmz-issues-page__count">
                        {list.hasFilters
                            ? `Showing ${visible.length} of ${issues.length} issues`
                            : `${issues.length} issue${issues.length === 1 ? '' : 's'}`}
                    </span>
                </div>
            )}

            {createdIsHidden && (
                <Alert
                    severity="info"
                    action={<Button color="inherit" size="small" onClick={list.clearFilters}>Clear filters</Button>}
                >
                    {lastCreatedIssue} was created but is hidden by the current filters.
                </Alert>
            )}

            <Card className="rmz-issues-page__card">{renderBody()}</Card>
        </section>
    );
}

export default ProjectIssues;

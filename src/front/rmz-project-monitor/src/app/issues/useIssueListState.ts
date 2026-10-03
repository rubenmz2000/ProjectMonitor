import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Issue } from '../../models/IssueModel.ts';
import type { IssueStatus } from '../../models/enums/IssueStatus.ts';
import type { Priority } from '../../models/enums/Priority.ts';
import { ISSUE_STATUS_ORDER, PRIORITY_ORDER } from '../domain/statusPresentation.ts';
import { issueDueDate } from '../domain/issueDueDate.ts';

export type IssueSortField = 'key' | 'status' | 'priority' | 'due' | 'updated';
export type SortDirection = 'asc' | 'desc';

export interface IssueSort {
    field: IssueSortField;
    direction: SortDirection;
}

/** Filter value used for issues without an assignee (actors are filtered by identifier). */
export const UNASSIGNED = 'unassigned';

const DEFAULT_SORT: IssueSort = { field: 'key', direction: 'desc' };

/** Direction applied when a column is first selected: the one that is most useful at the top. */
const INITIAL_DIRECTION: Record<IssueSortField, SortDirection> = {
    key: 'desc',
    status: 'asc',
    priority: 'desc',
    due: 'asc',
    updated: 'desc',
};

const SORT_FIELDS = Object.keys(INITIAL_DIRECTION) as IssueSortField[];

function parseList(value: string | null): string[] {
    return value ? value.split(',').filter(Boolean) : [];
}

function parseSort(value: string | null): IssueSort {
    if (!value) return DEFAULT_SORT;
    const direction: SortDirection = value.startsWith('-') ? 'desc' : 'asc';
    const field = value.replace(/^-/, '') as IssueSortField;
    return SORT_FIELDS.includes(field) ? { field, direction } : DEFAULT_SORT;
}

function formatSort(sort: IssueSort): string | null {
    if (sort.field === DEFAULT_SORT.field && sort.direction === DEFAULT_SORT.direction) return null;
    return `${sort.direction === 'desc' ? '-' : ''}${sort.field}`;
}

/** Matches by identifier ("PM-12", "pm-012", "12") or by text in the identifier or title. */
function matchesSearch(issue: Issue, query: string): boolean {
    if (!query) return true;
    if (issue.issueIdentifier.toLowerCase().includes(query) || issue.title.toLowerCase().includes(query)) {
        return true;
    }
    const keyMatch = /^(?:([a-z0-9]+)-)?0*(\d+)$/.exec(query);
    if (!keyMatch) return false;
    const [, prefix, number] = keyMatch;
    const issuePrefix = issue.issueIdentifier.slice(0, issue.issueIdentifier.lastIndexOf('-')).toLowerCase();
    return Number(number) === issue.issueNumber && (!prefix || prefix === issuePrefix);
}

function compareIssues(a: Issue, b: Issue, sort: IssueSort): number {
    const sign = sort.direction === 'asc' ? 1 : -1;
    switch (sort.field) {
        case 'status':
            return sign * (ISSUE_STATUS_ORDER.indexOf(a.status as IssueStatus) - ISSUE_STATUS_ORDER.indexOf(b.status as IssueStatus));
        case 'priority':
            return sign * (PRIORITY_ORDER.indexOf(a.priority as Priority) - PRIORITY_ORDER.indexOf(b.priority as Priority));
        case 'due': {
            const dueA = issueDueDate(a);
            const dueB = issueDueDate(b);
            // Issues without a due date always go last, whatever the direction
            if (!dueA || !dueB) return dueA ? -1 : dueB ? 1 : 0;
            return sign * (dueA.valueOf() - dueB.valueOf());
        }
        case 'updated':
            return sign * (Date.parse(a.updatedAt) - Date.parse(b.updatedAt));
        case 'key':
        default:
            return sign * (a.issueNumber - b.issueNumber);
    }
}

export interface IssueListState {
    search: string;
    statuses: string[];
    assignees: string[];
    priorities: string[];
    sort: IssueSort;
    hasFilters: boolean;
    setSearch: (value: string) => void;
    setStatuses: (values: string[]) => void;
    setAssignees: (values: string[]) => void;
    setPriorities: (values: string[]) => void;
    /** Selects a column, or flips the direction if it is already the sorted one. */
    toggleSort: (field: IssueSortField) => void;
    clearFilters: () => void;
    /** Applies search, filters and sort to the given issues. */
    apply: (issues: Issue[]) => Issue[];
}

/**
 * Search, filters and sort of an issue list, kept in the URL query string so they survive
 * navigating to an issue and back, and so a filtered view can be shared.
 */
export function useIssueListState(): IssueListState {
    const [params, setParams] = useSearchParams();

    const search = params.get('q') ?? '';
    const statuses = useMemo(() => parseList(params.get('status')), [params]);
    const assignees = useMemo(() => parseList(params.get('assignee')), [params]);
    const priorities = useMemo(() => parseList(params.get('priority')), [params]);
    const sort = useMemo(() => parseSort(params.get('sort')), [params]);

    const update = useCallback((changes: Record<string, string | null>) => {
        setParams((prev) => {
            const next = new URLSearchParams(prev);
            for (const [key, value] of Object.entries(changes)) {
                if (value) next.set(key, value);
                else next.delete(key);
            }
            return next;
        }, { replace: true });
    }, [setParams]);

    const setSearch = useCallback((value: string) => update({ q: value.trim() ? value : null }), [update]);

    const toggleSort = useCallback((field: IssueSortField) => {
        const direction: SortDirection = sort.field === field
            ? (sort.direction === 'asc' ? 'desc' : 'asc')
            : INITIAL_DIRECTION[field];
        update({ sort: formatSort({ field, direction }) });
    }, [sort, update]);

    const apply = useCallback((issues: Issue[]) => {
        const query = search.trim().toLowerCase();
        return issues
            .filter((issue) =>
                matchesSearch(issue, query)
                && (statuses.length === 0 || statuses.includes(issue.status))
                && (priorities.length === 0 || priorities.includes(issue.priority))
                && (assignees.length === 0 || assignees.includes(issue.assignee?.identifier ?? UNASSIGNED)))
            .sort((a, b) => compareIssues(a, b, sort) || b.issueNumber - a.issueNumber);
    }, [search, statuses, priorities, assignees, sort]);

    return {
        search,
        statuses,
        assignees,
        priorities,
        sort,
        hasFilters: search.trim() !== '' || statuses.length > 0 || assignees.length > 0 || priorities.length > 0,
        setSearch,
        setStatuses: (values) => update({ status: values.join(',') }),
        setAssignees: (values) => update({ assignee: values.join(',') }),
        setPriorities: (values) => update({ priority: values.join(',') }),
        toggleSort,
        clearFilters: () => update({ q: null, status: null, assignee: null, priority: null }),
        apply,
    };
}

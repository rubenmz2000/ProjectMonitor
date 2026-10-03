import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * The issue's due date, or null when it has none. The issue list endpoint returns the
 * DateTime.MinValue sentinel (year 1) instead of null for issues without a due date (see
 * docs/current-state.md), so both are treated as "no due date".
 */
export function issueDueDate(issue: { dueDate: string | null }): Dayjs | null {
    if (!issue.dueDate) return null;
    const due = dayjs.utc(issue.dueDate);
    return due.isValid() && due.year() > 1 ? due : null;
}

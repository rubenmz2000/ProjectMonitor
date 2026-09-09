import type { Actor } from './IssueDetailModel.ts';

export interface Issue {
    id: string;
    issueIdentifier: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string | null;
    creationDate: string;
    updatedAt: string;
    createdBy: Actor;
    assignee: Actor | null;
}

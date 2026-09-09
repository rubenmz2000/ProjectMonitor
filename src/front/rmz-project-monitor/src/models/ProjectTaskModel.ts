import type { Actor } from './TaskDetailModel.ts';

export interface ProjectTask {
    id: string;
    taskIdentifier: string;
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

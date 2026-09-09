import type { Actor } from './ActorModel.ts';

export interface IssueDetailData {
  id: string;
  issueNumber: number;
  issueIdentifier: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  creationDate: string;
  updatedAt: string;
  projectName: string;
  issuePrefix: string;
  createdBy: Actor;
  assignee: Actor | null;
}

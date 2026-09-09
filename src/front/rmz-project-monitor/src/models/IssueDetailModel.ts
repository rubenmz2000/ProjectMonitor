export interface Actor {
  id: string;
  displayName: string;
  identifier: string;
  kind: string;
}

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

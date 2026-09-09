import type { Actor } from './ActorModel.ts';

export interface ActivityValue {
  value: string | null;
  label: string;
}

export type IssueActivityType = 'Created' | 'AssigneeChanged' | 'Comment';

export interface IssueActivity {
  id: string;
  type: IssueActivityType;
  occurredAt: string;
  actor: Actor;
  from: ActivityValue | null;
  to: ActivityValue | null;
  body: string | null;
}

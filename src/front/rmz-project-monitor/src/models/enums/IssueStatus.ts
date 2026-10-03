export const IssueStatus = {
    ToDo: "ToDo",
    InProgress: "InProgress",
    Blocked: "Blocked",
    Done: "Done",
    Cancelled: "Cancelled",
} as const;

export type IssueStatus = typeof IssueStatus[keyof typeof IssueStatus];

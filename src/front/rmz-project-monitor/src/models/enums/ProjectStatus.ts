export const ProjectStatus = {
    NotStarted: "NotStarted",
    InProgress: "InProgress",
    Paused: "Paused",
    Completed: "Completed",
    Archived: "Archived",
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];
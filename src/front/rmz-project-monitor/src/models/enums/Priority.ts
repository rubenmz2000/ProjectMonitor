export const Priority = {
    Low: "Low",
    Medium: "Medium",
    High: "High",
    Critical: "Critical",
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

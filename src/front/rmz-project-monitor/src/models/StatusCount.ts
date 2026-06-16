import { ProjectStatus } from './enums/ProjectStatus.ts';

export interface StatusCount {
    status: ProjectStatus,
    count: number
}
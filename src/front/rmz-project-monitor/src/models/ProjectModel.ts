import { ProjectStatus } from './enums/ProjectStatus.ts';

export interface Project {
    id: string,
    name: string,
    description: string,
    status: string,
    updatedAt: string
}
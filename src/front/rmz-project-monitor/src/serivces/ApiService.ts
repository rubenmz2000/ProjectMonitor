import axios from 'axios';
import type {Project} from '../models/ProjectModel.ts';
import type {StatusCount} from '../models/StatusCount.ts';
import type {ProjectTask} from '../models/ProjectTaskModel.ts';

const API_URL = 'http://localhost:5023/api';

export const getLatestProjects = async (): Promise<Project[]> => {
    const response = await axios.get(`${API_URL}/Projects/latest`);
    return response.data;
}

export const getAllProjects = async (): Promise<Project[]> => {
    const response = await axios.get(`${API_URL}/Projects`);
    return response.data;
}

export const getProjectById = async (id: string): Promise<Project> => {
    const response = await axios.get(`${API_URL}/Projects/${id}`);
    return response.data;
}

export const getStatusCount = async (): Promise<StatusCount[]> => {
    const response = await axios.get(`${API_URL}/Projects/status-count`);
    return response.data;
}

export const addProject = async (project: Record<string, FormDataEntryValue>): Promise<boolean> => {
    try {
        await axios.post(`${API_URL}/Projects`, project);
        return true;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Server error";
        throw message;
    }
}

export const getProjectTasks = async (projectId: string): Promise<ProjectTask[]> => {
    const response = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
    return response.data;
}

export const createTask = async (projectId: string, task: Record<string, unknown>): Promise<ProjectTask> => {
    try {
        const response = await axios.post(`${API_URL}/projects/${projectId}/tasks`, task);
        return response.data;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Server error";
        throw message;
    }
}

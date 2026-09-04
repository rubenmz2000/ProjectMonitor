import axios from 'axios';
import type {Project} from '../models/ProjectModel.ts';
import type {StatusCount} from '../models/StatusCount.ts';

const API_URL = 'http://localhost:5023/api';

export const getLatestProjects = async (): Promise<Project[]> => {
    const response = await axios.get(`${API_URL}/Projects/latest`);
    return response.data;
}

export const getStatusCount = async (): Promise<StatusCount[]> => {
    const response = await axios.get(`${API_URL}/Projects/status-count`);
    return response.data;
}

export const addProject = async (project: {name: string, description: string}): Promise<boolean> => {
    try {
        await axios.post(`${API_URL}/Projects`, project);
        return true;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Server error";
        throw message;
    }
}
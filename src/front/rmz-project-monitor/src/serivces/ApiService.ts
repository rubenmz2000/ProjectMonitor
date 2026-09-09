import axios from 'axios';
import type {Project} from '../models/ProjectModel.ts';
import type {StatusCount} from '../models/StatusCount.ts';
import type {ProjectTask} from '../models/ProjectTaskModel.ts';
import type { TaskDetailData, Actor } from '../models/TaskDetailModel.ts';

const API_URL = 'http://localhost:5023/api';

// Create axios client with actor identity interceptor
const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor to inject actor identifier from environment
// This is a transitory solution; will be replaced by real authentication
apiClient.interceptors.request.use((config) => {
  const actorIdentifier = import.meta.env.VITE_ACTOR_IDENTIFIER;
  
  // Only inject for state-changing operations that require actor context
  const methodsRequiringActor = ['post', 'put', 'patch', 'delete'];
  if (methodsRequiringActor.includes(config.method?.toLowerCase() || '')) {
    config.headers['X-Actor-Identifier'] = actorIdentifier;
  }
  
  return config;
});

export const getLatestProjects = async (): Promise<Project[]> => {
    const response = await apiClient.get('/Projects/latest');
    return response.data;
}

export const getAllProjects = async (): Promise<Project[]> => {
    const response = await apiClient.get('/Projects');
    return response.data;
}

export const getProjectById = async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/Projects/${id}`);
    return response.data;
}

export const getStatusCount = async (): Promise<StatusCount[]> => {
    const response = await apiClient.get('/Projects/status-count');
    return response.data;
}

export const addProject = async (project: Record<string, FormDataEntryValue>): Promise<boolean> => {
    try {
        await apiClient.post('/Projects', project);
        return true;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Server error";
        throw message;
    }
}

export const getProjectTasks = async (projectId: string): Promise<ProjectTask[]> => {
    const response = await apiClient.get(`/projects/${projectId}/tasks`);
    return response.data;
}

export const createTask = async (projectId: string, task: Record<string, unknown>): Promise<ProjectTask> => {
    try {
        const response = await apiClient.post(`/projects/${projectId}/tasks`, task);
        return response.data;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Server error";
        throw message;
    }
}

export const getIssueByTaskIdentifier = async (taskIdentifier: string): Promise<TaskDetailData> => {
    const response = await apiClient.get(`/issues/${taskIdentifier}`);
    return response.data;
}

export const getActiveActors = async (): Promise<Actor[]> => {
    const response = await apiClient.get('/actors');
    return response.data;
}

export const updateAssignee = async (taskIdentifier: string, assigneeId: string | null): Promise<TaskDetailData> => {
    const response = await apiClient.patch(`/issues/${taskIdentifier}/assign`, { assigneeId });
    return response.data;
}

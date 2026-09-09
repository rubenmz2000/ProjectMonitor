import axios from 'axios';
import type {Project} from '../models/ProjectModel.ts';
import type {StatusCount} from '../models/StatusCount.ts';
import type {Issue} from '../models/IssueModel.ts';
import type { IssueDetailData } from '../models/IssueDetailModel.ts';
import type { Actor } from '../models/ActorModel.ts';
import type { IssueActivity } from '../models/IssueActivityModel.ts';

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

export const getProjectByPrefix = async (prefix: string): Promise<Project> => {
    const response = await apiClient.get(`/Projects/${prefix}`);
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

export const getProjectIssues = async (projectId: string): Promise<Issue[]> => {
    const response = await apiClient.get(`/projects/${projectId}/issues`);
    return response.data;
}

export const createIssue = async (projectId: string, issue: Record<string, unknown>): Promise<Issue> => {
    try {
        const response = await apiClient.post(`/projects/${projectId}/issues`, issue);
        return response.data;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Server error";
        throw message;
    }
}

export const getIssueByIdentifier = async (issueIdentifier: string): Promise<IssueDetailData> => {
    const response = await apiClient.get(`/issues/${issueIdentifier}`);
    return response.data;
}

export const getActiveActors = async (): Promise<Actor[]> => {
    const response = await apiClient.get('/actors');
    return response.data;
}

export const updateAssignee = async (issueIdentifier: string, assigneeId: string | null, note?: string): Promise<IssueDetailData> => {
    const response = await apiClient.patch(`/issues/${issueIdentifier}/assign`, { assigneeId, note: note ?? null });
    return response.data;
}

export const getIssueActivity = async (issueIdentifier: string): Promise<IssueActivity[]> => {
    const response = await apiClient.get(`/issues/${issueIdentifier}/activity`);
    return response.data;
}

export const addComment = async (issueIdentifier: string, body: string): Promise<IssueActivity> => {
    const response = await apiClient.post(`/issues/${issueIdentifier}/comments`, { body });
    return response.data;
}

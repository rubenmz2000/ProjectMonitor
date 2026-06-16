import axios from 'axios';

const API_URL = 'http://localhost:5023/api';

export const getLatestProjects = async () => {
    const response = await axios.get(`${API_URL}/Projects/latest`);
    return response.data;
}

export const getStatusCount = async () => {
    const response = await axios.get(`${API_URL}/Projects/status-count`);
    return response.data;
}

export const addProject = async (project) => {
    try {
        await axios.post(`${API_URL}/Projects`, project);
        return true;
    } catch (error) {
        throw error.response?.data || "Server error";
    }
}
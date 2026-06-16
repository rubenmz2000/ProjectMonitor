import axios from 'axios';

const API_URL = 'http://localhost:5023/api';

export const getLatestProjects = async () => {
    const response = await axios.get(`${API_URL}/Projects/latest`);
    return response.data;
}

// export default getLatestProjects;
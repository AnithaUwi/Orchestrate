import axios from 'axios';

// Public API client WITHOUT authentication headers
const publicApi = axios.create({
    baseURL: 'http://localhost:4000/api',
});

export default publicApi;

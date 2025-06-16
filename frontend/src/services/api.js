const API_BASE = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(response);
  },

  verifyToken: async (token) => {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },
};

export const jobsAPI = {
  getJobs: async (filters) => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    
    const response = await fetch(`${API_BASE}/jobs?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getJob: async (id) => {
    const response = await fetch(`${API_BASE}/jobs/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createJob: async (jobData) => {
    const response = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  },

  updateJob: async (id, jobData) => {
    const response = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  },

  deleteJob: async (id) => {
    const response = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE}/jobs/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

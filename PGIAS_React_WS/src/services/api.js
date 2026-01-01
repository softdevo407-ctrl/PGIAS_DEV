import { config } from '../config/config';

// Base API configuration
const API_BASE_URL = config.api.baseURL;

// Get user employee code (loginId) from ISRO CAS auth response or localStorage
// Returns ONLY the loginId/emp_staffcode, not the entire user object
const getUserEmployeeCode = () => {
  try {
    // First, check if we have ISRO CAS response in URL (fresh login)
    const url = new URL(window.location.href);
    if (url.search.trim().length > 0) {
      const cauthResponse = url.searchParams.get('cauthresponse');
      if (cauthResponse) {
        try {
          const authJson = JSON.parse(atob(cauthResponse));
          if (authJson.login_status === 'success' && authJson.emp_staffcode) {
            // Extract employee code from ISRO response
            const userCode = authJson.emp_staffcode;
            // Clean URL by removing cauthresponse parameter
            window.history.replaceState({}, document.title, window.location.pathname);
            return userCode;
          }
        } catch (parseError) {
          console.warn('Failed to parse ISRO CAS response:', parseError);
        }
      }
    }

    // Check localStorage for previously authenticated user
    const userStr = localStorage.getItem('pgias_user');
    if (userStr) {
      try {
        // Try to parse as JSON (user object)
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.loginId) {
          return userObj.loginId;
        }
      } catch (e) {
        // If parsing fails, return as-is (might be just loginId string)
        return userStr;
      }
    }

    return 'SYSTEM';
  } catch (e) {
    console.warn('Could not retrieve user info:', e);
    return 'SYSTEM';
  }
};

// Helper function for API calls with error handling and RBAC headers
const apiCall = async (url, options = {}, userContext = null) => {
  const employeeCode = getUserEmployeeCode();
  console.log(`API Call by User: ${employeeCode} to URL: ${url}`);
  
  // Build headers with X-USER-ID taking priority
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    'X-USER-ID': employeeCode  // This ensures X-USER-ID is always set
  };

  // Add RBAC headers if userContext is provided
  if (userContext) {
    headers['X-Login-Id'] = userContext.loginId || employeeCode;
    headers['X-Role-Code'] = userContext.roleCode || 'USR';
    headers['X-Centre-Code'] = userContext.centreCode || '';
  }
  
  console.log(`Request headers:`, headers);

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers,
      ...options,
      headers  // Make sure headers are last to override
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      try {
        error.data = await response.json();
      } catch (e) {
        error.data = null;
      }
      throw error;
    }

    const data = await response.json();
    console.log(`Response from ${url}:`, data);
    return data;
  } catch (err) {
    console.error(`Error calling ${url}:`, err);
    // Handle network errors and CORS issues
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to server. Please ensure the backend is running on http://localhost:8080');
    }
    throw err;
  }
};

// Role API endpoints
export const roleAPI = {
  // Get all roles
  getAll: async () => {
    return apiCall(`${API_BASE_URL}/api/roles`);
  },

  // Get role by ID
  getById: async (id) => {
    return apiCall(`${API_BASE_URL}/api/roles/${id}`);
  },

  // Create new role
  create: async (roleData) => {
    return apiCall(`${API_BASE_URL}/api/roles`, {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  },

  // Update role
  update: async (id, roleData) => {
    return apiCall(`${API_BASE_URL}/api/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  },

  // Delete role
  delete: async (id) => {
    return apiCall(`${API_BASE_URL}/api/roles/${id}`, {
      method: 'DELETE',
    });
  },
};

// User Role API endpoints
export const userRoleAPI = {
  // Get all user-role assignments
  getAll: async () => {
    return apiCall(`${API_BASE_URL}/api/userroles`);
  },

  // Get roles for a specific user by login ID
  getByLoginId: async (loginId) => {
    return apiCall(`${API_BASE_URL}/api/userroles/login/${loginId}`);
  },

  // Get specific user-role assignment
  getById: async (loginId, roleCode, centreCode) => {
    return apiCall(`${API_BASE_URL}/api/userroles/${loginId}/${roleCode}/${centreCode}`);
  },

  // Get screens assigned to a user-role
  getScreensByUserRole: async (loginId, roleCode, centreCode) => {
    return apiCall(`${API_BASE_URL}/api/userroles/${loginId}/${roleCode}/${centreCode}/screens`);
  },

  // Assign role to user
  create: async (userRoleData) => {
    return apiCall(`${API_BASE_URL}/api/userroles`, {
      method: 'POST',
      body: JSON.stringify(userRoleData),
    });
  },

  // Update user-role assignment
  update: async (loginId, roleCode, centreCode, userRoleData) => {
    return apiCall(`${API_BASE_URL}/api/userroles/${loginId}/${roleCode}/${centreCode}`, {
      method: 'PUT',
      body: JSON.stringify(userRoleData),
    });
  },

  // Assign a screen/page to a user-role
  assignScreen: async (loginId, roleCode, centreCode, screenData) => {
    return apiCall(`${API_BASE_URL}/api/userroles/${loginId}/${roleCode}/${centreCode}/screens`, {
      method: 'POST',
      body: JSON.stringify(screenData),
    });
  },

  // Delete screen assignment by screenCode
  deleteScreenAssignment: async (loginId, roleCode, centreCode, screenCode) => {
    return apiCall(`${API_BASE_URL}/api/userroles/${loginId}/${roleCode}/${centreCode}/screens/${screenCode}`, {
      method: 'DELETE',
    });
  },

  // Revoke role from user
  delete: async (loginId, roleCode, centreCode) => {
    return apiCall(`${API_BASE_URL}/api/userroles/${loginId}/${roleCode}/${centreCode}`, {
      method: 'DELETE',
    });
  },
};

// Centres API endpoints
export const centresAPI = {
  // Get all centres
  getAll: async () => {
    return apiCall(`${API_BASE_URL}/api/centres`);
  },
};

// Generic API utility for other endpoints
export const createApiService = (endpoint) => ({
  getAll: async () => {
    return apiCall(`${API_BASE_URL}${endpoint}`);
  },

  getById: async (id) => {
    return apiCall(`${API_BASE_URL}${endpoint}/${id}`);
  },

  create: async (data) => {
    return apiCall(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiCall(`${API_BASE_URL}${endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiCall(`${API_BASE_URL}${endpoint}/${id}`, {
      method: 'DELETE',
    });
  },
});

// Screens API endpoints with RBAC support
export const screensAPI = {
  // Get all screens (admin only)
  getAll: async () => {
    return apiCall(`${API_BASE_URL}/api/screens`);
  },

  // Get assigned screens for current user (requires userContext)
  getAssigned: async (userContext) => {
    return apiCall(`${API_BASE_URL}/api/screens/assigned`, {}, userContext);
  },

  // Get screens by login ID
  getByLoginId: async (loginId) => {
    return apiCall(`${API_BASE_URL}/api/screens/user/${loginId}`);
  },

  getById: async (id) => {
    return apiCall(`${API_BASE_URL}/api/screens/${id}`);
  },

  create: async (data) => {
    return apiCall(`${API_BASE_URL}/api/screens`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiCall(`${API_BASE_URL}/api/screens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiCall(`${API_BASE_URL}/api/screens/${id}`, {
      method: 'DELETE',
    });
  },
};

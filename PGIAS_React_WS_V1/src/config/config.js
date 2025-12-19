// Configuration file for the application
// Update these values based on your environment

export const config = {
  // Backend API Configuration
  api: {
    baseURL: 'http://localhost:8080',
    timeout: 30000, // 30 seconds
    
    // Endpoints
    endpoints: {
      roles: '/api/roles',
      userRoles: '/api/userroles',
      users: '/api/users',
      login: '/api/auth/login',
      centers: '/api/centres',
      objectives: '/api/objectives',
      actions: '/api/actions',
      successIndicators: '/api/successindicator'
    }
  },

  // Authentication Configuration
  auth: {
    tokenKey: 'pgias_token',
    userKey: 'pgias_user',
    tokenType: 'Bearer'
  },

  // Application Configuration
  app: {
    name: 'PGIAS',
    version: '1.0.0',
    theme: 'light'
  },

  // Page Configuration
  pages: {
    itemsPerPage: 10,
    searchDebounceTime: 300
  },

  // Role Configuration
  roles: {
    admin: 'ADM',
    approver: 'APP',
    sanctioner: 'SAN',
    reviewer: 'REV',
    user: 'USR'
  }
};

// Export helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${config.api.baseURL}${endpoint}`;
};

// Export function to get endpoint by name
export const getEndpoint = (name) => {
  return config.api.endpoints[name] || null;
};

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Home, Users, DollarSign, FileText, Settings, BarChart, Package, LogOut, ChevronLeft, ChevronRight, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Search, Edit, Trash2, Plus, Shield } from 'lucide-react';
import { userRoleAPI } from './services/api';
import HomePage from './pages/HomePage';
import OperationsTargetSettingPage from './pages/OperationsTargetSettingPage';
import NoRoleAccess from './pages/NoRoleAccess';

// Auth Context
const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Role-based page configuration
const PAGE_CONFIG = {
  ADMIN: ['dashboard', 'users', 'genericEntry'],
  APPROVER: ['dashboard', 'users', 'genericEntry'],
  SANCTIONER: ['dashboard', 'users', 'genericEntry'],
  REVIEWER: ['dashboard', 'users', 'genericEntry'],
  USER: ['dashboard', 'users', 'genericEntry']
};

// Page definitions
const PAGES = {
  dashboard: { name: 'Dashboard', icon: Home, path: '/dashboard' },
  users: { name: 'User Management', icon: Users, path: '/users' },
  operations: { name: 'Operations', icon: FileText, path: '/operations', submenu: ['operationsDataEntry', 'operationsReview', 'operationsReport', 'operationsApproval'] },
  operationsDataEntry: { name: 'Data Entry', icon: FileText, path: '/operations/data-entry' },
  operationsReview: { name: 'Review & Approve', icon: BarChart, path: '/operations/review' },
  operationsReport: { name: 'Reports', icon: FileText, path: '/operations/report' },
  operationsApproval: { name: 'Approval Queue', icon: Shield, path: '/operations/approval' },
  genericEntry: { name: 'Generic Entry', icon: FileText, path: '/generic-entry', submenu: ['roleManagement', 'userRoleAssignment', 'centres', 'centreTypes', 'objectives', 'screens', 'successIndicator', 'actions', 'statusCodes', 'unitDatatypeCodes'] },
  roleManagement: { name: 'Role Management', icon: Shield, path: '/roles' },
  userRoleAssignment: { name: 'User Role Assignment', icon: Shield, path: '/user-roles' },
  centres: { name: 'Centres', icon: Package, path: '/generic/centres' },
  centreTypes: { name: 'Centre Types', icon: Package, path: '/generic/centre-types' },
  objectives: { name: 'Objectives', icon: Package, path: '/generic/objectives' },
  screens: { name: 'Screens', icon: Package, path: '/generic/screens' },
  successIndicator: { name: 'Success Indicators', icon: Package, path: '/generic/success-indicators' },
  actions: { name: 'Actions', icon: Package, path: '/generic/actions' },
  statusCodes: { name: 'Status Codes', icon: Package, path: '/generic/status-codes' },
  unitDatatypeCodes: { name: 'Unit Datatype Codes', icon: Package, path: '/generic/unit-datatype-codes' },
  incentives: { name: 'Incentives', icon: DollarSign, path: '/incentives' },
  reports: { name: 'Reports', icon: FileText, path: '/reports' },
  inventory: { name: 'Inventory', icon: Package, path: '/inventory' },
  settings: { name: 'Settings', icon: Settings, path: '/settings' },
  analytics: { name: 'Analytics', icon: BarChart, path: '/analytics' }
};

// All available pages for assignment
const ALL_PAGES = [
  { key: 'dashboard', name: 'Dashboard', description: 'Main dashboard view' },
  { key: 'users', name: 'User Management', description: 'Manage users and roles' },
  { key: 'operations', name: 'Operations', description: 'Data entry operations' },
  { key: 'genericEntry', name: 'Generic Entry', description: 'Generic data entry forms' }
];

// Production: Only real ISRO-authenticated users
// Mock user data removed - using real ISRO authentication

// Form Validation Hook
const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  const handleChange = (fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    if (touched[fieldName]) {
      const error = validate(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validate(fieldName, values[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return { values, errors, touched, handleChange, handleBlur, validateAll, resetForm, setValues };
};

// Validation Rules
const required = (message = 'This field is required') => (value) => {
  if (!value || (typeof value === 'string' && !value.trim())) return message;
  if (Array.isArray(value) && value.length === 0) return message;
  return '';
};

const email = (message = 'Invalid email address') => (value) => {
  if (!value) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? '' : message;
};

const minLength = (min, message) => (value) => {
  if (!value) return '';
  return value.length >= min ? '' : message || `Must be at least ${min} characters`;
};

const alphanumeric = (message = 'Only letters and numbers allowed') => (value) => {
  if (!value) return '';
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(value) ? '' : message;
};

const pattern = (regex, message) => (value) => {
  if (!value) return '';
  return regex.test(value) ? '' : message;
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const sessionTimeoutRef = React.useRef(null);

  // Session timeout configuration (15 minutes in milliseconds)
  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  // Reset session timer on user activity
  const resetSessionTimer = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    if (user) {
      sessionTimeoutRef.current = setTimeout(() => {
        // Session expired
        setSessionExpired(true);
        logout();
      }, SESSION_TIMEOUT);
    }
  };

  // Set up activity listeners for session management
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetSessionTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initial timer setup
    resetSessionTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    const storedUser = localStorage.getItem('pgias_user');
    const sessionToken = sessionStorage.getItem('pgias_session_token');
    
    if (storedUser && sessionToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setSessionExpired(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (loginId, password) => {
    try {
      // Call API Gateway which routes to backend (8081)
      const response = await fetch(`http://localhost:8080/api/userroles/login/${loginId}`);
      
      if (response.ok) {
        const rolesData = await response.json();
        
        // Extract role codes and centre codes from response
        let rolesArray = [];
        let centreCodesArray = [];
        
        if (Array.isArray(rolesData) && rolesData.length > 0) {
          // If response is an array, extract all unique roles and centre codes
          rolesArray = [...new Set(rolesData.map(item => {
            return typeof item === 'object' && item.roleCode ? item.roleCode : item;
          }))];
          
          // Extract ALL centre codes (handles both single and multiple centres)
          centreCodesArray = [...new Set(rolesData
            .filter(item => typeof item === 'object' && item.centreCode)
            .map(item => item.centreCode)
          )];
          
          console.log('📍 Extracted centres from API:', centreCodesArray);
        } else if (typeof rolesData === 'object' && rolesData.roleCode) {
          // If response is a single object with roleCode
          rolesArray = [rolesData.roleCode];
          if (rolesData.centreCode) {
            centreCodesArray = [rolesData.centreCode];
          }
        }
        
        // Store centre codes as comma-separated string for multiple centres
        // Single centre: "01"
        // Multiple centres: "01,04" or "01,04,13" etc.
        const centreCodeFromApi = centreCodesArray.length > 0 ? centreCodesArray.join(',') : '';
        
        // Create user object with roles and centre code from API
        const userWithRoles = {
          loginId: loginId,
          name: loginId.toUpperCase(),
          email: `${loginId}@isro.gov.in`,
          roles: rolesArray.length > 0 ? rolesArray : ['USER'],
          roleCode: rolesArray.length > 0 ? rolesArray[0] : 'USER',
          centreCode: centreCodeFromApi || 'ALL',  // If no centre assigned, allow all
          centreCodesArray: centreCodesArray,  // Also store as array for reference
          loginTime: new Date().toISOString()
        };
        console.log('Fetched roles from API for user', loginId, ':', userWithRoles);
        // Generate secure session token
        const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        setUser(userWithRoles);
        localStorage.setItem('pgias_user', JSON.stringify(userWithRoles));
        // Also store loginId and centre data separately for pages that read them directly
        try {
          localStorage.setItem('loginId', loginId);
          // Store centre code as comma-separated string (for backward compatibility)
          localStorage.setItem('centreCode', userWithRoles.centreCode || '');
          // Store centre codes array as JSON for easy parsing in components
          localStorage.setItem('centreCodesArray', JSON.stringify(userWithRoles.centreCodesArray || []));
          
        } catch (e) {
          console.warn('Could not set loginId/centreCode in localStorage', e);
        }
        sessionStorage.setItem('pgias_session_token', sessionToken);
        setSessionExpired(false);
        setLoading(false);
        
        console.log('Login successful - Roles:', rolesArray);
        
        return { success: true, user: userWithRoles };
      }
      
      return { success: false, error: 'Invalid loginId or user not found' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication service unavailable. Please try again.' };
    }
  };

  const loginWithCAS = async (loginId) => {
    // Call the login function to fetch user roles from backend
    const result = await login(loginId);
    return result;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pgias_user');
    // Clear the convenience login keys
    localStorage.removeItem('loginId');
    localStorage.removeItem('centreCode');
    localStorage.removeItem('centreCodesArray');
    sessionStorage.removeItem('pgias_session_token');
    
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithCAS, logout, loading, sessionExpired, setSessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithCAS, sessionExpired, setSessionExpired } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    { loginId: '', password: '' },
    {
      loginId: [
        required('Login ID is required'),
        minLength(3, 'Login ID must be at least 3 characters')
      ],
      password: [] // Password validation disabled for testing
    }
  );

  // Handle CAS Response
  useEffect(() => {
    const processCASResponse = async () => {
      const url = new URL(window.location.href);
      
      if (url.search.trim().length > 0) {
        try {
          const cauthResponse = url.searchParams.get('cauthresponse');
          
          if (cauthResponse) {
            // Decode the base64 response
            const _ujson = JSON.parse(atob(cauthResponse));
            
            if (_ujson.login_status === 'success') {
              const _loginUserID = _ujson['emp_staffcode']; // Username like IS03651
              console.log('CAS Login successful for user:', _loginUserID);
              
              setIsLoading(true);
              
              // Call login with the CAS-provided user ID
              const result = await loginWithCAS(_loginUserID);
              
              if (result.success) {
                console.log('User logged in successfully via CAS');
                // The redirect to dashboard happens automatically through the MainLayout effect
              } else {
                setLoginError(result.error || 'CAS login failed. Please try again.');
              }
              
              setIsLoading(false);
            } else {
              setLoginError('Invalid CAS Login. ' + (_ujson.msg || ''));
            }
            
            // Clean up the URL by removing the cauthresponse parameter
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Error processing CAS response:', error);
          setLoginError('Error processing authentication response. Please try again.');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    
    processCASResponse();
  }, []);

  const handleLogin = async () => {
    setLoginError('');
    
    if (!validateAll()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(values.loginId, '');
      
      if (!result.success) {
        setLoginError(result.error || 'Login failed. Please try again.');
      }
      
      console.log('Login successful - User:', values.loginId);
      
    } catch (error) {
      setLoginError('Login failed. Please try again.');
      console.error('Login error:', error);
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Generate CAS Login URL with redirect
  const generateCASLoginURL = () => {
    const redirectURL = `${window.location.origin}${window.location.pathname}`;
    const casLoginURL = `https://central-authentication.isro.dos.gov.in/CASClient/userauthentication.html?redirectURL=${encodeURIComponent(redirectURL)}`;
    return casLoginURL;
  };

  useEffect(() => {
    if (sessionExpired) {
      setLoginError('Your session has expired due to inactivity. Please login again.');
      setSessionExpired(false);
    }
  }, [sessionExpired, setSessionExpired]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
                    <DollarSign size={40} className="text-primary" />
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Welcome to PGIAS</h2>
                  <p className="text-muted">Performance & Growth Incentive Analysis System</p>
                </div>

                {loginError && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <XCircle size={20} className="me-2" />
                    <div>{loginError}</div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Login ID</label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${touched.loginId && errors.loginId ? 'is-invalid' : touched.loginId ? 'is-valid' : ''}`}
                    placeholder="Enter your login ID"
                    value={values.loginId}
                    onChange={(e) => handleChange('loginId', e.target.value)}
                    onBlur={() => handleBlur('loginId')}
                    onKeyPress={handleKeyPress}
                  />
                  {touched.loginId && errors.loginId && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <AlertCircle size={16} className="me-1" />
                      {errors.loginId}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted small">
                    <i>Password field disabled for testing - Login ID only required</i>
                  </label>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="btn btn-primary btn-lg w-100 mb-2"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login to Dashboard'
                  )}
                </button>

                <a
                  href={generateCASLoginURL()}
                  disabled={isLoading}
                  className="btn btn-outline-primary btn-lg w-100 mb-3 text-decoration-none"
                >
                  Login via CAS
                </a>

                <div className="mt-3 pt-3 border-top">
                  <div className="small text-center">
                    <div className="mb-2">
                      <a href="https://central-authentication.isro.dos.gov.in/CASClient/forgotpass.html" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none fw-semibold">
                        Forgot Password?
                      </a>
                    </div>
                    <div>
                      Don't have an account?
                      <a href="https://central-authentication.isro.dos.gov.in/CASClient/signup.html" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none fw-semibold ms-1">
                        Sign Up Here
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ collapsed, setCollapsed, activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  const [genericOpen, setGenericOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);

  // Show dashboard and users for all (always shown)
  // Add operations if user has 'USR' or 'REV' role
  // Add genericEntry if user has 'ADM' role
  const hasADMRole = user && Array.isArray(user.roles) && user.roles.includes('ADM');
  const hasUSRRole = user && Array.isArray(user.roles) && (user.roles.includes('USR') || user.roles.includes('REV'));
  
  // Build pages dynamically based on roles
  let pageKeysToShow = ['dashboard', 'users'];
  if (hasUSRRole) pageKeysToShow.push('operations');
  if (hasADMRole) pageKeysToShow.push('genericEntry');

  // Debug log
  //console.log('Sidebar - User:', user);

  return (
    <div className={`${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} bg-dark text-white vh-100 d-flex flex-column transition-all`} style={{ transition: 'all 0.3s' }}>
      <div className="p-3 border-bottom border-secondary d-flex align-items-center justify-content-between">
        {!collapsed && <h4 className="mb-0 fw-bold">PGIAS</h4>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-sm btn-outline-light"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      {!collapsed && user && (
        <div className="p-3 border-bottom border-secondary">
          <div className="d-flex align-items-center mb-2">
            <div className="bg-primary rounded-circle p-2 me-2">
              <Users size={20} />
            </div>
            <div>
              <div className="fw-semibold">{user.name || user.loginId}</div>
              <div className="small text-muted">{user.email}</div>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-1 mt-2">
            {Array.isArray(user.roles) && user.roles.length > 0 ? (
              user.roles.map((role, idx) => {
                // Color code by role
                let badgeClass = 'bg-primary';
                if (role === 'USR') badgeClass = 'bg-success';
                else if (role === 'REV') badgeClass = 'bg-info';
                else if (role === 'ADM') badgeClass = 'bg-danger';
                else if (role === 'APR') badgeClass = 'bg-warning text-dark';
                
                return (
                  <span key={`sidebar-role-${idx}`} className={`badge ${badgeClass}`}>
                    {role}
                  </span>
                );
              })
            ) : (
              <span className="badge bg-secondary">No Role</span>
            )}
          </div>
        </div>
      )}
      
      <nav className="flex-grow-1 p-3 overflow-auto">
        {pageKeysToShow && pageKeysToShow.length > 0 ? (
          pageKeysToShow.map((pageKey) => {
            const page = PAGES[pageKey];
            if (!page) return null;
            const Icon = page.icon;

            // Render Operations as a parent that toggles submenu
            if (pageKey === 'operations') {
              return (
                <div key={pageKey} className="mb-2">
                  <button
                    onClick={() => setOperationsOpen(!operationsOpen)}
                    className={`btn w-100 text-start d-flex align-items-center ${
                      collapsed ? 'justify-content-center' : 'justify-content-between'
                    } ${
                      activePage === pageKey || operationsOpen ? 'btn-primary' : 'btn-outline-secondary text-white'
                    }`}
                    title={collapsed ? 'Operations' : ''}
                  >
                    <span className="d-flex align-items-center">
                      <Icon size={20} />
                      {!collapsed && <span className="ms-2">{page.name}</span>}
                    </span>
                    {!collapsed && <ChevronRight size={16} style={{ transform: operationsOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />}
                  </button>

                  {!collapsed && operationsOpen && (
                    <div className="ms-3 mt-2">
                      {['operationsDataEntry', 'operationsReview', 'operationsReport', 'operationsApproval'].map(subKey => {
                        const sub = PAGES[subKey];
                        if (!sub) return null;
                        const SubIcon = sub.icon;
                        return (
                          <button
                            key={subKey}
                            onClick={() => setActivePage(subKey)}
                            className={`btn w-100 text-start mb-2 d-flex align-items-center ${
                              activePage === subKey ? 'btn-primary' : 'btn-outline-secondary text-white'
                            }`}
                          >
                            <SubIcon size={16} />
                            <span className="ms-2">{sub.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Render Generic Entry as a parent that toggles submenu
            if (pageKey === 'genericEntry') {
              return (
                <div key={pageKey} className="mb-2">
                  <button
                    onClick={() => setGenericOpen(!genericOpen)}
                    className={`btn w-100 text-start d-flex align-items-center ${
                      collapsed ? 'justify-content-center' : 'justify-content-between'
                    } ${
                      activePage === pageKey || genericOpen ? 'btn-primary' : 'btn-outline-secondary text-white'
                    }`}
                    title={collapsed ? 'Generic Entry' : ''}
                  >
                    <span className="d-flex align-items-center">
                      <Icon size={20} />
                      {!collapsed && <span className="ms-2">{page.name}</span>}
                    </span>
                    {!collapsed && <ChevronRight size={16} style={{ transform: genericOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />}
                  </button>

                  {!collapsed && genericOpen && (
                    <div className="ms-3 mt-2">
                      {page.submenu?.map(subKey => {
                        const sub = PAGES[subKey];
                        if (!sub) return null;
                        const SubIcon = sub.icon;
                        return (
                          <button
                            key={subKey}
                            onClick={() => setActivePage(subKey)}
                            className={`btn w-100 text-start mb-2 d-flex align-items-center ${
                              activePage === subKey ? 'btn-primary' : 'btn-outline-secondary text-white'
                            }`}
                          >
                            <SubIcon size={16} />
                            <span className="ms-2">{sub.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={pageKey}
                onClick={() => setActivePage(pageKey)}
                className={`btn w-100 text-start mb-2 d-flex align-items-center ${
                  activePage === pageKey ? 'btn-primary' : 'btn-outline-secondary text-white'
                } ${collapsed ? 'justify-content-center' : ''}`}
              >
                <Icon size={20} />
                {!collapsed && <span className="ms-2">{page.name}</span>}
              </button>
            );
          })
        ) : (
          <p className="text-muted">No pages available</p>
        )}
      </nav>
      
      <div className="p-3 border-top border-secondary">
        <button
          onClick={logout}
          className={`btn btn-danger w-100 d-flex align-items-center ${collapsed ? 'justify-content-center' : ''}`}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ms-2">Logout</span>}
        </button>
      </div>

      <style>{`
        .sidebar-collapsed { width: 80px; }
        .sidebar-expanded { width: 260px; }
        .transition-all { transition: all 0.3s ease; }
      `}</style>
    </div>
  );
};

// Dashboard Page
const DashboardPage = ({ user }) => (
  <div className="container-fluid">
    <div className="row mb-4">
      <div className="col">
        <h2 className="fw-bold">Dashboard</h2>
        <p className="text-muted">Welcome back, {user.name}!</p>
      </div>
    </div>

    <div className="row g-4 mb-4">
      <div className="col-md-6 col-xl-3">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small mb-1">Total Incentives</div>
                <h3 className="fw-bold mb-0">₹2,45,680</h3>
                <small className="text-success">+12.5% from last month</small>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded">
                <DollarSign size={30} className="text-success" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-xl-3">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small mb-1">Active Users</div>
                <h3 className="fw-bold mb-0">156</h3>
                <small className="text-info">8 online now</small>
              </div>
              <div className="bg-info bg-opacity-10 p-3 rounded">
                <Users size={30} className="text-info" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-xl-3">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small mb-1">Reports Generated</div>
                <h3 className="fw-bold mb-0">43</h3>
                <small className="text-warning">15 pending</small>
              </div>
              <div className="bg-warning bg-opacity-10 p-3 rounded">
                <FileText size={30} className="text-warning" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-xl-3">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small mb-1">Performance</div>
                <h3 className="fw-bold mb-0">94.2%</h3>
                <small className="text-success">Above target</small>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded">
                <BarChart size={30} className="text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="row g-4">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom">
            <h5 className="mb-0 fw-bold">Recent Activity</h5>
          </div>
          <div className="card-body">
            <div className="list-group list-group-flush">
              <div className="list-group-item px-0">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                    <CheckCircle size={20} className="text-success" />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">Incentive Calculated</div>
                    <small className="text-muted">Q4 incentives processed successfully</small>
                  </div>
                  <small className="text-muted">2 hours ago</small>
                </div>
              </div>
              <div className="list-group-item px-0">
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 p-2 rounded me-3">
                    <Users size={20} className="text-info" />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">New User Added</div>
                    <small className="text-muted">John Doe joined the system</small>
                  </div>
                  <small className="text-muted">5 hours ago</small>
                </div>
              </div>
              <div className="list-group-item px-0">
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-2 rounded me-3">
                    <FileText size={20} className="text-warning" />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">Report Generated</div>
                    <small className="text-muted">Monthly performance report</small>
                  </div>
                  <small className="text-muted">1 day ago</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom">
            <h5 className="mb-0 fw-bold">Your Access</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <div className="small text-muted">User ID</div>
              <div className="fw-semibold">{user.loginId}</div>
            </div>
            <div className="mb-3">
              <div className="small text-muted">Roles</div>
              <div className="d-flex flex-wrap gap-1">
                {user.roles && user.roles.map((role, idx) => (
                  <span key={`dashboard-role-${idx}`} className="badge bg-primary">{role}</span>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <div className="small text-muted">Centre Code</div>
              <div className="fw-semibold">{user.centreCode}</div>
            </div>
            <div>
              <div className="small text-muted mb-2">Accessible Pages</div>
              <div className="d-flex flex-wrap gap-2">
                {['dashboard', 'users', 'genericEntry'].map(pageKey => {
                  const page = PAGES[pageKey];
                  if (!page) return null;
                  const Icon = page.icon;
                  return (
                    <div key={pageKey} className="d-flex align-items-center gap-1 px-2 py-1 bg-light rounded small">
                      <Icon size={14} className="text-primary" />
                      <span>{page.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Users Page with Advanced Validation
const UsersPage = () => {
  const [users, setUsers] = useState([
    { id: 1, loginId: 'IS03651', name: 'John Doe', email: 'john@example.com', roles: ['ADMIN'], centreCode: 'All', status: 'Active' },
    { id: 2, loginId: 'IS03652', name: 'Jane Smith', email: 'jane@example.com', roles: ['APPROVER'], centreCode: 'C001', status: 'Active' },
    { id: 3, loginId: 'IS03653', name: 'Bob Wilson', email: 'bob@example.com', roles: ['USER'], centreCode: 'C002', status: 'Active' },
    { id: 4, loginId: 'IS03654', name: 'Alice Brown', email: 'alice@example.com', roles: ['REVIEWER'], centreCode: 'C003', status: 'Active' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const availableRoles = ['ADMIN', 'USER', 'APPROVER', 'REVIEWER', 'SANCTIONER'];
  const centres = ['All', 'C001', 'C002', 'C003', 'C004', 'C005'];

  const roleDescriptions = {
    ADMIN: 'Full system access with all permissions',
    USER: 'Standard user access for daily operations',
    APPROVER: 'Can approve incentive calculations',
    REVIEWER: 'Can review and validate data',
    SANCTIONER: 'Can sanction approved incentives'
  };

  const userValidationRules = {
    loginId: [
      required('Login ID is required'),
      minLength(6, 'Login ID must be at least 6 characters'),
      alphanumeric('Login ID must contain only letters and numbers')
    ],
    name: [
      required('Full name is required'),
      minLength(3, 'Name must be at least 3 characters'),
      pattern(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces')
    ],
    email: [
      required('Email is required'),
      email('Please enter a valid email address')
    ],
    roles: [
      required('At least one role must be assigned')
    ],
    centreCode: [
      required('Centre code is required')
    ]
  };

  const formValidation = useFormValidation(
    {
      loginId: '',
      name: '',
      email: '',
      roles: [],
      centreCode: '',
      status: 'Active'
    },
    userValidationRules
  );

  const handleAdd = () => {
    setModalMode('add');
    formValidation.resetForm();
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    formValidation.setValues({
      loginId: user.loginId,
      name: user.name,
      email: user.email,
      roles: [...user.roles],
      centreCode: user.centreCode,
      status: user.status
    });
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleSubmit = () => {
    if (!formValidation.validateAll()) {
      return;
    }

    if (modalMode === 'add') {
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...formValidation.values
      };
      setUsers([...users, newUser]);
    } else {
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, ...formValidation.values } : u
      ));
    }
    setShowModal(false);
  };

  const toggleRole = (role) => {
    const currentRoles = formValidation.values.roles;
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    formValidation.handleChange('roles', newRoles);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.loginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-md-6">
          <h2 className="fw-bold mb-1">User Management</h2>
          <p className="text-muted">Manage user accounts and role assignments</p>
        </div>
        <div className="col-md-6 text-md-end">
          <button onClick={handleAdd} className="btn btn-primary btn-lg">
            <Plus size={20} className="me-2" />
            Add New User
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group input-group-lg">
            <span className="input-group-text bg-white border-end-0">
              <Search size={20} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by name, login ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Login ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">Centre</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <span className="fw-semibold">{user.loginId}</span>
                    </td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">
                      <small className="text-muted">{user.email}</small>
                    </td>
                    <td className="px-4 py-3">
                      <div className="d-flex flex-wrap gap-1">
                        {user.roles.map((role, idx) => (
                          <span key={`user-${user.id}-role-${idx}`} className="badge bg-primary">{role}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-secondary">{user.centreCode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="btn-group">
                        <button onClick={() => handleEdit(user)} className="btn btn-sm btn-outline-primary">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="btn btn-sm btn-outline-danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {modalMode === 'add' ? 'Add New User' : 'Edit User'}
                </h5>
                <button onClick={() => setShowModal(false)} className="btn-close"></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Login ID <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formValidation.touched.loginId && formValidation.errors.loginId ? 'is-invalid' : formValidation.touched.loginId ? 'is-valid' : ''}`}
                      value={formValidation.values.loginId}
                      onChange={(e) => formValidation.handleChange('loginId', e.target.value)}
                      onBlur={() => formValidation.handleBlur('loginId')}
                      placeholder="Enter login ID"
                    />
                    {formValidation.touched.loginId && formValidation.errors.loginId && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <AlertCircle size={16} className="me-1" />
                        {formValidation.errors.loginId}
                      </div>
                    )}
                    {formValidation.touched.loginId && !formValidation.errors.loginId && (
                      <div className="valid-feedback d-flex align-items-center">
                        <CheckCircle size={16} className="me-1" />
                        Looks good!
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formValidation.touched.name && formValidation.errors.name ? 'is-invalid' : formValidation.touched.name ? 'is-valid' : ''}`}
                      value={formValidation.values.name}
                      onChange={(e) => formValidation.handleChange('name', e.target.value)}
                      onBlur={() => formValidation.handleBlur('name')}
                      placeholder="Enter full name"
                    />
                    {formValidation.touched.name && formValidation.errors.name && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <AlertCircle size={16} className="me-1" />
                        {formValidation.errors.name}
                      </div>
                    )}
                    {formValidation.touched.name && !formValidation.errors.name && (
                      <div className="valid-feedback d-flex align-items-center">
                        <CheckCircle size={16} className="me-1" />
                        Looks good!
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${formValidation.touched.email && formValidation.errors.email ? 'is-invalid' : formValidation.touched.email ? 'is-valid' : ''}`}
                      value={formValidation.values.email}
                      onChange={(e) => formValidation.handleChange('email', e.target.value)}
                      onBlur={() => formValidation.handleBlur('email')}
                      placeholder="user@example.com"
                    />
                    {formValidation.touched.email && formValidation.errors.email && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <AlertCircle size={16} className="me-1" />
                        {formValidation.errors.email}
                      </div>
                    )}
                    {formValidation.touched.email && !formValidation.errors.email && (
                      <div className="valid-feedback d-flex align-items-center">
                        <CheckCircle size={16} className="me-1" />
                        Looks good!
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Assign Roles <span className="text-danger">*</span> (Multiple Selection)
                    </label>
                    {formValidation.touched.roles && formValidation.errors.roles && (
                      <div className="alert alert-danger d-flex align-items-center p-2 mb-2">
                        <AlertCircle size={16} className="me-2" />
                        <small>{formValidation.errors.roles}</small>
                      </div>
                    )}
                    <div className="row g-2">
                      {availableRoles.map(role => (
                        <div key={role} className="col-md-6">
                          <div
                            onClick={() => toggleRole(role)}
                            className={`card h-100 cursor-pointer ${
                              formValidation.values.roles.includes(role)
                                ? 'border-primary bg-primary bg-opacity-10'
                                : 'border-secondary'
                            }`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="mb-0 fw-bold">{role}</h6>
                                <div className={`form-check-input ${formValidation.values.roles.includes(role) ? 'bg-primary border-primary' : ''}`} style={{ pointerEvents: 'none' }}>
                                  {formValidation.values.roles.includes(role) && <CheckCircle size={16} />}
                                </div>
                              </div>
                              <small className="text-muted">{roleDescriptions[role]}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {formValidation.values.roles.length > 0 && (
                      <div className="alert alert-success d-flex align-items-center p-2 mt-2 mb-0">
                        <CheckCircle size={16} className="me-2" />
                        <small>Selected: {formValidation.values.roles.join(', ')}</small>
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Centre Code <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${formValidation.touched.centreCode && formValidation.errors.centreCode ? 'is-invalid' : formValidation.touched.centreCode ? 'is-valid' : ''}`}
                      value={formValidation.values.centreCode}
                      onChange={(e) => formValidation.handleChange('centreCode', e.target.value)}
                      onBlur={() => formValidation.handleBlur('centreCode')}
                    >
                      <option value="">Select centre</option>
                      {centres.map(centre => (
                        <option key={centre} value={centre}>{centre}</option>
                      ))}
                    </select>
                    {formValidation.touched.centreCode && formValidation.errors.centreCode && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <AlertCircle size={16} className="me-1" />
                        {formValidation.errors.centreCode}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={formValidation.values.status}
                      onChange={(e) => formValidation.handleChange('status', e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="btn btn-primary">
                  {modalMode === 'add' ? 'Add User' : 'Update User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Operations Data Entry Page - Template
// TARGET SETTING PAGE - Backend Integrated
const OperationsPage = () => {
  const [operation, setOperation] = useState('TARGET_SETTING'); // or 'TARGET_ACHIEVED'
  const [selectedFY, setSelectedFY] = useState('FY2024-25');
  const [objectives, setObjectives] = useState([]);
  const [actions, setActions] = useState({});
  const [successIndicators, setSuccessIndicators] = useState({});
  const [weights, setWeights] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Financial Years for display
  const financialYears = [
    { id: 'FY2024-25', name: 'FY 2024-25' },
    { id: 'FY2023-24', name: 'FY 2023-24' },
    { id: 'FY2022-23', name: 'FY 2022-23' }
  ];

  // Fetch Objectives on mount
  useEffect(() => {
    fetchObjectives();
  }, []);

  // Fetch objectives from API
  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/objectives');
      const data = await response.json();
      setObjectives(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch objectives: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Actions based on selected Objective
  const fetchActions = async (objectCode) => {
    try {
      const response = await fetch(`http://localhost:8081/api/actions/${objectCode}`);
      const data = await response.json();
      setActions(prev => ({
        ...prev,
        [objectCode]: data
      }));
    } catch (err) {
      console.error('Failed to fetch actions:', err);
    }
  };

  // Fetch Success Indicators
  const fetchSuccessIndicators = async (objectCode, actionCode) => {
    try {
      const response = await fetch(`http://localhost:8081/api/successindicator/${objectCode}/${actionCode}`);
      const data = await response.json();
      const key = `${objectCode}_${actionCode}`;
      setSuccessIndicators(prev => ({
        ...prev,
        [key]: data
      }));
    } catch (err) {
      console.error('Failed to fetch success indicators:', err);
    }
  };

  // Fetch Weight
  const fetchWeight = async (objectCode, rowId) => {
    try {
      const response = await fetch(`http://localhost:8081/api/successindicator/getWeight/${objectCode}`);
      const data = await response.json();
      setWeights(prev => ({
        ...prev,
        [objectCode]: data
      }));
      return data;
    } catch (err) {
      console.error('Failed to fetch weight:', err);
      return null;
    }
  };

  // Add new row to table
  const addNewRow = () => {
    const newRow = {
      id: Date.now(),
      objectCode: '',
      actionCode: '',
      successIndicatorCode: '',
      weightInfo: null,
      excellent: '',
      veryGood: '',
      good: '',
      fair: '',
      poor: '',
      isEditing: true,
      isSaved: false,
      objectName: '',
      actionName: '',
      siName: ''
    };
    setRows([...rows, newRow]);
  };

  // Handle objective selection
  const handleObjectiveChange = (rowId, objectCode) => {
    const objective = objectives.find(o => o.code === objectCode);
    setRows(rows.map(row => 
      row.id === rowId 
        ? { ...row, objectCode, objectName: objective?.name || '', actionCode: '', successIndicatorCode: '', weightInfo: null }
        : row
    ));
    fetchActions(objectCode);
    fetchWeight(objectCode, rowId);
  };

  // Handle action selection
  const handleActionChange = (rowId, objectCode, actionCode) => {
    const action = actions[objectCode]?.find(a => a.code === actionCode);
    setRows(rows.map(row =>
      row.id === rowId
        ? { ...row, actionCode, actionName: action?.name || '', successIndicatorCode: '' }
        : row
    ));
    fetchSuccessIndicators(objectCode, actionCode);
  };

  // Handle success indicator selection
  const handleSIChange = (rowId, objectCode, actionCode, siCode) => {
    const key = `${objectCode}_${actionCode}`;
    const si = successIndicators[key]?.find(s => s.code === siCode);
    setRows(rows.map(row =>
      row.id === rowId
        ? { ...row, successIndicatorCode: siCode, siName: si?.name || '' }
        : row
    ));
  };

  // Handle field change (Excellent, VeryGood, Good, Fair, Poor)
  const handleFieldChange = (rowId, field, value) => {
    setRows(rows.map(row =>
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  // Save row to backend
  const saveRow = async (row) => {
    if (!row.objectCode || !row.actionCode || !row.successIndicatorCode) {
      alert('Please select all master data first');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        financialYear: selectedFY,
        objectCode: row.objectCode,
        actionCode: row.actionCode,
        successIndicatorCode: row.successIndicatorCode,
        weight: row.weightInfo,
        excellent: row.excellent,
        veryGood: row.veryGood,
        good: row.good,
        fair: row.fair,
        poor: row.poor,
        status: 'SAVED'
      };

      const response = await fetch('http://localhost:8081/api/target-setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Freeze the row
        setRows(rows.map(r =>
          r.id === row.id ? { ...r, isEditing: false, isSaved: true } : r
        ));
        alert('Row saved successfully');
      } else {
        alert('Failed to save row');
      }
    } catch (err) {
      alert('Error saving row: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit saved row
  const editRow = (rowId) => {
    setRows(rows.map(r =>
      r.id === rowId ? { ...r, isEditing: true } : r
    ));
  };

  // Delete row
  const deleteRow = (rowId) => {
    setRows(rows.filter(r => r.id !== rowId));
  };

  // Get weight type for display (from weightInfo)
  const getWeightType = (weightInfo) => {
    if (!weightInfo) return 'text';
    if (weightInfo.type === 'DATE') return 'date';
    if (weightInfo.type === 'PERCENTAGE') return 'number';
    return 'number';
  };

  const masterData = {
    financialYears: [
      { id: 'C001', code: 'C001', name: 'Centre Mumbai' },
      { id: 'C002', code: 'C002', name: 'Centre Delhi' },
      { id: 'C003', code: 'C003', name: 'Centre Bangalore' }
    ],
    objectives: [
      { id: 'OBJ001', code: 'OBJ001', name: 'Research Excellence' },
      { id: 'OBJ002', code: 'OBJ002', name: 'Publication Quality' },
      { id: 'OBJ003', code: 'OBJ003', name: 'Technology Transfer' }
    ],
    actions: [
      { id: 'ACT001', code: 'ACT001', name: 'Research Publication', objectiveId: 'OBJ001' },
      { id: 'ACT002', code: 'ACT002', name: 'Patent Filing', objectiveId: 'OBJ001' },
      { id: 'ACT003', code: 'ACT003', name: 'Journal Articles', objectiveId: 'OBJ002' },
      { id: 'ACT004', code: 'ACT004', name: 'Technology Licensing', objectiveId: 'OBJ003' }
    ],
    successIndicators: [
      { id: 'SI001', code: 'SI001', name: 'Number of Publications', description: 'Count of published papers', actionId: 'ACT001' },
      { id: 'SI002', code: 'SI002', name: 'Number of Patents', description: 'Count of filed patents', actionId: 'ACT002' },
      { id: 'SI003', code: 'SI003', name: 'Journal Impact Factor', description: 'Quality of journals', actionId: 'ACT003' },
      { id: 'SI004', code: 'SI004', name: 'License Agreements', description: 'Technology transfer deals', actionId: 'ACT004' }
    ],
    units: [
      { id: 'U001', code: 'U001', name: 'Number', unitValue: 'Count' },
      { id: 'U002', code: 'U002', name: 'Percentage', unitValue: '%' },
      { id: 'U003', code: 'U003', name: 'Amount', unitValue: '₹' }
    ]
  };

  // Form State
  const [formData, setFormData] = useState({
    // Selection fields
    financialYear: '',
    centreCode: '',
    objectiveCode: '',
    actionCode: '',
    successIndicatorCode: '',
    unitCode: '',
    
    // Target Value Section
    targetValueDate: '',
    targetValueNumber: '',
    targetValueNumberRangeFrom: '',
    targetValueNumberRangeTo: '',
    unitValueInRange: 'N',
    weightPerUnitOfActivity: '',
    
    // Target Criteria Section
    targetCriteriaExcellentFrom: '',
    targetCriteriaExcellentTo: '',
    targetCriteriaVeryGoodFrom: '',
    targetCriteriaVeryGoodTo: '',
    targetCriteriaGoodFrom: '',
    targetCriteriaGoodTo: '',
    targetCriteriaFairFrom: '',
    targetCriteriaFairTo: '',
    targetCriteriaPoorFrom: '',
    targetCriteriaPoorTo: '',
    
    // Achievement Section
    achievementStatus: 'N',
    achievementValueDate: '',
    achievementValueNumber: '',
    actualAchievementPercentage: '',
    supportingDocument: '',
    
    // Centre Unit Section
    centreUnitRemarks: '',
    
    // Committee Section
    committeeRemarks: '',
    recommendedAchievementValueDate: '',
    recommendedAchievementValueNumber: '',
    recommendedWeightPerUnit: '',
    recommendedAchievementPercentage: '',
    pointsEarned: '',
    
    // Status
    status: 'Draft'
  });

  const [submittedData, setSubmittedData] = useState([]);
  const [showForm, setShowForm] = useState(true);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getFilteredActions = () => {
    if (!formData.objectiveCode) return [];
    return masterData.actions.filter(action => action.objectiveId === formData.objectiveCode);
  };

  const getFilteredSuccessIndicators = () => {
    if (!formData.actionCode) return [];
    return masterData.successIndicators.filter(si => si.actionId === formData.actionCode);
  };

  const getSelectedNames = () => {
    const centre = masterData.centres.find(c => c.id === formData.centreCode);
    const objective = masterData.objectives.find(o => o.id === formData.objectiveCode);
    const action = masterData.actions.find(a => a.id === formData.actionCode);
    const si = masterData.successIndicators.find(s => s.id === formData.successIndicatorCode);
    const unit = masterData.units.find(u => u.id === formData.unitCode);
    
    return { centre, objective, action, si, unit };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.financialYear || !formData.centreCode || !formData.objectiveCode || !formData.actionCode || !formData.successIndicatorCode || !formData.unitCode) {
      alert('Please fill all required selection fields');
      return;
    }
    
    // Create submission object
    const submission = {
      id: Date.now(),
      ...formData,
      submittedDate: new Date().toLocaleString(),
      userId: storedUser // TODO: Get from auth context
    };
    
    setSubmittedData(prev => [...prev, submission]);
    
    // Reset form
    setFormData({
      financialYear: '', centreCode: '', objectiveCode: '', actionCode: '', 
      successIndicatorCode: '', unitCode: '', targetValueDate: '', targetValueNumber: '',
      targetValueNumberRangeFrom: '', targetValueNumberRangeTo: '', unitValueInRange: 'N',
      weightPerUnitOfActivity: '', targetCriteriaExcellentFrom: '', targetCriteriaExcellentTo: '',
      targetCriteriaVeryGoodFrom: '', targetCriteriaVeryGoodTo: '', targetCriteriaGoodFrom: '',
      targetCriteriaGoodTo: '', targetCriteriaFairFrom: '', targetCriteriaFairTo: '',
      targetCriteriaPoorFrom: '', targetCriteriaPoorTo: '', achievementStatus: 'N',
      achievementValueDate: '', achievementValueNumber: '', actualAchievementPercentage: '',
      supportingDocument: '', centreUnitRemarks: '', committeeRemarks: '',
      recommendedAchievementValueDate: '', recommendedAchievementValueNumber: '',
      recommendedWeightPerUnit: '', recommendedAchievementPercentage: '', pointsEarned: '',
      status: 'Draft'
    });
    
    alert('Data submitted successfully!');
  };

  const names = getSelectedNames();

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold">Operational Data Entry</h2>
          <p className="text-muted">Enter operational performance data with cascading selections</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit}>
          {/* ===== SECTION 1: MASTER DATA SELECTION ===== */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📋 Step 1: Select Master Data</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {/* Financial Year */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Financial Year <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-select-lg"
                    value={formData.financialYear}
                    onChange={(e) => handleInputChange('financialYear', e.target.value)}
                    required
                  >
                    <option value="">-- Select Financial Year --</option>
                    {masterData.financialYears.map(fy => (
                      <option key={fy.id} value={fy.id}>{fy.name}</option>
                    ))}
                  </select>
                </div>

                {/* Centre Code */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Centre Code <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-select-lg"
                    value={formData.centreCode}
                    onChange={(e) => handleInputChange('centreCode', e.target.value)}
                    required
                  >
                    <option value="">-- Select Centre --</option>
                    {masterData.centres.map(centre => (
                      <option key={centre.id} value={centre.id}>{centre.code} - {centre.name}</option>
                    ))}
                  </select>
                  {names.centre && <small className="text-success d-block mt-1">✓ {names.centre.name}</small>}
                </div>

                {/* Objective Code */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Objective Code <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-select-lg"
                    value={formData.objectiveCode}
                    onChange={(e) => handleInputChange('objectiveCode', e.target.value)}
                    required
                  >
                    <option value="">-- Select Objective --</option>
                    {masterData.objectives.map(obj => (
                      <option key={obj.id} value={obj.id}>{obj.code} - {obj.name}</option>
                    ))}
                  </select>
                  {names.objective && <small className="text-success d-block mt-1">✓ {names.objective.name}</small>}
                </div>

                {/* Action Code */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Action Code <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-select-lg"
                    value={formData.actionCode}
                    onChange={(e) => handleInputChange('actionCode', e.target.value)}
                    disabled={!formData.objectiveCode}
                    required
                  >
                    <option value="">-- Select Action --</option>
                    {getFilteredActions().map(action => (
                      <option key={action.id} value={action.id}>{action.code} - {action.name}</option>
                    ))}
                  </select>
                  {names.action && <small className="text-success d-block mt-1">✓ {names.action.name}</small>}
                </div>

                {/* Success Indicator Code */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Success Indicator <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-select-lg"
                    value={formData.successIndicatorCode}
                    onChange={(e) => handleInputChange('successIndicatorCode', e.target.value)}
                    disabled={!formData.actionCode}
                    required
                  >
                    <option value="">-- Select Success Indicator --</option>
                    {getFilteredSuccessIndicators().map(si => (
                      <option key={si.id} value={si.id}>{si.code} - {si.name}</option>
                    ))}
                  </select>
                  {names.si && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-success fw-semibold">✓ {names.si.name}</small>
                      <div className="text-muted small">{names.si.description}</div>
                    </div>
                  )}
                </div>

                {/* Unit Code */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Unit of Measurement <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-select-lg"
                    value={formData.unitCode}
                    onChange={(e) => handleInputChange('unitCode', e.target.value)}
                    required
                  >
                    <option value="">-- Select Unit --</option>
                    {masterData.units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.code} - {unit.name} ({unit.unitValue})</option>
                    ))}
                  </select>
                  {names.unit && <small className="text-success d-block mt-1">✓ {names.unit.name}</small>}
                </div>
              </div>
            </div>
          </div>

          {/* ===== SECTION 2: TARGET VALUE SECTION ===== */}
          {formData.unitCode && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">🎯 Step 2: Target Values</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Target Value Date</label>
                    <input type="date" className="form-control form-control-lg" value={formData.targetValueDate} onChange={(e) => handleInputChange('targetValueDate', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Target Value Number</label>
                    <input type="number" className="form-control form-control-lg" placeholder="Enter target value" value={formData.targetValueNumber} onChange={(e) => handleInputChange('targetValueNumber', e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Value in Range? (Y/N)</label>
                    <select className="form-select form-select-lg" value={formData.unitValueInRange} onChange={(e) => handleInputChange('unitValueInRange', e.target.value)}>
                      <option value="N">No</option>
                      <option value="Y">Yes</option>
                    </select>
                  </div>
                  {formData.unitValueInRange === 'Y' && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Range From</label>
                        <input type="number" className="form-control form-control-lg" value={formData.targetValueNumberRangeFrom} onChange={(e) => handleInputChange('targetValueNumberRangeFrom', e.target.value)} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Range To</label>
                        <input type="number" className="form-control form-control-lg" value={formData.targetValueNumberRangeTo} onChange={(e) => handleInputChange('targetValueNumberRangeTo', e.target.value)} />
                      </div>
                    </>
                  )}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Weight Per Unit of Activity (%)</label>
                    <input type="number" className="form-control form-control-lg" placeholder="0-100" value={formData.weightPerUnitOfActivity} onChange={(e) => handleInputChange('weightPerUnitOfActivity', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== SECTION 3: TARGET CRITERIA SECTION ===== */}
          {formData.unitCode && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">📊 Step 3: Target Criteria (Performance Levels)</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {['Excellent', 'VeryGood', 'Good', 'Fair', 'Poor'].map((level, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="fw-bold mb-3">{level === 'VeryGood' ? 'Very Good' : level}</h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <small className="form-label">From</small>
                            <input type="number" className="form-control form-control-sm" value={formData[`targetCriteria${level}From`]} onChange={(e) => handleInputChange(`targetCriteria${level}From`, e.target.value)} />
                          </div>
                          <div className="col-6">
                            <small className="form-label">To</small>
                            <input type="number" className="form-control form-control-sm" value={formData[`targetCriteria${level}To`]} onChange={(e) => handleInputChange(`targetCriteria${level}To`, e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== SECTION 4: ACHIEVEMENT SECTION ===== */}
          {formData.unitCode && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">✅ Step 4: Achievement Values</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Achievement Status (Y/N)</label>
                    <select className="form-select form-select-lg" value={formData.achievementStatus} onChange={(e) => handleInputChange('achievementStatus', e.target.value)}>
                      <option value="N">No Achievement</option>
                      <option value="Y">Achieved</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Achievement Value Date</label>
                    <input type="date" className="form-control form-control-lg" value={formData.achievementValueDate} onChange={(e) => handleInputChange('achievementValueDate', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Achievement Value Number</label>
                    <input type="number" className="form-control form-control-lg" value={formData.achievementValueNumber} onChange={(e) => handleInputChange('achievementValueNumber', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Actual Achievement %</label>
                    <input type="number" className="form-control form-control-lg" placeholder="0-100" value={formData.actualAchievementPercentage} onChange={(e) => handleInputChange('actualAchievementPercentage', e.target.value)} />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Supporting Document</label>
                    <input type="file" className="form-control form-control-lg" onChange={(e) => handleInputChange('supportingDocument', e.target.files?.[0]?.name || '')} />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Remarks from Centre Unit</label>
                    <textarea className="form-control" rows="3" placeholder="Enter centre unit remarks..." value={formData.centreUnitRemarks} onChange={(e) => handleInputChange('centreUnitRemarks', e.target.value)}></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== SECTION 5: COMMITTEE SECTION ===== */}
          {formData.unitCode && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">👥 Step 5: Committee Review</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Recommended Achievement Value Date</label>
                    <input type="date" className="form-control form-control-lg" value={formData.recommendedAchievementValueDate} onChange={(e) => handleInputChange('recommendedAchievementValueDate', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Recommended Achievement Value Number</label>
                    <input type="number" className="form-control form-control-lg" value={formData.recommendedAchievementValueNumber} onChange={(e) => handleInputChange('recommendedAchievementValueNumber', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Recommended Weight Per Unit (%)</label>
                    <input type="number" className="form-control form-control-lg" value={formData.recommendedWeightPerUnit} onChange={(e) => handleInputChange('recommendedWeightPerUnit', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Recommended Achievement %</label>
                    <input type="number" className="form-control form-control-lg" value={formData.recommendedAchievementPercentage} onChange={(e) => handleInputChange('recommendedAchievementPercentage', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Points Earned</label>
                    <input type="number" className="form-control form-control-lg" value={formData.pointsEarned} onChange={(e) => handleInputChange('pointsEarned', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Status</label>
                    <select className="form-select form-select-lg" value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)}>
                      <option value="Draft">Draft</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Committee Remarks</label>
                    <textarea className="form-control" rows="3" placeholder="Enter committee remarks..." value={formData.committeeRemarks} onChange={(e) => handleInputChange('committeeRemarks', e.target.value)}></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="row mb-4">
            <div className="col-12">
              <button type="submit" className="btn btn-primary btn-lg me-2">
                <Plus size={18} className="me-2" />
                Submit Data
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline-secondary btn-lg me-2">
                View Submissions
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ===== SUBMITTED DATA TABLE ===== */}
      {!showForm && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Submitted Data</h5>
              <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
                <Plus size={14} className="me-1" />
                Add New Entry
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Financial Year</th>
                    <th>Centre</th>
                    <th>Objective</th>
                    <th>Success Indicator</th>
                    <th>Target Value</th>
                    <th>Achievement Value</th>
                    <th>Achievement %</th>
                    <th>Points</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedData.map(data => {
                    const fy = masterData.financialYears.find(f => f.id === data.financialYear);
                    const centre = masterData.centres.find(c => c.id === data.centreCode);
                    const obj = masterData.objectives.find(o => o.id === data.objectiveCode);
                    const si = masterData.successIndicators.find(s => s.id === data.successIndicatorCode);
                    
                    return (
                      <tr key={data.id}>
                        <td><small>{fy?.name}</small></td>
                        <td><small>{centre?.code}</small></td>
                        <td><small>{obj?.code}</small></td>
                        <td><small>{si?.name}</small></td>
                        <td><strong>{data.targetValueNumber}</strong></td>
                        <td><strong>{data.achievementValueNumber}</strong></td>
                        <td><strong>{data.actualAchievementPercentage}%</strong></td>
                        <td><strong>{data.pointsEarned}</strong></td>
                        <td><span className={`badge bg-${data.status === 'Approved' ? 'success' : data.status === 'Rejected' ? 'danger' : 'warning'}`}>{data.status}</span></td>
                        <td><small>{data.submittedDate}</small></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {submittedData.length === 0 && (
                <div className="alert alert-info text-center mt-4">No submissions yet. Click "Add New Entry" to start.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Other Page Components
const IncentivesPage = () => (
  <div className="container-fluid">
    <h2 className="fw-bold mb-3">Incentives</h2>
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <p className="text-muted">Incentive calculation and management system.</p>
      </div>
    </div>
  </div>
);

const ReportsPage = () => (
  <div className="container-fluid">
    <h2 className="fw-bold mb-3">Reports</h2>
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <p className="text-muted">Generate and view various reports.</p>
      </div>
    </div>
  </div>
);

const InventoryPage = () => (
  <div className="container-fluid">
    <h2 className="fw-bold mb-3">Inventory</h2>
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <p className="text-muted">Inventory management system.</p>
      </div>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="container-fluid">
    <h2 className="fw-bold mb-3">Settings</h2>
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <p className="text-muted">System configuration and settings.</p>
      </div>
    </div>
  </div>
);

const AnalyticsPage = () => (
  <div className="container-fluid">
    <h2 className="fw-bold mb-3">Analytics</h2>
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <p className="text-muted">Business analytics and insights.</p>
      </div>
    </div>
  </div>
);

// Lazy import for role management pages (will be replaced with actual components later)
const RoleManagementPage = React.lazy(() => import('./pages/RoleManagementPage'));
const UserRoleAssignmentPage = React.lazy(() => import('./pages/UserRoleAssignmentPage'));
const CentresPage = React.lazy(() => import('./pages/generic/CentresPage'));
const CentreTypePage = React.lazy(() => import('./pages/generic/CentreTypePage'));
const ObjectivesPage = React.lazy(() => import('./pages/generic/ObjectivesPage'));
const ScreensPage = React.lazy(() => import('./pages/generic/ScreensPage'));
const SuccessIndicatorsPage = React.lazy(() => import('./pages/generic/SuccessIndicatorPage'));
const ActionsPage = React.lazy(() => import('./pages/generic/ActionsPage'));
const StatusCodesPage = React.lazy(() => import('./pages/generic/StatusCodesPage'));
const UnitDatatypeCodesPage = React.lazy(() => import('./pages/generic/UnitDatatypeCodesPage'));

// Operations Sub-Pages
const OperationsReviewPage = () => (
  <div className="container-fluid">
    <div className="row mb-4">
      <div className="col">
        <h2 className="fw-bold">📋 Review & Approve Operations</h2>
        <p className="text-muted">Review submitted operational data and provide approval</p>
      </div>
    </div>
    <div className="alert alert-info">
      <strong>Features:</strong> Review submitted data, add committee remarks, approve/reject entries
    </div>
    <p className="text-muted">This page will display all submitted operational data ready for review and approval.</p>
  </div>
);

const OperationsReportPage = () => (
  <div className="container-fluid">
    <div className="row mb-4">
      <div className="col">
        <h2 className="fw-bold">📊 Operations Reports</h2>
        <p className="text-muted">Generate and view operational data reports</p>
      </div>
    </div>
    <div className="alert alert-info">
      <strong>Features:</strong> Generate reports by centre, objective, time period; export to Excel
    </div>
    <p className="text-muted">This page will provide comprehensive reporting on operational performance data.</p>
  </div>
);

const OperationsApprovalPage = () => (
  <div className="container-fluid">
    <div className="row mb-4">
      <div className="col">
        <h2 className="fw-bold">✅ Approval Queue</h2>
        <p className="text-muted">Track pending approvals and approval history</p>
      </div>
    </div>
    <div className="alert alert-info">
      <strong>Features:</strong> View pending approvals, approval workflow status, approval history
    </div>
    <p className="text-muted">This page will show all items pending approval with workflow status.</p>
  </div>
);

// Page Router
const PageRouter = ({ activePage, user }) => {
  const pages = {
    dashboard: <DashboardPage user={user} />,
    users: <UsersPage />,
    operations: <OperationsTargetSettingPage />,
    operationsDataEntry: <OperationsTargetSettingPage />,
    operationsReview: <OperationsReviewPage />,
    operationsReport: <OperationsReportPage />,
    operationsApproval: <OperationsApprovalPage />,
    roleManagement: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><RoleManagementPage /></React.Suspense>,
    userRoleAssignment: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><UserRoleAssignmentPage /></React.Suspense>,
    centres: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><CentresPage /></React.Suspense>,
    centreTypes: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><CentreTypePage /></React.Suspense>,
    objectives: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><ObjectivesPage /></React.Suspense>,
    screens: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><ScreensPage /></React.Suspense>,
    successIndicator: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><SuccessIndicatorsPage /></React.Suspense>,
    actions: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><ActionsPage /></React.Suspense>,
    statusCodes: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><StatusCodesPage /></React.Suspense>,
    unitDatatypeCodes: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><UnitDatatypeCodesPage /></React.Suspense>,
    incentives: <IncentivesPage />,
    reports: <ReportsPage />,
    inventory: <InventoryPage />,
    settings: <SettingsPage />,
    analytics: <AnalyticsPage />
  };

  return pages[activePage] || pages.dashboard;
};

// Main Layout
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const { user, logout } = useAuth();
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(null);

  // Check if user has any role - must have roles array with at least one role
  if (!user || !Array.isArray(user.roles) || user.roles.length === 0) {
    return <NoRoleAccess user={user} />;
  }

  // Session timeout warning (show warning at 2 minutes before timeout)
  const SESSION_TIMEOUT = 15 * 60 * 1000;
  const WARNING_TIME = 2 * 60 * 1000;

  // Auto-collapse sidebar when navigating to Operations pages
  useEffect(() => {
    if (activePage && activePage.startsWith('operations')) {
      setCollapsed(true);
    }
  }, [activePage]);

  useEffect(() => {
    if (!user) return;

    const updateSessionTimer = () => {
      const loginTime = new Date(user.loginTime);
      const elapsed = Date.now() - loginTime.getTime();
      const remaining = Math.max(0, SESSION_TIMEOUT - elapsed);
      
      if (remaining > 0) {
        setSessionTimeRemaining(remaining);
      } else {
        logout();
      }
    };

    const interval = setInterval(updateSessionTimer, 1000);
    updateSessionTimer();

    return () => clearInterval(interval);
  }, [user, logout]);

  const formatTimeRemaining = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showSessionWarning = sessionTimeRemaining && sessionTimeRemaining <= WARNING_TIME;

  return (
    <div className="d-flex">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className="flex-grow-1 overflow-auto bg-light" style={{ minHeight: '100vh' }}>
        {/* Session warning disabled - will be re-enabled if needed */}
        {false && (
          <div className="alert alert-warning alert-dismissible fade show m-3 d-flex align-items-center" role="alert">
            <AlertCircle size={20} className="me-2" />
            <div className="flex-grow-1">
              Your session will expire in <strong>{formatTimeRemaining(sessionTimeRemaining)}</strong> due to inactivity. Please save your work.
            </div>
            <button type="button" className="btn-close" onClick={() => {}} aria-label="Close"></button>
          </div>
        )}
        <div className="p-4">
          <PageRouter activePage={activePage} user={user} />
        </div>
      </div>
    </div>
  );
};

// Main App
const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
      {user ? <MainLayout /> : <LoginPage />}
    </>
  );
};

export default function PGIASApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Home, Users, DollarSign, FileText, Settings, BarChart, Package, LogOut, ChevronLeft, ChevronRight, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Search, Edit, Trash2, Plus, Shield } from 'lucide-react';
import { userRoleAPI } from './services/api';
import HomePage from './pages/HomePage';

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
  genericEntry: { name: 'Generic Entry', icon: FileText, path: '/generic-entry', submenu: ['roleManagement', 'userRoleAssignment', 'centres', 'centreTypes', 'objectives', 'screens', 'successIndicator', 'actions'] },
  roleManagement: { name: 'Role Management', icon: Shield, path: '/roles' },
  userRoleAssignment: { name: 'User Role Assignment', icon: Shield, path: '/user-roles' },
  centres: { name: 'Centres', icon: Package, path: '/generic/centres' },
  centreTypes: { name: 'Centre Types', icon: Package, path: '/generic/centre-types' },
  objectives: { name: 'Objectives', icon: Package, path: '/generic/objectives' },
  screens: { name: 'Screens', icon: Package, path: '/generic/screens' },
  successIndicator: { name: 'Success Indicators', icon: Package, path: '/generic/success-indicators' },
  actions: { name: 'Actions', icon: Package, path: '/generic/actions' },
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
        
        // Extract role codes from response
        let rolesArray = [];
        if (Array.isArray(rolesData) && rolesData.length > 0) {
          rolesArray = rolesData.map(item => {
            return typeof item === 'object' && item.roleCode ? item.roleCode : item;
          });
        }
        
        // Check if user has roles assigned
        if (rolesArray.length === 0) {
          return { 
            success: false, 
            error: 'Roles not yet assigned. Please contact Administrator.',
            noRoles: true
          };
        }
        
        // Create user object with roles
        const userWithRoles = {
          loginId: loginId,
          name: loginId.toUpperCase(),
          email: `${loginId}@isro.gov.in`,
          roles: rolesArray,
          roleCode: rolesArray[0],
          centreCode: 'CENTRE01',
          loginTime: new Date().toISOString()
        };
        
        // Generate secure session token
        const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        setUser(userWithRoles);
        localStorage.setItem('pgias_user', JSON.stringify(userWithRoles));
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

// Landing Page Component (Homepage with Login/Signup buttons in header)
const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
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
      password: []
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
            const _ujson = JSON.parse(atob(cauthResponse));
            
            if (_ujson.login_status === 'success') {
              const _loginUserID = _ujson['emp_staffcode'];
              console.log('CAS Login successful for user:', _loginUserID);
              
              setIsLoading(true);
              const result = await loginWithCAS(_loginUserID);
              
              if (!result.success) {
                setLoginError(result.error || 'CAS login failed. Please try again.');
              }
              
              setIsLoading(false);
            } else {
              setLoginError('Invalid CAS Login. ' + (_ujson.msg || ''));
            }
            
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
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header/Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-50">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold fs-4 d-flex align-items-center" href="#">
            <DollarSign size={28} className="me-2" />
            PGIAS
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button 
                  className="btn btn-outline-light me-2"
                  onClick={() => setShowLoginModal(true)}
                >
                  Login
                </button>
              </li>
              <li className="nav-item">
                <a 
                  href="https://central-authentication.isro.dos.gov.in/CASClient/signup.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-light"
                >
                  Sign Up
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="text-white">
                <h1 className="display-4 fw-bold mb-4">Welcome to PGIAS</h1>
                <p className="lead mb-4">
                  Performance & Growth Incentive Analysis System
                </p>
                <p className="fs-5 mb-4">
                  A comprehensive platform for managing and analyzing performance incentives across ISRO centres. 
                  Track, analyze, and optimize growth incentive allocations with ease.
                </p>
                <div className="d-flex gap-3">
                  <button 
                    className="btn btn-light btn-lg px-4"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Get Started
                  </button>
                  <a
                    href={generateCASLoginURL()}
                    className="btn btn-outline-light btn-lg px-4 text-decoration-none"
                  >
                    Login via CAS
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card shadow-lg border-0 rounded-4 bg-white bg-opacity-95">
                <div className="card-body p-5">
                  <h3 className="text-center fw-bold mb-4 text-dark">Features</h3>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item border-0 d-flex align-items-start">
                      <CheckCircle size={24} className="text-success me-3 mt-1 flex-shrink-0" />
                      <div>
                        <h6 className="mb-1 text-dark">Role-Based Access</h6>
                        <p className="text-muted small">Control access based on user roles</p>
                      </div>
                    </div>
                    <div className="list-group-item border-0 d-flex align-items-start">
                      <CheckCircle size={24} className="text-success me-3 mt-1 flex-shrink-0" />
                      <div>
                        <h6 className="mb-1 text-dark">Real-Time Analytics</h6>
                        <p className="text-muted small">Monitor incentives and performance metrics</p>
                      </div>
                    </div>
                    <div className="list-group-item border-0 d-flex align-items-start">
                      <CheckCircle size={24} className="text-success me-3 mt-1 flex-shrink-0" />
                      <div>
                        <h6 className="mb-1 text-dark">Secure Authentication</h6>
                        <p className="text-muted small">Integrated with ISRO CAS for security</p>
                      </div>
                    </div>
                    <div className="list-group-item border-0 d-flex align-items-start">
                      <CheckCircle size={24} className="text-success me-3 mt-1 flex-shrink-0" />
                      <div>
                        <h6 className="mb-1 text-dark">Data Management</h6>
                        <p className="text-muted small">Efficient CRUD operations for all modules</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
          <div className="card shadow-lg border-0 rounded-4" style={{ width: '400px' }}>
            <div className="card-body p-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0">Login</h4>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowLoginModal(false)}
                >
                  ✕
                </button>
              </div>

              {loginError && (
                <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
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
                className="btn btn-outline-primary btn-lg w-100 mb-3 text-decoration-none"
              >
                Login via CAS
              </a>

              <div className="mt-3 pt-3 border-top text-center">
                <div className="small text-muted mb-2">
                  <a href="https://central-authentication.isro.dos.gov.in/CASClient/forgotpass.html" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none fw-semibold">
                    Forgot Password?
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
                {user.roles && user.roles.map(role => (
                  <span key={role} className="badge bg-primary">{role}</span>
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
                        {user.roles.map(role => (
                          <span key={role} className="badge bg-primary">{role}</span>
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

// Page Router
const PageRouter = ({ activePage, user }) => {
  const pages = {
    dashboard: <DashboardPage user={user} />,
    users: <UsersPage />,
    roleManagement: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><RoleManagementPage /></React.Suspense>,
    userRoleAssignment: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><UserRoleAssignmentPage /></React.Suspense>,
    centres: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><CentresPage /></React.Suspense>,
    centreTypes: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><CentreTypePage /></React.Suspense>,
    objectives: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><ObjectivesPage /></React.Suspense>,
    screens: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><ScreensPage /></React.Suspense>,
    successIndicator: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><SuccessIndicatorsPage /></React.Suspense>,
    actions: <React.Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}><ActionsPage /></React.Suspense>,
    incentives: <IncentivesPage />,
    reports: <ReportsPage />,
    inventory: <InventoryPage />,
    settings: <SettingsPage />,
    analytics: <AnalyticsPage />
  };

  return pages[activePage] || pages.dashboard;
};

// Sidebar Component
const Sidebar = ({ collapsed, setCollapsed, activePage, setActivePage }) => {
  const { user, logout } = useAuth();

  return (
    <div 
      className="bg-dark text-white d-flex flex-column" 
      style={{ 
        width: collapsed ? '60px' : '250px', 
        minHeight: '100vh',
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {/* Logo/Brand */}
      <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-secondary">
        {!collapsed && <h5 className="mb-0 fw-bold">PGIAS</h5>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-sm btn-dark text-white"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-3 border-bottom border-secondary">
          <small className="text-muted">Logged in as</small>
          <div className="small fw-semibold text-white mt-1">{user.loginId}</div>
          <div className="small text-muted mt-1">{user.roles?.[0]}</div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-grow-1 p-2">
        <div className="list-group list-group-flush">
          {['dashboard', 'users', 'genericEntry'].map(pageKey => {
            const page = PAGES[pageKey];
            if (!page) return null;
            const Icon = page.icon;
            const isActive = activePage === pageKey;
            
            return (
              <button
                key={pageKey}
                onClick={() => setActivePage(pageKey)}
                className={`btn btn-dark text-white list-group-item list-group-item-action border-0 mb-1 text-start d-flex align-items-center gap-2 ${
                  isActive ? 'bg-primary' : ''
                }`}
                title={collapsed ? page.name : ''}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{page.name}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-top border-secondary">
        <button
          onClick={() => {
            logout();
            window.location.reload();
          }}
          className="btn btn-dark text-white w-100 d-flex align-items-center justify-content-center gap-2"
          title="Logout"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

// Main Layout
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const { user, logout } = useAuth();
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(null);

  // Session timeout warning (show warning at 2 minutes before timeout)
  const SESSION_TIMEOUT = 15 * 60 * 1000;
  const WARNING_TIME = 2 * 60 * 1000;

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
        {showSessionWarning && (
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
      {user ? <MainLayout /> : <LandingPage />}
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

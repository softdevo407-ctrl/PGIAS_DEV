import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertCircle, CheckCircle, XCircle, ChevronUp, ChevronDown, Loader } from 'lucide-react';
import { userRoleAPI, roleAPI, centresAPI } from '../services/api';
import { fetchScreens } from '../services/screensService';

const UserRoleAssignmentPage = () => {
  const [userRoles, setUserRoles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    loginId: '',
    roleCode: '',
    centreCode: '',
    effectiveFrom: '',
    effectiveTo: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [centres, setCentres] = useState([]);
  const [screensList, setScreensList] = useState([]);
  const [screenAccess, setScreenAccess] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const itemsPerPage = 10;

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [userRolesData, rolesData] = await Promise.all([
        userRoleAPI.getAll(),
        roleAPI.getAll()
      ]);
      
      // Fetch screens for each assignment
      const assignmentsWithScreens = await Promise.all(
        (Array.isArray(userRolesData) ? userRolesData : []).map(async (assignment) => {
          try {
            const screensResponse = await userRoleAPI.getScreensByUserRole(
              assignment.loginId,
              assignment.roleCode,
              assignment.centreCode
            );
            return {
              ...assignment,
              assignedScreens: screensResponse || []
            };
          } catch (error) {
            console.error('Error fetching screens:', error);
            return {
              ...assignment,
              assignedScreens: []
            };
          }
        })
      );
      
      setUserRoles(assignmentsWithScreens);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.loginId.trim()) {
      errors.loginId = 'Login ID is required';
    }
    if (!formData.roleCode) {
      errors.roleCode = 'Role is required';
    }
    if (!formData.centreCode) {
      errors.centreCode = 'Centre Code is required';
    }
    return errors;
  };

  const handleAdd = async () => {
    // Fetch centres data and screens from API
    try {
      setError('');
      
      // Fetch centres
      const centresData = await centresAPI.getAll();
      setCentres(Array.isArray(centresData) ? centresData : []);
      
      // Fetch screens from API-driven service
      try {
        const screensData = await fetchScreens();
        setScreensList(Array.isArray(screensData) ? screensData : []);
        console.log('✅ Loaded screens from API:', screensData.length);
        setScreenAccess({});
      } catch (err) {
        console.error('❌ Failed to load screens from API:', err);
        setError('Failed to load pages/screens. Ensure API is running.');
        setScreensList([]);
        return;
      }
    } catch (err) {
      console.error('Error fetching centres:', err);
      setError('Failed to fetch centres data');
      return;
    }

    setModalMode('add');
    setFormData({
      loginId: '',
      roleCode: '',
      centreCode: '',
      effectiveFrom: '',
      effectiveTo: ''
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const handleEdit = (assignment) => {
    setModalMode('edit');
    setSelectedAssignment(assignment);
    setFormData({
      loginId: assignment.loginId || '',
      roleCode: assignment.roleCode || '',
      centreCode: assignment.centreCode || '',
      effectiveFrom: assignment.effectiveFrom || '',
      effectiveTo: assignment.effectiveTo || ''
    });
    setValidationErrors({});
    setShowModal(true);
    
    // For edit mode, load screens and existing assignments
    (async () => {
      try {
        // Fetch screens from API-driven service
        const screensData = await fetchScreens();
        setScreensList(Array.isArray(screensData) ? screensData : []);
        console.log('✅ Loaded screens for edit:', screensData.length);
        
        // Load existing screen assignments for this user-role
        try {
          const assignedScreens = await userRoleAPI.getScreensByUserRole(
            assignment.loginId, 
            assignment.roleCode, 
            assignment.centreCode
          );
          const map = {};
          if (Array.isArray(assignedScreens)) {
            assignedScreens.forEach(s => {
              // Map screenId (from API) to screenCode for access tracking
              map[s.screenId] = s.accessType || 'READ';
            });
          }
          setScreenAccess(map);
          console.log('✅ Loaded existing screen assignments:', map);
        } catch (e) {
          console.warn('No existing screen assignments found for this user-role');
          setScreenAccess({});
        }
      } catch (err) {
        console.error('❌ Error loading screens for edit:', err);
        setScreensList([]);
      }
    })();
  };

  const handleDelete = async (loginId, roleCode, centreCode) => {
    try {
      setSubmitting(true);
      setError('');
      await userRoleAPI.delete(loginId, roleCode, centreCode);
      setSuccess('✓ Role assignment revoked successfully');
      setShowDeleteConfirm(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to revoke role assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      // Get current date as fallback
      const today = new Date().toISOString().slice(0, 10);
      
      // Build payload with user role assignment
      // Convert frontend field names (effectiveFrom/To) to backend field names (fromDate/toDate)
      const payload = {
        loginId: formData.loginId,
        roleCode: formData.roleCode,
        centreCode: formData.centreCode,
        fromDate: formData.effectiveFrom || today,  // REQUIRED - fallback to today if empty
        toDate: formData.effectiveTo || null,       // Optional
        userId: null,
        regStatus: 'A',  // Single character: A=ACTIVE, I=INACTIVE
        regTime: new Date().toISOString()
      };
      
      // Build screen access payload from selected screens
      const screenAccessPayload = Object.entries(screenAccess)
        .filter(([screenId, accessType]) => accessType && accessType !== 'NONE')
        .map(([screenId, accessType]) => {
          // Find screen details from screensList
          const screen = screensList.find(s => s.screenId === screenId);
          return {
            screenId: screenId,           // Frontend uses screenId
            screenCode: screenId,         // Backend expects screenCode (store as screenCode in DB)
            screenName: screen?.screenName || screenId,
            accessType: accessType,       // READ, WRITE, ADMIN, ALL
            status: 'R',                  // Single character: R=Regular/Active
            fromDate: formData.effectiveFrom || today,  // REQUIRED - use role fromDate
            toDate: formData.effectiveTo || null,       // Optional
            createdBy: localStorage.getItem('loginId') || 'SYSTEM'  // Track who created it
          };
        });

      // Add screens array to payload
      if (screenAccessPayload.length > 0) {
        payload.screens = screenAccessPayload;
      }

      console.log('📤 Submitting payload:', payload);

      if (modalMode === 'add') {
        await userRoleAPI.create(payload);
        setSuccess('✓ Role assigned successfully with screen access');
      } else {
        await userRoleAPI.update(
          selectedAssignment.loginId,
          selectedAssignment.roleCode,
          selectedAssignment.centreCode,
          payload
        );
        setSuccess('✓ Role assignment updated successfully with screen access');
      }
      
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Error submitting:', err);
      setError(err.message || 'Failed to save role assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const filteredAssignments = userRoles.filter(assignment =>
    assignment.loginId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.roleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.centreCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAssignments = sortConfig.key ? [...filteredAssignments].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (typeof aVal === 'string') {
      return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  }) : filteredAssignments;

  const paginatedAssignments = sortedAssignments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedAssignments.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const getRoleName = (roleCode) => {
    // Match by roleCode and return roleDescription
    const role = roles.find(r => r.roleCode === roleCode);
    return role?.roleDescription || roleCode;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }} className="py-4">
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="row mb-5">
          <div className="col-md-8">
            <h1 className="fw-bold text-dark mb-2" style={{ fontSize: '2.5rem' }}>User Role Assignment</h1>
            <p className="text-muted fs-5">Assign roles to users by login ID</p>
          </div>
          <div className="col-md-4 d-flex align-items-center justify-content-end">
            <button
              className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm"
              onClick={handleAdd}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
            >
              <Plus size={20} className="me-2" />
              Assign Role
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center rounded-lg shadow-sm mb-4" role="alert">
            <AlertCircle size={20} className="me-3" />
            <div><strong>Error!</strong> {error}</div>
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible fade show d-flex align-items-center rounded-lg shadow-sm mb-4" role="alert">
            <CheckCircle size={20} className="me-3" />
            <div>{success}</div>
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        )}

        {/* Main Card */}
        <div className="card shadow-lg border-0 rounded-3xl overflow-hidden">
          <div className="card-body p-0">
            {/* Search */}
            <div className="p-4 border-bottom" style={{ background: '#f8f9fa' }}>
              <div className="input-group">
                <span className="input-group-text rounded-start-2xl" style={{ border: '2px solid #e9ecef', background: 'white' }}>
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control rounded-end-2xl"
                  placeholder="Search by login ID, role, or centre..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ border: '2px solid #e9ecef', borderLeft: 'none' }}
                />
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="text-center py-5">
                <Loader className="spinner-border text-primary" size={40} />
                <p className="mt-3 text-muted">Loading role assignments...</p>
              </div>
            ) : paginatedAssignments.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted fs-5">{searchTerm ? 'No assignments found' : 'No role assignments found yet.'}</p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <tr>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('loginId')}>
                          <div className="d-flex align-items-center">
                            Login ID
                            {sortConfig.key === 'loginId' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('roleCode')}>
                          <div className="d-flex align-items-center">
                            Role
                            {sortConfig.key === 'roleCode' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark">Role Name</th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('centreCode')}>
                          <div className="d-flex align-items-center">
                            Centre
                            {sortConfig.key === 'centreCode' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark">From Date</th>
                        <th className="px-4 py-3 fw-bold text-dark">To Date</th>
                        <th className="px-4 py-3 fw-bold text-dark">Assigned Pages</th>
                        <th className="px-4 py-3 fw-bold text-dark text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAssignments.map((assignment, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td className="px-4 py-3"><span className="fw-semibold">{assignment.loginId}</span></td>
                          <td className="px-4 py-3"><span className="badge bg-light text-dark">{assignment.roleCode}</span></td>
                          <td className="px-4 py-3"><small>{getRoleName(assignment.roleCode)}</small></td>
                          <td className="px-4 py-3"><span className="badge bg-secondary">{assignment.centreCode}</span></td>
                          <td className="px-4 py-3"><small className="text-muted">{assignment.effectiveFrom ? new Date(assignment.effectiveFrom).toLocaleDateString() : '-'}</small></td>
                          <td className="px-4 py-3"><small className="text-muted">{assignment.effectiveTo ? new Date(assignment.effectiveTo).toLocaleDateString() : '-'}</small></td>
                          <td className="px-4 py-3">
                            {assignment.assignedScreens && assignment.assignedScreens.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {assignment.assignedScreens.map(screen => (
                                  <div key={screen.screenId} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span className="badge bg-light text-dark" style={{ fontSize: '0.75rem' }}>{screen.screenName}</span>
                                    {screen.accessType && screen.accessType.toUpperCase() === 'READ' && <span className="badge bg-info" style={{ fontSize: '0.65rem' }}>R</span>}
                                    {screen.accessType && screen.accessType.toUpperCase() === 'WRITE' && <span className="badge bg-warning" style={{ fontSize: '0.65rem' }}>W</span>}
                                    {screen.accessType && screen.accessType.toUpperCase() === 'ADMIN' && <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>A</span>}
                                    {screen.accessType && screen.accessType.toUpperCase() === 'ALL' && <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>A</span>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(assignment)}>
                              <Edit size={16} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => setShowDeleteConfirm(assignment)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center p-4" style={{ background: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
                  <div className="text-muted">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedAssignments.length)} of {sortedAssignments.length} records
                  </div>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className="page-item" style={{ opacity: currentPage === 1 ? 0.5 : 1 }}>
                        <button className="page-link" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</button>
                      </li>
                      <li className="page-item" style={{ opacity: currentPage === 1 ? 0.5 : 1 }}>
                        <button className="page-link" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Prev</button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i + 1} className="page-item">
                          <button className={`page-link ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                      <li className="page-item" style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}>
                        <button className="page-link" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</button>
                      </li>
                      <li className="page-item" style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}>
                        <button className="page-link" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3xl border-0 shadow-xl">
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} className="modal-header border-0 text-white rounded-top-3xl">
                <h5 className="modal-title fw-bold fs-5">
                  {modalMode === 'add' ? '➕ Assign Role to User' : '✏️ Update Role Assignment'}
                </h5>
                <button onClick={() => setShowModal(false)} className="btn-close btn-close-white"></button>
              </div>
              <div className="modal-body p-5" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">Login ID <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control rounded-2 px-2 py-2 ${validationErrors.loginId ? 'is-invalid' : ''}`}
                    placeholder="e.g., IS03651"
                    value={formData.loginId}
                    onChange={handleInputChange}
                    name="loginId"
                    disabled={modalMode === 'edit'}
                    style={{ border: '2px solid #e9ecef' }}
                  />
                  {validationErrors.loginId && <div className="invalid-feedback d-block">{validationErrors.loginId}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">Role <span className="text-danger">*</span></label>
                  {modalMode === 'edit' ? (
                    <div className="form-control rounded-2 px-2 py-2" style={{ border: '2px solid #e9ecef', background: '#f8f9fa' }}>
                      <strong>{formData.roleCode}</strong>
                    </div>
                  ) : (
                    <select
                      className={`form-select rounded-2 px-2 py-2 ${validationErrors.roleCode ? 'is-invalid' : ''}`}
                      value={formData.roleCode}
                      onChange={handleInputChange}
                      name="roleCode"
                      style={{ border: '2px solid #e9ecef' }}
                    >
                      <option value="">Select a role</option>
                      {roles.map(role => (
                        <option key={role.roleCode} value={role.roleCode}>
                          {role.roleDescription}
                        </option>
                      ))}
                    </select>
                  )}
                  {validationErrors.roleCode && <div className="invalid-feedback d-block">{validationErrors.roleCode}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">Centre Code <span className="text-danger">*</span></label>
                  {modalMode === 'edit' ? (
                    <div className="form-control rounded-2 px-2 py-2" style={{ border: '2px solid #e9ecef', background: '#f8f9fa' }}>
                      <strong>{formData.centreCode}</strong>
                    </div>
                  ) : (
                    <select
                      className={`form-select rounded-2 px-2 py-2 ${validationErrors.centreCode ? 'is-invalid' : ''}`}
                      value={formData.centreCode}
                      onChange={handleInputChange}
                      name="centreCode"
                      style={{ border: '2px solid #e9ecef' }}
                    >
                      <option value="">Select a centre</option>
                      {centres.map(centre => (
                        <option key={centre.centrecode} value={centre.centrecode}>
                          {centre.centrelongname} - {centre.centreshortname}
                        </option>
                      ))}
                    </select>
                  )}
                  {validationErrors.centreCode && <div className="invalid-feedback d-block">{validationErrors.centreCode}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-dark mb-2">Effective From</label>
                    <input
                      type="date"
                      className="form-control rounded-2 px-2 py-2"
                      value={formData.effectiveFrom}
                      onChange={handleInputChange}
                      name="effectiveFrom"
                      style={{ border: '2px solid #e9ecef' }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-dark mb-2">Effective To</label>
                    <input
                      type="date"
                      className="form-control rounded-2 px-2 py-2"
                      value={formData.effectiveTo}
                      onChange={handleInputChange}
                      name="effectiveTo"
                      style={{ border: '2px solid #e9ecef' }}
                    />
                  </div>
                </div>

                {/* Page/Screen Permissions Section */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark mb-3">📄 Assign Pages & Permissions</label>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: '2px solid #e9ecef', borderRadius: '1rem', padding: '1rem', background: '#f8f9fa' }}>
                    {screensList.length === 0 ? (
                      <p className="text-muted text-center">No pages available</p>
                    ) : (
                      screensList.map(screen => (
                        <div key={screen.screenId} className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                          <div>
                            <strong className="text-dark">{screen.screenName}</strong>
                            <br />
                            <small className="text-muted">{screen.screenId}</small>
                          </div>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: '140px', border: '2px solid #e9ecef' }}
                            value={screenAccess[screen.screenId] || 'NONE'}
                            onChange={(e) =>
                              setScreenAccess(prev => ({
                                ...prev,
                                [screen.screenId]: e.target.value
                              }))
                            }
                          >
                            <option value="NONE">No Access</option>
                            <option value="READ">Read Only</option>
                            <option value="WRITE">Read & Write</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <button className="btn btn-secondary btn-lg rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-lg rounded-pill px-4" onClick={handleSubmit} disabled={submitting} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                  {submitting ? <><Loader size={16} className="me-2" /> Saving...</> : (modalMode === 'add' ? 'Assign' : 'Update')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3xl border-0 shadow-xl">
              <div className="modal-body text-center p-5">
                <AlertCircle size={60} className="text-danger mx-auto mb-4" />
                <h5 className="fw-bold text-dark mb-2 fs-5">Revoke Role Assignment?</h5>
                <p className="text-muted">Are you sure you want to revoke the <strong>{showDeleteConfirm.roleCode}</strong> role from <strong>{showDeleteConfirm.loginId}</strong>?</p>
              </div>
              <div className="modal-footer border-0 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <button className="btn btn-secondary btn-lg rounded-pill px-4" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger btn-lg rounded-pill px-4" onClick={() => handleDelete(showDeleteConfirm.loginId, showDeleteConfirm.roleCode, showDeleteConfirm.centreCode)} disabled={submitting}>
                  {submitting ? <><Loader size={16} className="me-2" /> Revoking...</> : 'Revoke'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleAssignmentPage;

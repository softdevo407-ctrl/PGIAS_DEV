import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle, Search, ChevronUp, ChevronDown, Loader, Lock } from 'lucide-react';
import { createApiService } from '../../services/api';

const screensService = createApiService('/api/screens');
const roleService = createApiService('/api/rolerights');

const ScreensPage = () => {
  // RBAC States
  const [userRole, setUserRole] = useState(null);
  const [userCentre, setUserCentre] = useState(null);
  const [userCentreCode, setUserCentreCode] = useState(null);
  const [assignedScreens, setAssignedScreens] = useState([]);
  const [rbacLoading, setRbacLoading] = useState(true);
  
  // Original States
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    screenId: '',
    screenCategory: '',
    screenName: '',
    status: 'Active',
    fromDate: '',
    toDate: '',
    userId: '',
    centreCode: '',
    centreName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const itemsPerPage = 10;

  // Filter and Sort - RBAC FILTERED
  const rbacFilteredItems = useMemo(() => {
    // Filter items based on user role and centre
    if (!assignedScreens.length) return [];
    
    return items.filter(item => {
      // Check if screen is assigned to user's role
      const isScreenAssigned = assignedScreens.some(screen => 
        screen.screenId === item.screenId && 
        screen.screenCategory === item.screenCategory
      );
      
      // Check if centre matches or if screen is for all centres
      const isCentreMatch = !item.centreCode || item.centreCode === userCentreCode;
      
      return isScreenAssigned && isCentreMatch;
    });
  }, [items, assignedScreens, userCentreCode]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return rbacFilteredItems;
    return rbacFilteredItems.filter(item => 
      item.screenId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.screenCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.screenName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.centreName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rbacFilteredItems, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  // Initialize RBAC data
  useEffect(() => {
    const initializeRBAC = async () => {
      try {
        setRbacLoading(true);
        
        // Get user info from localStorage
        const loginId = localStorage.getItem('loginId');
        const userRoleFromStorage = localStorage.getItem('userRole');
        const centreCodeFromStorage = localStorage.getItem('centreCode');
        const centreNameFromStorage = localStorage.getItem('centreName');
        
        if (!loginId || !userRoleFromStorage) {
          setError('❌ User role or ID not found. Please log in again.');
          setRbacLoading(false);
          return;
        }
        
        setUserRole(userRoleFromStorage);
        setUserCentreCode(centreCodeFromStorage);
        setUserCentre(centreNameFromStorage);
        
        // Fetch assigned screens for user's role
        try {
          const response = await roleService.getAll();
          const roleScreens = Array.isArray(response) 
            ? response.filter(r => r.rolename?.toLowerCase() === userRoleFromStorage?.toLowerCase())
            : [];
          
          setAssignedScreens(roleScreens);
          console.log('✅ RBAC - Assigned Screens:', roleScreens);
        } catch (err) {
          console.warn('⚠️ Could not fetch role rights:', err);
          setAssignedScreens([]);
        }
        
        // Now fetch all screens
        await fetchAll();
      } catch (err) {
        console.error('RBAC Initialization Error:', err);
        setError('❌ Failed to initialize access control');
      } finally {
        setRbacLoading(false);
      }
    };
    
    initializeRBAC();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await screensService.getAll();
      setItems(Array.isArray(data) ? data : []);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load screens');
    } finally { setLoading(false); }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.screenId.trim()) errors.screenId = 'Screen ID is required';
    if (!form.screenCategory.trim()) errors.screenCategory = 'Category is required';
    if (!form.screenName.trim()) errors.screenName = 'Screen Name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAdd = () => { 
    setModalMode('add'); 
    setForm({ 
      screenId: '', 
      screenCategory: '', 
      screenName: '', 
      status: 'Active', 
      fromDate: '', 
      toDate: '', 
      userId: localStorage.getItem('loginId') || '',
      centreCode: userCentreCode || '',
      centreName: userCentre || ''
    }); 
    setFormErrors({});
    setError('');
    setShowModal(true); 
  };

  const openEdit = (item) => { 
    setModalMode('edit'); 
    setForm({ 
      screenId: item.screenId || '', 
      screenCategory: item.screenCategory || '', 
      screenName: item.screenName || '', 
      status: item.status || 'Active', 
      fromDate: item.fromDate || '', 
      toDate: item.toDate || '', 
      userId: item.userId || localStorage.getItem('loginId') || '', 
      centreCode: item.centreCode || userCentreCode || '',
      centreName: item.centreName || userCentre || ''
    }); 
    setFormErrors({});
    setError('');
    setShowModal(true); 
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setError('');
      if (modalMode === 'add') {
        await screensService.create(form);
        setSuccess('✓ Screen created successfully');
      } else {
        const response = await fetch(`${screensService.baseUrl}/${form.screenId}/${form.screenCategory}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error(response.statusText);
        setSuccess('✓ Screen updated successfully');
      }
      setShowModal(false);
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { 
      setError(e.message || 'Save failed'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (screenId, screenCategory) => {
    try { 
      setSubmitting(true);
      setError('');
      const response = await fetch(`${screensService.baseUrl}/${screenId}/${screenCategory}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(response.statusText);
      setSuccess('✓ Screen deleted successfully'); 
      setShowDeleteConfirm(null);
      fetchAll(); 
      setTimeout(() => setSuccess(''), 3000); 
    } catch(e){ 
      setError(e.message || 'Delete failed'); 
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }} className="py-4">
      <div className="container-fluid px-4">
        {/* RBAC Info Bar */}
        {rbacLoading ? (
          <div className="alert alert-info mb-4" style={{borderRadius: '10px', borderLeft: '4px solid #0066cc'}}>
            <Loader size={18} className="spinner-border me-2" style={{display: 'inline-block'}} />
            Loading access control...
          </div>
        ) : (
          <div className="alert alert-light mb-4" style={{borderRadius: '10px', borderLeft: '4px solid #28a745', background: 'linear-gradient(90deg, #f0f9ff 0%, #f0f8ff 100%)'}}>
            <div className="row">
              <div className="col-md-4">
                <strong>👤 Role:</strong> <span style={{color: '#0066cc', fontWeight: '600'}}>{userRole || 'Not assigned'}</span>
              </div>
              <div className="col-md-4">
                <strong>🏢 Centre Code:</strong> <span style={{color: '#28a745', fontWeight: '600'}}>{userCentreCode || 'All'}</span>
              </div>
              <div className="col-md-4">
                <strong>🏭 Centre Name:</strong> <span style={{color: '#6c757d', fontWeight: '600'}}>{userCentre || 'All Centres'}</span>
              </div>
            </div>
            {assignedScreens.length > 0 && (
              <div className="mt-3">
                <small style={{color: '#666'}}>
                  📊 <strong>{assignedScreens.length}</strong> screens assigned to your role
                </small>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="row mb-5">
          <div className="col-md-8">
            <h1 className="fw-bold text-dark mb-2" style={{ fontSize: '2.5rem' }}>
              <Lock size={32} className="me-2" style={{display: 'inline-block', color: '#0066cc'}} />
              Screens (RBAC Enabled)
            </h1>
            <p className="text-muted fs-5">Role-based screen and form management</p>
          </div>
          <div className="col-md-4 d-flex align-items-center justify-content-end">
            {userRole && userRole.toLowerCase() === 'admin' ? (
              <button 
                className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm"
                onClick={openAdd}
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
              >
                <Plus size={20} className="me-2" />
                Add Screen
              </button>
            ) : (
              <div className="alert alert-warning mb-0 py-2 px-3" style={{borderRadius: '8px'}}>
                <small>📖 <strong>View Only</strong> - Only admins can add screens</small>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center rounded-lg shadow-sm mb-4" role="alert">
            <AlertCircle size={20} className="me-3" />
            <div>
              <strong>Error!</strong> {error}
            </div>
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

        {/* Table Card */}
        <div className="card shadow-lg border-0 rounded-3xl overflow-hidden">
          <div className="card-body p-0">
            {/* Search Bar */}
            <div className="p-4 border-bottom" style={{ background: '#f8f9fa' }}>
              <div className="input-group">
                <span className="input-group-text rounded-start-2xl" style={{ border: '2px solid #e9ecef', background: 'white' }}>
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control rounded-end-2xl"
                  placeholder="Search by Screen ID, Category, or Name..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ border: '2px solid #e9ecef', borderLeft: 'none' }}
                />
              </div>
            </div>

            {/* Table */}
            {rbacLoading || loading ? (
              <div className="text-center py-5">
                <Loader className="spinner-border text-primary" size={40} />
                <p className="mt-3 text-muted">{rbacLoading ? 'Loading access control...' : 'Loading screens...'}</p>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-5">
                <Lock size={50} className="text-muted mb-3" style={{opacity: 0.5}} />
                <p className="text-muted fs-5">
                  {assignedScreens.length === 0 
                    ? '❌ No screens assigned to your role' 
                    : '📭 No screens found matching your criteria'}
                </p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <tr>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('screenId')}>
                          <div className="d-flex align-items-center">
                            Screen ID
                            {sortConfig.key === 'screenId' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('screenCategory')}>
                          <div className="d-flex align-items-center">
                            Category
                            {sortConfig.key === 'screenCategory' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('screenName')}>
                          <div className="d-flex align-items-center">
                            Screen Name
                            {sortConfig.key === 'screenName' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('centreCode')}>
                          <div className="d-flex align-items-center">
                            🏢 Centre Code
                            {sortConfig.key === 'centreCode' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('status')}>
                          <div className="d-flex align-items-center">
                            Status
                            {sortConfig.key === 'status' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td className="px-4 py-3">{item.screenId}</td>
                          <td className="px-4 py-3">{item.screenCategory}</td>
                          <td className="px-4 py-3">{item.screenName}</td>
                          <td className="px-4 py-3">
                            <span className="badge" style={{backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: '600'}}>
                              {item.centreCode || 'All'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge px-3 py-2 ${item.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {userRole && userRole.toLowerCase() === 'admin' ? (
                              <>
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(item)} title="Edit">
                                  <Edit size={16} />
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => setShowDeleteConfirm(item)} title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <span className="text-muted" title="View only">👁️ View Only</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center p-4" style={{ background: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
                  <div className="text-muted">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} records
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

      {/* Modal Form */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3xl border-0 shadow-xl">
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} className="modal-header border-0 text-white rounded-top-3xl">
                <h5 className="modal-title fw-bold fs-5">
                  {modalMode === 'add' ? '➕ Add New Screen' : '✏️ Edit Screen'}
                </h5>
                <button onClick={() => setShowModal(false)} className="btn-close btn-close-white"></button>
              </div>

              <div className="modal-body p-5" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">
                    Screen ID <span className="text-danger">*</span>
                  </label>
                  <input 
                    className={`form-control rounded-2 px-2 py-2 ${formErrors.screenId ? 'is-invalid' : ''}`}
                    placeholder="Enter screen ID"
                    value={form.screenId}
                    onChange={(e) => setForm({...form, screenId: e.target.value})}
                    disabled={modalMode === 'edit'}
                    style={{ border: '2px solid #e9ecef', transition: 'all 0.3s' }}
                  />
                  {formErrors.screenId && <div className="invalid-feedback d-block">{formErrors.screenId}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">
                    Category <span className="text-danger">*</span>
                  </label>
                  <input 
                    className={`form-control rounded-2 px-2 py-2 ${formErrors.screenCategory ? 'is-invalid' : ''}`}
                    placeholder="Enter category"
                    value={form.screenCategory}
                    onChange={(e) => setForm({...form, screenCategory: e.target.value})}
                    disabled={modalMode === 'edit'}
                    style={{ border: '2px solid #e9ecef', transition: 'all 0.3s' }}
                  />
                  {formErrors.screenCategory && <div className="invalid-feedback d-block">{formErrors.screenCategory}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">
                    Screen Name <span className="text-danger">*</span>
                  </label>
                  <input 
                    className={`form-control rounded-2 px-2 py-2 ${formErrors.screenName ? 'is-invalid' : ''}`}
                    placeholder="Enter screen name"
                    value={form.screenName}
                    onChange={(e) => setForm({...form, screenName: e.target.value})}
                    style={{ border: '2px solid #e9ecef', transition: 'all 0.3s' }}
                  />
                  {formErrors.screenName && <div className="invalid-feedback d-block">{formErrors.screenName}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">Status</label>
                  <select 
                    className="form-control rounded-2 px-2 py-2"
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    style={{ border: '2px solid #e9ecef' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-dark mb-2">🏢 Centre Code</label>
                    <input 
                      className="form-control rounded-2 px-2 py-2"
                      value={form.centreCode}
                      onChange={(e) => setForm({...form, centreCode: e.target.value})}
                      placeholder="e.g., 01, 02"
                      style={{ border: '2px solid #e9ecef' }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-dark mb-2">Centre Name</label>
                    <input 
                      className="form-control rounded-2 px-2 py-2"
                      value={form.centreName}
                      onChange={(e) => setForm({...form, centreName: e.target.value})}
                      placeholder="e.g., HQ, Region 1"
                      style={{ border: '2px solid #e9ecef' }}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-dark mb-2">From Date</label>
                    <input 
                      className="form-control rounded-2 px-2 py-2"
                      type="date"
                      value={form.fromDate}
                      onChange={(e) => setForm({...form, fromDate: e.target.value})}
                      style={{ border: '2px solid #e9ecef' }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-dark mb-2">To Date</label>
                    <input 
                      className="form-control rounded-2 px-2 py-2"
                      type="date"
                      value={form.toDate}
                      onChange={(e) => setForm({...form, toDate: e.target.value})}
                      style={{ border: '2px solid #e9ecef' }}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">👤 User ID</label>
                  <input 
                    className="form-control rounded-2 px-2 py-2"
                    value={form.userId}
                    readOnly
                    style={{ border: '2px solid #e9ecef', backgroundColor: '#f8f9fa' }}
                  />
                </div>
              </div>

              <div className="modal-footer border-0 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <button className="btn btn-secondary btn-lg rounded-pill px-4" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary btn-lg rounded-pill px-4"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                >
                  {submitting ? <><Loader size={16} className="me-2" /> Saving...</> : (modalMode === 'add' ? 'Create Screen' : 'Update Screen')}
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
                <div className="mb-4">
                  <AlertCircle size={60} className="text-danger mx-auto" />
                </div>
                <h5 className="fw-bold text-dark mb-2 fs-5">Delete Screen?</h5>
                <p className="text-muted">
                  Are you sure you want to delete <strong>{showDeleteConfirm.screenId}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <button className="btn btn-secondary btn-lg rounded-pill px-4" onClick={() => setShowDeleteConfirm(null)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-danger btn-lg rounded-pill px-4"
                  onClick={() => handleDelete(showDeleteConfirm.screenId, showDeleteConfirm.screenCategory)}
                  disabled={submitting}
                >
                  {submitting ? <><Loader size={16} className="me-2" /> Deleting...</> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreensPage;

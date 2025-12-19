import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertCircle, CheckCircle, XCircle, ChevronUp, ChevronDown, Loader } from 'lucide-react';
import { roleAPI } from '../services/api';

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    roleCode: '',
    roleDescription: '',
    fromDate: '',
    toDate: '',
    userId: '',
    regStatus: 'R'
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const itemsPerPage = 10;

  // Fetch all roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching roles from:', `${window.location.origin}/api/roles`);
      const data = await roleAPI.getAll();
      console.log('Roles fetched successfully:', data);
      setRoles(Array.isArray(data) ? data : []);
      if (!Array.isArray(data)) {
        console.warn('Expected array but got:', typeof data, data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.roleCode || formData.roleCode.trim() === '') {
      errors.roleCode = 'Role Code is required';
    } else if (formData.roleCode.length > 3) {
      errors.roleCode = 'Role Code must be 3 characters or less';
    }
    if (!formData.roleDescription || formData.roleDescription.trim() === '') {
      errors.roleDescription = 'Role Description is required';
    }
    if (!formData.fromDate) {
      errors.fromDate = 'From Date is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    setModalMode('add');
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      roleCode: '',
      roleDescription: '',
      fromDate: today,
      toDate: '',
      userId: '',
      regStatus: 'R'
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setModalMode('edit');
    setSelectedRole(role);
    setFormData({
      roleCode: role.roleCode || '',
      roleDescription: role.roleDescription || '',
      fromDate: role.fromDate || '',
      toDate: role.toDate || '',
      userId: role.userId || '',
      regStatus: role.regStatus || 'R'
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const handleDelete = async (roleCode) => {
    try {
      setSubmitting(true);
      setError('');
      await roleAPI.delete(roleCode);
      setSuccess('✓ Role deleted successfully');
      setShowDeleteConfirm(null);
      fetchRoles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      if (modalMode === 'add') {
        await roleAPI.create(formData);
        setSuccess('✓ Role created successfully');
      } else {
        await roleAPI.update(selectedRole.roleCode, formData);
        setSuccess('✓ Role updated successfully');
      }
      setShowModal(false);
      fetchRoles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const filteredRoles = roles.filter(role =>
    role.roleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.roleDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRoles = sortConfig.key ? [...filteredRoles].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (typeof aVal === 'string') {
      return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  }) : filteredRoles;

  const paginatedRoles = sortedRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedRoles.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }} className="py-4">
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="row mb-5">
          <div className="col-md-8">
            <h1 className="fw-bold text-dark mb-2" style={{ fontSize: '2.5rem' }}>Role Management</h1>
            <p className="text-muted fs-5">Define and manage system roles</p>
          </div>
          <div className="col-md-4 d-flex align-items-center justify-content-end">
            <button
              className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm"
              onClick={handleAdd}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
            >
              <Plus size={20} className="me-2" />
              Add Role
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
                  placeholder="Search by role code or description..."
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
                <p className="mt-3 text-muted">Loading roles...</p>
              </div>
            ) : paginatedRoles.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted fs-5">{searchTerm ? 'No roles found' : 'No roles yet. Create one to get started.'}</p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <tr>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('roleCode')}>
                          <div className="d-flex align-items-center">
                            Code
                            {sortConfig.key === 'roleCode' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('roleDescription')}>
                          <div className="d-flex align-items-center">
                            Description
                            {sortConfig.key === 'roleDescription' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('fromDate')}>
                          <div className="d-flex align-items-center">
                            From Date
                            {sortConfig.key === 'fromDate' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRoles.map((role, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td className="px-4 py-3"><strong>{role.roleCode}</strong></td>
                          <td className="px-4 py-3">{role.roleDescription}</td>
                          <td className="px-4 py-3">{new Date(role.fromDate).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-3 text-center">
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(role)}>
                              <Edit size={16} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => setShowDeleteConfirm(role)}>
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedRoles.length)} of {sortedRoles.length} records
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3xl border-0 shadow-xl">
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} className="modal-header border-0 text-white rounded-top-3xl">
                <h5 className="modal-title fw-bold fs-5">
                  {modalMode === 'add' ? '➕ Add New Role' : '✏️ Edit Role'}
                </h5>
                <button onClick={() => setShowModal(false)} className="btn-close btn-close-white"></button>
              </div>
              <div className="modal-body p-5">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">
                    Role Code <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control rounded-2 px-2 py-2 ${validationErrors.roleCode ? 'is-invalid' : ''}`}
                    placeholder="e.g., ADM, APR (Max 3 chars)"
                    value={formData.roleCode}
                    onChange={handleInputChange}
                    name="roleCode"
                    maxLength="3"
                    style={{ border: '2px solid #e9ecef' }}
                  />
                  {validationErrors.roleCode && <div className="invalid-feedback d-block">{validationErrors.roleCode}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">
                    Role Description <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control rounded-2 px-2 py-2 ${validationErrors.roleDescription ? 'is-invalid' : ''}`}
                    placeholder="e.g., Administrator, Approver"
                    value={formData.roleDescription}
                    onChange={handleInputChange}
                    name="roleDescription"
                    style={{ border: '2px solid #e9ecef' }}
                  />
                  {validationErrors.roleDescription && <div className="invalid-feedback d-block">{validationErrors.roleDescription}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">
                    From Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-control rounded-2 px-2 py-2 ${validationErrors.fromDate ? 'is-invalid' : ''}`}
                    value={formData.fromDate}
                    onChange={handleInputChange}
                    name="fromDate"
                    style={{ border: '2px solid #e9ecef' }}
                  />
                  {validationErrors.fromDate && <div className="invalid-feedback d-block">{validationErrors.fromDate}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    className="form-control rounded-2 px-2 py-2"
                    value={formData.toDate}
                    onChange={handleInputChange}
                    name="toDate"
                    style={{ border: '2px solid #e9ecef' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-2 px-2 py-2"
                    placeholder="Enter user ID"
                    value={formData.userId}
                    onChange={handleInputChange}
                    name="userId"
                    style={{ border: '2px solid #e9ecef' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">
                    Status
                  </label>
                  <select
                    className="form-control rounded-2 px-2 py-2"
                    value={formData.regStatus}
                    onChange={handleInputChange}
                    name="regStatus"
                    style={{ border: '2px solid #e9ecef' }}
                  >
                    <option value="R">Active (R)</option>
                    <option value="I">Inactive (I)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer border-0 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <button className="btn btn-secondary btn-lg rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-lg rounded-pill px-4" onClick={handleSubmit} disabled={submitting} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                  {submitting ? <><Loader size={16} className="me-2" /> Saving...</> : (modalMode === 'add' ? 'Create' : 'Update')}
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
                <h5 className="fw-bold text-dark mb-2 fs-5">Delete Role?</h5>
                <p className="text-muted">Are you sure you want to delete <strong>{showDeleteConfirm.roleCode}</strong> ({showDeleteConfirm.roleDescription})?</p>
              </div>
              <div className="modal-footer border-0 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <button className="btn btn-secondary btn-lg rounded-pill px-4" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger btn-lg rounded-pill px-4" onClick={() => handleDelete(showDeleteConfirm.roleCode)} disabled={submitting}>
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

export default RoleManagementPage;

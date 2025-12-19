import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertCircle, CheckCircle, ChevronUp, ChevronDown, Loader, Eye, Lock, Edit3 } from 'lucide-react';
import { userRoleAPI, roleAPI, centresAPI, screensAPI } from '../services/api';

const RolePageAssignmentPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [screensList, setScreensList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [screenAccess, setScreenAccess] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  // Fetch all assignments and roles on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [assignData, rolesData, screensData] = await Promise.all([
        userRoleAPI.getAll(),
        roleAPI.getAll(),
        screensAPI.getAll()
      ]);
      setAssignments(Array.isArray(assignData) ? assignData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setScreensList(Array.isArray(screensData) ? screensData : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPages = async (assignment) => {
    try {
      setSelectedAssignment(assignment);
      // Fetch the screens assigned to this user-role
      const assignedScreens = await userRoleAPI.getScreensByUserRole(
        assignment.loginId,
        assignment.roleCode,
        assignment.centreCode
      );
      
      const map = {};
      if (Array.isArray(assignedScreens)) {
        assignedScreens.forEach(s => {
          map[s.screenCode] = {
            name: s.screenName,
            access: s.accessType
          };
        });
      }
      setScreenAccess(map);
      setModalMode('view');
      setShowModal(true);
    } catch (err) {
      setError('Failed to load page assignments: ' + (err.message || err));
    }
  };

  const handleEditPages = async (assignment) => {
    try {
      setSelectedAssignment(assignment);
      // Fetch existing assignments
      const assignedScreens = await userRoleAPI.getScreensByUserRole(
        assignment.loginId,
        assignment.roleCode,
        assignment.centreCode
      );
      
      const map = {};
      if (Array.isArray(assignedScreens)) {
        assignedScreens.forEach(s => {
          map[s.screenCode] = s.accessType;
        });
      }
      setScreenAccess(map);
      setModalMode('edit');
      setShowModal(true);
    } catch (err) {
      setError('Failed to load page assignments: ' + (err.message || err));
    }
  };

  const handleSavePages = async () => {
    try {
      setSubmitting(true);
      setError('');

      // Build screens payload
      const screensPayload = Object.entries(screenAccess)
        .filter(([code, access]) => access && access !== 'NONE')
        .map(([code, access]) => {
          const screen = screensList.find(s => s.screenId === code);
          return {
            screenCode: code,
            screenName: screen?.screenName || code,
            accessType: access,
            status: 'ACTIVE',
            fromDate: new Date().toISOString().slice(0, 10)
          };
        });

      // For now, we can remove all old and add new; or just update existing ones
      // This is a simple approach - remove all and re-add
      try {
        // Delete existing assignments (one by one)
        const existing = await userRoleAPI.getScreensByUserRole(
          selectedAssignment.loginId,
          selectedAssignment.roleCode,
          selectedAssignment.centreCode
        );
        
        for (const screen of existing) {
          try {
            await userRoleAPI.deleteScreenAssignment(
              selectedAssignment.loginId,
              selectedAssignment.roleCode,
              selectedAssignment.centreCode,
              screen.screenCode
            );
          } catch (e) {
            console.warn('Could not delete screen:', e);
          }
        }
      } catch (e) {
        console.warn('Could not fetch existing assignments for deletion');
      }

      // Assign new ones
      for (const screen of screensPayload) {
        try {
          await userRoleAPI.assignScreen(
            selectedAssignment.loginId,
            selectedAssignment.roleCode,
            selectedAssignment.centreCode,
            screen
          );
        } catch (e) {
          console.warn('Could not assign screen:', e);
        }
      }

      setSuccess('✓ Page assignments updated successfully');
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save page assignments');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    (assignment.loginId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.roleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.centreCode?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filterRole || assignment.roleCode === filterRole)
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

  const getAccessBadge = (access) => {
    const styles = {
      'READ': { bg: 'bg-info', icon: Eye },
      'WRITE': { bg: 'bg-warning', icon: Edit3 },
      'ADMIN': { bg: 'bg-success', icon: Lock },
      'ALL': { bg: 'bg-danger', icon: Lock }
    };
    const style = styles[access] || { bg: 'bg-secondary', icon: Lock };
    return <span className={`badge ${style.bg}`}>{access}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }} className="py-4">
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="row mb-5">
          <div className="col-md-8">
            <h1 className="fw-bold text-dark mb-2" style={{ fontSize: '2.5rem' }}>📄 Role Page Assignments</h1>
            <p className="text-muted fs-5">View and manage page access for each role</p>
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
            {/* Filters */}
            <div className="p-4 border-bottom" style={{ background: '#f8f9fa' }}>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text rounded-start-2xl" style={{ border: '2px solid #e9ecef', background: 'white' }}>
                      <Search size={18} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control rounded-end-2xl"
                      placeholder="Search by login ID, role or centre..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      style={{ border: '2px solid #e9ecef', borderLeft: 'none' }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <select
                    className="form-select form-control-lg rounded-2xl px-4 py-3"
                    value={filterRole}
                    onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
                    style={{ border: '2px solid #e9ecef' }}
                  >
                    <option value="">All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="text-center py-5">
                <Loader className="spinner-border text-primary" size={40} />
                <p className="mt-3 text-muted">Loading assignments...</p>
              </div>
            ) : paginatedAssignments.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted fs-5">No assignments found</p>
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
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('centreCode')}>
                          <div className="d-flex align-items-center">
                            Centre
                            {sortConfig.key === 'centreCode' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark">Pages Assigned</th>
                        <th className="px-4 py-3 fw-bold text-dark text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAssignments.map((assignment, idx) => {
                        const assignedPages = Object.keys(screenAccess).filter(code => screenAccess[code] && screenAccess[code] !== 'NONE');
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td className="px-4 py-3"><span className="fw-semibold">{assignment.loginId}</span></td>
                            <td className="px-4 py-3"><span className="badge bg-light text-dark">{assignment.roleCode}</span></td>
                            <td className="px-4 py-3"><span className="badge bg-secondary">{assignment.centreCode}</span></td>
                            <td className="px-4 py-3">
                              <small className="text-muted">Click "View" or "Edit" to see assigned pages</small>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                className="btn btn-sm btn-outline-info me-2" 
                                onClick={() => handleViewPages(assignment)}
                                title="View assigned pages"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-warning" 
                                onClick={() => handleEditPages(assignment)}
                                title="Edit page assignments"
                              >
                                <Edit size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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

      {/* View/Edit Modal */}
      {showModal && selectedAssignment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3xl border-0 shadow-xl">
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} className="modal-header border-0 text-white rounded-top-3xl">
                <h5 className="modal-title fw-bold fs-5">
                  {modalMode === 'view' ? '👁️ View Page Assignments' : '✏️ Edit Page Assignments'}
                </h5>
                <button onClick={() => setShowModal(false)} className="btn-close btn-close-white"></button>
              </div>
              <div className="modal-body p-5" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="mb-4">
                  <strong className="d-block text-dark mb-2">User:</strong>
                  <span className="badge bg-light text-dark">{selectedAssignment.loginId}</span>
                </div>
                <div className="mb-4">
                  <strong className="d-block text-dark mb-2">Role:</strong>
                  <span className="badge bg-light text-dark">{selectedAssignment.roleCode}</span>
                </div>
                <div className="mb-4">
                  <strong className="d-block text-dark mb-2">Centre:</strong>
                  <span className="badge bg-secondary">{selectedAssignment.centreCode}</span>
                </div>

                <hr />

                <div>
                  <strong className="d-block text-dark mb-3">📄 Assigned Pages</strong>
                  <div style={{ border: '2px solid #e9ecef', borderRadius: '1rem', padding: '1rem', background: '#f8f9fa' }}>
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
                          {modalMode === 'view' ? (
                            <div>
                              {screenAccess[screen.screenId] && screenAccess[screen.screenId] !== 'NONE' ? (
                                getAccessBadge(screenAccess[screen.screenId])
                              ) : (
                                <span className="badge bg-light text-dark">No Access</span>
                              )}
                            </div>
                          ) : (
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
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <button className="btn btn-secondary btn-lg rounded-pill px-4" onClick={() => setShowModal(false)}>Close</button>
                {modalMode === 'edit' && (
                  <button className="btn btn-primary btn-lg rounded-pill px-4" onClick={handleSavePages} disabled={submitting} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                    {submitting ? <><Loader size={16} className="me-2" /> Saving...</> : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePageAssignmentPage;

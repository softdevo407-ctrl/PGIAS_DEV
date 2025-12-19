import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle, Search, ChevronUp, ChevronDown, Loader } from 'lucide-react';
import { createApiService } from '../../services/api';

const centreTypeService = createApiService('/api/centretypes');

const CentreTypePage = () => {
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
    centretypecode: '',
    centretypedescription: '',
    centretypeshortdescription: '',
    fromdate: '',
    todate: '',
    userid: '',
    regstatus: 'R',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return items;
    return items.filter(item => 
      item.centretypecode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.centretypedescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.centretypeshortdescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

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

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await centreTypeService.getAll();
      setItems(Array.isArray(data) ? data : []);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load centre types');
    } finally { setLoading(false); }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.centretypecode.trim()) errors.centretypecode = 'Centre Type Code is required';
    if (!form.centretypedescription.trim()) errors.centretypedescription = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAdd = () => { 
    setModalMode('add'); 
    setForm({ 
      centretypecode: '', 
      centretypedescription: '', 
      centretypeshortdescription: '', 
      fromdate: '', 
      todate: '', 
      userid: '', 
      regstatus: 'R' 
    }); 
    setFormErrors({});
    setError('');
    setShowModal(true); 
  };

  const openEdit = (item) => { 
    setModalMode('edit'); 
    setForm({ 
      centretypecode: item.centretypecode || '', 
      centretypedescription: item.centretypedescription || '', 
      centretypeshortdescription: item.centretypeshortdescription || '', 
      fromdate: item.fromdate || '', 
      todate: item.todate || '', 
      userid: item.userid || '', 
      regstatus: item.regstatus || 'R' 
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
        await centreTypeService.create(form);
        setSuccess('✓ Centre Type created successfully');
      } else {
        await centreTypeService.update(form.centretypecode, form);
        setSuccess('✓ Centre Type updated successfully');
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

  const handleDelete = async (centretypecode) => {
    try { 
      setSubmitting(true);
      setError('');
      await centreTypeService.delete(centretypecode); 
      setSuccess('✓ Centre Type deleted successfully'); 
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
        <div className="row mb-5">
          <div className="col-md-8">
            <h1 className="fw-bold text-dark mb-2" style={{ fontSize: '2.5rem' }}>Centre Types</h1>
            <p className="text-muted fs-5">Manage centre types and classifications</p>
          </div>
          <div className="col-md-4 d-flex align-items-center justify-content-end">
            <button 
              className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm"
              onClick={openAdd}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
            >
              <Plus size={20} className="me-2" />
              Add Centre Type
            </button>
          </div>
        </div>

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

        <div className="card shadow-lg border-0 rounded-3xl overflow-hidden">
          <div className="card-body p-0">
            <div className="p-4 border-bottom" style={{ background: '#f8f9fa' }}>
              <div className="input-group">
                <span className="input-group-text rounded-start-2xl" style={{ border: '2px solid #e9ecef', background: 'white' }}>
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control rounded-end-2xl"
                  placeholder="Search by Code or Description..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ border: '2px solid #e9ecef', borderLeft: 'none' }}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Loader className="spinner-border text-primary" size={40} />
                <p className="mt-3 text-muted">Loading centre types...</p>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted fs-5">No centre types found</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <tr>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('centretypecode')}>
                          <div className="d-flex align-items-center">
                            Code
                            {sortConfig.key === 'centretypecode' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('centretypedescription')}>
                          <div className="d-flex align-items-center">
                            Description
                            {sortConfig.key === 'centretypedescription' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('centretypeshortdescription')}>
                          <div className="d-flex align-items-center">
                            Short Description
                            {sortConfig.key === 'centretypeshortdescription' && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('fromdate')}>
                          <div className="d-flex align-items-center">
                            From Date
                            {sortConfig.key === 'fromdate' && (
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
                          <td className="px-4 py-3"><strong>{item.centretypecode}</strong></td>
                          <td className="px-4 py-3">{item.centretypedescription}</td>
                          <td className="px-4 py-3"><span className="badge bg-light text-dark">{item.centretypeshortdescription}</span></td>
                          <td className="px-4 py-3"><small className="text-muted">{item.fromdate ? new Date(item.fromdate).toLocaleDateString() : '-'}</small></td>
                          <td className="px-4 py-3 text-center">
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(item)}>
                              <Edit size={16} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => setShowDeleteConfirm(item)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3xl border-0 shadow-xl">
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} className="modal-header border-0 text-white rounded-top-3xl">
                <h5 className="modal-title fw-bold fs-5">
                  {modalMode === 'add' ? '➕ Add New Centre Type' : '✏️ Edit Centre Type'}
                </h5>
                <button onClick={() => setShowModal(false)} className="btn-close btn-close-white"></button>
              </div>

              <div className="modal-body p-5" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">Code <span className="text-danger">*</span></label>
                  <input className={`form-control rounded-2 px-2 py-2 ${formErrors.centretypecode ? 'is-invalid' : ''}`} placeholder="Enter code (e.g., ISRO)" value={form.centretypecode} onChange={(e) => setForm({...form, centretypecode: e.target.value})} disabled={modalMode === 'edit'} style={{ border: '2px solid #e9ecef' }} />
                  {formErrors.centretypecode && <div className="invalid-feedback d-block">{formErrors.centretypecode}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">Description <span className="text-danger">*</span></label>
                  <input className={`form-control rounded-2 px-2 py-2 ${formErrors.centretypedescription ? 'is-invalid' : ''}`} placeholder="Enter full description" value={form.centretypedescription} onChange={(e) => setForm({...form, centretypedescription: e.target.value})} style={{ border: '2px solid #e9ecef' }} />
                  {formErrors.centretypedescription && <div className="invalid-feedback d-block">{formErrors.centretypedescription}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">Short Description</label>
                  <input className="form-control rounded-2 px-2 py-2" placeholder="Enter short description" value={form.centretypeshortdescription} onChange={(e) => setForm({...form, centretypeshortdescription: e.target.value})} style={{ border: '2px solid #e9ecef' }} />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-dark mb-2">From Date</label>
                    <input className="form-control rounded-2 px-2 py-2" type="date" value={form.fromdate} onChange={(e) => setForm({...form, fromdate: e.target.value})} style={{ border: '2px solid #e9ecef' }} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-dark mb-2">To Date</label>
                    <input className="form-control rounded-2 px-2 py-2" type="date" value={form.todate} onChange={(e) => setForm({...form, todate: e.target.value})} style={{ border: '2px solid #e9ecef' }} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-dark mb-2">Status</label>
                    <select className="form-control rounded-2 px-2 py-2" value={form.regstatus} onChange={(e) => setForm({...form, regstatus: e.target.value})} style={{ border: '2px solid #e9ecef' }}>
                      <option value="R">Active</option>
                      <option value="I">Inactive</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-dark mb-2">User ID</label>
                    <input className="form-control rounded-2 px-2 py-2" value={form.userid} readOnly style={{ border: '2px solid #e9ecef', backgroundColor: '#f8f9fa' }} />
                  </div>
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

      {showDeleteConfirm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3xl border-0 shadow-xl">
              <div className="modal-body text-center p-5">
                <AlertCircle size={60} className="text-danger mx-auto mb-4" />
                <h5 className="fw-bold text-dark mb-2 fs-5">Delete Centre Type?</h5>
                <p className="text-muted">Are you sure you want to delete <strong>{showDeleteConfirm.centretypecode}</strong>?</p>
              </div>
              <div className="modal-footer border-0 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <button className="btn btn-secondary btn-lg rounded-pill px-4" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger btn-lg rounded-pill px-4" onClick={() => handleDelete(showDeleteConfirm.centretypecode)} disabled={submitting}>
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

export default CentreTypePage;

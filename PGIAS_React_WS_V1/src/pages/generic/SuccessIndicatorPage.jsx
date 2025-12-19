import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle, Search, ChevronUp, ChevronDown, Loader } from 'lucide-react';
import { createApiService } from '../../services/api';

const successIndicatorService = createApiService('/api/successindicator');

const SuccessIndicatorPage = () => {
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
    objectivecode: '', successindicatorcode: '', successindicatordescription: '', defaultorfixed: 'Default', unit: '', weightperunit: '', targetcriteriavalueexcellent: '', targetcriteriavalueverygood: '', targetcriteriavaluegood: '', targetcriteriavaluefair: '', targetcriteriavaluepoor: '', status: 'Active', fromdate: '', todate: '', userid: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return items;
    return items.filter(item => 
      item.successindicatorcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.successindicatordescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.objectivecode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key]; const bVal = b[sortConfig.key];
      if (typeof aVal === 'string') return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
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
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    setCurrentPage(1);
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await successIndicatorService.getAll();
      setItems(Array.isArray(data) ? data : []);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load success indicators');
    } finally { setLoading(false); }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.successindicatorcode.trim()) errors.successindicatorcode = 'Code is required';
    if (!form.successindicatordescription.trim()) errors.successindicatordescription = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAdd = () => { 
    setModalMode('add'); 
    setForm({ objectivecode: '', successindicatorcode: '', successindicatordescription: '', defaultorfixed: 'Default', unit: '', weightperunit: '', targetcriteriavalueexcellent: '', targetcriteriavalueverygood: '', targetcriteriavaluegood: '', targetcriteriavaluefair: '', targetcriteriavaluepoor: '', status: 'Active', fromdate: '', todate: '', userid: '' }); 
    setFormErrors({});
    setError('');
    setShowModal(true); 
  };

  const openEdit = (item) => { 
    setModalMode('edit'); 
    setForm({ objectivecode: item.objectivecode || '', successindicatorcode: item.successindicatorcode || '', successindicatordescription: item.successindicatordescription || '', defaultorfixed: item.defaultorfixed || 'Default', unit: item.unit || '', weightperunit: item.weightperunit || '', targetcriteriavalueexcellent: item.targetcriteriavalueexcellent || '', targetcriteriavalueverygood: item.targetcriteriavalueverygood || '', targetcriteriavaluegood: item.targetcriteriavaluegood || '', targetcriteriavaluefair: item.targetcriteriavaluefair || '', targetcriteriavaluepoor: item.targetcriteriavaluepoor || '', status: item.status || 'Active', fromdate: item.fromdate || '', todate: item.todate || '', userid: item.userid || '' }); 
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
        await successIndicatorService.create(form);
        setSuccess('✓ Success Indicator created successfully');
      } else {
        await successIndicatorService.update(form.successindicatorcode, form);
        setSuccess('✓ Success Indicator updated successfully');
      }
      setShowModal(false);
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.message || 'Save failed'); } 
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { 
      setSubmitting(true);
      setError('');
      await successIndicatorService.delete(id); 
      setSuccess('✓ Success Indicator deleted successfully'); 
      setShowDeleteConfirm(null);
      fetchAll(); 
      setTimeout(() => setSuccess(''), 3000); 
    } catch(e){ setError(e.message || 'Delete failed'); } 
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }} className="py-4">
      <div className="container-fluid px-4">
        <div className="row mb-5">
          <div className="col-md-8"><h1 className="fw-bold text-dark mb-2" style={{ fontSize: '2.5rem' }}>Success Indicators</h1><p className="text-muted fs-5">Manage success indicators</p></div>
          <div className="col-md-4 d-flex align-items-center justify-content-end"><button className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm" onClick={openAdd} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}><Plus size={20} className="me-2" />Add Indicator</button></div>
        </div>

        {error && <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center rounded-lg shadow-sm mb-4" role="alert"><AlertCircle size={20} className="me-3" /><div><strong>Error!</strong> {error}</div><button type="button" className="btn-close" onClick={() => setError('')}></button></div>}
        {success && <div className="alert alert-success alert-dismissible fade show d-flex align-items-center rounded-lg shadow-sm mb-4" role="alert"><CheckCircle size={20} className="me-3" /><div>{success}</div><button type="button" className="btn-close" onClick={() => setSuccess('')}></button></div>}

        <div className="card shadow-lg border-0 rounded-3xl overflow-hidden">
          <div className="card-body p-0">
            <div className="p-4 border-bottom" style={{ background: '#f8f9fa' }}>
              <div className="input-group">
                <span className="input-group-text rounded-start-2xl" style={{ border: '2px solid #e9ecef', background: 'white' }}><Search size={18} className="text-muted" /></span>
                <input type="text" className="form-control rounded-end-2xl" placeholder="Search by Code, Description, or Objective..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ border: '2px solid #e9ecef', borderLeft: 'none' }} />
              </div>
            </div>

            {loading ? <div className="text-center py-5"><Loader className="spinner-border text-primary" size={40} /><p className="mt-3 text-muted">Loading indicators...</p></div> : paginatedData.length === 0 ? <div className="text-center py-5"><p className="text-muted fs-5">No indicators found</p></div> : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <tr>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('successindicatorcode')}><div className="d-flex align-items-center">Code{sortConfig.key === 'successindicatorcode' && (sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />)}</div></th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('successindicatordescription')}><div className="d-flex align-items-center">Description{sortConfig.key === 'successindicatordescription' && (sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />)}</div></th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('objectivecode')}><div className="d-flex align-items-center">Objective{sortConfig.key === 'objectivecode' && (sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />)}</div></th>
                        <th className="px-4 py-3 fw-bold text-dark cursor-pointer" onClick={() => handleSort('status')}><div className="d-flex align-items-center">Status{sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ms-2 text-primary" /> : <ChevronDown size={16} className="ms-2 text-primary" />)}</div></th>
                        <th className="px-4 py-3 fw-bold text-dark text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td className="px-4 py-3">{item.successindicatorcode}</td>
                          <td className="px-4 py-3">{item.successindicatordescription}</td>
                          <td className="px-4 py-3">{item.objectivecode}</td>
                          <td className="px-4 py-3"><span className={`badge px-3 py-2 ${item.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{item.status}</span></td>
                          <td className="px-4 py-3 text-center">
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(item)}><Edit size={16} /></button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => setShowDeleteConfirm(item)}><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center p-4" style={{ background: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
                  <div className="text-muted">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} records</div>
                  <nav><ul className="pagination mb-0">
                    <li className="page-item" style={{ opacity: currentPage === 1 ? 0.5 : 1 }}><button className="page-link" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</button></li>
                    <li className="page-item" style={{ opacity: currentPage === 1 ? 0.5 : 1 }}><button className="page-link" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Prev</button></li>
                    {[...Array(totalPages)].map((_, i) => (<li key={i + 1} className="page-item"><button className={`page-link ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button></li>)).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                    <li className="page-item" style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}><button className="page-link" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</button></li>
                    <li className="page-item" style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}><button className="page-link" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</button></li>
                  </ul></nav>
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
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} className="modal-header border-0 text-white"><h5 className="modal-title fw-bold">{modalMode === 'add' ? '➕ Add Indicator' : '✏️ Edit Indicator'}</h5><button onClick={() => setShowModal(false)} className="btn-close btn-close-white"></button></div>
              <div className="modal-body p-5" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="mb-3"><label className="form-label fw-bold mb-2">Code <span className="text-danger">*</span></label><input className={`form-control rounded-2 px-2 py-2 ${formErrors.successindicatorcode ? 'is-invalid' : ''}`} value={form.successindicatorcode} onChange={(e) => setForm({...form, successindicatorcode: e.target.value})} disabled={modalMode === 'edit'} style={{ border: '2px solid #e9ecef' }} />{formErrors.successindicatorcode && <div className="invalid-feedback d-block">{formErrors.successindicatorcode}</div>}</div>
                <div className="mb-3"><label className="form-label fw-bold mb-2">Objective Code</label><input className="form-control rounded-2 px-2 py-2" value={form.objectivecode} onChange={(e) => setForm({...form, objectivecode: e.target.value})} style={{ border: '2px solid #e9ecef' }} /></div>
                <div className="mb-3"><label className="form-label fw-bold mb-2">Description <span className="text-danger">*</span></label><textarea className={`form-control rounded-2 px-2 py-2 ${formErrors.successindicatordescription ? 'is-invalid' : ''}`} rows="3" value={form.successindicatordescription} onChange={(e) => setForm({...form, successindicatordescription: e.target.value})} style={{ border: '2px solid #e9ecef' }} />{formErrors.successindicatordescription && <div className="invalid-feedback d-block">{formErrors.successindicatordescription}</div>}</div>
                <div className="row"><div className="col-md-6 mb-3"><label className="form-label fw-bold mb-2">Default/Fixed</label><select className="form-control rounded-2 px-2 py-2" value={form.defaultorfixed} onChange={(e) => setForm({...form, defaultorfixed: e.target.value})} style={{ border: '2px solid #e9ecef' }}><option value="Default">Default</option><option value="Fixed">Fixed</option></select></div><div className="col-md-6 mb-3"><label className="form-label fw-bold mb-2">Status</label><select className="form-control rounded-2 px-2 py-2" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} style={{ border: '2px solid #e9ecef' }}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div></div>
                <fieldset className="border p-3 mb-3 rounded"><legend className="w-auto px-2 fw-bold">Target Criteria Values</legend>
                  <div className="row"><div className="col-md-6 mb-3"><label className="form-label fw-bold mb-2">Excellent</label><input className="form-control rounded-2 px-2 py-2" type="number" step="0.01" value={form.targetcriteriavalueexcellent} onChange={(e) => setForm({...form, targetcriteriavalueexcellent: e.target.value})} style={{ border: '2px solid #e9ecef' }} /></div><div className="col-md-6 mb-3"><label className="form-label fw-bold mb-2">Very Good</label><input className="form-control rounded-2 px-2 py-2" type="number" step="0.01" value={form.targetcriteriavalueverygood} onChange={(e) => setForm({...form, targetcriteriavalueverygood: e.target.value})} style={{ border: '2px solid #e9ecef' }} /></div></div>
                  <div className="row"><div className="col-md-6 mb-3"><label className="form-label fw-bold mb-2">Good</label><input className="form-control rounded-2 px-2 py-2" type="number" step="0.01" value={form.targetcriteriavaluegood} onChange={(e) => setForm({...form, targetcriteriavaluegood: e.target.value})} style={{ border: '2px solid #e9ecef' }} /></div><div className="col-md-6 mb-3"><label className="form-label fw-bold mb-2">Fair</label><input className="form-control rounded-2 px-2 py-2" type="number" step="0.01" value={form.targetcriteriavaluefair} onChange={(e) => setForm({...form, targetcriteriavaluefair: e.target.value})} style={{ border: '2px solid #e9ecef' }} /></div></div>
                  <div className="row"><div className="col-md-6 mb-3"><label className="form-label fw-bold mb-2">Poor</label><input className="form-control rounded-2 px-2 py-2" type="number" step="0.01" value={form.targetcriteriavaluepoor} onChange={(e) => setForm({...form, targetcriteriavaluepoor: e.target.value})} style={{ border: '2px solid #e9ecef' }} /></div></div>
                </fieldset>
                <div className="row"><div className="col-md-6 mb-3"><label className="form-label fw-bold mb-2">From Date</label><input className="form-control rounded-2 px-2 py-2" type="date" value={form.fromdate} onChange={(e) => setForm({...form, fromdate: e.target.value})} style={{ border: '2px solid #e9ecef' }} /></div><div className="col-md-6 mb-3"><label className="form-label fw-bold mb-2">To Date</label><input className="form-control rounded-2 px-2 py-2" type="date" value={form.todate} onChange={(e) => setForm({...form, todate: e.target.value})} style={{ border: '2px solid #e9ecef' }} /></div></div>
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
              <div className="modal-body text-center p-5"><AlertCircle size={60} className="text-danger mx-auto mb-4" /><h5 className="fw-bold text-dark mb-2">Delete Indicator?</h5><p className="text-muted">Are you sure you want to delete <strong>{showDeleteConfirm.successindicatorcode}</strong>?</p></div>
              <div className="modal-footer border-0 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <button className="btn btn-secondary btn-lg rounded-pill px-4" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger btn-lg rounded-pill px-4" onClick={() => handleDelete(showDeleteConfirm.successindicatorcode)} disabled={submitting}>
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

export default SuccessIndicatorPage;

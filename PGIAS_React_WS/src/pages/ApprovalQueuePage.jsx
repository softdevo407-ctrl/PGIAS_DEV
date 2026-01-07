import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';

// Helper function to format date as DD-MM-YYYY
const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return '-';
  try {
    // Handle YYYY-MM-DD format
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateString || '-';
  }
};

const ApprovalQueuePage = () => {
  // SweetAlert notification helper
  const showAlert = useCallback((message, type = 'info', title = '') => {
    const config = {
      title: title || (type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : type === 'warning' ? 'Warning!' : 'Info'),
      text: message,
      icon: type,
      confirmButtonColor: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#0066cc',
      confirmButtonText: 'OK',
      toast: false,
      position: 'center',
      showConfirmButton: true,
      allowOutsideClick: true,
      allowEscapeKey: true
    };
    Swal.fire(config);
  }, []);

  // SweetAlert confirmation dialog
  const showConfirmAlert = useCallback((title, message) => {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0066cc',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Proceed',
      cancelButtonText: 'Cancel'
    });
  }, []);

  // State Management
  const [selectedFY, setSelectedFY] = useState('2026-2027');
  const [centrecode, setCentrecode] = useState('');
  const [centres, setCentres] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [userid, setUserid] = useState('USER001');
  const [userRole, setUserRole] = useState('');
  const [centreCodesArray, setCentreCodesArray] = useState([]);
  
  // Approver-specific state
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [remarksData, setRemarksData] = useState({ rowId: null, remarks: '' });
  const [expandedObjectives, setExpandedObjectives] = useState({});

  // Initialize from localStorage
  useEffect(() => {
    try {
      const loginId = localStorage.getItem('loginId');
      const role = localStorage.getItem('userRole');
      const centreCodesFromStorage = localStorage.getItem('centreCodesArray');
      const centreCodeFromStorage = localStorage.getItem('centreCode');
      
      setUserid(loginId || 'USER001');
      setUserRole(role || '');
      
      // Parse centreCodesArray from localStorage
      if (centreCodesFromStorage) {
        try {
          const parsedCodes = JSON.parse(centreCodesFromStorage);
          setCentreCodesArray(Array.isArray(parsedCodes) ? parsedCodes : []);
        } catch (e) {
          console.log('Could not parse centreCodesArray, treating as string');
          setCentreCodesArray([centreCodesFromStorage]);
        }
      }
      
      // Set centrecode from storage if available
      if (centreCodeFromStorage && !centreCodeFromStorage.includes(',') && !centreCodeFromStorage.includes('|')) {
        setCentrecode(centreCodeFromStorage);
      }
      
      fetchObjectives();
      fetchCentres();
    } catch (err) {
      console.error('Failed to initialize:', err);
    }
  }, []);

  // Check if user is Approver
  const isApprover = userRole === 'APR' || userRole === 'APR' || userRole === 'APR';

  // Fetch objectives
  const fetchObjectives = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/objectives');
      if (!response.ok) throw new Error('Failed to fetch objectives');
      const data = await response.json();
      setObjectives(data);
    } catch (err) {
      console.error('Failed to fetch objectives:', err);
    }
  };

  // Fetch centres
  const fetchCentres = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/centres');
      if (!res.ok) throw new Error('Failed to fetch centres');
      const data = await res.json();
      setCentres(data || []);
    } catch (err) {
      console.error('Failed to load centres:', err);
      setCentres([]);
    }
  };

  // Load submitted data for approval
  const loadSubmittedDataForApproval = async (centre) => {
    try {
      setLoading(true);
      console.log(`📥 Fetching submitted data for approval - Centre: ${centre}, FY: ${selectedFY}`);
      
      const response = await fetch(`http://localhost:8080/api/targets/gettargets?financialyear=${selectedFY}&centrecode=${centre}`);
      if (!response.ok) {
        setRows([]);
        return;
      }

      const data = await response.json();
      console.log(`✅ Loaded ${data.length} submitted entries for approval`, data);

      const submittedRows = data.map((item, idx) => {
        return {
          id: `submitted_${item.objectivecode}_${item.actioncode}_${item.successindicatorcode}_${idx}`,
          objectCode: item.objectivecode || '',
          objectDescription: objectives.find(o => o.objectivecode === item.objectivecode)?.objectivedescription || '',
          mandatory: objectives.find(o => o.objectivecode === item.objectivecode)?.mandatory || '',
          multipleEntries: objectives.find(o => o.objectivecode === item.objectivecode)?.multipleentries === 'Yes',
          actionCode: item.actioncode || '',
          actionName: item.actiondescription || '',
          successIndicatorCode: item.successindicatorcode || '',
          siName: item.successindicatordescription || '',
          siDescription: item.successindicatordescription || '',
          unit: item.unit || '',
          selectedWeightType: item.unit === 'Number' ? 'NUMBER' : item.unit === 'Percentage' ? 'PERCENTAGE' : item.unit === 'Date' ? 'DATE' : 'NUMBER',
          weightValue: item.weightperunitofactivity ? { value: item.weightperunitofactivity, unit: '' } : null,
          excellent: item.targetcriteriavalueexcellent || '',
          veryGood: item.targetcriteriavalueverygood || '',
          good: item.targetcriteriavaluegood || '',
          fair: item.targetcriteriavaluefair || '',
          poor: item.targetcriteriavaluepoor || '',
          isEditing: false,
          isSaved: true,
          weightperunitofactivity: item.weightperunitofactivity || 0,
          statuscode: item.statuscode || 'T02',
          approvalRemarks: item.approvalremarks || '',
          approvedBy: item.approvedby || null,
          approvedAt: item.approvedat || null
        };
      });

      setRows(submittedRows);
      
      // Auto-expand all objectives
      const objectsWithData = new Set(submittedRows.map(r => r.objectCode));
      setExpandedObjectives(prev => {
        const updated = { ...prev };
        objectsWithData.forEach(objCode => {
          updated[objCode] = true;
        });
        return updated;
      });

      setError(null);
    } catch (err) {
      console.error(`Failed to load submitted data for approval:`, err);
      setError('Failed to load submitted data for approval');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // When centre is selected, load data
  useEffect(() => {
    if (centrecode && centrecode.trim() !== '' && objectives.length > 0) {
      console.log('📥 Loading submitted data for approval from centre:', centrecode);
      loadSubmittedDataForApproval(centrecode);
    }
  }, [centrecode, selectedFY, objectives]);

  // Request approval
  const requestApproveRow = (rowId) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    showConfirmAlert('Approve Entry?', 'Are you sure you want to approve this entry?').then((result) => {
      if (result.isConfirmed) {
        approveRowToBackend(row);
      }
    });
  };

  // Approve row
  const approveRowToBackend = async (row) => {
    try {
      setLoading(true);
      const fyYear = selectedFY;

      const approveUrl = `http://localhost:8080/api/targets/approve/${fyYear}/${centrecode}/${row.actionCode}/${row.successIndicatorCode}`;
      console.log('✅ Approving row via PUT:', approveUrl);

      const response = await fetch(approveUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to approve row';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      setRows(rows.map(r =>
        r.id === row.id 
          ? { ...r, statuscode: 'T04', approvedBy: userid, approvedAt: new Date().toISOString() } 
          : r
      ));

      showAlert('Entry approved successfully!', 'success', 'Success');
    } catch (err) {
      showAlert('Error: ' + err.message, 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Request rejection
  const requestRejectRow = (rowId) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    showConfirmAlert('Reject Entry?', 'Are you sure you want to reject this entry?').then((result) => {
      if (result.isConfirmed) {
        setRemarksData({ rowId, remarks: '' });
        setShowRemarksModal(true);
      }
    });
  };

  // Submit rejection
  const submitRejectWithRemarks = async () => {
    if (!remarksData.remarks || remarksData.remarks.trim() === '') {
      showAlert('Please enter rejection remarks', 'warning', 'Remarks Required');
      return;
    }

    const row = rows.find(r => r.id === remarksData.rowId);
    if (!row) return;

    try {
      setLoading(true);
      const fyYear = selectedFY;
      const remarks = remarksData.remarks.trim();

      const rejectUrl = `http://localhost:8080/api/targets/reject/${fyYear}/${centrecode}/${row.actionCode}/${row.successIndicatorCode}?remarks=${encodeURIComponent(remarks)}`;
      console.log('❌ Rejecting row via PUT:', rejectUrl);

      const response = await fetch(rejectUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to reject row';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      setRows(rows.map(r =>
        r.id === row.id 
          ? { ...r, statuscode: 'T03', approvalRemarks: remarks, approvedBy: userid, approvedAt: new Date().toISOString() } 
          : r
      ));

      setShowRemarksModal(false);
      setRemarksData({ rowId: null, remarks: '' });

      showAlert('Entry rejected with remarks!', 'success', 'Success');
    } catch (err) {
      showAlert('Error: ' + err.message, 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Validate and approve all
  const validateAndApproveAllData = () => {
    const approved = rows.filter(r => r.statuscode === 'T04').length;
    const rejected = rows.filter(r => r.statuscode === 'T03').length;
    const pending = rows.filter(r => r.statuscode === 'T02').length;

    if (rejected > 0) {
      const warningMsg = `⚠️ IMPORTANT:\n\nYou have ${rejected} REJECTED entry(ies) that will remain rejected.\n\n📊 Summary:\n• Pending (to approve): ${pending}\n• Already Rejected: ${rejected}\n• Already Approved: ${approved}\n\n✓ Only the ${pending} PENDING entries will be approved.\n✗ The ${rejected} REJECTED entries will remain unchanged.\n\nDo you want to continue?`;
      
      showConfirmAlert('Approve Pending - Rejected Cases Will Stay Rejected', warningMsg)
        .then((result) => {
          if (result.isConfirmed) {
            approveAllToBackend();
          }
        });
    } else if (pending > 0) {
      const summaryMessage = `Approve ${pending} pending entries?\n\n📊 Summary:\n• Pending (to approve): ${pending}\n• Already Approved: ${approved}`;
      
      showConfirmAlert('Approve All Data?', summaryMessage)
        .then((result) => {
          if (result.isConfirmed) {
            approveAllToBackend();
          }
        });
    } else if (approved > 0) {
      showAlert('✅ All entries are already approved!', 'info', 'All Approved');
    } else {
      showAlert('No entries to approve', 'warning', 'No Data');
    }
  };

  // Approve all to backend
  const approveAllToBackend = async () => {
    try {
      setLoading(true);
      const fyYear = selectedFY;

      const approveAllUrl = `http://localhost:8080/api/targets/approveall?financialyear=${fyYear}&centrecode=${centrecode}`;
      console.log('✅ Approving all via PUT:', approveAllUrl);

      const response = await fetch(approveAllUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to approve all entries';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      setRows(prev => prev.map(r => {
        if (r.statuscode === 'T02') {
          return {
            ...r,
            statuscode: 'T04',
            approvedBy: userid,
            approvedAt: new Date().toISOString()
          };
        }
        return r;
      }));

      showAlert('All pending entries approved successfully!', 'success', 'Success');
    } catch (err) {
      showAlert('Error: ' + err.message, 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Get rows for objective
  const getObjectiveRows = (objectCode) => {
    return rows.filter(r => r.objectCode === objectCode);
  };

  // Calculate total weight for an objective (sum of weightperunitofactivity for all rows)
  const calculateTotalWeightForObjective = (objectCode) => {
    const objectiveRows = getObjectiveRows(objectCode);
    if (objectiveRows.length === 0) return 0;
    const total = objectiveRows.reduce((sum, row) => {
      return sum + (parseFloat(row.weightperunitofactivity) || 0);
    }, 0);
    return total.toFixed(2);
  };

  return (
    <>
      {/* Role-based access control */}
      {!isApprover ? (
        <div className="container-fluid" style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
          <div className="card shadow-lg" style={{maxWidth: '500px', borderRadius: '12px', border: 'none'}}>
            <div className="card-body text-center p-5">
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🔒</div>
              <h3 className="fw-bold text-danger mb-3">Access Denied</h3>
              <p className="text-muted mb-4">This page is only accessible to users with the <strong>APPROVER</strong> role.</p>
              <p style={{fontSize: '0.9rem', color: '#666'}}>Current Role: <strong>{userRole || 'Not assigned'}</strong></p>
              <button 
                className="btn btn-primary mt-3"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container-fluid" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)', minHeight: '100vh', paddingTop: '1.5rem', paddingBottom: '2rem'}}>
          {/* Beautiful Header */}
          <div className="mb-4" style={{background: 'linear-gradient(135deg, #0066cc 0%, #004da3 100%)', borderRadius: '12px', padding: '2rem', color: 'white', boxShadow: '0 8px 24px rgba(0, 102, 204, 0.2)'}}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="fw-bold mb-1" style={{fontSize: '1.5rem', letterSpacing: '-0.5px'}}>✅ Approval Queue</h3>
                <p className="mb-0" style={{fontSize: '0.95rem', opacity: 0.95}}>Review and approve submitted entries</p>
              </div>
              <div style={{fontSize: '2.5rem', opacity: 0.9}}>📋</div>
            </div>
          </div>

          {/* Centre and FY Selection */}
          <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '12px', overflow: 'hidden', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}}>
            <div className="card-body p-3">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold text-dark" style={{fontSize: '0.95rem'}}>📅 Financial Year</label>
                  <select 
                    className="form-select" 
                    value={selectedFY}
                    onChange={(e) => setSelectedFY(e.target.value)}
                    style={{
                      borderColor: '#0066cc',
                      fontSize: '0.9rem',
                      padding: '0.5rem 0.75rem',
                      border: '1.5px solid #0066cc',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="2026-2027">FY 2026-2027</option>
                    <option value="2025-2026">FY 2025-2026</option>
                    <option value="2024-2025">FY 2024-2025</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold text-dark" style={{fontSize: '0.95rem'}}>🏢 Select Centre <span className="text-danger">*</span></label>
                  <select 
                    className="form-select" 
                    value={centrecode}
                    onChange={(e) => setCentrecode(e.target.value)}
                    style={{
                      borderColor: centrecode ? '#0066cc' : '#dc3545',
                      fontSize: '0.9rem',
                      padding: '0.5rem 0.75rem',
                      border: centrecode ? '1.5px solid #0066cc' : '2px solid #dc3545',
                      borderRadius: '8px',
                      backgroundColor: centrecode ? '#fff' : '#fff5f5'
                    }}
                  >
                    <option value="">-- Select Centre --</option>
                    {centres
                      .filter(centre => centreCodesArray.length === 0 || centreCodesArray.includes(centre.centrecode))
                      .map((centre, idx) => (
                        <option key={idx} value={centre.centrecode}>
                          {centre.centreshortname} - {centre.centrelongname}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  {rows.length > 0 && (
                    <button 
                      className="btn w-100 fw-bold"
                      onClick={validateAndApproveAllData}
                      disabled={loading}
                      style={{
                        fontSize: '0.9rem',
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.2)',
                        transition: 'all 0.3s ease',
                        opacity: loading ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.2)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Check size={16} className="me-2" style={{display: 'inline-block'}} />
                      Approve All Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

      {/* Objectives and Rows */}
      {objectives.map(objective => {
        const objectiveRows = getObjectiveRows(objective.objectivecode);
        if (objectiveRows.length === 0) return null;

        return (
          <div key={objective.objectivecode} className="card border-0 shadow-sm mb-4" style={{borderRadius: '8px', overflow: 'hidden'}}>
            <div 
              onClick={() => setExpandedObjectives(prev => ({
                ...prev, 
                [objective.objectivecode]: !prev[objective.objectivecode]
              }))}
              style={{
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #f0f4f8 0%, #e8ecf1 100%)',
                padding: '1rem',
                borderBottom: '2px solid #0066cc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e6eef7';
                e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{flex: 1}}>
                <h5 className="mb-2 fw-bold" style={{color: '#0066cc', fontSize: '1rem'}}>
                  {objective.objectivecode} - {objective.objectivedescription}
                </h5>
                <small className="text-muted">{objectiveRows.length} entry(ies) pending approval</small>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                <div style={{textAlign: 'right'}}>
                  <small style={{color: '#ff6600', fontWeight: '700', fontSize: '0.95rem'}}>
                    ⚖️ Total Weight: {calculateTotalWeightForObjective(objective.objectivecode)}
                  </small>
                </div>
                <div style={{color: '#0066cc', fontSize: '1.3rem', minWidth: '24px', textAlign: 'center'}}>
                  {expandedObjectives[objective.objectivecode] ? '⬆️' : '⬇️'}
                </div>
              </div>
            </div>

            {expandedObjectives[objective.objectivecode] && (
              <div className="card-body" style={{padding: '1rem'}}>
                <div className="table-responsive" style={{overflowX: 'auto', overflowY: 'auto', maxHeight: '600px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'}}>
                  <table className="table table-hover table-sm enhanced-table" style={{width: '100%', marginBottom: 0}}>
                    <thead className="sticky-table-header" style={{position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)'}}>
                      <tr style={{
                        background: 'linear-gradient(135deg, #f0f4f8 0%, #e8ecf1 100%)',
                        borderBottom: '3px solid #0066cc',
                        boxShadow: '0 2px 6px rgba(0, 102, 204, 0.1)'
                      }}>
                        <th width="18%" style={{
                          textAlign: 'left',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          padding: '0.75rem 0.5rem',
                          color: '#0066cc',
                          letterSpacing: '0.5px'
                        }}>📝 Action</th>
                        <th width="14%" style={{
                          textAlign: 'center',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          padding: '0.75rem 0.5rem',
                          color: '#0066cc',
                          letterSpacing: '0.5px'
                        }}>🎯 Success Indicator</th>
                        <th width="7%" style={{
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.5rem 0.3rem',
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          letterSpacing: '0.5px'
                        }}>⚖️ Weight</th>
                        <th width="8%" style={{
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.5rem 0.3rem',
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          letterSpacing: '0.5px'
                        }}>📌 Type</th>
                        <th width="7%" style={{
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.5rem 0.3rem',
                          backgroundColor: '#d4e9ff',
                          color: '#004db3',
                          letterSpacing: '0.5px'
                        }}>⭐ Excellent</th>
                        <th width="7%" style={{
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.5rem 0.3rem',
                          backgroundColor: '#d4e9ff',
                          color: '#004db3',
                          letterSpacing: '0.5px'
                        }}>📈 Very Good</th>
                        <th width="7%" style={{
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.5rem 0.3rem',
                          backgroundColor: '#d4e9ff',
                          color: '#004db3',
                          letterSpacing: '0.5px'
                        }}>✓ Good</th>
                        <th width="7%" style={{
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.5rem 0.3rem',
                          backgroundColor: '#d4e9ff',
                          color: '#004db3',
                          letterSpacing: '0.5px'
                        }}>⬇️ Fair</th>
                        <th width="7%" style={{
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.5rem 0.3rem',
                          backgroundColor: '#d4e9ff',
                          color: '#004db3',
                          letterSpacing: '0.5px'
                        }}>📉 Poor</th>
                        <th width="8%" style={{
                          textAlign: 'center',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          padding: '0.75rem 0.5rem',
                          color: '#0066cc',
                          letterSpacing: '0.5px'
                        }}>📊 Status</th>
                        <th width="15%" style={{
                          textAlign: 'center',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          padding: '0.75rem 0.5rem',
                          color: '#0066cc',
                          letterSpacing: '0.5px'
                        }}>🔧 Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {objectiveRows.map((row, rowIdx) => (
                        <tr key={row.id} style={{
                          backgroundColor: rowIdx % 2 === 0 ? '#ffffff' : '#f9fafb',
                          borderBottom: '1px solid #e5e7eb',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowIdx % 2 === 0 ? '#ffffff' : '#f9fafb'}
                        >
                          <td style={{fontSize: '0.75rem', fontWeight: '600', color: '#0066cc', padding: '0.5rem 0.3rem', textAlign: 'left'}}>
                            {row.actionName}
                          </td>
                          <td style={{fontSize: '0.75rem', padding: '0.5rem 0.3rem', textAlign: 'center'}}>
                            <small>{row.siName}</small>
                          </td>
                          <td style={{fontSize: '0.75rem', padding: '0.5rem 0.3rem', textAlign: 'center', fontWeight: '600', color: '#0066cc'}}>
                            {row.weightperunitofactivity || '-'}
                          </td>
                          <td style={{fontSize: '0.75rem', padding: '0.5rem 0.3rem', textAlign: 'center', fontWeight: '500', color: '#856404'}}>
                            {row.selectedWeightType === 'NUMBER' ? 'NUMBER' : row.selectedWeightType === 'PERCENTAGE' ? 'PERCENTAGE' : row.selectedWeightType === 'DATE' ? 'DATE' : 'NUMBER'}
                          </td>
                          <td style={{fontSize: '0.75rem', padding: '0.5rem 0.3rem', textAlign: 'center', fontWeight: '600'}}>
                            {row.selectedWeightType === 'DATE' ? formatDateToDDMMYYYY(row.excellent) : row.excellent || '-'}
                          </td>
                          <td style={{fontSize: '0.75rem', padding: '0.5rem 0.3rem', textAlign: 'center'}}>
                            {row.selectedWeightType === 'DATE' ? formatDateToDDMMYYYY(row.veryGood) : row.veryGood || '-'}
                          </td>
                          <td style={{fontSize: '0.75rem', padding: '0.5rem 0.3rem', textAlign: 'center'}}>
                            {row.selectedWeightType === 'DATE' ? formatDateToDDMMYYYY(row.good) : row.good || '-'}
                          </td>
                          <td style={{fontSize: '0.75rem', padding: '0.5rem 0.3rem', textAlign: 'center'}}>
                            {row.selectedWeightType === 'DATE' ? formatDateToDDMMYYYY(row.fair) : row.fair || '-'}
                          </td>
                          <td style={{fontSize: '0.75rem', padding: '0.5rem 0.3rem', textAlign: 'center'}}>
                            {row.selectedWeightType === 'DATE' ? formatDateToDDMMYYYY(row.poor) : row.poor || '-'}
                          </td>
                          <td style={{fontSize: '0.75rem', padding: '0.5rem 0.3rem', textAlign: 'center'}}>
                            <div style={{
                              fontSize: '0.65rem',
                              padding: '0.25rem 0.35rem',
                              borderRadius: '3px',
                              fontWeight: '600',
                              minWidth: '55px',
                              textAlign: 'center',
                              backgroundColor: row.statuscode === 'T04' ? '#d4edda' : row.statuscode === 'T03' ? '#f8d7da' : '#fff3cd',
                              color: row.statuscode === 'T04' ? '#155724' : row.statuscode === 'T03' ? '#721c24' : '#856404',
                              border: `1px solid ${row.statuscode === 'T04' ? '#c3e6cb' : row.statuscode === 'T03' ? '#f5c6cb' : '#ffeaa7'}`,
                              display: 'inline-block'
                            }}>
                              {row.statuscode === 'T04' ? '✅ APPR' : row.statuscode === 'T03' ? '❌ REJ' : '⏳ PND'}
                            </div>
                          </td>
                          <td style={{fontSize: '0.75rem', padding: '0.5rem 0.3rem', textAlign: 'center'}}>
                            <div style={{display: 'flex', gap: '0.3rem', justifyContent: 'center'}}>
                              {/* APPROVE BUTTON */}
                              <button 
                                className="btn btn-sm"
                                onClick={() => requestApproveRow(row.id)}
                                disabled={row.statuscode === 'T04' || loading}
                                title={row.statuscode === 'T04' ? 'Already approved' : 'Approve this entry'}
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '0.25rem 0.35rem',
                                  minWidth: '24px',
                                  flex: '0 0 auto',
                                  backgroundColor: row.statuscode === 'T04' ? '#e9ecef' : '#28a745',
                                  border: 'none',
                                  color: row.statuscode === 'T04' ? '#999' : 'white',
                                  borderRadius: '4px',
                                  cursor: row.statuscode === 'T04' ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  fontWeight: '600'
                                }}
                                onMouseEnter={(e) => {
                                  if (row.statuscode !== 'T04') {
                                    e.currentTarget.style.backgroundColor = '#20c997';
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(40, 167, 69, 0.3)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = row.statuscode === 'T04' ? '#e9ecef' : '#28a745';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <Check size={11} />
                              </button>

                              {/* REJECT BUTTON */}
                              <button 
                                className="btn btn-sm"
                                onClick={() => requestRejectRow(row.id)}
                                disabled={row.statuscode === 'T03' || loading}
                                title={row.statuscode === 'T03' ? 'Already rejected' : 'Reject this entry'}
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '0.25rem 0.35rem',
                                  minWidth: '24px',
                                  flex: '0 0 auto',
                                  backgroundColor: row.statuscode === 'T03' ? '#e9ecef' : '#dc3545',
                                  border: 'none',
                                  color: row.statuscode === 'T03' ? '#999' : 'white',
                                  borderRadius: '4px',
                                  cursor: row.statuscode === 'T03' ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  fontWeight: '600'
                                }}
                                onMouseEnter={(e) => {
                                  if (row.statuscode !== 'T03') {
                                    e.currentTarget.style.backgroundColor = '#c82333';
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(220, 53, 69, 0.3)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = row.statuscode === 'T03' ? '#e9ecef' : '#dc3545';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <X size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {rows.length === 0 && !loading && centrecode && (
        <div className="card border-0 shadow-sm" style={{borderRadius: '12px', overflow: 'hidden', background: 'linear-gradient(135deg, #d4edda 0%, #c8e6c9 100%)', borderLeft: '5px solid #28a745'}}>
          <div className="card-body text-center py-5">
            <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>✅</div>
            <h5 className="fw-bold text-success mb-2">No Entries Pending Approval</h5>
            <p className="text-muted mb-0">All submitted entries for the selected centre have been reviewed.</p>
          </div>
        </div>
      )}

      {!centrecode && !loading && (
        <div className="card border-0 shadow-sm" style={{borderRadius: '12px', overflow: 'hidden', background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)', borderLeft: '5px solid #ffc107'}}>
          <div className="card-body text-center py-5">
            <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>🏢</div>
            <h5 className="fw-bold text-warning mb-2">Select a Centre</h5>
            <p className="text-muted mb-0">Please select a centre from the dropdown above to view entries pending approval.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="card border-0 shadow-sm" style={{borderRadius: '12px', overflow: 'hidden', background: 'linear-gradient(135deg, #e7f3ff 0%, #cfe0ff 100%)'}}>
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" style={{width: '2.5rem', height: '2.5rem'}}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted fw-bold">⏳ Loading approval data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="card border-0 shadow-sm" style={{borderRadius: '12px', overflow: 'hidden', background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)', borderLeft: '5px solid #dc3545'}}>
          <div className="card-body">
            <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
              <div style={{fontSize: '1.5rem'}}>❌</div>
              <div>
                <h5 className="fw-bold text-danger mb-2">Error!</h5>
                <p className="mb-0 text-muted">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remarks Modal */}
      {showRemarksModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{borderRadius: '8px'}}>
              <div className="modal-header bg-danger text-white" style={{borderRadius: '8px 8px 0 0'}}>
                <h5 className="modal-title fw-bold">❌ Rejection Remarks</h5>
                <button onClick={() => setShowRemarksModal(false)} className="btn-close btn-close-white"></button>
              </div>
              <div className="modal-body">
                <label className="form-label fw-semibold text-dark mb-2">Please enter reason for rejection:</label>
                <textarea 
                  className="form-control form-control-lg" 
                  rows="5"
                  placeholder="Enter rejection remarks..."
                  value={remarksData.remarks}
                  onChange={(e) => setRemarksData({...remarksData, remarks: e.target.value})}
                  style={{
                    fontSize: '0.95rem',
                    borderColor: '#dc3545',
                    minHeight: '120px'
                  }}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowRemarksModal(false)} className="btn btn-secondary btn-lg">
                  Cancel
                </button>
                <button onClick={submitRejectWithRemarks} className="btn btn-danger btn-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <X size={18} className="me-2" />
                      Submit Rejection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </>
  );
};

export default ApprovalQueuePage;

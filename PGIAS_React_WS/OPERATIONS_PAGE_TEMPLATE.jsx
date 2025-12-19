// ============================================
// OPERATIONS DATA ENTRY PAGE TEMPLATE
// Based on OperationalData.MasterData Excel
// ============================================

import React, { useState } from 'react';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const OperationsPageTemplate = () => {
  // ===== MASTER DATA (Hardcoded from Excel) =====
  const masterData = {
    financialYears: [
      { id: 'FY2024-25', name: 'FY 2024-25' },
      { id: 'FY2023-24', name: 'FY 2023-24' },
      { id: 'FY2022-23', name: 'FY 2022-23' }
    ],
    centres: [
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

  // ===== FORM STATE =====
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
    
    // Target Criteria Section (Performance Levels)
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

  // ===== HANDLERS =====
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
    
    if (!formData.financialYear || !formData.centreCode || !formData.objectiveCode || !formData.actionCode || !formData.successIndicatorCode || !formData.unitCode) {
      alert('Please fill all required selection fields');
      return;
    }
    
    const submission = {
      id: Date.now(),
      ...formData,
      submittedDate: new Date().toLocaleString(),
      userId: 'USER001'
    };
    
    setSubmittedData(prev => [...prev, submission]);
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

export default OperationsPageTemplate;

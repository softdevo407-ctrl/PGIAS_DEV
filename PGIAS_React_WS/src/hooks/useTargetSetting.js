// useTargetSetting - Custom hook for target setting page logic
import { useState, useCallback } from 'react';
import * as targetService from '../services/targetService';
import * as objectiveService from '../services/objectiveService';
import * as actionService from '../services/actionService';
import * as successIndicatorService from '../services/successIndicatorService';
import * as centreService from '../services/centreService';
import { validateRow } from '../utils/validators';
import { mapSavedDataToRow } from '../services/successIndicatorService';

export const useTargetSetting = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tooltipError, setTooltipError] = useState(null);
  const [expandedObjectives, setExpandedObjectives] = useState({});

  /**
   * Fetch saved rows for centre and FY combination
   */
  const fetchSavedRowsForCentre = useCallback(async (centrecode, financialyear) => {
    if (!centrecode) {
      console.log('❌ No centre provided, skipping fetch');
      return [];
    }

    const apiData = await targetService.getTargetsByCentreAndFY(centrecode, financialyear);

    if (!Array.isArray(apiData) || apiData.length === 0) {
      console.log(`ℹ️ No saved data for centre: ${centrecode}`);
      return [];
    }

    // Map API response to row format
    const savedRows = apiData.map((item) => mapSavedDataToRow(item));

    // Auto-expand objectives with saved rows
    const objectsWithSavedRows = new Set(savedRows.map(r => r.objectCode));
    setExpandedObjectives(prev => {
      const updated = { ...prev };
      objectsWithSavedRows.forEach(objCode => {
        updated[objCode] = true;
      });
      return updated;
    });

    console.log(`✅ Loaded ${savedRows.length} saved row(s) for centre: ${centrecode}`);
    return savedRows;
  }, []);

  /**
   * Handle centre change
   */
  const handleCentreChange = useCallback(async (selectedCentre, selectedFY) => {
    if (!selectedCentre || selectedCentre.trim() === '') {
      setTooltipError({
        rowId: null,
        field: 'centrecode',
        message: '⚠️ Please select a centre before proceeding'
      });
      return;
    }

    setTooltipError(null);
    setLoading(true);

    try {
      const savedRows = await fetchSavedRowsForCentre(selectedCentre, selectedFY);

      setRows(prev => {
        // Keep only template rows (empty objectives)
        const templateRows = prev.filter(r => !r.isSaved);
        // Combine with new saved rows
        return [...savedRows, ...templateRows];
      });
    } catch (err) {
      setError('Failed to load saved data for centre');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchSavedRowsForCentre]);

  /**
   * Save row to backend
   */
  const saveRow = useCallback(async (row, objectives, centrecode, selectedFY, centres, userid) => {
    // Validate centre is selected
    if (!centrecode || centrecode.trim() === '') {
      setTooltipError({
        rowId: row.id,
        field: 'centrecode',
        message: '⚠️ Please select a centre before saving'
      });
      return false;
    }

    // Validate row
    const validation = validateRow(row, objectives);
    if (!validation.isValid) {
      setTooltipError({
        rowId: row.id,
        field: validation.field,
        message: validation.message
      });
      return false;
    }

    setLoading(true);

    try {
      const centreObj = centreService.findCentreByCode(centres, centrecode);
      const payload = {
        financialyear: selectedFY,
        centrecode: centrecode,
        centreshortname: centreObj ? centreObj.centreshortname : '',
        objectivecode: row.objectCode,
        objectivedescription: row.objectDescription || '',
        actioncode: row.actionCode,
        actiondescription: row.actionName || '',
        successindicatorcode: row.successIndicatorCode,
        successindicatordescription: row.siName || '',
        unit: row.unit || '',
        targetsetvalue: row.excellent || '',
        weightperunitofactivity: row.weightValue?.value || 0,
        targetcriteriavalueexcellent: row.excellent || '',
        targetcriteriavalueverygood: row.veryGood || '',
        targetcriteriavaluegood: row.good || '',
        targetcriteriavaluefair: row.fair || '',
        targetcriteriavaluepoor: row.poor || '',
        validforpercentage: row.selectedWeightType === 'PERCENTAGE' ? 'Yes' : 'No',
        statuscode: 'T01',
        userid: userid,
        regstatus: 'A',
        regtime: new Date().toISOString()
      };

      await targetService.saveTarget(payload);

      // Update row state to frozen
      setRows(prev =>
        prev.map(r =>
          r.id === row.id ? { ...r, isEditing: false, isSaved: true, hasChanges: false } : r
        )
      );

      setTooltipError(null);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error saving row:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete row from backend
   */
  const deleteRow = useCallback(async (row, selectedFY, centrecode) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return false;
    }

    setLoading(true);

    try {
      const deleteId = {
        financialyear: selectedFY.replace('-', '/'),
        centrecode: centrecode,
        objectivecode: row.objectCode,
        actioncode: row.actionCode,
        successindicatorcode: row.successIndicatorCode
      };

      await targetService.deleteTarget(deleteId);

      // Remove row from state
      setRows(prev => prev.filter(r => r.id !== row.id));

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting row:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update row field
   */
  const updateRowField = useCallback((rowId, field, value) => {
    setRows(prev =>
      prev.map(row => {
        if (row.id === rowId) {
          const hasChanges = row.isSaved ? true : false;
          return { ...row, [field]: value, hasChanges };
        }
        return row;
      })
    );

    // Clear error if exists
    if (tooltipError?.rowId === rowId) {
      setTooltipError(null);
    }
  }, [tooltipError]);

  /**
   * Edit saved row
   */
  const editRow = useCallback((rowId) => {
    if (!window.confirm('Are you sure you want to edit this row?')) {
      return false;
    }

    setRows(prev =>
      prev.map(r => {
        if (r.id === rowId) {
          return {
            ...r,
            isEditing: true,
            hasChanges: false,
            originalValues: { ...r }
          };
        }
        return r;
      })
    );

    return true;
  }, []);

  /**
   * Toggle objective expansion
   */
  const toggleObjectiveExpansion = useCallback((objectCode) => {
    setExpandedObjectives(prev => ({
      ...prev,
      [objectCode]: !prev[objectCode]
    }));
  }, []);

  return {
    rows,
    setRows,
    loading,
    setLoading,
    error,
    setError,
    tooltipError,
    setTooltipError,
    expandedObjectives,
    setExpandedObjectives,
    fetchSavedRowsForCentre,
    handleCentreChange,
    saveRow,
    deleteRow,
    updateRowField,
    editRow,
    toggleObjectiveExpansion
  };
};

import React from 'react';
import { AlertCircle, Phone, User } from 'lucide-react';

const NoRoleAccess = ({ user }) => {
  return (
    <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="row w-100">
        <div className="col-md-6 offset-md-3">
          <div className="card shadow-lg border-0" style={{ borderTop: '4px solid #dc3545' }}>
            <div className="card-body p-5 text-center">
              {/* Icon */}
              <div style={{ marginBottom: '2rem' }}>
                <AlertCircle size={80} className="text-danger" />
              </div>

              {/* Main Message */}
              <h2 className="fw-bold text-danger mb-3">❌ Access Denied</h2>
              <p className="fs-5 text-muted mb-4">
                You currently do not have any roles assigned to access the PGIAS module.
              </p>

              {/* Info Section */}
              <div className="alert alert-warning border-0 mb-4" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
                <p className="mb-0">
                  <strong>Your Account Status:</strong>
                </p>
                <p className="mb-3 text-muted">
                  Login ID: <code className="bg-light px-2 py-1">{user?.loginId || 'N/A'}</code>
                </p>
                <p className="mb-0 text-danger fw-bold">
                  ⚠️ No roles currently assigned
                </p>
              </div>

              {/* Contact Information */}
              <div className="card border-0 bg-light mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3 text-dark">📞 Contact Support</h5>
                  <p className="mb-2">
                    <strong>Please contact:</strong>
                  </p>
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <User size={20} className="me-2 text-primary" />
                    <span className="fs-6">
                      <strong>Surendranath P</strong> (IS03651)
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-center">
                    <Phone size={20} className="me-2 text-success" />
                    <span className="fs-5">
                      <strong>Ext: 5657</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-muted smaller">
                <p className="mb-2">
                  Surendranath will assist you with role assignment and access provisioning.
                </p>
                <p className="mb-0">
                  Once roles are assigned, you will be able to access the PGIAS module.
                </p>
              </div>

              {/* Footer */}
              <hr className="my-4" />
              <p className="text-muted small">
                For other inquiries or technical support, please reach out to your system administrator.
              </p>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-4 bg-light rounded" style={{ borderLeft: '4px solid #0d6efd' }}>
            <h6 className="fw-bold mb-2">ℹ️ What are roles?</h6>
            <p className="mb-0 small text-muted">
              Roles determine what features and data you can access in PGIAS. Common roles include:
            </p>
            <ul className="small text-muted mt-2 mb-0">
              <li><strong>USR</strong> - Operations module access (Target Setting & Review)</li>
              <li><strong>ADM</strong> - Administrator & Generic Entry access</li>
              <li><strong>APR</strong> - Approval & Review capabilities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoRoleAccess;

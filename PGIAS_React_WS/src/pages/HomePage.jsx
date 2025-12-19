import React from 'react';
import { ArrowRight, CheckCircle, Users, Zap, BarChart3, Shield, Sparkles } from 'lucide-react';

const HomePage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="container">
          <a className="navbar-brand fw-bold d-flex align-items-center" href="#" style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>
            <div style={{
              width: '45px',
              height: '45px',
              background: 'linear-gradient(135deg, #fff 0%, #e9ecef 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
            }}>
              <Sparkles size={28} style={{ color: '#667eea' }} />
            </div>
            <span style={{ background: 'linear-gradient(135deg, #fff 0%, #e9ecef 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>
              PGIAS
            </span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link text-white me-3" href="#features" style={{ fontSize: '0.95rem' }}>Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white me-3" href="#about" style={{ fontSize: '0.95rem' }}>About</a>
              </li>
              <li className="nav-item me-3">
                <a 
                  href="https://central-authentication.isro.dos.gov.in/CASClient/userauthentication.html?redirectURL=https://localhost:5173"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light rounded-pill px-4 fw-bold"
                  style={{ border: '2px solid white', transition: 'all 0.3s', display: 'inline-block' }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'white';
                  }}
                >
                  Login
                </a>
              </li>
              <li className="nav-item">
                <a 
                  href="https://central-authentication.isro.dos.gov.in/CASClient/signup.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light rounded-pill px-4 fw-bold"
                  style={{ background: 'white', color: '#667eea', transition: 'all 0.3s', display: 'inline-block' }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Sign Up
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '40px' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div style={{ marginBottom: '30px' }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: 'linear-gradient(135deg, #fff 0%, #e9ecef 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.25)'
                }}>
                  <Sparkles size={40} style={{ color: '#667eea' }} />
                </div>
              </div>
              <h1 className="display-3 fw-bold text-white mb-4" style={{ lineHeight: '1.2', letterSpacing: '-1px' }}>
                Incentive & Performance <span style={{ background: 'linear-gradient(135deg, #fff 0%, #e9ecef 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Management System</span>
              </h1>
              <p className="lead text-white-50 mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
                Transform your organization's performance management with our comprehensive incentive tracking and analytics platform. Empower your team with data-driven insights.
              </p>
              <div className="d-flex gap-3">
                <a 
                  href="https://central-authentication.isro.dos.gov.in/CASClient/userauthentication.html?redirectURL=https://localhost:5173"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light btn-lg rounded-pill px-5 fw-bold"
                  style={{ color: '#667eea', transition: 'all 0.3s', display: 'inline-block' }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Get Started <ArrowRight size={20} className="ms-2" />
                </a>
                <a 
                  href="https://central-authentication.isro.dos.gov.in/CASClient/forgotpass.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light btn-lg rounded-pill px-5 fw-bold"
                  style={{ border: '2px solid white', transition: 'all 0.3s', display: 'inline-block' }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  Forgot Password
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ background: 'rgba(0,0,0,0.3)', padding: '80px 0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-white mb-3">Powerful Features</h2>
            <p className="lead text-white-50">Everything you need to manage incentives effectively</p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(15px)',
                borderRadius: '20px',
                padding: '35px',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <Zap size={40} style={{ color: '#FFD700', marginBottom: '15px' }} />
                <h5 className="text-white fw-bold mb-2">Real-Time Analytics</h5>
                <p className="text-white-50 small">Monitor performance metrics and incentives in real-time with interactive dashboards</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(15px)',
                borderRadius: '20px',
                padding: '35px',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <Shield size={40} style={{ color: '#00D084', marginBottom: '15px' }} />
                <h5 className="text-white fw-bold mb-2">Secure & Reliable</h5>
                <p className="text-white-50 small">Enterprise-grade security with data encryption and compliance standards</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(15px)',
                borderRadius: '20px',
                padding: '35px',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <Users size={40} style={{ color: '#FF6B6B', marginBottom: '15px' }} />
                <h5 className="text-white fw-bold mb-2">Team Collaboration</h5>
                <p className="text-white-50 small">Seamlessly collaborate with your team with role-based access control</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(15px)',
                borderRadius: '20px',
                padding: '35px',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <BarChart3 size={40} style={{ color: '#4ECDC4', marginBottom: '15px' }} />
                <h5 className="text-white fw-bold mb-2">Custom Reports</h5>
                <p className="text-white-50 small">Generate custom reports and export data in multiple formats</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h2 className="display-5 fw-bold text-white mb-4">Why Choose PGIAS?</h2>
              <div className="space-y-3">
                {[
                  'Streamline incentive management processes',
                  'Transparent and fair performance evaluation',
                  'Automated calculations and reporting'
                ].map((benefit, idx) => (
                  <div key={idx} className="d-flex align-items-center mb-3">
                    <CheckCircle size={24} style={{ color: '#00D084', marginRight: '15px', flexShrink: 0 }} />
                    <p className="text-white mb-0" style={{ fontSize: '1.1rem' }}>{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'rgba(0,0,0,0.5)', padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <div className="row mb-4">
            <div className="col-md-6 mb-4 mb-md-0">
              <h5 className="text-white fw-bold mb-3">ISRO HRPM</h5>
              <p className="text-white-50 small">Performance and Incentive Management System</p>
              <p className="text-white-50 small mt-3">Department of Human Resources and Performance Management</p>
              <p className="text-white-50 small">Indian Space Research Organisation Headquarters</p>
            </div>
            <div className="col-md-6">
              <h6 className="text-white fw-bold mb-3">Support & Information</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none small">Documentation</a></li>
                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none small">Help & Support</a></li>
                <li><a href="#" className="text-white-50 text-decoration-none small">System Status</a></li>
              </ul>
            </div>
          </div>
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <div className="text-center">
            <p className="text-white-50 small mb-0">&copy; 2025 ISRO HRPM Division. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const LoginPage = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // Enforce 8-character minimum password rule
    if (!password || password.length < 8) {
      alert('Authentication Failed: Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (role === 'faculty') {
        // --- FACULTY LOGIN FLOW (Checked against database 'faculty' table) ---
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (facultyError || !facultyData) {
          alert('Faculty Login Failed: No faculty account found with this email.');
        } else if (facultyData.password !== password) {
          alert('Faculty Login Failed: Incorrect password.');
        } else {
          alert('Faculty Login Successful!');
          onLoginSuccess({ email: cleanEmail, role: 'faculty' });
        }
      } else {
        if (isSignUp) {
          // --- STUDENT SIGN UP FLOW ---
          const { data: existing } = await supabase
            .from('registrations')
            .select('*')
            .eq('student_email', cleanEmail)
            .maybeSingle();

          if (existing) {
            alert('Account already exists with this email! Please switch to Sign In.');
            setLoading(false);
            return;
          }

          const { error } = await supabase.from('registrations').insert([
            {
              event_id: 1,
              student_name: name || 'Campus Student',
              student_email: cleanEmail,
              student_phone: phone || '0000000000',
              password: password
            }
          ]);

          if (error) {
            alert('Sign Up failed: ' + error.message);
          } else {
            alert('Sign Up successful! Welcome to Eventics.');
            onLoginSuccess({ email: cleanEmail, role: 'student' });
          }
        } else {
          // --- STUDENT SIGN IN FLOW ---
          const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .eq('student_email', cleanEmail)
            .maybeSingle();

          if (error || !data) {
            alert('Login Failed: No account found with this email. Please Sign Up first!');
          } else if (data.password && data.password !== password) {
            alert('Login Failed: Incorrect password. Please try again.');
          } else {
            alert('Student Login Successful!');
            onLoginSuccess({ email: cleanEmail, role: 'student' });
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .auth-page-wrapper {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          background: #f1f5f9;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .auth-container {
          background: #ffffff;
          width: 100%;
          max-width: 900px;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08);
          display: flex;
          overflow: hidden;
        }

        .auth-left-panel {
          background: #0b1329;
          color: white;
          width: 45%;
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .auth-brand {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .auth-brand-underline {
          width: 36px;
          height: 3px;
          background: #2563eb;
          margin-bottom: 2rem;
          border-radius: 2px;
        }

        .auth-left-desc {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #94a3b8;
        }

        .auth-right-panel {
          flex: 1;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .auth-heading {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          margin-bottom: 0.25rem;
        }

        .auth-heading-underline {
          width: 24px;
          height: 3px;
          background: #2563eb;
          margin: 0 auto 1.5rem auto;
          border-radius: 2px;
        }

        .role-switch-container {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .role-btn {
          flex: 1;
          padding: 0.6rem;
          border: none;
          background: transparent;
          font-family: 'Poppins', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .role-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-input {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.875rem;
          outline: none;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
          background: #ffffff;
          color: #0f172a;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          border-color: #2563eb;
        }

        .login-submit-btn {
          width: 100%;
          padding: 0.9rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: background 0.2s;
        }

        .login-submit-btn:hover {
          background: #1d4ed8;
        }

        .auth-toggle-text {
          text-align: center;
          margin-top: 1.25rem;
          font-size: 0.85rem;
          color: #64748b;
        }

        .auth-toggle-text span {
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
        }

        .auth-toggle-text span:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .auth-container {
            flex-direction: column;
          }
          .auth-left-panel {
            width: 100%;
            padding: 2rem;
          }
          .auth-right-panel {
            padding: 2rem;
          }
        }
      `}</style>

      <div className="auth-page-wrapper">
        <div className="auth-container">
          <div className="auth-left-panel">
            <div className="auth-brand">Eventics</div>
            <div className="auth-brand-underline"></div>
            <p className="auth-left-desc">
              Your ultimate college event management portal. Discover, register, and coordinate campus technical and cultural events seamlessly.
            </p>
          </div>

          <div className="auth-right-panel">
            <h2 className="auth-heading">{role === 'faculty' ? 'Faculty Portal' : (isSignUp ? 'Create Account' : 'Sign In')}</h2>
            <div className="auth-heading-underline"></div>

            <div className="role-switch-container">
              <button 
                type="button" 
                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => { setRole('student'); setIsSignUp(false); }}
              >
                Student
              </button>
              <button 
                type="button" 
                className={`role-btn ${role === 'faculty' ? 'active' : ''}`}
                onClick={() => { setRole('faculty'); setIsSignUp(false); }}
              >
                Faculty
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {role === 'student' && isSignUp && (
                <>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <input
                  type="email"
                  placeholder={role === 'faculty' ? "Faculty Email ID" : "Student Email ID"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? 'Processing...' : (role === 'faculty' ? 'LOG IN AS FACULTY' : (isSignUp ? 'SIGN UP' : 'LOG IN'))}
              </button>
            </form>

            {role === 'student' && (
              <div className="auth-toggle-text">
                {isSignUp ? (
                  <p>
                    Already have an account? <span onClick={() => setIsSignUp(false)}>Sign In</span>
                  </p>
                ) : (
                  <p>
                    Don't have an account yet? <span onClick={() => setIsSignUp(true)}>Sign Up</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
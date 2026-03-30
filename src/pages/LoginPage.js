import React, { useState, useEffect } from 'react';
import { COLORS, CONSTANTS } from '../constants';
import logo from '../icons/logo.png';

const LoginPage = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= CONSTANTS.BREAKPOINT);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= CONSTANTS.BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.isAdmin);
      } else {
        setError(data.message || '비밀번호가 일치하지 않습니다.');
        setPassword('');
      }
    } catch {
      setError('서버 연결에 실패했습니다.');
    }
    setLoading(false);
  };

  const form = (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        autoFocus
        style={{ width: '100%', padding: '13px 14px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '16px', outline: 'none', boxSizing: 'border-box', color: COLORS.gray900, backgroundColor: isDesktop ? COLORS.gray50 : COLORS.white }}
      />
      {error && (
        <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{ padding: '13px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', color: COLORS.white, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: COLORS.gray50, fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '320px', padding: '0 24px' }}>
          <div style={{ backgroundColor: COLORS.white, borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: '36px 28px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <img src={logo} alt="헤어샵" style={{ width: '100%', maxWidth: '260px' }} />
            </div>
            {form}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh', backgroundColor: COLORS.white, fontFamily: 'Apple SD Gothic Neo, sans-serif', padding: '0 28px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <img src={logo} alt="헤어샵" style={{ width: '100%', maxWidth: '280px' }} />
      </div>
      {form}
    </div>
  );
};

export default LoginPage;

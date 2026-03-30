import React, { useState, useEffect } from 'react';
import { CONSTANTS, COLORS } from './constants';
import { FileText, Scissors, Users, BarChart3, SettingsIcon, Menu } from './icons/Icons';
import logo from './icons/logo.png';
import LoginPage from './pages/LoginPage';
import AllHistoryPage from './pages/AllHistoryPage';
import TreatmentListPage from './pages/TreatmentListPage';
import CustomerManagePage from './pages/CustomerManagePage';
import SalesPage from './pages/SalesPage';
import SettingsPage from './pages/SettingsPage';

const TABS = [
  { id: 0, name: '전체내역', Icon: FileText },
  { id: 1, name: '시술표', Icon: Scissors },
  { id: 2, name: '고객관리', Icon: Users },
  { id: 3, name: '매출현황', Icon: BarChart3 },
  { id: 4, name: '설정', Icon: SettingsIcon },
];

const PAGE_COMPONENTS = [AllHistoryPage, TreatmentListPage, CustomerManagePage, SalesPage, SettingsPage];
const N = PAGE_COMPONENTS.length; // 5

const TabApp = ({ isAdmin, onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= CONSTANTS.BREAKPOINT);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [historyFilter, setHistoryFilter] = useState(null);

  const getPageProps = (id) => {
    if (id === 0) return { externalFilter: historyFilter };
    if (id === 3) return { onNavigateToHistory: (f) => { setHistoryFilter(f); setActiveTab(0); } };
    if (id === 4) return { isAdmin, onLogout };
    return {};
  };

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= CONSTANTS.BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleTabClick = (id) => {
    if (id === activeTab) return;
    setActiveTab(id);
  };

  // ─── PC 레이아웃 ───────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: COLORS.white, fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>

        {/* 사이드바 */}
        <div style={{ width: sidebarExpanded ? CONSTANTS.SIDEBAR_WIDTH.expanded : CONSTANTS.SIDEBAR_WIDTH.collapsed, backgroundColor: COLORS.gray50, borderRight: `1px solid ${COLORS.gray200}`, display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '16px 24px' }}>
            <button
              onClick={() => setSidebarExpanded(v => !v)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', background: 'none', border: 'none', color: COLORS.gray500, cursor: 'pointer', padding: 0 }}
            >
              <Menu size={20} />
            </button>
          </div>
          <nav style={{ padding: '4px 0' }}>
            {TABS.map(({ id, name, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button key={id} onClick={() => handleTabClick(id)}
                  style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '11px 24px', margin: '1px 0', backgroundColor: isActive ? COLORS.primaryLight : 'transparent', color: isActive ? COLORS.primaryDark : COLORS.gray500, border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: isActive ? '600' : '400', textAlign: 'left', outline: 'none', userSelect: 'none', transition: 'background-color 0.15s, color 0.15s' }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = COLORS.gray100; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ display: 'flex', flexShrink: 0 }}><Icon size={20} /></span>
                  <span style={{ marginLeft: '16px', whiteSpace: 'nowrap', opacity: sidebarExpanded ? 1 : 0, width: sidebarExpanded ? 'auto' : 0, overflow: 'hidden', transition: `opacity ${CONSTANTS.ANIMATION_DURATION} ease` }}>
                    {name}
                  </span>
                </button>
              );
            })}
          </nav>
          <div style={{ marginTop: 'auto', opacity: sidebarExpanded ? 1 : 0, transition: `opacity ${CONSTANTS.ANIMATION_DURATION} ease`, display: 'flex', justifyContent: 'center', padding: '16px 24px 32px' }}>
            <img src={logo} alt="이미란 헤어샵" style={{ width: '100%', maxWidth: '160px', display: 'block', opacity: 0.3 }} />
          </div>
        </div>

        {/* 콘텐츠: 세로로 N개 페이지 배치, translateY로 이동 */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: `${N * 100}%`,
            width: '100%',
            transform: `translateY(-${activeTab * (100 / N)}%)`,
            transition: `transform ${CONSTANTS.ANIMATION_DURATION} ${CONSTANTS.ANIMATION_EASING}`,
          }}>
            {PAGE_COMPONENTS.map((Page, id) => (
              <div key={id} style={{ height: `${100 / N}%`, width: '100%', flexShrink: 0, overflow: 'hidden' }}>
                <Page {...getPageProps(id)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── 모바일 레이아웃 ────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: COLORS.white, fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>

      {/* 콘텐츠: 가로로 N개 페이지 배치, translateX로 이동 */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0, position: 'relative' }}>
        <div style={{
          display: 'flex',
          width: `${N * 100}%`,
          height: '100%',
          transform: `translateX(-${activeTab * (100 / N)}%)`,
          transition: `transform ${CONSTANTS.ANIMATION_DURATION} ${CONSTANTS.ANIMATION_EASING}`,
        }}>
          {PAGE_COMPONENTS.map((Page, id) => (
            <div key={id} style={{ width: `${100 / N}%`, height: '100%', flexShrink: 0, overflow: 'hidden' }}>
              <Page {...getPageProps(id)} />
            </div>
          ))}
        </div>
      </div>

      {/* 하단 탭바 */}
      <div style={{ flexShrink: 0, backgroundColor: COLORS.white, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, height: '2px', backgroundColor: COLORS.primary, width: '12%', left: `${activeTab * 20 + 4}%`, transition: `left ${CONSTANTS.ANIMATION_DURATION} ${CONSTANTS.ANIMATION_EASING}` }} />
        <div style={{ display: 'flex', borderTop: `1px solid ${COLORS.gray100}` }}>
          {TABS.map(({ id, name, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => handleTabClick(id)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px 36px', color: isActive ? COLORS.primary : COLORS.gray400, backgroundColor: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', cursor: 'pointer', gap: '3px', transition: 'color 0.15s' }}
              >
                <Icon size={22} />
                <span style={{ fontSize: '11px', fontWeight: isActive ? '600' : '400' }}>{name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [auth, setAuth] = useState(() => {
    try {
      const s = sessionStorage.getItem('hairshop_auth');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const handleLogin = (isAdmin) => {
    const authData = { isAdmin };
    sessionStorage.setItem('hairshop_auth', JSON.stringify(authData));
    setAuth(authData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hairshop_auth');
    setAuth(null);
  };

  if (!auth) return <LoginPage onLogin={handleLogin} />;
  return <TabApp isAdmin={auth.isAdmin} onLogout={handleLogout} />;
};

export default App;

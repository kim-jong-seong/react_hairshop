import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CONSTANTS, COLORS } from './constants';
import { FileText, Scissors, Users, BarChart3, SettingsIcon, Menu } from './icons/Icons';
import logo from './icons/logo.png';
import LoginPage from './pages/LoginPage';
import AllHistoryPage from './pages/AllHistoryPage';
import TreatmentListPage from './pages/TreatmentListPage';
import CustomerManagePage from './pages/CustomerManagePage';
import SalesPage from './pages/SalesPage';
import SettingsPage from './pages/SettingsPage';

const MemoAllHistoryPage = React.memo(AllHistoryPage);
const MemoTreatmentListPage = React.memo(TreatmentListPage);
const MemoCustomerManagePage = React.memo(CustomerManagePage);
const MemoSalesPage = React.memo(SalesPage);
const MemoSettingsPage = React.memo(SettingsPage);

const TABS = [
  { id: 0, name: '전체내역', Icon: FileText },
  { id: 1, name: '시술표', Icon: Scissors },
  { id: 2, name: '고객관리', Icon: Users },
  { id: 3, name: '매출현황', Icon: BarChart3 },
  { id: 4, name: '설정', Icon: SettingsIcon },
];

const PAGE_COMPONENTS = [MemoAllHistoryPage, MemoTreatmentListPage, MemoCustomerManagePage, MemoSalesPage, MemoSettingsPage];
const N = PAGE_COMPONENTS.length; // 5

const TabApp = ({ isAdmin, onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= CONSTANTS.BREAKPOINT);
  const [sidebarIconOnly, setSidebarIconOnly] = useState(() => localStorage.getItem('sidebarIconOnly') === 'true');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [historyFilter, setHistoryFilter] = useState(null);

  const onNavigateToHistory = useCallback((f) => {
    setHistoryFilter(f);
    setActiveTab(0);
  }, []);

  const handleToggleSidebarIconOnly = useCallback((val) => {
    setSidebarIconOnly(val);
    localStorage.setItem('sidebarIconOnly', val ? 'true' : 'false');
    if (val) setSidebarExpanded(false);
  }, []);

  const pageProps = useMemo(() => [
    { externalFilter: historyFilter, isActive: activeTab === 0 },
    { isActive: activeTab === 1 },
    { isActive: activeTab === 2 },
    { onNavigateToHistory },
    { isAdmin, onLogout, isDesktop, sidebarIconOnly, onToggleSidebarIconOnly: handleToggleSidebarIconOnly },
  ], [historyFilter, activeTab, onNavigateToHistory, isAdmin, onLogout, isDesktop, sidebarIconOnly, handleToggleSidebarIconOnly]);

  const getPageProps = (id) => pageProps[id] ?? {};

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
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: COLORS.white, fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>

        {/* 사이드바 */}
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: CONSTANTS.SIDEBAR_WIDTH.expanded, backgroundColor: COLORS.gray50, borderRight: `1px solid ${COLORS.gray200}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10, clipPath: (sidebarIconOnly && !sidebarExpanded) ? 'inset(0 168px 0 0)' : 'inset(0 0 0 0)', transition: 'clip-path 0.2s ease' }}>
          {sidebarIconOnly && (
            <div style={{ padding: '16px 24px' }}>
              <button
                onClick={() => setSidebarExpanded(v => !v)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', background: 'none', border: 'none', color: COLORS.gray500, cursor: 'pointer', padding: 0 }}
              >
                <Menu size={20} />
              </button>
            </div>
          )}
          <nav style={{ padding: sidebarIconOnly ? '4px 0' : '16px 0 4px' }}>
            {TABS.map(({ id, name, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button key={id} onClick={() => handleTabClick(id)}
                  style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '11px 24px', margin: '1px 0', backgroundColor: isActive ? COLORS.primaryLight : 'transparent', color: isActive ? COLORS.primaryDark : COLORS.gray500, border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: isActive ? '600' : '400', textAlign: 'left', outline: 'none', userSelect: 'none', transition: 'background-color 0.15s, color 0.15s' }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = COLORS.gray100; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ display: 'flex', flexShrink: 0 }}><Icon size={20} /></span>
                  <span style={{ marginLeft: '16px', whiteSpace: 'nowrap', opacity: (sidebarIconOnly && !sidebarExpanded) ? 0 : 1, transition: `opacity ${CONSTANTS.ANIMATION_DURATION} ease` }}>
                    {name}
                  </span>
                </button>
              );
            })}
          </nav>
          <div style={{ marginTop: 'auto', opacity: (sidebarIconOnly && !sidebarExpanded) ? 0 : 1, transition: `opacity ${CONSTANTS.ANIMATION_DURATION} ease`, display: 'flex', justifyContent: 'center', padding: '16px 24px 32px' }}>
            <img src={logo} alt="이미란 헤어샵" style={{ width: '100%', maxWidth: '160px', display: 'block', opacity: 0.3 }} />
          </div>
        </div>

        {/* 콘텐츠: 세로로 N개 페이지 배치, translateY로 이동 */}
        <div style={{ position: 'absolute', top: 0, left: sidebarIconOnly ? '72px' : CONSTANTS.SIDEBAR_WIDTH.expanded, right: 0, bottom: 0, overflow: 'hidden', transition: 'left 0.3s ease' }}>
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

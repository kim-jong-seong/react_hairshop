import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';
import { Download, Database, Code, LogOut } from '../icons/Icons';
import BottomSheet, { Label, TextInput } from '../components/BottomSheet';
import { api, downloadFile } from '../api';

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{ width: '48px', height: '28px', backgroundColor: value ? COLORS.primary : COLORS.gray300, borderRadius: '14px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s', flexShrink: 0 }}
  >
    <div style={{ width: '22px', height: '22px', backgroundColor: COLORS.white, borderRadius: '50%', position: 'absolute', top: '3px', left: value ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
  </button>
);

const SectionHeader = ({ title }) => (
  <div style={{ padding: '14px 16px 8px', backgroundColor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray100}` }}>
    <span style={{ fontSize: '12px', fontWeight: '600', color: COLORS.gray400, letterSpacing: '0.04em' }}>{title}</span>
  </div>
);

const SettingRow = ({ label, children, noBorder }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: COLORS.white, borderBottom: noBorder ? 'none' : `1px solid ${COLORS.gray100}`, gap: '12px' }}>
    <span style={{ fontSize: '15px', color: COLORS.gray900 }}>{label}</span>
    {children}
  </div>
);

const ActionRow = ({ icon, label, onClick, noBorder, danger }) => (
  <button
    onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '14px 16px', backgroundColor: COLORS.white, border: 'none', borderBottom: noBorder ? 'none' : `1px solid ${COLORS.gray100}`, cursor: 'pointer', gap: '12px', textAlign: 'left' }}
  >
    <span style={{ display: 'flex', color: danger ? '#ef4444' : COLORS.gray500 }}>{icon}</span>
    <span style={{ fontSize: '15px', color: danger ? '#ef4444' : COLORS.gray900 }}>{label}</span>
  </button>
);

const SelectInput = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{ padding: '8px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '8px', fontSize: '14px', color: COLORS.gray700, backgroundColor: COLORS.white, outline: 'none', cursor: 'pointer' }}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// SQL 실행 시트
const SqlSheet = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (!open) return;
    setSelectedTable(null);
    setColumns([]);
    api.post('/api/admin/execute-sql', { query: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name" })
      .then(res => setTables(res.results?.map(r => r.name) || []))
      .catch(() => {});
  }, [open]);

  const clickTimer = React.useRef(null);
  const textareaRef = React.useRef(null);
  const cursorPosRef = React.useRef(null);

  useEffect(() => {
    if (cursorPosRef.current !== null && textareaRef.current) {
      textareaRef.current.setSelectionRange(cursorPosRef.current, cursorPosRef.current);
      cursorPosRef.current = null;
    }
  }, [query]);

  const insertAtCursor = (text) => {
    const el = textareaRef.current;
    if (!el) { setQuery(q => q + text); return; }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newQuery = query.slice(0, start) + text + query.slice(end);
    cursorPosRef.current = start + text.length;
    setQuery(newQuery);
    el.focus();
  };

  const handleTableClick = (t) => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null; return; }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      insertAtCursor(t);
    }, 250);
  };

  const handleTableDblClick = (t) => {
    if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null; }
    if (selectedTable === t) { setSelectedTable(null); setColumns([]); return; }
    setSelectedTable(t);
    api.post('/api/admin/execute-sql', { query: `PRAGMA table_info(${t})` })
      .then(res => setColumns(res.results?.map(r => r.name) || []))
      .catch(() => {});
  };

  const handleRun = async () => {
    if (!query.trim()) return;
    setRunning(true);
    setResult(null);
    setError('');
    try {
      const res = await api.post('/api/admin/execute-sql', { query });
      if (res.error) setError(res.error);
      else setResult(res);
    } catch (e) { setError('실행 중 오류가 발생했습니다.'); }
    setRunning(false);
  };

  const handleClose = () => { setQuery(''); setResult(null); setError(''); onClose(); };

  return (
    <BottomSheet open={open} onClose={handleClose} title="SQL 직접 실행" maxHeight="85vh">
      <div style={{ padding: '0 20px 60px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {tables.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '4px', borderBottom: columns.length > 0 ? `1px solid ${COLORS.gray200}` : 'none' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: COLORS.gray400, letterSpacing: '0.04em', marginBottom: '6px' }}>테이블</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tables.map(t => (
                  <span key={t} onClick={() => handleTableClick(t)} onDoubleClick={() => handleTableDblClick(t)}
                    style={{ fontSize: '12px', fontFamily: 'monospace', color: selectedTable === t ? COLORS.primary : COLORS.gray500, backgroundColor: selectedTable === t ? COLORS.primaryLight : COLORS.gray100, padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', userSelect: 'none' }}>{t}</span>
                ))}
              </div>
            </div>
            {columns.length > 0 && (
              <div style={{ borderTop: `1px solid ${COLORS.gray100}`, paddingTop: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: COLORS.gray400, letterSpacing: '0.04em', marginBottom: '6px' }}>{selectedTable} 컬럼</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {columns.map(c => (
                    <span key={c} onClick={() => insertAtCursor(c)}
                      style={{ fontSize: '12px', fontFamily: 'monospace', color: COLORS.gray500, backgroundColor: COLORS.white, border: `1px solid ${COLORS.gray200}`, padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', userSelect: 'none' }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div>
          <Label text="SQL 쿼리" />
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM history LIMIT 10"
            rows={5}
            style={{ width: '100%', padding: '11px 12px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '13px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', resize: 'vertical', color: COLORS.gray900, backgroundColor: COLORS.white }}
          />
        </div>
        <button onClick={handleRun} disabled={running}
          style={{ padding: '13px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', color: COLORS.white, cursor: running ? 'not-allowed' : 'pointer', opacity: running ? 0.7 : 1 }}>
          {running ? '실행 중...' : '실행'}
        </button>
        {error && <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#dc2626', fontFamily: 'monospace', wordBreak: 'break-all' }}>{error}</div>}
        {result && (
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '320px', paddingBottom: '16px' }}>
            {result.isSelect && result.results?.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr>{Object.keys(result.results[0]).map(k => <th key={k} style={{ padding: '8px', backgroundColor: COLORS.gray50, border: `1px solid ${COLORS.gray200}`, textAlign: 'left', fontWeight: '600', color: COLORS.gray700 }}>{k}</th>)}</tr>
                </thead>
                <tbody>
                  {result.results.map((row, i) => (
                    <tr key={i}>{Object.values(row).map((v, j) => <td key={j} style={{ padding: '8px', border: `1px solid ${COLORS.gray200}`, color: COLORS.gray900, whiteSpace: 'nowrap' }}>{String(v ?? '')}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '13px', color: '#16a34a' }}>
                {result.message || `실행 완료 (영향 행: ${result.changes ?? 0})`}
              </div>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

const SettingsPage = ({ isAdmin, onLogout }) => {
  const [autoBackup, setAutoBackup] = useState(false);
  const [backupInterval, setBackupInterval] = useState('weekly');
  const [backupDay, setBackupDay] = useState('sunday');
  const [backupTime, setBackupTime] = useState('03:00');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');
  const [isSqlOpen, setIsSqlOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get('/api/backup/settings').then(s => {
      if (!s || s.error) return;
      setAutoBackup(!!s.is_auto_backup);
      setBackupInterval(s.backup_interval || 'weekly');
      setBackupDay(s.backup_day || 'sunday');
      setBackupTime(s.backup_time || '03:00');
      setEmail(s.backup_email || '');
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const saveSettings = async (overrides = {}) => {
    setSaving(true);
    await api.put('/api/backup/settings', {
      is_auto_backup: overrides.autoBackup !== undefined ? (overrides.autoBackup ? 1 : 0) : (autoBackup ? 1 : 0),
      backup_interval: overrides.backupInterval || backupInterval,
      backup_time: overrides.backupTime || backupTime,
      backup_day: overrides.backupDay || backupDay,
      backup_email: overrides.email !== undefined ? overrides.email : email,
    });
    setSaving(false);
  };

  const handleToggleAutoBackup = (val) => { setAutoBackup(val); saveSettings({ autoBackup: val }); };
  const handleIntervalChange = (val) => { setBackupInterval(val); saveSettings({ backupInterval: val }); };
  const handleDayChange = (val) => { setBackupDay(val); saveSettings({ backupDay: val }); };
  const handleTimeChange = (val) => { setBackupTime(val); saveSettings({ backupTime: val }); };
  const handleEmailBlur = () => { saveSettings({ email }); };

  const handleBackupNow = async () => {
    setBackupMsg('');
    try {
      const res = await api.post('/api/backup/run', {});
      setBackupMsg(res.message || '백업이 시작되었습니다.');
    } catch (e) { setBackupMsg('백업 실행 중 오류가 발생했습니다.'); }
  };

  const handleDbDownload = () => downloadFile('/api/database/download', 'hairshop_database.db');
  const handleCsvExport = () => downloadFile('/api/export/csv', 'hairshop_export.zip');

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.gray50, display: 'flex', flexDirection: 'column', fontFamily: 'Apple SD Gothic Neo, sans-serif', overflowY: 'auto' }}>

      {/* 데이터 관리 */}
      <div style={{ marginTop: '8px' }}>
        <SectionHeader title="데이터 관리" />
        <ActionRow icon={<Database size={18} />} label="데이터베이스 다운로드" onClick={handleDbDownload} />
        <ActionRow icon={<Download size={18} />} label="CSV 내보내기" onClick={handleCsvExport} noBorder />
      </div>

      {/* 관리자 */}
      {isAdmin && (
        <div style={{ marginTop: '8px' }}>
          <SectionHeader title="관리자" />
          <ActionRow icon={<Code size={18} />} label="SQL 직접 실행" onClick={() => setIsSqlOpen(true)} noBorder />
        </div>
      )}

      {/* 계정 */}
      <div style={{ marginTop: '8px' }}>
        <SectionHeader title="계정" />
        <ActionRow icon={<LogOut size={18} />} label="로그아웃" onClick={() => { if (window.confirm('로그아웃 하시겠습니까?')) onLogout(); }} noBorder danger />
      </div>

      {/* 버전 표기 — 배포 시 버전 번호 함께 변경 */}
      <div style={{ marginTop: '8px' }}>
        <SectionHeader title="정보" />
        <SettingRow label="버전" noBorder>
          <span style={{ fontSize: '14px', color: COLORS.gray400 }}>2.0</span>
        </SettingRow>
      </div>

      <div style={{ height: '32px' }} />

      <SqlSheet open={isSqlOpen} onClose={() => setIsSqlOpen(false)} />
    </div>
  );
};

export default SettingsPage;

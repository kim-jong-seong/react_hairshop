import React, { useState, useEffect, useCallback } from 'react';
import { COLORS } from '../constants';
import { api } from '../api';

const VIEW_TYPES = [
  { key: 'day', label: '일별' },
  { key: 'month', label: '월별' },
  { key: 'year', label: '연별' },
];

const todayStr = () => new Date().toISOString().slice(0, 10);
const firstOfMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};


const computeHistoryFilter = (viewType, period) => {
  const today = new Date().toISOString().slice(0, 10);
  if (viewType === 'day') {
    return { term: '', from: period, to: period, gender: '' };
  }
  if (viewType === 'month') {
    // ISO 형식("2026-03") 또는 한국 형식("2026년 03월") 모두 처리
    let y, m;
    if (period.includes('-')) {
      [y, m] = period.split('-').map(Number);
    } else {
      const match = period.match(/(\d{4})년\s*(\d{2})월/);
      [y, m] = [Number(match[1]), Number(match[2])];
    }
    const from = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDate = new Date(y, m, 0).getDate();
    const lastDayStr = `${y}-${String(m).padStart(2, '0')}-${String(lastDate).padStart(2, '0')}`;
    return { term: '', from, to: today < lastDayStr ? today : lastDayStr, gender: '' };
  }
  // year — ISO 형식("2026") 또는 한국 형식("2026년") 모두 처리
  const y = period.replace('년', '').trim();
  const from = `${y}-01-01`;
  const lastDayStr = `${y}-12-31`;
  return { term: '', from, to: today < lastDayStr ? today : lastDayStr, gender: '' };
};

const SalesPage = ({ onNavigateToHistory }) => {
  const [viewType, setViewType] = useState('day');
  const [dateFrom, setDateFrom] = useState(firstOfMonthStr());
  const [dateTo, setDateTo] = useState(todayStr());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (vt, from, to) => {
    setLoading(true);
    try {
      const result = await api.get(`/api/sales?viewType=${vt}&startDate=${from}&endDate=${to}`);
      setData(Array.isArray(result) ? result : []);
    } catch (e) { setData([]); } finally { setLoading(false); }
  }, []);

  // 첫 로드 및 뷰타입 변경 시만 자동 조회
  useEffect(() => { load(viewType, dateFrom, dateTo); }, [viewType]);

  const handleSearch = () => load(viewType, dateFrom, dateTo);

  const totalAmount = data.reduce((s, r) => s + (r.total || 0), 0);
  const totalCount = data.reduce((s, r) => s + (r.count || 0), 0);

  const formatPeriod = (period) => {
    if (viewType === 'day') {
      const d = new Date(period);
      const day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
      return { main: period.replace(/-/g, '.'), sub: day };
    }
    if (viewType === 'month') {
      if (period.includes('-')) {
        const [y, m] = period.split('-');
        return { main: `${y}년 ${m}월`, sub: null };
      }
      return { main: period, sub: null };
    }
    if (period.includes('년')) return { main: period, sub: null };
    return { main: `${period}년`, sub: null };
  };

  const getDayColor = (period) => {
    if (viewType !== 'day') return COLORS.gray900;
    const day = new Date(period).getDay();
    if (day === 0) return '#ef4444';
    if (day === 6) return '#3b82f6';
    return COLORS.gray900;
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.white, display: 'flex', flexDirection: 'column', fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>

      {/* 기간 토글 */}
      <div style={{ flexShrink: 0, padding: '12px 16px', backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.gray100}` }}>
        <div style={{ display: 'flex', backgroundColor: COLORS.gray100, borderRadius: '10px', padding: '3px' }}>
          {VIEW_TYPES.map(v => (
            <button key={v.key} onClick={() => setViewType(v.key)}
              style={{ flex: 1, padding: '8px', fontSize: '14px', fontWeight: viewType === v.key ? '600' : '400', color: viewType === v.key ? COLORS.gray900 : COLORS.gray500, backgroundColor: viewType === v.key ? COLORS.white : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', boxShadow: viewType === v.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* 날짜 필터 + 조회 버튼 */}
      <div style={{ flexShrink: 0, padding: '10px 16px', backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.gray100}`, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '8px', fontSize: '13px', outline: 'none', color: COLORS.gray700, boxSizing: 'border-box' }} />
        <span style={{ fontSize: '13px', color: COLORS.gray400 }}>~</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '8px', fontSize: '13px', outline: 'none', color: COLORS.gray700, boxSizing: 'border-box' }} />
        <button onClick={handleSearch}
          style={{ padding: '8px 14px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: COLORS.white, cursor: 'pointer', flexShrink: 0 }}>
          조회
        </button>
      </div>

      {/* 합계 카드 */}
      <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${COLORS.gray100}` }}>
        <div style={{ padding: '16px', borderRight: `1px solid ${COLORS.gray100}` }}>
          <div style={{ fontSize: '12px', color: COLORS.gray400, fontWeight: '500', marginBottom: '6px' }}>총 매출</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: COLORS.gray900, letterSpacing: '-0.03em' }}>
            {loading ? '-' : totalAmount.toLocaleString()}<span style={{ fontSize: '13px', fontWeight: '500', color: COLORS.gray500, marginLeft: '2px' }}>원</span>
          </div>
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: COLORS.gray400, fontWeight: '500', marginBottom: '6px' }}>총 건수</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: COLORS.gray900, letterSpacing: '-0.03em' }}>
            {loading ? '-' : totalCount}<span style={{ fontSize: '13px', fontWeight: '500', color: COLORS.gray500, marginLeft: '2px' }}>건</span>
          </div>
        </div>
      </div>

      {/* 데이터 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', color: COLORS.gray400, fontSize: '14px' }}>불러오는 중...</div>
        ) : data.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', color: COLORS.gray400, fontSize: '14px' }}>데이터가 없습니다</div>
        ) : (
          data.map(row => {
            const { main, sub } = formatPeriod(row.period);
            const dayColor = getDayColor(row.period);
            return (
              <div key={row.period} onClick={() => onNavigateToHistory && onNavigateToHistory(computeHistoryFilter(viewType, row.period))} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${COLORS.gray100}`, cursor: onNavigateToHistory ? 'pointer' : 'default' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: dayColor }}>{main}</span>
                  {sub && <span style={{ fontSize: '13px', color: dayColor, marginLeft: '6px', opacity: 0.8 }}>{sub}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: COLORS.gray400 }}>{row.count}건</span>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: COLORS.gray900, letterSpacing: '-0.02em', minWidth: '80px', textAlign: 'right' }}>{(row.total || 0).toLocaleString()}원</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SalesPage;

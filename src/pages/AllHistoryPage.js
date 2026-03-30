import React, { useState, useEffect, useCallback } from 'react';
import { COLORS } from '../constants';
import { Calendar, User, Scissors, Phone, Memo, Search, Plus, ChevronRight, Eye, EyeOff } from '../icons/Icons';
import BottomSheet, { Label, TextInput, GenderToggle } from '../components/BottomSheet';
import { api, parseDate, todayStr, nowTimeStr, fmtAmountInput, parseAmount } from '../api';

const ICON_COLOR = '#9ca3af';

const IconRow = ({ icon, children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
    <span style={{ display: 'flex', alignItems: 'center', color: ICON_COLOR, flexShrink: 0, paddingTop: '1px' }}>{icon}</span>
    {children}
  </div>
);

// ── 검색 시트 ─────────────────────────────────────────────────
const isOverOneMonth = (from, to) => {
  if (!from || !to) return false;
  const f = new Date(from), t = new Date(to);
  const monthDiff = (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth());
  return monthDiff >= 1 && t.getDate() >= f.getDate();
};

const SearchSheet = ({ open, onClose, filters, setFilters, onSearch, onReset }) => {
  const longRange = isOverOneMonth(filters.from, filters.to);
  return (
    <BottomSheet open={open} onClose={onClose} title="검색">
      <div style={{ padding: '0 20px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <Label text="통합 검색" />
          <TextInput value={filters.term} onChange={(e) => setFilters(f => ({ ...f, term: e.target.value }))} placeholder="고객명, 시술명, 전화번호" />
        </div>
        <div>
          <Label text="날짜 범위" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="date" value={filters.from} onChange={(e) => setFilters(f => ({ ...f, from: e.target.value }))}
              style={{ padding: '11px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', color: COLORS.gray900, boxSizing: 'border-box', width: '100%' }} />
            <input type="date" value={filters.to} onChange={(e) => setFilters(f => ({ ...f, to: e.target.value }))}
              style={{ padding: '11px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', color: COLORS.gray900, boxSizing: 'border-box', width: '100%' }} />
          </div>
          {longRange && (
            <div style={{ marginTop: '8px', padding: '10px 12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
              날짜 범위가 넓을 경우 과부하로 인해 전체적인 동작이 느려질 수 있습니다.
            </div>
          )}
        </div>
        <div>
          <Label text="성별" />
          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ v: '', label: '전체' }, { v: '남', label: '남' }, { v: '여', label: '여' }].map(({ v, label }) => (
              <button key={v} onClick={() => setFilters(f => ({ ...f, gender: v }))}
                style={{ flex: 1, padding: '10px', border: `1px solid ${filters.gender === v ? COLORS.primary : COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', fontWeight: filters.gender === v ? '600' : '400', color: filters.gender === v ? COLORS.primary : COLORS.gray700, backgroundColor: filters.gender === v ? COLORS.primaryLight : COLORS.white, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onReset} style={{ flex: 1, padding: '13px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '15px', fontWeight: '500', color: COLORS.gray700, backgroundColor: COLORS.white, cursor: 'pointer' }}>초기화</button>
          <button onClick={onSearch} style={{ flex: 2, padding: '13px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', color: COLORS.white, cursor: 'pointer' }}>검색</button>
        </div>
      </div>
    </BottomSheet>
  );
};

// ── 고객 선택 컴포넌트 ────────────────────────────────────────
const CustomerSelector = ({ customers, selectedId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = customers.find(c => c.id === selectedId);
  const filtered = customers.filter(c => !search || (c.name || '').includes(search) || (c.phone || '').includes(search));

  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '11px 14px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', backgroundColor: COLORS.white, cursor: 'pointer', boxSizing: 'border-box' }}>
        <span style={{ flex: 1, fontSize: '15px', color: selectedId ? COLORS.gray900 : COLORS.gray400, textAlign: 'left' }}>
          {selected ? `${selected.name}${selected.gender ? `  ·  ${selected.gender}` : ''}` : '고객 선택'}
        </span>
        <span style={{ color: COLORS.gray400, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}><ChevronRight size={16} /></span>
      </button>
      <div style={{ maxHeight: open ? '300px' : 0, opacity: open ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease, opacity 0.2s ease', marginTop: open ? '6px' : 0 }}>
        <div style={{ border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '8px 10px', borderBottom: `1px solid ${COLORS.gray100}` }}>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름 또는 전화번호 검색"
              style={{ width: '100%', padding: '8px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: COLORS.gray900 }} />
          </div>
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '14px', textAlign: 'center', fontSize: '14px', color: COLORS.gray400 }}>검색 결과 없음</div>
            ) : filtered.map(c => (
              <button key={c.id} onClick={() => { onSelect(c); setOpen(false); setSearch(''); }}
                style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '11px 14px', backgroundColor: selectedId === c.id ? COLORS.primaryLight : COLORS.white, border: 'none', borderBottom: `1px solid ${COLORS.gray100}`, cursor: 'pointer', boxSizing: 'border-box' }}>
                <span style={{ flex: 1, fontSize: '14px', fontWeight: selectedId === c.id ? '600' : '400', color: selectedId === c.id ? COLORS.primaryDark : COLORS.gray900, textAlign: 'left' }}>{c.name}</span>
                {c.gender && <span style={{ fontSize: '12px', color: COLORS.gray400, marginRight: selectedId === c.id ? '8px' : '0' }}>{c.gender}</span>}
                {selectedId === c.id && <span style={{ fontSize: '14px', color: COLORS.primary, fontWeight: '700' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 추가 시트 ─────────────────────────────────────────────────
const AddSheet = ({ open, onClose, onSubmit, services, customers }) => {
  const [form, setForm] = useState({ date: todayStr(), time: nowTimeStr(), selectedCustomerId: null, treatmentMode: 'select', selectedServiceId: null, directName: '', amount: '', memo: '' });
  const [isServiceListOpen, setIsServiceListOpen] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedService = services.find(s => s.id === form.selectedServiceId);
  const favs = services.filter(s => s.is_favorite);
  const others = services.filter(s => !s.is_favorite);

  const handleServiceSelect = (svc) => { set('selectedServiceId', svc.id); set('amount', svc.price.toLocaleString()); setIsServiceListOpen(false); };

  const handleSubmit = async () => {
    const isDirect = form.treatmentMode === 'direct';
    const name = isDirect ? form.directName : (selectedService?.name || '');
    if (!form.selectedCustomerId || !name || !form.amount) return;
    const created_at = `${form.date}T${form.time}`;
    await onSubmit({ customer_id: form.selectedCustomerId, service_id: isDirect ? 999 : (form.selectedServiceId || 999), amount: parseAmount(form.amount), memo: form.memo || '', created_at, modified_service_name: isDirect ? form.directName : '' });
    setForm({ date: todayStr(), time: nowTimeStr(), selectedCustomerId: null, treatmentMode: 'select', selectedServiceId: null, directName: '', amount: '', memo: '' });
    setIsServiceListOpen(false);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="시술 기록 추가">
      <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><Label text="날짜" />
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} style={{ width: '100%', padding: '11px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: COLORS.gray900 }} />
          </div>
          <div><Label text="시간" />
            <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} style={{ width: '100%', padding: '11px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: COLORS.gray900 }} />
          </div>
        </div>
        <div><Label text="고객" /><CustomerSelector customers={customers} selectedId={form.selectedCustomerId} onSelect={(c) => set('selectedCustomerId', c.id)} /></div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Label text="시술" />
            <button onClick={() => { set('treatmentMode', form.treatmentMode === 'select' ? 'direct' : 'select'); set('selectedServiceId', null); set('directName', ''); set('amount', ''); }}
              style={{ fontSize: '13px', color: COLORS.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', padding: 0 }}>
              {form.treatmentMode === 'select' ? '직접 입력' : '목록에서 선택'}
            </button>
          </div>
          {form.treatmentMode === 'direct' ? (
            <TextInput value={form.directName} onChange={(e) => set('directName', e.target.value)} placeholder="시술명 직접 입력" />
          ) : (
            <>
              <button
                onClick={() => setIsServiceListOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '11px 14px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', backgroundColor: COLORS.white, cursor: 'pointer', boxSizing: 'border-box' }}
              >
                <span style={{ flex: 1, fontSize: '15px', color: form.selectedServiceId ? COLORS.gray900 : COLORS.gray400, textAlign: 'left' }}>
                  {selectedService ? selectedService.name : '시술 선택'}
                </span>
                {selectedService && <span style={{ fontSize: '14px', color: COLORS.gray500, marginRight: '8px' }}>{selectedService.price.toLocaleString()}원</span>}
                <span style={{ color: COLORS.gray400, transform: isServiceListOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}>
                  <ChevronRight size={16} />
                </span>
              </button>
              <div style={{ maxHeight: isServiceListOpen ? '300px' : 0, opacity: isServiceListOpen ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease, opacity 0.2s ease' }}>
                <ServiceSelectList favs={favs} others={others} selectedId={form.selectedServiceId} onSelect={handleServiceSelect} />
              </div>
            </>
          )}
        </div>
        <div><Label text="금액 (원)" /><TextInput inputMode="numeric" value={form.amount} onChange={(e) => set('amount', fmtAmountInput(e.target.value))} placeholder="0" /></div>
        <div><Label text="메모" /><TextInput value={form.memo} onChange={(e) => set('memo', e.target.value)} placeholder="특이사항 등 (선택)" /></div>
        <button onClick={handleSubmit} style={{ padding: '14px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', color: COLORS.white, cursor: 'pointer' }}>추가</button>
      </div>
    </BottomSheet>
  );
};

// ── 수정 시트 (더블클릭) ──────────────────────────────────────
const EditSheet = ({ open, onClose, record, onSave, onDelete, services }) => {
  const [form, setForm] = useState({});
  const [isServiceListOpen, setIsServiceListOpen] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (record) {
      const { date, time } = parseDate(record.created_at);
      setForm({
        date, time,
        isDirect: !!record.is_direct_input,
        selectedServiceId: record.is_direct_input ? null : record.service_id,
        directName: record.is_direct_input ? (record.modified_service_name || record.service_name) : '',
        amount: record.amount ? record.amount.toLocaleString() : '',
        memo: record.memo || '',
      });
      setIsServiceListOpen(false);
    }
  }, [record]);

  if (!record) return <BottomSheet open={false} onClose={onClose} title="시술 내역 수정"><div /></BottomSheet>;

  const favs = services.filter(s => s.is_favorite);
  const others = services.filter(s => !s.is_favorite);
  const selectedService = services.find(s => s.id === form.selectedServiceId);

  const handleServiceSelect = (svc) => { set('selectedServiceId', svc.id); set('amount', svc.price.toLocaleString()); };

  const handleSave = async () => {
    const created_at = `${form.date}T${form.time}`;
    const service_id = form.isDirect ? 999 : (form.selectedServiceId || 999);
    const modified_service_name = form.isDirect ? form.directName : '';
    await onSave(record.id, { service_id, amount: parseAmount(form.amount), memo: form.memo, created_at, modified_service_name });
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="시술 내역 수정">
      <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <Label text="고객" />
          <div style={{ padding: '11px 14px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', backgroundColor: COLORS.gray50, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span onClick={() => { if (!record.phone) { alert('등록된 전화번호가 없습니다.'); return; } if (window.confirm(`${record.customer_name}(${record.phone})님에게 전화하시겠습니까?`)) window.location.href = `tel:${record.phone}`; }} style={{ fontSize: '15px', fontWeight: '500', color: COLORS.gray900, cursor: 'pointer' }}>{record.customer_name}</span>
            {record.gender && <span style={{ fontSize: '13px', color: COLORS.gray400 }}>{record.gender}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><Label text="날짜" />
            <input type="date" value={form.date || ''} onChange={(e) => set('date', e.target.value)} style={{ width: '100%', padding: '11px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: COLORS.gray900 }} />
          </div>
          <div><Label text="시간" />
            <input type="time" value={form.time || ''} onChange={(e) => set('time', e.target.value)} style={{ width: '100%', padding: '11px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: COLORS.gray900 }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Label text="시술" />
            <button onClick={() => { set('isDirect', !form.isDirect); set('selectedServiceId', null); set('directName', ''); }}
              style={{ fontSize: '13px', color: COLORS.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', padding: 0 }}>
              {form.isDirect ? '목록에서 선택' : '직접 입력'}
            </button>
          </div>
          {form.isDirect ? (
            <TextInput value={form.directName || ''} onChange={(e) => set('directName', e.target.value)} placeholder="시술명 직접 입력" />
          ) : (
            <>
              <button
                onClick={() => setIsServiceListOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '11px 14px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', backgroundColor: COLORS.white, cursor: 'pointer', boxSizing: 'border-box' }}
              >
                <span style={{ flex: 1, fontSize: '15px', color: form.selectedServiceId ? COLORS.gray900 : COLORS.gray400, textAlign: 'left' }}>
                  {selectedService ? selectedService.name : '시술 선택'}
                </span>
                {selectedService && <span style={{ fontSize: '14px', color: COLORS.gray500, marginRight: '8px' }}>{selectedService.price.toLocaleString()}원</span>}
                <span style={{ color: COLORS.gray400, transform: isServiceListOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}>
                  <ChevronRight size={16} />
                </span>
              </button>
              <div style={{ maxHeight: isServiceListOpen ? '300px' : 0, opacity: isServiceListOpen ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease, opacity 0.2s ease' }}>
                <ServiceSelectList favs={favs} others={others} selectedId={form.selectedServiceId} onSelect={(svc) => { handleServiceSelect(svc); setIsServiceListOpen(false); }} />
              </div>
            </>
          )}
        </div>

        <div><Label text="금액 (원)" /><TextInput inputMode="numeric" value={form.amount || ''} onChange={(e) => set('amount', fmtAmountInput(e.target.value))} placeholder="0" /></div>
        <div><Label text="메모" /><TextInput value={form.memo || ''} onChange={(e) => set('memo', e.target.value)} placeholder="메모" /></div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onDelete(record.id)} style={{ flex: 1, padding: '13px', backgroundColor: COLORS.white, border: '1px solid #fee2e2', borderRadius: '10px', fontSize: '15px', fontWeight: '500', color: '#ef4444', cursor: 'pointer' }}>삭제</button>
          <button onClick={handleSave} style={{ flex: 2, padding: '13px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', color: COLORS.white, cursor: 'pointer' }}>저장</button>
        </div>
      </div>
    </BottomSheet>
  );
};

// ── 서비스 선택 목록 (공통) ───────────────────────────────────
const ServiceSelectList = ({ favs, others, selectedId, onSelect }) => {
  const [search, setSearch] = useState('');
  const filtered = search
    ? [...favs, ...others].filter(s => s.name.includes(search))
    : null;

  return (
    <div style={{ border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '8px 10px', borderBottom: `1px solid ${COLORS.gray100}` }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="시술명 검색"
          style={{ width: '100%', padding: '8px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: COLORS.gray900 }} />
      </div>
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {filtered ? (
          filtered.length === 0
            ? <div style={{ padding: '14px', textAlign: 'center', fontSize: '14px', color: COLORS.gray400 }}>검색 결과 없음</div>
            : filtered.map(svc => <ServiceSelectItem key={svc.id} svc={svc} selected={selectedId === svc.id} onSelect={onSelect} />)
        ) : (
          <>
            {favs.length > 0 && (
              <>
                <div style={{ padding: '7px 14px', backgroundColor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray100}` }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: COLORS.gray400, letterSpacing: '0.04em' }}>즐겨찾기</span>
                </div>
                {favs.map(svc => <ServiceSelectItem key={svc.id} svc={svc} selected={selectedId === svc.id} onSelect={onSelect} />)}
              </>
            )}
            <div style={{ padding: '7px 14px', backgroundColor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray100}`, borderTop: favs.length > 0 ? `1px solid ${COLORS.gray100}` : 'none' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: COLORS.gray400, letterSpacing: '0.04em' }}>전체</span>
            </div>
            {others.map(svc => <ServiceSelectItem key={svc.id} svc={svc} selected={selectedId === svc.id} onSelect={onSelect} />)}
          </>
        )}
      </div>
    </div>
  );
};

const ServiceSelectItem = ({ svc, selected, onSelect }) => (
  <button onClick={() => onSelect(svc)}
    style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 14px', backgroundColor: selected ? COLORS.primaryLight : COLORS.white, border: 'none', borderBottom: `1px solid ${COLORS.gray100}`, cursor: 'pointer', boxSizing: 'border-box' }}>
    <span style={{ flex: 1, fontSize: '14px', fontWeight: selected ? '600' : '400', color: selected ? COLORS.primaryDark : COLORS.gray900, textAlign: 'left' }}>{svc.name}</span>
    <span style={{ fontSize: '14px', color: selected ? COLORS.primaryDark : COLORS.gray500 }}>{svc.price.toLocaleString()}원</span>
    {selected && <span style={{ fontSize: '14px', color: COLORS.primary, fontWeight: '700', marginLeft: '8px' }}>✓</span>}
  </button>
);

// ── 메인 컴포넌트 ─────────────────────────────────────────────
const AllHistoryPage = ({ externalFilter }) => {
  const [history, setHistory] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hideAmount, setHideAmount] = useState(() => localStorage.getItem('hideAmount') === 'true');

  const toggleHideAmount = () => {
    setHideAmount(v => {
      localStorage.setItem('hideAmount', String(!v));
      return !v;
    });
  };

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const openEditSheet = (record) => { setEditRecord(record); setEditSheetOpen(true); };
  const closeEditSheet = () => { setEditSheetOpen(false); setTimeout(() => setEditRecord(null), 300); };

  // 검색 필터 (입력 중) - 기본값: 오늘
  const [filters, setFilters] = useState({ term: '', from: todayStr(), to: todayStr(), gender: '' });
  // 적용된 필터
  const [applied, setApplied] = useState({ term: '', from: todayStr(), to: todayStr(), gender: '' });

  // 모든 필터를 서버에 전달 — 클라이언트 필터링 없음
  const loadHistory = useCallback(async (f) => {
    try {
      const p = new URLSearchParams();
      if (f.from)   p.append('startDate', f.from);
      if (f.to)     p.append('endDate', f.to);
      if (f.term)   p.append('term', f.term);
      if (f.gender) p.append('gender', f.gender);
      const data = await api.get(`/api/history?${p}`);
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const today = { term: '', from: todayStr(), to: todayStr(), gender: '' };
        await Promise.all([
          loadHistory(today),
          api.get('/api/services').then(d => setServices(Array.isArray(d) ? d : [])).catch(() => {}),
          api.get('/api/customers').then(d => setCustomers(Array.isArray(d) ? d : [])).catch(() => {}),
        ]);
      } finally { setLoading(false); }
    };
    init();
  }, [loadHistory]);

  // 매출현황에서 날짜 필터를 전달받으면 즉시 적용
  useEffect(() => {
    if (!externalFilter) return;
    setFilters(externalFilter);
    setApplied(externalFilter);
    setLoading(true);
    loadHistory(externalFilter).finally(() => setLoading(false));
  }, [externalFilter, loadHistory]);

  // 서버에서 이미 필터된 결과 — 클라이언트 필터 없음
  const totalAmount = history.reduce((s, t) => s + (t.amount || 0), 0);

  const handleSearch = () => {
    setApplied({ ...filters });
    setIsSearchOpen(false);
    setLoading(true);
    loadHistory(filters).finally(() => setLoading(false));
  };
  const handleReset = () => {
    const def = { term: '', from: todayStr(), to: todayStr(), gender: '' };
    setFilters(def);
    setApplied(def);
    setLoading(true);
    loadHistory(def).finally(() => setLoading(false));
  };

  // 현재 조회 기간 표시용
  const periodLabel = () => {
    if (applied.from === todayStr() && applied.to === todayStr()) return '오늘';
    if (applied.from === applied.to) return applied.from.replace(/-/g, '.');
    const f = applied.from ? applied.from.replace(/-/g, '.') : '';
    const t = applied.to ? applied.to.replace(/-/g, '.') : '';
    if (f && t) return `${f} ~ ${t}`;
    if (f) return `${f} ~`;
    if (t) return `~ ${t}`;
    return '전체';
  };

  const handleAdd = async ({ customer_id, service_id, amount, memo, created_at, modified_service_name }) => {
    await api.post('/api/history', { customer_id, service_id, amount, memo, created_at, modified_service_name });
    await loadHistory(applied);
    setIsAddOpen(false);
  };

  // 수정
  const handleSave = async (id, body) => {
    await api.put(`/api/history/${id}`, body);
    await loadHistory(applied);
    closeEditSheet();
  };

  // 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('이 시술 내역을 삭제하시겠습니까?')) return;
    await api.delete(`/api/history/${id}`);
    await loadHistory(applied);
    closeEditSheet();
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: COLORS.gray400, fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>불러오는 중...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.white, position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>

      {/* 상단 요약 바 */}
      <div onClick={() => setIsSearchOpen(true)} style={{ flexShrink: 0, padding: '10px 16px', backgroundColor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray100}`, cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: COLORS.gray500 }}>{history.length}건</span>
            <span style={{ fontSize: '12px', color: COLORS.primary, backgroundColor: COLORS.primaryLight, padding: '2px 8px', borderRadius: '999px', fontWeight: '500' }}>{periodLabel()}</span>
          </div>
          {!hideAmount && <span style={{ fontSize: '15px', fontWeight: '600', color: COLORS.gray900 }}>{totalAmount.toLocaleString()}원</span>}
        </div>
      </div>

      {/* 리스트 - 더블클릭으로 수정 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {history.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: COLORS.gray400, fontSize: '15px' }}>내역이 없습니다</div>
        ) : (
          history.map((t, i) => {
            const { date, time } = parseDate(t.created_at);
            return (
              <div key={t.id}>
                <div
                  onClick={() => openEditSheet(t)}
                  style={{ padding: '14px 16px', cursor: 'pointer' }}
                  title="클릭으로 수정"
                >
                  <IconRow icon={<Calendar size={14} />}>
                    <span style={{ fontSize: '13px', color: COLORS.gray500, flex: 1 }}>{date} {time}</span>
                    {!hideAmount && <span style={{ fontSize: '17px', fontWeight: '600', color: COLORS.gray900, letterSpacing: '-0.02em' }}>{(t.amount || 0).toLocaleString()}원</span>}
                  </IconRow>
                  <IconRow icon={<User size={14} />}>
                    <span onClick={(e) => { e.stopPropagation(); if (!t.phone) { alert('등록된 전화번호가 없습니다.'); return; } if (window.confirm(`${t.customer_name}(${t.phone})님에게 전화하시겠습니까?`)) window.location.href = `tel:${t.phone}`; }} style={{ fontSize: '14px', fontWeight: '500', color: COLORS.gray900, cursor: 'pointer' }}>{t.customer_name}</span>
                    {t.gender && <span style={{ fontSize: '13px', color: COLORS.gray400, marginLeft: '6px' }}>{t.gender}</span>}
                  </IconRow>
                  <IconRow icon={<Scissors size={14} />}>
                    <span style={{ fontSize: '14px', color: COLORS.gray700 }}>{t.service_name}</span>
                  </IconRow>
                  {t.phone && (
                    <IconRow icon={<Phone size={14} />}>
                      <span style={{ fontSize: '13px', color: COLORS.gray500 }}>{t.phone}</span>
                    </IconRow>
                  )}
                  {t.memo && (
                    <IconRow icon={<Memo size={14} />}>
                      <span style={{ fontSize: '13px', color: COLORS.gray500, lineHeight: '1.4' }}>{t.memo}</span>
                    </IconRow>
                  )}
                </div>
                {i < history.length - 1 && <div style={{ height: '1px', backgroundColor: COLORS.gray100, margin: '0 16px' }} />}
              </div>
            );
          })
        )}
        <div style={{ height: '80px' }} />
      </div>

      {/* 금액 숨김 FAB */}
      <button onClick={toggleHideAmount} style={{ position: 'absolute', bottom: '148px', right: '20px', width: '52px', height: '52px', backgroundColor: hideAmount ? COLORS.primary : COLORS.gray400, borderRadius: '50%', boxShadow: '0 2px 12px rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 10, color: COLORS.white, opacity: 0.75 }}>
        {hideAmount ? <Eye size={22} /> : <EyeOff size={22} />}
      </button>
      {/* 추가 FAB */}
      <button onClick={() => setIsAddOpen(true)} style={{ position: 'absolute', bottom: '84px', right: '20px', width: '52px', height: '52px', backgroundColor: COLORS.primary, borderRadius: '50%', boxShadow: '0 2px 12px rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 10, color: COLORS.white, opacity: 0.75 }}>
        <Plus size={22} />
      </button>
      {/* 검색 FAB */}
      <button onClick={() => setIsSearchOpen(true)} style={{ position: 'absolute', bottom: '20px', right: '20px', width: '52px', height: '52px', backgroundColor: COLORS.primary, borderRadius: '50%', boxShadow: '0 2px 12px rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 10, color: COLORS.white, opacity: 0.75 }}>
        <Search size={22} />
      </button>

      <SearchSheet open={isSearchOpen} onClose={() => setIsSearchOpen(false)} filters={filters} setFilters={setFilters} onSearch={handleSearch} onReset={handleReset} />
      <AddSheet open={isAddOpen} onClose={() => setIsAddOpen(false)} onSubmit={handleAdd} services={services} customers={customers} />
      <EditSheet open={editSheetOpen} onClose={closeEditSheet} record={editRecord} onSave={handleSave} onDelete={handleDelete} services={services} />
    </div>
  );
};

export default AllHistoryPage;

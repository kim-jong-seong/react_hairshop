import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';
import { Search, Plus, Phone, Memo, ChevronRight, Scissors, Calendar, X } from '../icons/Icons';
import BottomSheet, { Label, TextInput, GenderToggle } from '../components/BottomSheet';
import { api, parseDate, todayStr, nowTimeStr, fmtAmountInput, parseAmount } from '../api';

const GENDER_COLORS = {
  남: { bg: '#eff6ff', text: '#3b82f6' },
  여: { bg: '#fdf2f8', text: '#ec4899' },
};

const Avatar = ({ name, gender, size = 42 }) => {
  const color = gender === '여' ? '#ec4899' : COLORS.primary;
  const bg = gender === '여' ? '#fdf2f8' : COLORS.primaryLight;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.38, fontWeight: '600', color }}>{name ? name[0] : '?'}</span>
    </div>
  );
};

const GenderBadge = ({ gender }) => {
  const c = GENDER_COLORS[gender] || GENDER_COLORS['남'];
  return <span style={{ fontSize: '12px', fontWeight: '500', color: c.text, backgroundColor: c.bg, padding: '2px 7px', borderRadius: '999px' }}>{gender}</span>;
};

// ── 추가 시트 ─────────────────────────────────────────────────
const AddSheet = ({ open, onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', gender: '남', phone: '', memo: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    await onAdd({ ...form, phone: form.phone || '' });
    setForm({ name: '', gender: '남', phone: '', memo: '' });
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="고객 추가">
      <div style={{ overflowY: 'auto', padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div><Label text="이름 *" /><TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="고객 이름" /></div>
        <div><Label text="성별" /><GenderToggle value={form.gender} onChange={(g) => set('gender', g)} /></div>
        <div><Label text="전화번호" /><TextInput type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="010-0000-0000" /></div>
        <div><Label text="메모" /><TextInput value={form.memo} onChange={(e) => set('memo', e.target.value)} placeholder="특이사항 등" /></div>
        <button onClick={handleSubmit} style={{ padding: '13px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', color: COLORS.white, cursor: 'pointer', marginTop: '4px' }}>추가</button>
      </div>
    </BottomSheet>
  );
};

// ── 시술 선택 목록 ────────────────────────────────────────────
const ServiceSelectItem = ({ svc, selected, onSelect }) => (
  <button onClick={() => onSelect(svc)}
    style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 14px', backgroundColor: selected ? COLORS.primaryLight : COLORS.white, border: 'none', borderBottom: `1px solid ${COLORS.gray100}`, cursor: 'pointer', boxSizing: 'border-box' }}>
    <span style={{ flex: 1, fontSize: '14px', fontWeight: selected ? '600' : '400', color: selected ? COLORS.primaryDark : COLORS.gray900, textAlign: 'left' }}>{svc.name}</span>
    <span style={{ fontSize: '14px', color: selected ? COLORS.primaryDark : COLORS.gray500 }}>{svc.price.toLocaleString()}원</span>
    {selected && <span style={{ fontSize: '14px', color: COLORS.primary, fontWeight: '700', marginLeft: '8px' }}>✓</span>}
  </button>
);

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

// ── 시술 기록 추가 시트 (고객관리용) ─────────────────────────
const AddHistorySheet = ({ open, onClose, onSubmit, services, customer }) => {
  const [form, setForm] = useState({ date: todayStr(), time: nowTimeStr(), treatmentMode: 'select', selectedServiceId: null, directName: '', amount: '', memo: '' });
  const [isServiceListOpen, setIsServiceListOpen] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedService = services.find(s => s.id === form.selectedServiceId);
  const favs = services.filter(s => s.is_favorite);
  const others = services.filter(s => !s.is_favorite);

  const handleServiceSelect = (svc) => { set('selectedServiceId', svc.id); set('amount', svc.price.toLocaleString()); setIsServiceListOpen(false); };

  const handleSubmit = async () => {
    const isDirect = form.treatmentMode === 'direct';
    const name = isDirect ? form.directName : (selectedService?.name || '');
    if (!name || !form.amount) return;
    const created_at = `${form.date}T${form.time}`;
    await onSubmit({ service_id: isDirect ? 999 : (form.selectedServiceId || 999), amount: parseAmount(form.amount), memo: form.memo || '', created_at, modified_service_name: isDirect ? form.directName : '' });
    setForm({ date: todayStr(), time: nowTimeStr(), treatmentMode: 'select', selectedServiceId: null, directName: '', amount: '', memo: '' });
    setIsServiceListOpen(false);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="시술 기록 추가" zIndex={1100}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <Label text="고객" />
          <div style={{ padding: '11px 14px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', backgroundColor: COLORS.gray50, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: '500', color: COLORS.gray900 }}>{customer?.name}</span>
            {customer?.gender && <span style={{ fontSize: '13px', color: COLORS.gray400 }}>{customer?.gender}</span>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><Label text="날짜" /><input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} style={{ width: '100%', padding: '11px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: COLORS.gray900 }} /></div>
          <div><Label text="시간" /><input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} style={{ width: '100%', padding: '11px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: COLORS.gray900 }} /></div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Label text="시술" />
            <button onClick={() => { set('treatmentMode', form.treatmentMode === 'select' ? 'direct' : 'select'); set('selectedServiceId', null); set('directName', ''); set('amount', ''); setIsServiceListOpen(false); }}
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

// ── 시술 내역 수정 시트 (고객관리용) ─────────────────────────
const EditHistorySheet = ({ open, onClose, record, onSave, onDelete, services }) => {
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

  if (!record) return <BottomSheet open={false} onClose={onClose} title="시술 내역 수정" zIndex={1100}><div /></BottomSheet>;

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
    <BottomSheet open={open} onClose={onClose} title="시술 내역 수정" zIndex={1100}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><Label text="날짜" /><input type="date" value={form.date || ''} onChange={(e) => set('date', e.target.value)} style={{ width: '100%', padding: '11px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: COLORS.gray900 }} /></div>
          <div><Label text="시간" /><input type="time" value={form.time || ''} onChange={(e) => set('time', e.target.value)} style={{ width: '100%', padding: '11px 10px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: COLORS.gray900 }} /></div>
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
              <button onClick={() => setIsServiceListOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '11px 14px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', backgroundColor: COLORS.white, cursor: 'pointer', boxSizing: 'border-box' }}>
                <span style={{ flex: 1, fontSize: '15px', color: form.selectedServiceId ? COLORS.gray900 : COLORS.gray400, textAlign: 'left' }}>
                  {selectedService ? selectedService.name : '시술 선택'}
                </span>
                {selectedService && <span style={{ fontSize: '14px', color: COLORS.gray500, marginRight: '8px' }}>{selectedService.price.toLocaleString()}원</span>}
                <span style={{ color: COLORS.gray400, transform: isServiceListOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}><ChevronRight size={16} /></span>
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

// ── 고객 상세 시트 ────────────────────────────────────────────
const DetailSheet = ({ open, customer, onClose, onEdit, onDelete }) => {
  const [mode, setMode] = useState('history');
  const [editForm, setEditForm] = useState(null);
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histKey, setHistKey] = useState(0);
  const [sheetReady, setSheetReady] = useState(false);
  const [services, setServices] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setSheetReady(true), 320);
      return () => clearTimeout(t);
    } else {
      setSheetReady(false);
    }
  }, [open]);

  useEffect(() => {
    api.get('/api/services').then(d => setServices(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const reloadHistory = (id) => {
    setHistLoading(true);
    api.get(`/api/history?customer_id=${id}`)
      .then(d => { setHistory(Array.isArray(d) ? d : []); setHistKey(k => k + 1); })
      .finally(() => setHistLoading(false));
  };

  useEffect(() => {
    if (customer) {
      setEditForm({ ...customer });
      setMode('history');
      reloadHistory(customer.id);
    }
  }, [customer]);

  const handleAddHistory = async (body) => {
    await api.post('/api/history', { ...body, customer_id: customer.id });
    setIsAddOpen(false);
    reloadHistory(customer.id);
  };

  const handleEditHistory = async (id, body) => {
    await api.put(`/api/history/${id}`, body);
    setEditRecord(null);
    reloadHistory(customer.id);
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('이 시술 내역을 삭제하시겠습니까?')) return;
    await api.delete(`/api/history/${id}`);
    setEditRecord(null);
    reloadHistory(customer.id);
  };

  // 항상 BottomSheet를 렌더링해야 슬라이드 애니메이션이 동작함
  const safeCustomer = customer || { name: '', gender: '남', phone: null, id: null };
  const safeForm = editForm || safeCustomer;
  const totalAmount = history.reduce((s, h) => s + (h.amount || 0), 0);
  const setField = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  return (
    <BottomSheet open={open} onClose={onClose} height="88vh" maxHeight="88vh">
      {/* 고객 헤더 */}
      <div style={{ padding: '0 20px 0', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {safeCustomer.name
          ? <Avatar name={safeCustomer.name} gender={safeCustomer.gender} size={44} />
          : <div style={{ width: 44, height: 44 }} />
        }
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontSize: '18px', fontWeight: '600', color: COLORS.gray900 }}>{safeCustomer.name}</span>
            {safeCustomer.name && <GenderBadge gender={safeCustomer.gender} />}
          </div>
          {safeCustomer.phone && <span onClick={() => { if (window.confirm(`${safeCustomer.name}(${safeCustomer.phone})님에게 전화하시겠습니까?`)) window.location.href = `tel:${safeCustomer.phone}`; }} style={{ fontSize: '13px', color: COLORS.gray500, cursor: 'pointer', textDecoration: 'underline' }}>{safeCustomer.phone}</span>}
        </div>
        <button onClick={onClose} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: COLORS.gray100, border: 'none', borderRadius: '50%', cursor: 'pointer', color: COLORS.gray500, flexShrink: 0 }}>
          <X size={16} />
        </button>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px 0', gap: '16px', borderBottom: `1px solid ${COLORS.gray100}`, flexShrink: 0 }}>
        {[{ key: 'history', label: '시술 이력' }, { key: 'edit', label: '정보' }].map(tab => (
          <button key={tab.key} onClick={() => setMode(tab.key)}
            style={{ paddingBottom: '10px', fontSize: '14px', fontWeight: mode === tab.key ? '600' : '400', color: mode === tab.key ? COLORS.primary : COLORS.gray500, background: 'none', border: 'none', borderBottom: `2px solid ${mode === tab.key ? COLORS.primary : 'transparent'}`, cursor: 'pointer' }}>
            {tab.label}
          </button>
        ))}
        {mode === 'history' && (
          <button onClick={() => setIsAddOpen(true)}
            style={{ marginLeft: 'auto', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '50%', cursor: 'pointer', color: COLORS.white, flexShrink: 0 }}>
            <Plus size={15} />
          </button>
        )}
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {mode === 'history' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${COLORS.gray100}` }}>
              <div style={{ padding: '14px 20px', borderRight: `1px solid ${COLORS.gray100}` }}>
                <div style={{ fontSize: '12px', color: COLORS.gray400, fontWeight: '500', marginBottom: '4px' }}>총 방문</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: COLORS.gray900 }}>{history.length}<span style={{ fontSize: '13px', fontWeight: '500', color: COLORS.gray500, marginLeft: '2px' }}>회</span></div>
              </div>
              <div style={{ padding: '14px 20px' }}>
                <div style={{ fontSize: '12px', color: COLORS.gray400, fontWeight: '500', marginBottom: '4px' }}>누적 금액</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.gray900 }}>{totalAmount.toLocaleString()}<span style={{ fontSize: '12px', fontWeight: '500', color: COLORS.gray500, marginLeft: '2px' }}>원</span></div>
              </div>
            </div>

            {(!sheetReady || histLoading) ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', color: COLORS.gray400, fontSize: '14px' }}>불러오는 중...</div>
            ) : history.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', color: COLORS.gray400, fontSize: '14px' }}>시술 이력이 없습니다</div>
            ) : (
              history.map((h, idx) => {
                const { date, time } = parseDate(h.created_at);
                return (
                  <div key={`${histKey}-${h.id}`} onClick={() => setEditRecord(h)}
                    style={{ padding: '14px 20px', borderBottom: `1px solid ${COLORS.gray100}`, cursor: 'pointer', animation: 'fadeSlideUp 0.3s cubic-bezier(0.4,0,0.2,1) both', animationDelay: `${idx * 50}ms` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: COLORS.gray400 }}>
                        <Calendar size={13} />
                        <span style={{ fontSize: '13px', color: COLORS.gray500 }}>{date} {time}</span>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: COLORS.gray900 }}>{(h.amount || 0).toLocaleString()}원</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: COLORS.gray400 }}>
                      <Scissors size={13} />
                      <span style={{ fontSize: '14px', color: COLORS.gray700 }}>{h.service_name}</span>
                    </div>
                    {h.memo && <div style={{ marginTop: '4px', fontSize: '13px', color: COLORS.gray500, paddingLeft: '19px' }}>{h.memo}</div>}
                  </div>
                );
              })
            )}
          </>
        ) : (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', boxSizing: 'border-box' }}>
            <div><Label text="이름" /><TextInput value={safeForm.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="고객 이름" /></div>
            <div><Label text="성별" /><GenderToggle value={safeForm.gender || '남'} onChange={(g) => setField('gender', g)} /></div>
            <div><Label text="전화번호" /><TextInput type="tel" value={safeForm.phone || ''} onChange={(e) => setField('phone', e.target.value)} placeholder="010-0000-0000" /></div>
            <div><Label text="메모" /><TextInput value={safeForm.memo || ''} onChange={(e) => setField('memo', e.target.value)} placeholder="특이사항 등" /></div>
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <button onClick={() => { onDelete(customer?.id); onClose(); }} style={{ flex: 1, padding: '13px', backgroundColor: COLORS.white, border: '1px solid #fee2e2', borderRadius: '10px', fontSize: '15px', fontWeight: '500', color: '#ef4444', cursor: 'pointer' }}>삭제</button>
              <button onClick={() => { onEdit(editForm); onClose(); }} style={{ flex: 2, padding: '13px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', color: COLORS.white, cursor: 'pointer' }}>수정</button>
            </div>
          </div>
        )}
      </div>
      <AddHistorySheet open={isAddOpen} onClose={() => setIsAddOpen(false)} onSubmit={handleAddHistory} services={services} customer={safeCustomer} />
      <EditHistorySheet open={!!editRecord} onClose={() => setEditRecord(null)} record={editRecord} onSave={handleEditHistory} onDelete={handleDeleteHistory} services={services} />
    </BottomSheet>
  );
};

// ── 메인 ─────────────────────────────────────────────────────
const CustomerManagePage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/customers');
      setCustomers(Array.isArray(data) ? data : []);
    } catch (e) { setCustomers([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = customers.filter(c => {
    const t = searchTerm;
    return !t || (c.name || '').includes(t) || (c.phone || '').includes(t) || (c.memo || '').includes(t);
  });

  const handleAdd = async (form) => {
    await api.post('/api/customers', form);
    await load();
    setIsAddOpen(false);
  };

  const handleEdit = async (updated) => {
    await api.put(`/api/customers/${updated.id}`, { name: updated.name, gender: updated.gender, phone: updated.phone || '', memo: updated.memo || '' });
    await load();
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm('이 고객을 삭제하시겠습니까?')) return;
    await api.delete(`/api/customers/${id}`);
    setSelectedCustomer(null);
    await load();
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: COLORS.gray400, fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>불러오는 중...</div>;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.white, position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>

      <div style={{ flexShrink: 0, padding: '12px 16px', backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.gray100}` }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: COLORS.gray400, display: 'flex' }}><Search size={16} /></span>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="이름, 전화번호, 메모 검색"
            style={{ width: '100%', padding: '10px 14px 10px 36px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: COLORS.gray50, color: COLORS.gray900 }} />
        </div>
      </div>

      <div style={{ padding: '10px 16px', backgroundColor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray100}` }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: COLORS.gray400, letterSpacing: '0.04em' }}>고객</span>
        <span style={{ fontSize: '12px', color: COLORS.gray400, marginLeft: '6px' }}>{filtered.length}명</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', color: COLORS.gray400, fontSize: '14px' }}>검색 결과가 없습니다</div>
        ) : (
          filtered.map(c => (
            <div key={c.id} onClick={() => setSelectedCustomer(c)}
              style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.gray100}`, gap: '12px', cursor: 'pointer' }}>
              <Avatar name={c.name} gender={c.gender} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '500', color: COLORS.gray900 }}>{c.name}</span>
                  {c.gender && <GenderBadge gender={c.gender} />}
                </div>
                {c.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ color: COLORS.gray400, display: 'flex' }}><Phone size={13} /></span>
                    <span style={{ fontSize: '13px', color: COLORS.gray500 }}>{c.phone}</span>
                  </div>
                )}
                {c.memo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: COLORS.gray400, display: 'flex' }}><Memo size={13} /></span>
                    <span style={{ fontSize: '13px', color: COLORS.gray500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.memo}</span>
                  </div>
                )}
              </div>
              <span style={{ color: COLORS.gray300, display: 'flex', flexShrink: 0 }}><ChevronRight size={16} /></span>
            </div>
          ))
        )}
        <div style={{ height: '80px' }} />
      </div>

      <button onClick={() => setIsAddOpen(true)} style={{ position: 'absolute', bottom: '20px', right: '20px', width: '52px', height: '52px', backgroundColor: COLORS.primary, borderRadius: '50%', boxShadow: '0 2px 12px rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 10, color: COLORS.white, opacity: 0.75 }}>
        <Plus size={22} />
      </button>

      <AddSheet open={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
      <DetailSheet open={!!selectedCustomer} customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} onEdit={handleEdit} onDelete={handleDelete} onReload={load} />
    </div>
  );
};

export default CustomerManagePage;

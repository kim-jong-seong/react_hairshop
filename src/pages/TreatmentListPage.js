import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';
import { Search, Star, Plus } from '../icons/Icons';
import BottomSheet, { Label, TextInput } from '../components/BottomSheet';
import { api, fmtAmountInput, parseAmount } from '../api';

const SectionLabel = ({ label, count }) => (
  <div style={{ padding: '10px 16px 6px', backgroundColor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray100}` }}>
    <span style={{ fontSize: '12px', fontWeight: '600', color: COLORS.gray400, letterSpacing: '0.04em' }}>{label}</span>
    <span style={{ fontSize: '12px', color: COLORS.gray400, marginLeft: '6px' }}>{count}</span>
  </div>
);

const ServiceItem = ({ service, onEdit, onToggleFavorite }) => (
  <div onClick={() => onEdit(service)} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.gray100}`, cursor: 'pointer' }}>
    <span style={{ flex: 1, fontSize: '15px', fontWeight: '500', color: COLORS.gray900 }}>{service.name}</span>
    <span style={{ fontSize: '15px', color: COLORS.gray700, marginRight: '14px' }}>{(service.price || 0).toLocaleString()}원</span>
    <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(service); }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
      <Star size={18} filled={!!service.is_favorite} />
    </button>
  </div>
);

// ── 추가 시트 ─────────────────────────────────────────────────
const AddSheet = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !price) return;
    await onAdd(name.trim(), parseAmount(price));
    setName(''); setPrice('');
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="시술 추가">
      <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div><Label text="시술명" /><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 남자컷" /></div>
        <div><Label text="금액 (원)" /><TextInput inputMode="numeric" value={price} onChange={(e) => setPrice(fmtAmountInput(e.target.value))} placeholder="예: 15,000" /></div>
        <button onClick={handleSubmit} style={{ padding: '13px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', color: COLORS.white, cursor: 'pointer', marginTop: '4px' }}>추가</button>
      </div>
    </BottomSheet>
  );
};

// ── 수정 시트 ─────────────────────────────────────────────────
const EditSheet = ({ open, service, onClose, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (service) { setName(service.name); setPrice(service.price ? service.price.toLocaleString() : ''); setIsFav(!!service.is_favorite); }
  }, [service]);

  const handleSave = async () => {
    if (!name.trim() || !price) return;
    await onSave(service.id, name.trim(), parseAmount(price), isFav);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="시술 수정">
      <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div><Label text="시술명" /><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="시술명" /></div>
        <div><Label text="금액 (원)" /><TextInput inputMode="numeric" value={price} onChange={(e) => setPrice(fmtAmountInput(e.target.value))} placeholder="0" /></div>
        <button onClick={() => setIsFav(v => !v)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', backgroundColor: COLORS.white, cursor: 'pointer' }}>
          <span style={{ fontSize: '15px', color: COLORS.gray900 }}>즐겨찾기</span>
          <Star size={20} filled={isFav} />
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onDelete(service.id)} style={{ flex: 1, padding: '13px', backgroundColor: COLORS.white, border: '1px solid #fee2e2', borderRadius: '10px', fontSize: '15px', fontWeight: '500', color: '#ef4444', cursor: 'pointer' }}>삭제</button>
          <button onClick={handleSave} style={{ flex: 2, padding: '13px', backgroundColor: COLORS.primary, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', color: COLORS.white, cursor: 'pointer' }}>저장</button>
        </div>
      </div>
    </BottomSheet>
  );
};

// ── 메인 ─────────────────────────────────────────────────────
const TreatmentListPage = ({ isActive }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/services');
      setServices(Array.isArray(data) ? data : []);
    } catch (e) { setServices([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = services.filter(s => s.name.includes(searchTerm));
  const favorites = filtered.filter(s => s.is_favorite);
  const others = filtered.filter(s => !s.is_favorite);

  const handleAdd = async (name, price) => {
    await api.post('/api/services', { name, price });
    await load();
    setIsAddOpen(false);
  };

  const handleSave = async (id, name, price, isFav) => {
    await api.put(`/api/services/${id}`, { name, price });
    if (editTarget?.is_favorite !== isFav) {
      await api.put(`/api/services/${id}/favorite`, { is_favorite: isFav });
    }
    await load();
    setEditTarget(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 시술 항목을 삭제하시겠습니까?')) return;
    await api.delete(`/api/services/${id}`);
    await load();
    setEditTarget(null);
  };

  const handleToggleFavorite = async (svc) => {
    await api.put(`/api/services/${svc.id}/favorite`, { is_favorite: !svc.is_favorite });
    await load();
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: COLORS.gray400, fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>불러오는 중...</div>;

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.white, position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>
      <div style={{ flexShrink: 0, padding: '12px 16px', backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.gray100}` }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: COLORS.gray400, display: 'flex' }}><Search size={16} /></span>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="시술명 검색"
            style={{ width: '100%', padding: '10px 14px 10px 36px', border: `1px solid ${COLORS.gray200}`, borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: COLORS.gray50, color: COLORS.gray900 }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {favorites.length > 0 && <><SectionLabel label="즐겨찾기" count={favorites.length} />{favorites.map(s => <ServiceItem key={s.id} service={s} onEdit={setEditTarget} onToggleFavorite={handleToggleFavorite} />)}</>}
        {others.length > 0 && <><SectionLabel label="전체" count={others.length} />{others.map(s => <ServiceItem key={s.id} service={s} onEdit={setEditTarget} onToggleFavorite={handleToggleFavorite} />)}</>}
        {filtered.length === 0 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', color: COLORS.gray400, fontSize: '14px' }}>검색 결과가 없습니다</div>}
        <div style={{ height: '80px' }} />
      </div>

      <button onClick={() => setIsAddOpen(true)} style={{ position: 'absolute', bottom: '20px', right: '20px', width: '52px', height: '52px', backgroundColor: COLORS.primary, borderRadius: '50%', boxShadow: '0 2px 12px rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 10, color: COLORS.white, opacity: isActive ? 0.75 : 0, transition: 'opacity 0.3s ease 0.15s', pointerEvents: isActive ? 'auto' : 'none' }}>
        <Plus size={22} />
      </button>

      <AddSheet open={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
      <EditSheet open={!!editTarget} service={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} onDelete={handleDelete} />
    </div>
  );
};

export default TreatmentListPage;

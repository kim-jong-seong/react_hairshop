import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { COLORS } from '../constants';
import { X, Calendar, Clock } from '../icons/Icons';

export const DateInput = ({ value, onChange }) => {
  const parts = value ? value.split('-') : ['', '', ''];
  const y = parts[0] || '';
  const m = parts[1] || '';
  const d = parts[2] || '';

  const monthRef = useRef();
  const dayRef = useRef();
  const hiddenRef = useRef();

  const notify = (ny, nm, nd) => onChange(`${ny}-${nm}-${nd}`);

  const openPicker = () => {
    if (!hiddenRef.current) return;
    try { hiddenRef.current.showPicker(); } catch (e) { hiddenRef.current.click(); }
  };

  const fieldStyle = {
    border: 'none', outline: 'none', fontSize: '14px',
    color: COLORS.gray900, textAlign: 'center',
    background: 'transparent', fontFamily: 'inherit', padding: 0,
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', width: '100%',
      padding: '11px 10px', border: `1px solid ${COLORS.gray200}`,
      borderRadius: '10px', boxSizing: 'border-box', position: 'relative',
    }}>
      <input
        type="text" inputMode="numeric" maxLength={4}
        value={y} placeholder="YYYY"
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
          notify(val, m, d);
          if (val.length === 4) monthRef.current?.focus();
        }}
        style={{ ...fieldStyle, width: '40px' }}
      />
      <span style={{ color: COLORS.gray400, margin: '0 2px', userSelect: 'none' }}>-</span>
      <input
        ref={monthRef} type="text" inputMode="numeric" maxLength={2}
        value={m} placeholder="MM"
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 2);
          notify(y, val, d);
          if (val.length === 2) dayRef.current?.focus();
        }}
        onBlur={(e) => {
          const val = e.target.value;
          if (!val) return;
          const n = parseInt(val, 10);
          if (n < 1) notify(y, '01', d);
          else if (n > 12) notify(y, '12', d);
          else if (val.length === 1) notify(y, val.padStart(2, '0'), d);
        }}
        style={{ ...fieldStyle, width: '24px' }}
      />
      <span style={{ color: COLORS.gray400, margin: '0 2px', userSelect: 'none' }}>-</span>
      <input
        ref={dayRef} type="text" inputMode="numeric" maxLength={2}
        value={d} placeholder="DD"
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 2);
          notify(y, m, val);
        }}
        onBlur={(e) => {
          const val = e.target.value;
          if (!val) return;
          const n = parseInt(val, 10);
          if (n < 1) notify(y, m, '01');
          else if (n > 31) notify(y, m, '31');
          else if (val.length === 1) notify(y, m, val.padStart(2, '0'));
        }}
        style={{ ...fieldStyle, width: '24px' }}
      />
      <button
        type="button" onClick={openPicker} tabIndex={-1}
        style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          padding: '0 2px', cursor: 'pointer', color: COLORS.gray400,
          display: 'flex', alignItems: 'center',
        }}
      >
        <Calendar size={16} />
      </button>
      <input
        ref={hiddenRef}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        style={{
          position: 'absolute', opacity: 0, pointerEvents: 'none',
          width: '1px', height: '1px', right: 0, bottom: 0,
        }}
      />
    </div>
  );
};

export const TimeInput = ({ value, onChange }) => {
  const parts = value ? value.split(':') : ['', ''];
  const h = parts[0] || '';
  const min = parts[1] || '';

  const minRef = useRef();
  const hiddenRef = useRef();

  const notify = (nh, nm) => onChange(`${nh}:${nm}`);

  const openPicker = () => {
    if (!hiddenRef.current) return;
    try { hiddenRef.current.showPicker(); } catch (e) { hiddenRef.current.click(); }
  };

  const fieldStyle = {
    border: 'none', outline: 'none', fontSize: '14px',
    color: COLORS.gray900, textAlign: 'center',
    background: 'transparent', fontFamily: 'inherit', padding: 0,
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', width: '100%',
      padding: '11px 10px', border: `1px solid ${COLORS.gray200}`,
      borderRadius: '10px', boxSizing: 'border-box', position: 'relative',
    }}>
      <input
        type="text" inputMode="numeric" maxLength={2}
        value={h} placeholder="HH"
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 2);
          notify(val, min);
          if (val.length === 2) minRef.current?.focus();
        }}
        onBlur={(e) => {
          const val = e.target.value;
          if (!val) return;
          const n = parseInt(val, 10);
          if (n > 23) notify('23', min);
          else if (val.length === 1) notify(val.padStart(2, '0'), min);
        }}
        style={{ ...fieldStyle, width: '24px' }}
      />
      <span style={{ color: COLORS.gray400, margin: '0 2px', userSelect: 'none' }}>:</span>
      <input
        ref={minRef} type="text" inputMode="numeric" maxLength={2}
        value={min} placeholder="MM"
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 2);
          notify(h, val);
        }}
        onBlur={(e) => {
          const val = e.target.value;
          if (!val) return;
          const n = parseInt(val, 10);
          if (n > 59) notify(h, '59');
          else if (val.length === 1) notify(h, val.padStart(2, '0'));
        }}
        style={{ ...fieldStyle, width: '24px' }}
      />
      <button
        type="button" onClick={openPicker} tabIndex={-1}
        style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          padding: '0 2px', cursor: 'pointer', color: COLORS.gray400,
          display: 'flex', alignItems: 'center',
        }}
      >
        <Clock size={16} />
      </button>
      <input
        ref={hiddenRef}
        type="time"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        style={{
          position: 'absolute', opacity: 0, pointerEvents: 'none',
          width: '1px', height: '1px', right: 0, bottom: 0,
        }}
      />
    </div>
  );
};

// ── 공유 폼 컴포넌트 ──────────────────────────────────────────
export const Label = ({ text }) => (
  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: COLORS.gray500, marginBottom: '6px' }}>
    {text}
  </label>
);

export const TextInput = ({ value, onChange, placeholder, type = 'text', style = {} }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      width: '100%',
      padding: '11px 14px',
      border: `1px solid ${COLORS.gray200}`,
      borderRadius: '10px',
      fontSize: '15px',
      outline: 'none',
      boxSizing: 'border-box',
      color: COLORS.gray900,
      backgroundColor: COLORS.white,
      ...style
    }}
  />
);

export const GenderToggle = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '8px' }}>
    {['남', '여'].map(g => (
      <button
        key={g}
        onClick={() => onChange(g)}
        style={{
          flex: 1,
          padding: '11px',
          border: `1px solid ${value === g ? COLORS.primary : COLORS.gray200}`,
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: value === g ? '600' : '400',
          color: value === g ? COLORS.primary : COLORS.gray700,
          backgroundColor: value === g ? COLORS.primaryLight : COLORS.white,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {g}
      </button>
    ))}
  </div>
);

let openSheetCount = 0;

// ── BottomSheet (Portal 기반) ─────────────────────────────────
// transform 속성이 있는 조상 안에서 position:fixed 가 오동작하는 문제를 해결하기 위해
// ReactDOM.createPortal 로 document.body 에 직접 렌더링합니다.
const BottomSheet = ({ open, onClose, title, children, maxHeight = '90vh', height, zIndex = 1000 }) => {
  const [dragY, setDragY] = useState(0);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const dragYRef = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    if (open) {
      openSheetCount++;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (open) {
        openSheetCount--;
        if (openSheetCount === 0) document.body.style.overflow = '';
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) { setDragY(0); dragYRef.current = 0; }
  }, [open]);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY;
    lastY.current = e.clientY;
    lastTime.current = Date.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const delta = e.clientY - startY.current;
    if (delta > 0) {
      dragYRef.current = delta;
      setDragY(delta);
    }
    lastY.current = e.clientY;
    lastTime.current = Date.now();
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const elapsed = Date.now() - lastTime.current;
    const velocity = elapsed > 0 ? (e.clientY - lastY.current) / elapsed : 0;
    const shouldClose = dragYRef.current > 150 || velocity > 0.5;
    dragYRef.current = 0;
    setDragY(0);
    if (shouldClose) onClose();
  };

  const dragging = dragY > 0;
  const overlayOpacity = open ? Math.max(0, 0.4 * (1 - dragY / 300)) : 0;

  return ReactDOM.createPortal(
    <>
      {/* 딤 오버레이 */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,1)',
          zIndex: zIndex,
          opacity: overlayOpacity,
          visibility: open ? 'visible' : 'hidden',
          pointerEvents: open ? 'auto' : 'none',
          transition: dragging
            ? 'none'
            : open ? 'opacity 0.3s' : 'opacity 0.3s, visibility 0s 0.3s',
        }}
      />

      {/* 시트 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: COLORS.white,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          zIndex: zIndex + 1,
          maxHeight,
          height,
          display: 'flex',
          flexDirection: 'column',
          transform: !open ? 'translateY(100%)' : `translateY(${dragY}px)`,
          visibility: open ? 'visible' : 'hidden',
          transition: dragging
            ? 'none'
            : open
              ? 'transform 0.3s cubic-bezier(0.4,0,0.2,1)'
              : 'transform 0.3s cubic-bezier(0.4,0,0.2,1), visibility 0s 0.3s',
        }}
      >
        {/* 핸들 (드래그 영역) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px', flexShrink: 0, cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
        >
          <div style={{ width: '36px', height: '4px', backgroundColor: dragging ? COLORS.gray400 : COLORS.gray200, borderRadius: '2px', transition: 'background-color 0.15s' }} />
        </div>

        {/* 헤더 */}
        {title !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 16px', flexShrink: 0 }}>
            <span style={{ fontSize: '17px', fontWeight: '600', color: COLORS.gray900 }}>{title}</span>
            <button
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: COLORS.gray100, border: 'none', borderRadius: '50%', cursor: 'pointer', color: COLORS.gray500 }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {children}
      </div>
    </>,
    document.body
  );
};

export default BottomSheet;

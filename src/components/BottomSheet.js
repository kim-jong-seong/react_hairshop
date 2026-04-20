import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { COLORS } from '../constants';
import { X } from '../icons/Icons';

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

// ── BottomSheet (Portal 기반) ─────────────────────────────────
// transform 속성이 있는 조상 안에서 position:fixed 가 오동작하는 문제를 해결하기 위해
// ReactDOM.createPortal 로 document.body 에 직접 렌더링합니다.
const BottomSheet = ({ open, onClose, title, children, maxHeight = '90vh', height, zIndex = 1000 }) => {
  const [dragY, setDragY] = useState(0);
  const isDragging = useRef(false);
  const startY = useRef(0);

  useEffect(() => {
    if (!open) setDragY(0);
  }, [open]);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const delta = e.clientY - startY.current;
    if (delta > 0) setDragY(delta);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragY > 150) {
      setDragY(0);
      onClose();
    } else {
      setDragY(0);
    }
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

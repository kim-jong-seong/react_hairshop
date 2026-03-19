import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 페이지 컴포넌트들
const AllHistoryPage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 아이콘 SVG들
  const ICONS = {
    calendar: (
      <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
    user: (
      <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    service: (
      <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="6" cy="6" r="3"/>
        <circle cx="6" cy="18" r="3"/>
        <line x1="20" y1="4" x2="8.12" y2="15.88"/>
        <line x1="14.47" y1="14.48" x2="20" y2="20"/>
        <line x1="8.12" y1="8.12" x2="12" y2="12"/>
      </svg>
    ),
    phone: (
      <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    ),
    memo: (
      <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="4" y1="9" x2="20" y2="9"></line>
        <line x1="4" y1="15" x2="20" y2="15"></line>
        <line x1="10" y1="3" x2="8" y2="21"></line>
        <line x1="16" y1="3" x2="14" y2="21"></line>
      </svg>
    )
  };

  // 가상 데이터
  const transactions = [
    {
      id: 1,
      date: '2025-06-03',
      time: '18:16',
      customerName: '신영교',
      gender: '남',
      treatment: '남자컷',
      phone: '010-4119-3235',
      amount: 15000
    },
    {
      id: 2,
      date: '2025-06-03',
      time: '17:17',
      customerName: '김나자',
      gender: '남',
      treatment: '남자컷',
      phone: null,
      memo: '말레이시아',
      amount: 15000
    },
    {
      id: 3,
      date: '2025-06-03',
      time: '17:17',
      customerName: '박나자',
      gender: '남',
      treatment: '남자컷',
      phone: null,
      memo: '말레이시아',
      amount: 15000
    },
    {
      id: 4,
      date: '2025-06-03',
      time: '16:30',
      customerName: '박춘택',
      gender: '남',
      treatment: '남자컷',
      phone: '010-9484-2811',
      memo: '북카드는 박춘진5000 카드 보관',
      amount: 15000
    },
    {
      id: 5,
      date: '2025-06-02',
      time: '14:30',
      customerName: '이미영',
      gender: '여',
      treatment: '여성컷',
      phone: '010-5555-1234',
      amount: 25000
    },
    {
      id: 6,
      date: '2025-06-02',
      time: '11:15',
      customerName: '최대현',
      gender: '남',
      treatment: '파마',
      phone: '010-7777-9999',
      amount: 45000
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.customerName.includes(searchTerm) ||
      transaction.treatment.includes(searchTerm) ||
      (transaction.phone && transaction.phone.includes(searchTerm));
    
    const transactionDate = transaction.date;
    const matchesDateFrom = !dateFrom || transactionDate >= dateFrom;
    const matchesDateTo = !dateTo || transactionDate <= dateTo;
    
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Apple SD Gothic Neo, sans-serif'
    }}>
      {/* 메인 콘텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto'
      }}>
        {filteredTransactions.map((transaction, index) => (
          <div key={transaction.id}>
            <div style={{
              backgroundColor: 'white',
              padding: '16px'
            }}>
              {/* 날짜/시간 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{ marginRight: '8px' }}>
                    {ICONS.calendar}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '400',
                    letterSpacing: '-0.01em'
                  }}>
                    {transaction.date} {transaction.time}
                  </span>
                </div>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  letterSpacing: '-0.02em'
                }}>
                  {transaction.amount.toLocaleString()}원
                </span>
              </div>
              
              {/* 고객 정보 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <div style={{ marginRight: '8px' }}>
                  {ICONS.user}
                </div>
                <span style={{
                  color: '#1f2937',
                  fontWeight: '500',
                  fontSize: '15px',
                  letterSpacing: '-0.01em'
                }}>{transaction.customerName}</span>
                <span style={{
                  marginLeft: '8px',
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '400'
                }}>{transaction.gender}</span>
              </div>
              
              {/* 시술 정보 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <div style={{ marginRight: '8px' }}>
                  {ICONS.service}
                </div>
                <span style={{
                  color: '#374151',
                  fontSize: '15px',
                  fontWeight: '400',
                  letterSpacing: '-0.01em'
                }}>{transaction.treatment}</span>
              </div>
              
              {/* 전화번호 */}
              {transaction.phone && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <div style={{ marginRight: '8px' }}>
                    {ICONS.phone}
                  </div>
                  <span style={{
                    color: '#4b5563',
                    fontSize: '14px',
                    fontWeight: '400',
                    letterSpacing: '-0.005em'
                  }}>{transaction.phone}</span>
                </div>
              )}
              
              {/* 메모 */}
              {transaction.memo && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginTop: '8px'
                }}>
                  <div style={{ marginRight: '8px', marginTop: '2px' }}>
                    {ICONS.memo}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '400',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.4'
                  }}>{transaction.memo}</span>
                </div>
              )}
            </div>
            
            {/* 구분선 */}
            {index < filteredTransactions.length - 1 && (
              <div style={{
                height: '1px',
                backgroundColor: '#e5e7eb'
              }}></div>
            )}
          </div>
        ))}
      </div>

      {/* 플로팅 검색 버튼 */}
      <button
        onClick={openSearch}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        <svg style={{
          width: '24px',
          height: '24px',
          color: 'white'
        }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>

      {/* 바텀시트 배경 오버레이 */}
      {isSearchOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 20
          }}
          onClick={closeSearch}
        />
      )}

      {/* 바텀시트 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        boxShadow: '0 -4px 8px rgba(0,0,0,0.2)',
        zIndex: 30,
        transform: isSearchOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>검색</h3>
          <button
            onClick={closeSearch}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}
          >
            닫기
          </button>
        </div>

        {/* 검색 폼 */}
        <div style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* 통합 검색 */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              통합 검색
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="고객명, 시술명, 전화번호 검색"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>

          {/* 날짜 범위 */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              날짜 범위
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* 버튼들 */}
          <div style={{
            display: 'flex',
            gap: '8px',
            width: '100%'
          }}>
            <button
              onClick={clearFilters}
              style={{
                flex: 1,
                padding: '12px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                color: '#374151',
                fontWeight: '500',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                minWidth: 0
              }}
            >
              초기화
            </button>
            <button
              onClick={() => {
                // 검색 실행 후 바텀시트 닫기
                closeSearch();
              }}
              style={{
                flex: 1,
                padding: '12px 8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '14px',
                minWidth: 0
              }}
            >
              <svg style={{
                width: '14px',
                height: '14px',
                flexShrink: 0
              }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              검색
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TreatmentListPage = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div style={{
        fontSize: '8rem',
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: '1.5rem',
        lineHeight: 1
      }}>
        2
      </div>
      <h2 style={{
        fontSize: '1.875rem',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 1rem 0'
      }}>
        시술표
      </h2>
      <p style={{
        fontSize: '1.125rem',
        color: '#6b7280',
        margin: 0
      }}>
        시술표 페이지입니다
      </p>
    </div>
  );
};

const CustomerManagementPage = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div style={{
        fontSize: '8rem',
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: '1.5rem',
        lineHeight: 1
      }}>
        3
      </div>
      <h2 style={{
        fontSize: '1.875rem',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 1rem 0'
      }}>
        고객관리
      </h2>
      <p style={{
        fontSize: '1.125rem',
        color: '#6b7280',
        margin: 0
      }}>
        고객관리 페이지입니다
      </p>
    </div>
  );
};

const SalesPage = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div style={{
        fontSize: '8rem',
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: '1.5rem',
        lineHeight: 1
      }}>
        4
      </div>
      <h2 style={{
        fontSize: '1.875rem',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 1rem 0'
      }}>
        매출현황
      </h2>
      <p style={{
        fontSize: '1.125rem',
        color: '#6b7280',
        margin: 0
      }}>
        매출현황 페이지입니다
      </p>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div style={{
        fontSize: '8rem',
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: '1.5rem',
        lineHeight: 1
      }}>
        5
      </div>
      <h2 style={{
        fontSize: '1.875rem',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 1rem 0'
      }}>
        설정
      </h2>
      <p style={{
        fontSize: '1.125rem',
        color: '#6b7280',
        margin: 0
      }}>
        설정 페이지입니다
      </p>
    </div>
  );
};

// 상수 정의
const CONSTANTS = {
  BREAKPOINT: 1200,
  SIDEBAR_WIDTH: { expanded: '240px', collapsed: '72px' },
  ANIMATION_DURATION: '0.3s',
  ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  DELAY: 10
};

const COLORS = {
  primary: '#3b82f6',
  primaryLight: '#e8f4fd',
  primaryDark: '#1565c0',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray900: '#1f2937',
  white: '#ffffff'
};

// 아이콘 컴포넌트들
const FileText = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

const Scissors = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/>
    <circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
);

const Users = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const BarChart3 = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <path d="m19 9-5 5-4-4-3 3"/>
  </svg>
);

const Settings = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const Menu = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/>
    <line x1="4" y1="12" x2="20" y2="12"/>
    <line x1="4" y1="18" x2="20" y2="18"/>
  </svg>
);

// 스타일 객체들
const getBaseStyles = () => ({
  fontFamily: 'Apple SD Gothic Neo, sans-serif'
});

const getSlideContainerStyle = (isTransitioning, position, direction = 'horizontal') => ({
  display: 'flex',
  flexDirection: direction === 'vertical' ? 'column' : 'row',
  height: direction === 'vertical' ? '200%' : '100%',
  width: direction === 'horizontal' ? '200%' : '100%',
  transition: isTransitioning ? `transform ${CONSTANTS.ANIMATION_DURATION} ${CONSTANTS.ANIMATION_EASING}` : 'none',
  transform: direction === 'vertical' 
    ? `translateY(-${position * 50}%)` 
    : `translateX(-${position * 50}%)`,
  willChange: isTransitioning ? 'transform' : 'auto'
});

const TabApp = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  // 모바일 슬라이드 상태
  const [mobileSlidePages, setMobileSlidePages] = useState([0]);
  const [mobileSlidePosition, setMobileSlidePosition] = useState(0);
  const [mobileIsTransitioning, setMobileIsTransitioning] = useState(false);
  
  // PC 슬라이드 상태
  const [pcSlidePages, setPcSlidePages] = useState([0]);
  const [pcSlidePosition, setPcSlidePosition] = useState(0);
  const [pcIsTransitioning, setPcIsTransitioning] = useState(false);

  const tabs = useMemo(() => [
    { id: 0, name: '전체내역', icon: FileText },
    { id: 1, name: '시술표', icon: Scissors },
    { id: 2, name: '고객관리', icon: Users },
    { id: 3, name: '매출현황', icon: BarChart3 },
    { id: 4, name: '설정', icon: Settings }
  ], []);

  // 반응형 레이아웃 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= CONSTANTS.BREAKPOINT);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 애니메이션 실행 헬퍼 함수
  const executeSlideAnimation = useCallback((
    targetTab, 
    currentTab, 
    isDesktopMode,
    setPages,
    setPosition,
    setTransitioning
  ) => {
    if (targetTab > currentTab) {
      setPages([currentTab, targetTab]);
      setPosition(0);
      setTransitioning(false);
      setTimeout(() => {
        setTransitioning(true);
        setPosition(1);
      }, CONSTANTS.DELAY);
    } else {
      setPages([targetTab, currentTab]);
      setPosition(1);
      setTransitioning(false);
      setTimeout(() => {
        setTransitioning(true);
        setPosition(0);
      }, CONSTANTS.DELAY);
    }
  }, []);

  const handleTabClick = useCallback((tabId) => {
    if (activeTab === tabId) return;
    
    const currentTab = activeTab;
    setActiveTab(tabId);
    
    if (!isDesktop) {
      if (mobileIsTransitioning) return;
      executeSlideAnimation(
        tabId, 
        currentTab, 
        false,
        setMobileSlidePages,
        setMobileSlidePosition,
        setMobileIsTransitioning
      );
    } else {
      if (pcIsTransitioning) return;
      executeSlideAnimation(
        tabId, 
        currentTab, 
        true,
        setPcSlidePages,
        setPcSlidePosition,
        setPcIsTransitioning
      );
    }
  }, [activeTab, isDesktop, mobileIsTransitioning, pcIsTransitioning, executeSlideAnimation]);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded(!sidebarExpanded);
  }, [sidebarExpanded]);

  // 페이지 컴포넌트 렌더링
  const renderPageContent = useCallback((pageId) => {
    switch(pageId) {
      case 0:
        return <AllHistoryPage />;
      case 1:
        return <TreatmentListPage />;
      case 2:
        return <CustomerManagementPage />;
      case 3:
        return <SalesPage />;
      case 4:
        return <SettingsPage />;
      default:
        return <AllHistoryPage />;
    }
  }, []);

  // PC 버전
  if (isDesktop) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        backgroundColor: COLORS.white,
        ...getBaseStyles()
      }}>
        {/* 사이드바 */}
        <div style={{
          width: sidebarExpanded ? CONSTANTS.SIDEBAR_WIDTH.expanded : CONSTANTS.SIDEBAR_WIDTH.collapsed,
          backgroundColor: COLORS.gray50,
          borderRight: `1px solid ${COLORS.gray200}`,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          overflow: 'hidden'
        }}>
          {/* 햄버거 버튼 */}
          <div style={{ padding: '12px 24px', margin: '2px 0' }}>
            <button
              onClick={toggleSidebar}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                backgroundColor: 'transparent',
                border: 'none',
                color: COLORS.gray500,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                padding: 0,
                outline: 'none'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = COLORS.gray100}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Menu size={20} />
            </button>
          </div>

          {/* 네비게이션 메뉴 */}
          <div style={{ padding: '8px 0' }}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 24px',
                    margin: '2px 0',
                    borderRadius: '8px',
                    backgroundColor: isActive ? COLORS.primaryLight : 'transparent',
                    color: isActive ? COLORS.primaryDark : COLORS.gray500,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                    textAlign: 'left',
                    width: '100%',
                    outline: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = COLORS.gray100;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ 
                    marginRight: '20px',
                    transition: 'margin-right 0.2s ease'
                  }}>
                    <IconComponent size={20} />
                  </div>
                  <span style={{
                    marginLeft: 0,
                    whiteSpace: 'nowrap',
                    opacity: sidebarExpanded ? 1 : 0,
                    width: sidebarExpanded ? 'auto' : '0px',
                    transition: `opacity ${CONSTANTS.ANIMATION_DURATION} ease, width 0.2s ease`,
                    overflow: 'hidden'
                  }}>
                    {tab.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{ 
          flex: 1, 
          position: 'relative',
          backgroundColor: COLORS.gray50,
          overflow: 'hidden'
        }}>
          <div 
            style={getSlideContainerStyle(pcIsTransitioning, pcSlidePosition, 'vertical')}
            onTransitionEnd={() => {
              setPcIsTransitioning(false);
              setPcSlidePages([activeTab]);
              setPcSlidePosition(0);
            }}
          >
            {pcSlidePages.map((pageId, index) => (
              <div 
                key={`pc-page-${pageId}-${index}`}
                style={{
                  height: '50%',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}
              >
                {renderPageContent(pageId)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 모바일 버전
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: COLORS.white,
      ...getBaseStyles()
    }}>
      {/* 메인 콘텐츠 */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        <div 
          style={getSlideContainerStyle(mobileIsTransitioning, mobileSlidePosition, 'horizontal')}
          onTransitionEnd={() => {
            setMobileIsTransitioning(false);
            setMobileSlidePages([activeTab]);
            setMobileSlidePosition(0);
          }}
        >
          {mobileSlidePages.map((pageId, index) => (
            <div 
              key={`mobile-page-${pageId}-${index}`}
              style={{
                width: '50%',
                flexShrink: 0,
                height: '100%',
                overflow: 'hidden'
              }}
            >
              {renderPageContent(pageId)}
            </div>
          ))}
        </div>
      </div>
      
      {/* 하단 네비게이션 */}
      <div style={{ 
        backgroundColor: COLORS.white, 
        position: 'relative' 
      }}>
        {/* 상단 파란색 인디케이터 */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            height: '2px',
            backgroundColor: COLORS.primary,
            transition: `all ${CONSTANTS.ANIMATION_DURATION} ${CONSTANTS.ANIMATION_EASING}`,
            width: '12%',
            left: `${activeTab * 20 + 4}%`
          }}
        />
        
        <div style={{ 
          display: 'flex', 
          borderTop: `1px solid ${COLORS.gray100}` 
        }}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 8px',
                  transition: 'color 0.2s',
                  color: isActive ? COLORS.primary : COLORS.gray400,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <IconComponent size={24} style={{ marginBottom: '4px' }} />
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '500' 
                }}>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabApp;
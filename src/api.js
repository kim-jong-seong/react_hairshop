const BASE = '';

export const api = {
  get: (path) => fetch(BASE + path).then(r => r.json()),
  post: (path, body) => fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  put: (path, body) => fetch(BASE + path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  delete: (path) => fetch(BASE + path, { method: 'DELETE' }).then(r => r.json()),
};

export const downloadFile = async (path, filename) => {
  const res = await fetch(BASE + path);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// history created_at 포맷: "YYYY-MM-DDTHH:MM"
export const parseDate = (created_at) => ({
  date: created_at ? created_at.slice(0, 10) : '',
  time: created_at ? created_at.slice(11, 16) : '',
});

export const todayStr = () => new Date().toISOString().slice(0, 10);
export const nowTimeStr = () => new Date().toTimeString().slice(0, 5);

// 금액 입력 포맷: 숫자만 추출 후 천 단위 콤마 적용
export const fmtAmountInput = (v) => {
  const n = String(v).replace(/[^0-9]/g, '');
  return n ? parseInt(n, 10).toLocaleString() : '';
};
// 금액 파싱: 콤마 제거 후 정수 변환
export const parseAmount = (v) => parseInt(String(v).replace(/,/g, ''), 10) || 0;

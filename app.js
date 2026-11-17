
/* ===== utils.js ===== */
/* utils.js — أدوات عامة: DOM، تنسيق، MD5، CRC32، ZIP/TAR، تشفير */
window.FM = window.FM || {};
(function (FM) {
  'use strict';

  /* ---------- DOM ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'value') el.value = v;
        else if (k === 'checked') el.checked = !!v;
        else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    const iso = attrs && typeof attrs.class === 'string' && /^(nm|tl|vt|tb-title|dn)$/.test(attrs.class);
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      if (iso && typeof kid === 'string') { const b = document.createElement('bdi'); b.textContent = kid; el.append(b); continue; }
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  const ICONS = {
    menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    search: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    check: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    folder: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
    file: 'M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z',
    image: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
    music: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
    video: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
    apps: 'M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z',
    cloud: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z',
    trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
    cut: 'M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z',
    edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
    info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
    sd: 'M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 6h-2V4h2v4zm3 0h-2V4h2v4zm3 0h-2V4h2v4z',
    phone: 'M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z',
    recent: 'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
    pie: 'M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.27-8.52-8.97-8.99zm0 11.01V22c4.7-.47 8.5-4.25 8.97-8.99h-8.97z',
    pc: 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z',
    settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    star: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
    add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    play: 'M8 5v14l11-7z',
    pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
    next: 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z',
    prev: 'M6 6h2v12H6zm3.5 6 8.5 6V6z',
    chevron: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    rotate: 'M15.55 5.55 11 1v3.07a8 8 0 0 0 0 15.86v-2.02a6 6 0 0 1 0-11.82V10l4.55-4.45zM19.93 11a7.9 7.9 0 0 0-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02a7.92 7.92 0 0 0 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42 1.42 1.41A7.9 7.9 0 0 0 19.93 13h-2.02c-.14.87-.48 1.72-1.02 2.48z',
    zip: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6h-2v2h2v2h-2v2h-2v-2h2v-2h-2v-2h2v-2h-2V8h2v2h2v2z',
    sort: 'M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z',
    list: 'M3 14h4v-4H3v4zm0 5h4v-4H3v4zM3 9h4V5H3v4zm5 5h13v-4H8v4zm0 5h13v-4H8v4zM8 5v4h13V5H8z',
    refresh: 'M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
    android: 'M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84 1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 0 0 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z'
  };
  FM.icon = function (name, size) {
    size = size || 24;
    const s = h('span', { class: 'ic' });
    s.innerHTML = '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="currentColor" aria-hidden="true"><path d="' + (ICONS[name] || ICONS.file) + '"/></svg>';
    return s;
  };

  /* ---------- تنسيق ---------- */
  const LRI = '\u2066', PDI = '\u2069';
  function fmtSize(b) {
    if (b == null) return '';
    if (b < 1024) return LRI + b + ' B' + PDI;
    const u = ['KB', 'MB', 'GB', 'TB'];
    let i = -1;
    do { b /= 1024; i++; } while (b >= 1024 && i < 3);
    return LRI + (b >= 100 ? b.toFixed(0) : b >= 10 ? b.toFixed(1) : b.toFixed(2)).replace(/\.?0+$/, '') + ' ' + u[i] + PDI;
  }
  const p2 = n => String(n).padStart(2, '0');
  function fmtDate0(ts, mode) {
    if (!ts) return '';
    const d = new Date(ts);
    mode = mode || (FM.Settings && FM.Settings.get('dateFmt')) || 'dmy';
    const time = p2(d.getHours()) + ':' + p2(d.getMinutes());
    if (mode === 'ymd') return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + time;
    if (mode === 'mdy') return p2(d.getMonth() + 1) + '/' + p2(d.getDate()) + '/' + d.getFullYear() + ' ' + time;
    return p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + time;
  }
  const fmtDate = (ts, mode) => ts ? LRI + fmtDate0(ts, mode) + PDI : '';
  function fmtDur(sec) {
    if (!isFinite(sec)) return '--:--';
    sec = Math.round(sec);
    const m = Math.floor(sec / 60), s = sec % 60;
    return LRI + m + ':' + p2(s) + PDI;
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  /* ---------- MD5 ---------- */
  function md5(buf) {
    const bytes = new Uint8Array(buf), n = bytes.length;
    const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
    const K = new Int32Array(64);
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;
    const total = (((n + 8) >>> 6) + 1) << 6;
    const m = new Uint8Array(total); m.set(bytes); m[n] = 0x80;
    const dv = new DataView(m.buffer);
    dv.setUint32(total - 8, (n << 3) >>> 0, true);
    dv.setUint32(total - 4, Math.floor(n / 0x20000000), true);
    let a0 = 0x67452301 | 0, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476 | 0;
    for (let off = 0; off < total; off += 64) {
      const M = new Int32Array(16);
      for (let i = 0; i < 16; i++) M[i] = dv.getInt32(off + i * 4, true);
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * i) % 16; }
        F = (F + A + K[i] + M[g]) | 0;
        A = D; D = C; C = B;
        B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    const out = new DataView(new ArrayBuffer(16));
    [a0, b0, c0, d0].forEach((v, i) => out.setInt32(i * 4, v, true));
    return [...new Uint8Array(out.buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  async function digest(algo, buf) {
    const d = await crypto.subtle.digest(algo, buf);
    return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* ---------- CRC32 / ZIP / TAR ---------- */
  const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  const crcUpd = (crc, b) => (CRC_T[(crc ^ b) & 255] ^ (crc >>> 8)) >>> 0;

  function ZipCrypto(pw) {
    const k = [0x12345678, 0x23456789, 0x34567890];
    const upd = c => { k[0] = crcUpd(k[0], c); k[1] = (Math.imul((k[1] + (k[0] & 255)) >>> 0, 134775813) + 1) >>> 0; k[2] = crcUpd(k[2], k[1] >>> 24); };
    const stream = () => { const t = (k[2] | 2) & 0xFFFF; return (Math.imul(t, t ^ 1) >>> 8) & 255; };
    new TextEncoder().encode(pw).forEach(upd);
    return {
      dec(b) { const c = b ^ stream(); upd(c); return c; },
      enc(c) { const e = c ^ stream(); upd(c); return e; }
    };
  }
  function dosDT(ts) {
    const d = new Date(ts || Date.now());
    return {
      time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
      date: ((Math.max(d.getFullYear(), 1980) - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
    };
  }
  /** entries: [{name, data:Uint8Array|null (dir), date}] */
  function zipWrite(entries, password) {
    const enc = new TextEncoder(), parts = [], central = [];
    let off = 0;
    for (const e of entries) {
      const isDir = e.name.endsWith('/');
      const nameB = enc.encode(e.name);
      let data = isDir ? new Uint8Array(0) : e.data;
      const crc = crc32(data), usize = data.length;
      let stored = data, flags = 0x800;
      if (password && !isDir) {
        const z = ZipCrypto(password), head = new Uint8Array(12);
        crypto.getRandomValues(head); head[11] = crc >>> 24;
        const out = new Uint8Array(12 + data.length);
        for (let i = 0; i < 12; i++) out[i] = z.enc(head[i]);
        for (let i = 0; i < data.length; i++) out[12 + i] = z.enc(data[i]);
        stored = out; flags |= 1;
      }
      const { time, date } = dosDT(e.date);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, flags, true);
      lh.setUint16(8, 0, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, stored.length, true); lh.setUint32(22, usize, true);
      lh.setUint16(26, nameB.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), nameB, stored);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, flags, true); ch.setUint16(10, 0, true); ch.setUint16(12, time, true); ch.setUint16(14, date, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, stored.length, true); ch.setUint32(24, usize, true);
      ch.setUint16(28, nameB.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true);
      ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, isDir ? 0x10 : 0, true);
      ch.setUint32(42, off, true);
      central.push(new Uint8Array(ch.buffer), nameB);
      off += 30 + nameB.length + stored.length;
    }
    const cdSize = central.reduce((a, b) => a + b.length, 0);
    const eo = new DataView(new ArrayBuffer(22));
    eo.setUint32(0, 0x06054b50, true); eo.setUint16(8, entries.length, true); eo.setUint16(10, entries.length, true);
    eo.setUint32(12, cdSize, true); eo.setUint32(16, off, true);
    return new Blob([...parts, ...central, new Uint8Array(eo.buffer)], { type: 'application/zip' });
  }
  async function inflate(u8, fmt) {
    const ds = new DecompressionStream(fmt);
    const s = new Blob([u8]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(s).arrayBuffer());
  }
  async function zipRead(blob) {
    const u8 = new Uint8Array(await blob.arrayBuffer());
    const dv = new DataView(u8.buffer);
    let e = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65600); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error('ZIP');
    const count = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
    const dec = new TextDecoder(), list = [];
    for (let i = 0; i < count; i++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const flags = dv.getUint16(p + 8, true), method = dv.getUint16(p + 10, true);
      const time = dv.getUint16(p + 12, true), date = dv.getUint16(p + 14, true);
      const crc = dv.getUint32(p + 16, true), csize = dv.getUint32(p + 20, true), usize = dv.getUint32(p + 24, true);
      const nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
      const off = dv.getUint32(p + 42, true);
      const name = dec.decode(u8.subarray(p + 46, p + 46 + nl));
      const mt = new Date(((date >> 9) & 127) + 1980, ((date >> 5) & 15) - 1, date & 31, (time >> 11) & 31, (time >> 5) & 63, (time & 31) * 2).getTime();
      list.push({ name, flags, method, crc, csize, usize, off, time, mtime: mt, isDir: name.endsWith('/'), enc: !!(flags & 1) });
      p += 46 + nl + el + cl;
    }
    async function extract(ent, password) {
      const nl = dv.getUint16(ent.off + 26, true), el = dv.getUint16(ent.off + 28, true);
      let data = u8.slice(ent.off + 30 + nl + el, ent.off + 30 + nl + el + ent.csize);
      if (ent.enc) {
        if (!password) throw Object.assign(new Error('PASSWORD'), { code: 'PASSWORD' });
        const z = ZipCrypto(password), head = [];
        for (let i = 0; i < 12; i++) head.push(z.dec(data[i]));
        const check = (ent.flags & 8) ? (ent.time >> 8) : (ent.crc >>> 24);
        if (head[11] !== (check & 255)) throw Object.assign(new Error('WRONG'), { code: 'WRONG' });
        const out = new Uint8Array(data.length - 12);
        for (let i = 0; i < out.length; i++) out[i] = z.dec(data[12 + i]);
        data = out;
      }
      if (ent.method === 8) return inflate(data, 'deflate-raw');
      return data;
    }
    return { entries: list, extract };
  }
  async function tarRead(u8) {
    const dec = new TextDecoder(), out = [];
    let p = 0;
    const str = (a, b) => dec.decode(u8.subarray(p + a, p + b)).replace(/\0.*$/, '');
    while (p + 512 <= u8.length) {
      if (u8[p] === 0) break;
      let name = str(0, 100); const prefix = str(345, 500);
      if (prefix) name = prefix + '/' + name;
      const size = parseInt(str(124, 136).trim() || '0', 8), type = String.fromCharCode(u8[p + 156] || 48);
      const mtime = parseInt(str(136, 148).trim() || '0', 8) * 1000;
      const isDir = type === '5' || name.endsWith('/');
      const data = isDir ? null : u8.slice(p + 512, p + 512 + size);
      out.push({ name: isDir && !name.endsWith('/') ? name + '/' : name, isDir, usize: size, mtime, data });
      p += 512 + Math.ceil(size / 512) * 512;
    }
    return out;
  }

  /* ---------- تشفير بيانات الاعتماد محليًا (AES-GCM) ---------- */
  const Vault = {
    async key() {
      let jwk = FM.Settings.get('vaultKey');
      if (!jwk) {
        const k = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        jwk = await crypto.subtle.exportKey('jwk', k);
        await FM.Settings.set('vaultKey', jwk);
      }
      return crypto.subtle.importKey('jwk', jwk, 'AES-GCM', false, ['encrypt', 'decrypt']);
    },
    async enc(text) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await this.key(), new TextEncoder().encode(text)));
      const all = new Uint8Array(12 + ct.length); all.set(iv); all.set(ct, 12);
      return btoa(String.fromCharCode(...all));
    },
    async dec(b64) {
      try {
        const all = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: all.slice(0, 12) }, await this.key(), all.slice(12));
        return new TextDecoder().decode(pt);
      } catch (e) { return ''; }
    }
  };

  /** أجزاء نص متجاورة معزولة الاتجاه (تمنع اختلاط الأرقام في RTL) */
  function parts(arr, sep) { const out = []; arr.filter(Boolean).forEach((x, i) => { if (i) out.push(sep || ' · '); out.push(h('bdi', null, x)); }); return out; }
  FM.u = { parts, h, fmtSize, fmtDate, fmtDur, sleep, uid, debounce, md5, digest, crc32, zipWrite, zipRead, tarRead, inflate, Vault };
  FM.h = h;
})(window.FM);

;

/* ===== i18n.js ===== */
/* i18n.js — الترجمات: العربية (RTL) / Français / English. الصيغة: مفتاح: [ar, fr, en] */
window.FM = window.FM || {};
(function (FM) {
  'use strict';
  const D = {
    'app.name': ['مدير الملفات+', 'Gestionnaire de fichiers+', 'File Manager+'],
    ok: ['موافق', 'OK', 'OK'], cancel: ['إلغاء', 'Annuler', 'Cancel'], close: ['إغلاق', 'Fermer', 'Close'], save: ['حفظ', 'Enregistrer', 'Save'],
    saved: ['تم الحفظ', 'Enregistré', 'Saved'], delete: ['حذف', 'Supprimer', 'Delete'], deleted: ['تم الحذف', 'Supprimé', 'Deleted'],
    edit: ['تعديل', 'Modifier', 'Edit'], open: ['فتح', 'Ouvrir', 'Open'], more: ['المزيد', 'Plus', 'More'], all: ['الكل', 'Tout', 'All'],
    range: ['نطاق', 'Plage', 'Range'], 'range.hint': ['حدّد عنصرين على الأقل لتحديد ما بينهما', 'Sélectionnez deux éléments au moins', 'Select at least two items to select everything between'],
    selected: ['المحدد: {n}', 'Sélection : {n}', 'Selected: {n}'], 'select.all': ['تحديد الكل', 'Tout sélectionner', 'Select all'],
    copy: ['نسخ', 'Copier', 'Copy'], move: ['نقل', 'Déplacer', 'Move'], rename: ['إعادة تسمية', 'Renommer', 'Rename'],
    'rename.batch': ['إعادة تسمية جماعية', 'Renommage groupé', 'Batch rename'], 'rename.hint': ['استخدم {n} للترقيم، مثال: صورة_{n}', 'Utilisez {n} pour la numérotation', 'Use {n} for numbering, e.g. photo_{n}'],
    paste: ['لصق هنا', 'Coller ici', 'Paste here'], 'clip.copy': ['نسخ {n} عنصر', '{n} élément(s) à copier', '{n} item(s) to copy'], 'clip.move': ['نقل {n} عنصر', '{n} élément(s) à déplacer', '{n} item(s) to move'],
    'clip.set': ['تم تجهيز {n} عنصر', '{n} élément(s) prêts', '{n} item(s) ready'], 'clip.hint': ['افتح المجلد الهدف ثم اضغط «لصق هنا»', 'Ouvrez le dossier cible puis « Coller ici »', 'Open the target folder, then tap “Paste here”'],
    copying: ['جارٍ النسخ…', 'Copie…', 'Copying…'], moving: ['جارٍ النقل…', 'Déplacement…', 'Moving…'], 'paste.done': ['تمت العملية ({n})', 'Terminé ({n})', 'Done ({n})'],
    'copy.again': ['نسخ مرة أخرى', 'Copier à nouveau', 'Copy again'], 'return.src': ['العودة إلى المجلد المصدر', 'Retour au dossier source', 'Return to source folder'],
    hide: ['إخفاء', 'Masquer', 'Hide'], eta: ['متبقي {s} ث', 'reste {s} s', '{s}s left'], share: ['مشاركة', 'Partager', 'Share'], 'share.na': ['المشاركة غير متاحة هنا', 'Partage indisponible', 'Sharing not available here'],
    properties: ['خصائص', 'Propriétés', 'Properties'], 'open.with': ['فتح بواسطة…', 'Ouvrir avec…', 'Open with…'], restore: ['استعادة', 'Restaurer', 'Restore'],
    home: ['الرئيسية', 'Accueil', 'Home'], search: ['بحث', 'Recherche', 'Search'], 'search.ph': ['ابحث في الملفات والمجلدات', 'Rechercher fichiers et dossiers', 'Search files and folders'],
    'search.n': ['النتائج: {n}', 'Résultats : {n}', 'Results: {n}'], refresh: ['تحديث', 'Actualiser', 'Refresh'], empty: ['لا توجد عناصر', 'Aucun élément', 'Nothing here'],
    folder: ['مجلد جديد', 'Nouveau dossier', 'New folder'], 'new.folder': ['مجلد جديد', 'Nouveau dossier', 'New folder'], 'new.file': ['ملف نصي جديد', 'Nouveau fichier texte', 'New text file'],
    upload: ['رفع ملفات من الجهاز', 'Importer des fichiers', 'Upload files'], 'upload.dir': ['رفع مجلد', 'Importer un dossier', 'Upload folder'], uploaded: ['تم رفع {n} ملف', '{n} fichier(s) importé(s)', '{n} file(s) uploaded'],
    sort: ['الفرز', 'Trier', 'Sort'], 'sort.name': ['الاسم', 'Nom', 'Name'], 'sort.size': ['الحجم', 'Taille', 'Size'], 'sort.date': ['التاريخ', 'Date', 'Date'], 'sort.type': ['النوع', 'Type', 'Type'],
    'sort.asc': ['تصاعدي', 'Croissant', 'Ascending'], 'sort.desc': ['تنازلي', 'Décroissant', 'Descending'], 'sort.order': ['ترتيب الفرز', 'Ordre de tri', 'Sort order'],
    view: ['طريقة العرض', 'Affichage', 'View'], 'view.list-compact': ['قائمة مدمجة', 'Liste compacte', 'Compact list'], 'view.list-detailed': ['قائمة مفصلة', 'Liste détaillée', 'Detailed list'],
    'view.grid-medium': ['شبكة متوسطة', 'Grille moyenne', 'Medium grid'], 'view.grid-large': ['شبكة كبيرة', 'Grande grille', 'Large grid'],
    'show.hidden': ['إظهار الملفات المخفية', 'Afficher les fichiers masqués', 'Show hidden files'],
    'n.items': ['{n} عنصر', '{n} élément(s)', '{n} items'], 'n.files': ['{n} ملف', '{n} fichiers', '{n} files'], 'n.apps': ['{n} تطبيق', '{n} applis', '{n} apps'], 'n.acc': ['{n} حساب', '{n} compte(s)', '{n} account(s)'],
    today: ['اليوم', "Aujourd'hui", 'Today'], yesterday: ['أمس', 'Hier', 'Yesterday'], 'days.ago': ['قبل {n} يوم', 'Il y a {n} j', '{n} days ago'],
    'v.main': ['التخزين الرئيسي', 'Stockage principal', 'Main Storage'], 'v.sd': ['بطاقة SD', 'Carte SD', 'SD Card'],
    'cat.downloads': ['التنزيلات', 'Téléchargements', 'Downloads'], 'cat.recent': ['الملفات الجديدة', 'Nouveaux fichiers', 'New files'], 'cat.images': ['الصور', 'Images', 'Images'],
    'cat.audio': ['الصوتيات', 'Audio', 'Audio'], 'cat.video': ['الفيديوهات', 'Vidéos', 'Videos'], 'cat.docs': ['المستندات', 'Documents', 'Documents'],
    apps: ['التطبيقات', 'Applications', 'Apps'], cloud: ['السحابة', 'Cloud', 'Cloud'], analyzer: ['تحليل التخزين', 'Analyse de stockage', 'Storage analyzer'], 'pc.access': ['الوصول من الكمبيوتر', 'Accès depuis un PC', 'PC access'],
    'used.of': ['{u} / {t}', '{u} / {t}', '{u} / {t}'], shortcuts: ['الاختصارات', 'Raccourcis', 'Shortcuts'],
    'shortcut.add': ['إضافة اختصار للشاشة الرئيسية', "Ajouter à l'écran d'accueil", 'Add to home screen'], 'shortcut.done': ['تمت إضافة الاختصار', 'Raccourci ajouté', 'Shortcut added'],
    'shortcut.remove': ['إزالة الاختصار؟', 'Retirer le raccourci ?', 'Remove shortcut?'],
    'bookmark.add': ['إضافة للمفضلة', 'Ajouter aux favoris', 'Add to bookmarks'], bookmarked: ['أُضيف للمفضلة', 'Ajouté aux favoris', 'Bookmarked'], bookmarks: ['المفضلة', 'Favoris', 'Bookmarks'],
    'drawer.quick': ['الفئات السريعة', 'Catégories rapides', 'Quick categories'], 'cloud.manage': ['إدارة الحسابات السحابية', 'Gérer le cloud', 'Manage cloud'],
    trash: ['سلة المهملات', 'Corbeille', 'Trash'], 'trash.empty': ['السلة فارغة', 'Corbeille vide', 'Trash is empty'], 'trash.emptyall': ['إفراغ السلة', 'Vider la corbeille', 'Empty trash'],
    'trash.confirm': ['حذف كل العناصر نهائيًا؟', 'Supprimer définitivement tout ?', 'Delete everything permanently?'], 'trash.enable': ['تفعيل سلة المهملات', 'Activer la corbeille', 'Enable trash'],
    'del.trash': ['نقل {n} عنصر إلى سلة المهملات؟', 'Déplacer {n} élément(s) vers la corbeille ?', 'Move {n} item(s) to trash?'], 'del.perm': ['حذف {n} عنصر نهائيًا؟', 'Supprimer {n} élément(s) définitivement ?', 'Permanently delete {n} item(s)?'],
    'err.self': ['لا يمكن النقل/النسخ إلى داخل المجلد نفسه', 'Impossible dans le dossier lui-même', 'Cannot copy/move a folder into itself'], 'err.generic': ['حدث خطأ', 'Une erreur est survenue', 'Something went wrong'],
    'err.exists': ['الاسم موجود مسبقًا', 'Ce nom existe déjà', 'Name already exists'], 'err.name': ['اسم غير صالح', 'Nom invalide', 'Invalid name'], 'err.email': ['بريد إلكتروني غير صالح', 'E-mail invalide', 'Invalid email'], 'err.host': ['أدخل عنوان الخادم', "Saisissez l'hôte", 'Enter the host'],
    'zip.create': ['ضغط ZIP', 'Compresser en ZIP', 'Compress to ZIP'], 'zip.pw': ['كلمة المرور (اختياري)', 'Mot de passe (facultatif)', 'Password (optional)'],
    'zip.pw.hint': ['تشفير ZipCrypto المتوافق مع أغلب البرامج', 'Chiffrement ZipCrypto (compatible)', 'ZipCrypto encryption (widely compatible)'], 'zip.done': ['تم إنشاء الأرشيف', 'Archive créée', 'Archive created'],
    'zip.extract': ['فك الضغط هنا', 'Extraire ici', 'Extract here'], 'zip.enter.pw': ['أدخل كلمة مرور الأرشيف', "Mot de passe de l'archive", 'Archive password'], 'zip.wrong.pw': ['كلمة المرور خاطئة', 'Mot de passe incorrect', 'Wrong password'],
    extracting: ['جارٍ فك الضغط…', 'Extraction…', 'Extracting…'], extracted: ['تم استخراج {n} ملف', '{n} fichier(s) extrait(s)', '{n} file(s) extracted'], 'extract.here': ['استخراج إلى المجلد', 'Extraire ici', 'Extract here'], preview: ['معاينة', 'Aperçu', 'Preview'],
    'xz.na': ['صيغة XZ تحتاج مكتبة أصلية على الهاتف', 'Le format XZ nécessite une bibliothèque native', 'XZ needs a native library on the phone'],
    'apk.msg': ['ملف تثبيت تطبيق (APK).', "Fichier d'installation (APK).", 'Application package (APK).'], 'apk.native': ['التثبيت الفعلي يتطلب إضافة أصلية (REQUEST_INSTALL_PACKAGES) على أندرويد.', "L'installation réelle nécessite un plugin natif.", 'Real installation needs a native plugin on Android.'],
    'p.name': ['الاسم', 'Nom', 'Name'], 'p.path': ['المسار', 'Chemin', 'Path'], 'p.type': ['النوع', 'Type', 'Type'], 'p.folder': ['مجلد', 'Dossier', 'Folder'], 'p.items': ['العناصر', 'Éléments', 'Items'],
    'p.size': ['الحجم', 'Taille', 'Size'], 'p.bytes': ['بايت', 'octets', 'bytes'], 'p.modified': ['تاريخ التعديل', 'Modifié', 'Modified'], 'p.created': ['تاريخ الإنشاء', 'Créé', 'Created'],
    'p.perm': ['الأذونات', 'Permissions', 'Permissions'], 'p.local': ['قراءة/كتابة', 'lecture/écriture', 'read/write'], 'p.remote': ['(بعيد)', '(distant)', '(remote)'], 'p.res': ['الأبعاد', 'Dimensions', 'Dimensions'], 'p.dur': ['المدة', 'Durée', 'Duration'],
    'p.count': ['عدد العناصر', "Nombre d'éléments", 'Items'], 'p.hash': ['حساب بصمة MD5 / SHA', 'Calculer MD5 / SHA', 'Compute MD5 / SHA'], 'p.pkg': ['الحزمة', 'Paquet', 'Package'], 'p.version': ['الإصدار', 'Version', 'Version'], 'p.cache': ['الذاكرة المؤقتة', 'Cache', 'Cache'], 'p.installed': ['تاريخ التثبيت', "Date d'installation", 'Installed'],
    'apps.user': ['تطبيقات المستخدم', 'Applis utilisateur', 'User apps'], 'apps.sys': ['تطبيقات النظام', 'Applis système', 'System apps'], backup: ['نسخ احتياطي', 'Sauvegarder', 'Backup'],
    'backup.done': ['تم استخراج {n} ملف APK إلى /Backups', '{n} APK sauvegardé(s) dans /Backups', '{n} APK(s) saved to /Backups'], 'open.folder': ['فتح المجلد', 'Ouvrir le dossier', 'Open folder'],
    uninstall: ['إلغاء التثبيت', 'Désinstaller', 'Uninstall'], 'uninstall.msg': ['إلغاء تثبيت {n} تطبيق؟', 'Désinstaller {n} appli(s) ?', 'Uninstall {n} app(s)?'], uninstalled: ['تم إلغاء التثبيت', 'Désinstallé', 'Uninstalled'],
    'cache.clear': ['مسح الذاكرة المؤقتة', 'Vider le cache', 'Clear cache'], 'cache.clearall': ['مسح كل الذاكرة المؤقتة', 'Vider tous les caches', 'Clear all caches'], 'cache.cleared': ['تم مسح الذاكرة المؤقتة', 'Cache vidé', 'Cache cleared'],
    'app.open': ['فتح التطبيق', "Ouvrir l'appli", 'Open app'], 'app.open.native': ['تشغيل التطبيقات يتطلب إضافة أصلية على الهاتف', 'Nécessite un plugin natif', 'Launching apps needs a native plugin'], 'app.info': ['معلومات التطبيق', "Infos sur l'appli", 'App info'],
    'app.sys.na': ['لا يمكن إلغاء تثبيت تطبيقات النظام', 'Impossible de désinstaller une appli système', 'System apps cannot be uninstalled'], 'app.self': ['لا يمكن إلغاء تثبيت هذا التطبيق من داخله', 'Impossible de se désinstaller soi-même', 'This app cannot uninstall itself'],
    'an.over': ['نظرة عامة', 'Aperçu', 'Overview'], 'an.large': ['ملفات كبيرة', 'Gros fichiers', 'Large files'], 'an.junk': ['مخلفات', 'Fichiers inutiles', 'Junk & cache'], 'an.dup': ['مكررة', 'Doublons', 'Duplicates'],
    'an.folders': ['استهلاك المجلدات (الأكبر أولًا)', 'Dossiers (du plus gros au plus petit)', 'Folders (largest first)'], 'an.note': ['أحجام النظام وقيم السعة محاكاة في المتصفح؛ على الهاتف تُقرأ من الجهاز.', 'Valeurs système simulées dans le navigateur.', 'System values are simulated in the browser; on the phone they come from the device.'],
    'an.appcache': ['الذاكرة المؤقتة للتطبيقات', 'Cache des applis', 'App caches'], 'an.clean': ['لا مخلفات 🎉', 'Rien à nettoyer 🎉', 'Nothing to clean 🎉'], 'an.cleanbtn': ['تنظيف', 'Nettoyer', 'Clean'], 'an.nodup': ['لا توجد ملفات مكررة', 'Aucun doublon', 'No duplicates found'],
    cleaned: ['تم التنظيف', 'Nettoyé', 'Cleaned'], scanning: ['جارٍ الفحص…', 'Analyse…', 'Scanning…'], total: ['الإجمالي', 'Total', 'Total'], other: ['أخرى', 'Autres', 'Other'], system: ['النظام', 'Système', 'System'], root: ['(الجذر)', '(racine)', '(root)'],
    'selected.size': ['المحدد: {s}', 'Sélection : {s}', 'Selected: {s}'],
    'tab.cloud': ['التخزين السحابي', 'STOCKAGE CLOUD', 'CLOUD STORAGE'], 'tab.ftp': ['FTP والشبكة', 'FTP DISTANT', 'REMOTE FTP'], linked: ['الحسابات المرتبطة', 'Comptes liés', 'Linked accounts'], 'linked.none': ['لا توجد حسابات بعد', 'Aucun compte', 'No accounts yet'],
    'linked.ok': ['تم ربط الحساب', 'Compte lié', 'Account linked'], 'add.service': ['إضافة خدمة جديدة', 'Ajouter un service', 'Add new service'], 'add.x': ['إضافة {x}', 'Ajouter {x}', 'Add {x}'],
    'cloud.demo': ['وضع المحاكاة: تسجيل OAuth والمزامنة الفعلية يحتاجان مفاتيح API وإضافة أصلية.', 'Mode démo : OAuth et synchronisation réels nécessitent des clés API.', 'Demo mode: real OAuth and sync need API keys.'],
    signout: ['تسجيل الخروج', 'Se déconnecter', 'Sign out'], 'signin.to': ['تسجيل الدخول إلى {x}', 'Connexion à {x}', 'Sign in to {x}'], signin: ['دخول', 'Connexion', 'Sign in'], email: ['البريد الإلكتروني', 'E-mail', 'Email'],
    'oauth.demo': ['محاكاة OAuth 2.0: أدخل أي بريد لإنشاء حساب تجريبي.', 'Simulation OAuth 2.0 : saisissez un e-mail.', 'OAuth 2.0 simulation: enter any email to create a demo account.'],
    'ftp.title': ['نقل Wi‑Fi من الكمبيوتر', 'Transfert Wi‑Fi depuis le PC', 'Local Wi‑Fi PC transfer'], 'ftp.sub': ['حوّل الهاتف إلى خادم FTP', 'Transformez le téléphone en serveur FTP', 'Turn the phone into an FTP server'],
    'ftp.addr': ['عنوان الوصول من الكمبيوتر', "Adresse d'accès depuis le PC", 'Your PC can access files at'], 'ftp.running': ['الخادم يعمل', 'Serveur actif', 'Server running'], 'ftp.stopped': ['الخادم متوقف', 'Serveur arrêté', 'Server stopped'], 'ftp.started': ['تم تشغيل الخادم', 'Serveur démarré', 'Server started'],
    'ftp.settings': ['إعدادات الخادم', 'Réglages du serveur', 'Server settings'], 'ftp.anon': ['اتصال مجهول', 'Connexion anonyme', 'Anonymous access'], 'ftp.demo': ['محاكاة داخل المتصفح — الخادم الفعلي يحتاج إضافة أصلية على الهاتف.', 'Simulation — le vrai serveur nécessite un plugin natif.', 'Simulation — a real server needs a native plugin on the phone.'],
    'share.addr': ['مشاركة العنوان', "Partager l'adresse", 'Share address'], copied: ['تم النسخ', 'Copié', 'Copied'], 'remote.conns': ['اتصالات بعيدة', 'Connexions distantes', 'Remote connections'], 'remote.none': ['لا توجد اتصالات', 'Aucune connexion', 'No connections'], 'remote.add': ['إضافة اتصال بعيد', 'Ajouter une connexion', 'Add remote connection'],
    protocol: ['البروتوكول', 'Protocole', 'Protocol'], name: ['الاسم', 'Nom', 'Name'], host: ['الخادم', 'Hôte', 'Host'], port: ['المنفذ', 'Port', 'Port'], username: ['اسم المستخدم', "Nom d'utilisateur", 'Username'], password: ['كلمة المرور', 'Mot de passe', 'Password'], path: ['المسار', 'Chemin', 'Path'],
    'pw.enc': ['تُحفظ كلمة المرور مشفرة (AES‑GCM) محليًا.', 'Mot de passe chiffré localement (AES‑GCM).', 'Password is stored encrypted (AES‑GCM) locally.'], 'keep.pw': ['اتركه فارغًا للإبقاء على الحالي', 'Laisser vide pour conserver', 'Leave blank to keep current'],
    settings: ['الإعدادات', 'Paramètres', 'Settings'], about: ['حول التطبيق', 'À propos', 'About'], 'storage.engine': ['محرك قاعدة البيانات', 'Moteur de base', 'Database engine'], language: ['اللغة', 'Langue', 'Language'],
    theme: ['المظهر', 'Thème', 'Theme'], 'theme.system': ['حسب النظام', 'Système', 'System'], 'theme.light': ['فاتح', 'Clair', 'Light'], 'theme.dark': ['داكن', 'Sombre', 'Dark'],
    'set.general': ['عام', 'Général', 'General'], 'set.files': ['الملفات', 'Fichiers', 'Files'], 'set.media': ['الوسائط', 'Médias', 'Media'], 'set.device': ['الجهاز', 'Appareil', 'Device'],
    'date.format': ['تنسيق التاريخ', 'Format de date', 'Date format'], 'audio.engine': ['محرك الصوتيات', 'Moteur audio', 'Audio engine'], advanced: ['متقدم', 'avancé', 'advanced'], 'video.gestures': ['إيماءات الفيديو', 'Gestes vidéo', 'Video gestures'],
    'sd.sim': ['محاكاة وجود بطاقة SD', 'Simuler une carte SD', 'Simulate SD card'], 'wallpaper.clear': ['إزالة خلفية الشاشة الرئيسية', "Retirer le fond d'écran", 'Remove home wallpaper'], reset: ['إعادة ضبط البيانات', 'Réinitialiser', 'Reset data'],
    'reset.sub': ['يحذف كل الملفات التجريبية والإعدادات', 'Supprime fichiers de démo et réglages', 'Deletes demo files and settings'], 'reset.msg': ['سيتم حذف كل البيانات المحلية. متابعة؟', 'Toutes les données locales seront supprimées. Continuer ?', 'All local data will be deleted. Continue?'],
    player: ['المشغل', 'Lecteur', 'Player'], 'unknown.artist': ['فنان غير معروف', 'Artiste inconnu', 'Unknown artist'], 'slideshow.on': ['بدأ عرض الشرائح', 'Diaporama démarré', 'Slideshow started'],
    'wallpaper.set': ['تعيين كخلفية للشاشة الرئيسية', "Définir comme fond d'écran", 'Set as home wallpaper'], 'wallpaper.done': ['تم تعيين الخلفية', 'Fond défini', 'Wallpaper set'],
    brightness: ['السطوع', 'Luminosité', 'Brightness'], volume: ['الصوت', 'Volume', 'Volume'], 'video.nodata': ['لا توجد بيانات قابلة للتشغيل في هذا الملف التجريبي', 'Aucune donnée lisible dans ce fichier de démo', 'No playable data in this demo file'],
    'pdf.hint': ['إن لم يظهر الملف فاستخدم «مشاركة» لفتحه بتطبيق خارجي.', 'Si rien ne s’affiche, utilisez « Partager ».', 'If nothing shows, use “Share” to open it externally.'],
    wrap: ['التفاف الأسطر', 'Retour à la ligne', 'Word wrap'], 'font.up': ['تكبير الخط', 'Agrandir', 'Larger font'], 'font.down': ['تصغير الخط', 'Réduire', 'Smaller font'],
    'enc.dirty': ['احفظ التعديلات قبل تغيير الترميز', "Enregistrez avant de changer l'encodage", 'Save before changing encoding'], 'enc.saved.utf8': ['تم الحفظ بترميز UTF‑8', 'Enregistré en UTF‑8', 'Saved as UTF‑8'],
    unsaved: ['تعديلات غير محفوظة', 'Modifications non enregistrées', 'Unsaved changes'], 'unsaved.msg': ['تجاهل التعديلات؟', 'Abandonner les modifications ?', 'Discard changes?'], discard: ['تجاهل', 'Abandonner', 'Discard'],
    seeding: ['جارٍ تجهيز البيانات التجريبية…', 'Préparation des données de démo…', 'Preparing demo data…'], 'exit.press': ['اضغط مرة أخرى للخروج', 'Appuyez encore pour quitter', 'Press again to exit'], 'exit.web': ['في المتصفح أغلق التبويب للخروج', 'Fermez l’onglet pour quitter', 'Close the tab to exit']
  };
  let idx = 0;
  const LANGS = ['ar', 'fr', 'en'];
  FM.t = function (key, vars) {
    const e = D[key]; let s = e ? (e[idx] || e[2]) : key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  };
  FM.setLang = function (l) {
    idx = Math.max(0, LANGS.indexOf(l));
    document.documentElement.lang = LANGS[idx];
    document.documentElement.dir = idx === 0 ? 'rtl' : 'ltr';
  };
  FM.rtl = () => idx === 0;
  FM.I18N = D;
})(window.FM);

;

/* ===== db.js ===== */
/* db.js — طبقة التخزين المحلية (IndexedDB).
 * الواجهة (DB.*) مستقلة عن المحرك؛ يوجد محوّل Realm في db-realm.js بنفس الواجهة. */
window.FM = window.FM || {};
(function (FM) {
  'use strict';
  const NAME = 'fmplus_db', VER = 1;
  const STORES = {
    files: { key: 'id', idx: ['parent', 'vol', 'cat', 'mtime'] },
    blobs: { key: 'id' },
    settings: { key: 'key' },
    accounts: { key: 'id' },
    connections: { key: 'id' },
    apps: { key: 'pkg' },
    bookmarks: { key: 'id' }
  };
  let db;
  const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const txDone = tx => new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
  const st = (n, m) => db.transaction(n, m || 'readonly').objectStore(n);

  const IDB = {
    engine: 'indexeddb',
    open() {
      return new Promise((res, rej) => {
        const r = indexedDB.open(NAME, VER);
        r.onupgradeneeded = () => {
          const d = r.result;
          for (const [n, c] of Object.entries(STORES)) {
            const s = d.createObjectStore(n, { keyPath: c.key });
            (c.idx || []).forEach(i => s.createIndex(i, i));
          }
        };
        r.onsuccess = () => { db = r.result; res(); };
        r.onerror = () => rej(r.error);
      });
    },
    get: (n, k) => req(st(n).get(k)),
    put: (n, o) => req(st(n, 'readwrite').put(o)),
    del: (n, k) => req(st(n, 'readwrite').delete(k)),
    all: n => req(st(n).getAll()),
    byIndex: (n, i, v) => req(st(n).index(i).getAll(v)),
    count: (n, i, v) => req(st(n).index(i).count(v)),
    prefix: (n, p) => req(st(n).getAll(IDBKeyRange.bound(p, p + '￿'))),
    async putMany(n, arr) {
      if (!arr.length) return;
      const tx = db.transaction(n, 'readwrite'), s = tx.objectStore(n);
      arr.forEach(o => s.put(o));
      await txDone(tx);
    },
    async delMany(n, keys) {
      if (!keys.length) return;
      const tx = db.transaction(n, 'readwrite'), s = tx.objectStore(n);
      keys.forEach(k => s.delete(k));
      await txDone(tx);
    },
    async clear(n) { await req(st(n, 'readwrite').clear()); },
    async wipe() {
      if (db) db.close();
      await new Promise(r => { const q = indexedDB.deleteDatabase(NAME); q.onsuccess = q.onerror = q.onblocked = () => r(); });
    }
  };

  FM.DBStores = STORES;
  FM.DBEngines = { indexeddb: IDB };
  FM.DB = IDB; // يمكن استبداله بمحوّل Realm: FM.DB = new FM.RealmAdapter(Realm)

  /* ---------- الإعدادات ---------- */
  const DEFAULTS = {
    lang: 'ar', theme: 'system', showHidden: false, view: 'list-detailed',
    sortBy: 'name', sortDir: 'asc', dateFmt: 'dmy', gestures: true,
    audioEngine: 'exo', trash: true, sdMounted: true, wallpaper: null,
    ftpOn: false, ftpPort: 2121, ftpUser: 'user', ftpPass: '', ftpAnon: true, ftpIp: null
  };
  const cache = Object.assign({}, DEFAULTS);
  FM.Settings = {
    DEFAULTS,
    async load() {
      const rows = await FM.DB.all('settings');
      rows.forEach(r => { cache[r.key] = r.value; });
    },
    get: k => cache[k],
    async set(k, v) { cache[k] = v; await FM.DB.put('settings', { key: k, value: v }); },
    async reset() { Object.keys(cache).forEach(k => delete cache[k]); Object.assign(cache, DEFAULTS); }
  };
})(window.FM);

;

/* ===== vfs.js ===== */
/* vfs.js — نظام الملفات الافتراضي الموحد (UnifiedFileSystemProvider / VirtualFile)
 * كل الأقراص (الداخلي، SD، السحابة، الشبكة) تمر عبر نفس الواجهة.
 * السجل: {id:"vol:/path", vol, path, parent, name, isDir, ext, cat, size, mtime, ctime, hidden, mark, thumb, meta, mime}
 * لتحويل التطبيق لهاتف حقيقي: استبدل FM.fs.provider بمحوّل Capacitor (js/native-fs-adapter.js). */
window.FM = window.FM || {};
(function (FM) {
  'use strict';
  const D = () => FM.DB;
  const GB = 1024 * 1024 * 1024;

  const CATS = {
    image: 'jpg jpeg png gif webp bmp heic svg',
    audio: 'mp3 aac flac wav ogg m4a',
    video: 'mp4 mkv avi webm 3gp',
    doc: 'pdf doc docx xls xlsx ppt pptx txt epub csv md json xml html htm log ini rtf odt js css',
    apk: 'apk',
    archive: 'zip tar gz xz tgz'
  };
  const EXT2CAT = {};
  for (const [c, l] of Object.entries(CATS)) l.split(' ').forEach(e => EXT2CAT[e] = c);
  const MIME = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp', svg: 'image/svg+xml',
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4', flac: 'audio/flac', aac: 'audio/aac',
    mp4: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska', avi: 'video/x-msvideo', '3gp': 'video/3gpp',
    pdf: 'application/pdf', txt: 'text/plain', json: 'application/json', xml: 'text/xml', html: 'text/html', csv: 'text/csv', md: 'text/markdown',
    zip: 'application/zip', apk: 'application/vnd.android.package-archive'
  };
  const TEXT_EXT = new Set('txt md json xml html htm log ini csv js css rtf'.split(' '));

  const idOf = (vol, path) => vol + ':' + path;
  const parentPath = p => p === '/' ? null : (p.slice(0, p.lastIndexOf('/')) || '/');
  const baseName = p => p.slice(p.lastIndexOf('/') + 1);
  const join = (d, n) => (d === '/' ? '' : d) + '/' + n;
  const extOf = n => { const i = n.lastIndexOf('.'); return i > 0 ? n.slice(i + 1).toLowerCase() : ''; };
  const catOf = ext => EXT2CAT[ext] || 'other';
  const mimeOf = ext => MIME[ext] || 'application/octet-stream';
  const isHidden = r => r.hidden || r.name.startsWith('.');
  const inTrash = r => r.path.startsWith('/.Trash/') || r.path === '/.Trash';

  function makeRec(vol, path, isDir, extra) {
    const name = path === '/' ? '' : baseName(path), ext = isDir ? '' : extOf(name), now = Date.now();
    return Object.assign({
      id: idOf(vol, path), vol, path, parent: path === '/' ? null : idOf(vol, parentPath(path)),
      name, isDir, ext, cat: isDir ? 'dir' : catOf(ext), size: 0, mtime: now, ctime: now, hidden: false, mark: 0
    }, extra || {});
  }

  const fs = {
    GB, CATS, TEXT_EXT, idOf, parentPath, baseName, join, extOf, catOf, mimeOf, isHidden, inTrash, makeRec,

    /* ---------- الأقراص ---------- */
    SERVICES: {
      gdrive: { label: 'Google Drive', color: '#4285F4', letter: 'G', total: 15 },
      onedrive: { label: 'OneDrive', color: '#0078D4', letter: 'O', total: 5 },
      dropbox: { label: 'Dropbox', color: '#0061FF', letter: 'D', total: 2 },
      box: { label: 'Box', color: '#0061D5', letter: 'box', total: 10 },
      yandex: { label: 'Yandex Disk', color: '#FC3F1D', letter: 'Я', total: 10 },
      pcloud: { label: 'pCloud', color: '#17BED0', letter: 'p', total: 10 }
    },
    async volumes() {
      const list = [{ id: 'main', kind: 'main', label: FM.t('v.main'), color: '#FF9800', total: 64 * GB, base: 38.5 * GB }];
      if (FM.Settings.get('sdMounted')) list.push({ id: 'sd', kind: 'sd', label: FM.t('v.sd'), color: '#2196F3', total: 32 * GB, base: 4.2 * GB });
      for (const a of await D().all('accounts')) {
        const s = fs.SERVICES[a.service];
        list.push({ id: a.id, kind: 'cloud', label: s.label + ' — ' + a.email, color: s.color, total: s.total * GB, base: 0, service: a.service });
      }
      for (const c of await D().all('connections')) list.push({ id: 'rc_' + c.id, kind: 'remote', label: c.name, color: '#607D8B', total: 0, base: 0, conn: c });
      return list;
    },
    async volume(id) { return (await fs.volumes()).find(v => v.id === id); },
    async usage(vol) {
      const v = await fs.volume(vol);
      if (!v) return { used: 0, total: 0 };
      const recs = await D().prefix('files', vol + ':/');
      const sum = recs.reduce((a, r) => a + (r.isDir ? 0 : (r.size || 0)), 0);
      return { used: v.base + sum, total: v.total, files: sum };
    },

    /* ---------- أساسيات ---------- */
    get: id => D().get('files', id),
    async exists(vol, path) { return !!(await D().get('files', idOf(vol, path))); },
    async ensureRoot(vol) {
      if (!(await D().get('files', idOf(vol, '/')))) await D().put('files', makeRec(vol, '/', true));
    },
    async mkdirp(vol, path) {
      await fs.ensureRoot(vol);
      const segs = path.split('/').filter(Boolean);
      let cur = '/';
      const add = [];
      for (const s of segs) {
        cur = join(cur, s);
        if (!(await D().get('files', idOf(vol, cur)))) add.push(makeRec(vol, cur, true));
      }
      await D().putMany('files', add);
    },
    async uniqueName(vol, dir, name) {
      if (!(await fs.exists(vol, join(dir, name)))) return name;
      const e = extOf(name), base = e ? name.slice(0, -(e.length + 1)) : name;
      for (let i = 1; i < 1000; i++) {
        const n = base + ' (' + i + ')' + (e ? '.' + e : '');
        if (!(await fs.exists(vol, join(dir, n)))) return n;
      }
      return base + '-' + Date.now() + (e ? '.' + e : '');
    },
    sortRecs(recs, by, dir) {
      by = by || FM.Settings.get('sortBy'); dir = dir || FM.Settings.get('sortDir');
      const m = dir === 'desc' ? -1 : 1;
      const nameCmp = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      return recs.slice().sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        let c = 0;
        if (by === 'size' && !a.isDir) c = (a.size || 0) - (b.size || 0);
        else if (by === 'date') c = a.mtime - b.mtime;
        else if (by === 'type' && !a.isDir) c = a.ext.localeCompare(b.ext);
        if (!c) c = nameCmp(a, b);
        return c * m;
      });
    },
    async list(vol, path, opts) {
      opts = opts || {};
      let recs = await D().byIndex('files', 'parent', idOf(vol, path));
      if (!FM.Settings.get('showHidden') && !opts.all) recs = recs.filter(r => !isHidden(r));
      if (!opts.all) recs = recs.filter(r => r.name !== '.Trash');
      return fs.sortRecs(recs);
    },
    childCount: id => D().count('files', 'parent', id),

    /* ---------- القراءة والكتابة ---------- */
    async readBlob(rec) { const b = await D().get('blobs', rec.id); return b ? b.blob : new Blob([]); },
    async readText(rec, enc) {
      const buf = await (await fs.readBlob(rec)).arrayBuffer();
      return new TextDecoder(enc || 'utf-8').decode(buf);
    },
    async writeFile(vol, dir, name, blob, opts) {
      opts = opts || {};
      await fs.mkdirp(vol, dir);
      if (opts.uniq !== false) name = await fs.uniqueName(vol, dir, name);
      const path = join(dir, name);
      const rec = makeRec(vol, path, false, {
        size: opts.size != null ? opts.size : blob.size, mime: blob.type || mimeOf(extOf(name)),
        mark: opts.mark === false ? 0 : Date.now(), mtime: opts.mtime || Date.now(), meta: opts.meta
      });
      await D().put('files', rec);
      await D().put('blobs', { id: rec.id, blob });
      return rec;
    },
    async overwrite(rec, blob) {
      const r = Object.assign({}, await D().get('files', rec.id), { size: blob.size, mtime: Date.now(), thumb: null });
      await D().put('files', r); await D().put('blobs', { id: r.id, blob });
      return r;
    },
    async makeDir(vol, dir, name) {
      name = await fs.uniqueName(vol, dir, name);
      const rec = makeRec(vol, join(dir, name), true, { mark: Date.now() });
      await fs.mkdirp(vol, dir);
      await D().put('files', rec);
      return rec;
    },
    async update(id, patch) {
      const r = await D().get('files', id);
      if (!r) return null;
      Object.assign(r, patch); await D().put('files', r); return r;
    },

    /* ---------- النقل والنسخ والحذف ---------- */
    async relocate(rec, destVol, destPath, copy) {
      const subs = rec.isDir ? await D().prefix('files', rec.id + '/') : [];
      const all = [rec, ...subs], news = [], blobs = [];
      await fs.mkdirp(destVol, parentPath(destPath));
      for (const r of all) {
        const np = destPath + r.path.slice(rec.path.length);
        const nr = Object.assign({}, r, { vol: destVol, path: np, id: idOf(destVol, np), parent: idOf(destVol, parentPath(np)), name: baseName(np) });
        if (r === rec) nr.mark = Date.now();
        if (copy && r === rec) nr.ctime = Date.now();
        news.push(nr);
        if (!r.isDir) { const b = await D().get('blobs', r.id); if (b) blobs.push({ id: nr.id, blob: b.blob }); }
      }
      await D().putMany('files', news);
      await D().putMany('blobs', blobs);
      if (!copy) {
        await D().delMany('files', all.map(r => r.id));
        await D().delMany('blobs', all.filter(r => !r.isDir).map(r => r.id));
      }
      return news[0];
    },
    async rename(rec, newName) {
      newName = newName.trim();
      if (!newName || /[\/\\]/.test(newName)) throw new Error('bad-name');
      const np = join(parentPath(rec.path), newName);
      if (np === rec.path) return rec;
      if (await fs.exists(rec.vol, np)) throw new Error('exists');
      return fs.relocate(rec, rec.vol, np, false);
    },
    async deleteTree(rec) {
      const subs = rec.isDir ? await D().prefix('files', rec.id + '/') : [];
      const all = [rec, ...subs];
      await D().delMany('files', all.map(r => r.id));
      await D().delMany('blobs', all.filter(r => !r.isDir).map(r => r.id));
    },
    async remove(recs, permanent) {
      const useTrash = FM.Settings.get('trash') && !permanent;
      for (const r of recs) {
        if (useTrash && !inTrash(r)) {
          const n = await fs.uniqueName(r.vol, '/.Trash', r.name);
          const moved = await fs.relocate(r, r.vol, join('/.Trash', n), false);
          await fs.update(moved.id, { origPath: r.path, trashedAt: Date.now(), mark: 0 });
        } else await fs.deleteTree(r);
      }
    },
    async trashItems() {
      const out = [];
      for (const v of await fs.volumes()) out.push(...await D().byIndex('files', 'parent', idOf(v.id, '/.Trash')));
      return out.sort((a, b) => (b.trashedAt || 0) - (a.trashedAt || 0));
    },
    async restore(rec) {
      const orig = rec.origPath || join('/', rec.name);
      const dir = parentPath(orig) || '/';
      const n = await fs.uniqueName(rec.vol, dir, baseName(orig));
      const moved = await fs.relocate(rec, rec.vol, join(dir, n), false);
      await fs.update(moved.id, { origPath: null, trashedAt: null });
    },
    async emptyTrash() { for (const r of await fs.trashItems()) await fs.deleteTree(r); },
    async dirSize(rec) {
      if (!rec.isDir) return rec.size || 0;
      const subs = await D().prefix('files', rec.id + '/');
      return subs.reduce((a, r) => a + (r.isDir ? 0 : (r.size || 0)), 0);
    },

    /** نقل/نسخ مع تقدم. onProgress({name,done,total,speed,eta,pct}) */
    async transfer(recs, destVol, destDir, mode, onProgress, ctl) {
      ctl = ctl || {};
      const sizes = [];
      for (const r of recs) sizes.push(await fs.dirSize(r));
      const total = sizes.reduce((a, b) => a + b, 0) || 1;
      let done = 0; const t0 = performance.now(); const out = [];
      for (let i = 0; i < recs.length; i++) {
        if (ctl.cancelled) break;
        const r = recs[i];
        if (r.isDir && destVol === r.vol && (join(destDir, r.name) === r.path || (destDir + '/').startsWith(r.path + '/') || destDir === r.path)) {
          throw new Error('into-self');
        }
        const name = await fs.uniqueName(destVol, destDir, r.name);
        const steps = Math.max(1, Math.min(12, Math.round(sizes[i] / (6 * 1024 * 1024))));
        for (let s = 1; s <= steps; s++) {
          if (ctl.cancelled) break;
          await FM.u.sleep(35);
          const d = done + sizes[i] * s / steps, el = (performance.now() - t0) / 1000 || 0.001;
          onProgress && onProgress({ name: r.name, done: d, total, pct: Math.min(99, Math.round(d / total * 100)), speed: d / el, eta: (total - d) / (d / el || 1) });
        }
        if (ctl.cancelled) break;
        out.push(await fs.relocate(r, destVol, join(destDir, name), mode === 'copy'));
        done += sizes[i];
      }
      onProgress && onProgress({ name: '', done: total, total, pct: 100, speed: 0, eta: 0 });
      return out;
    },

    /* ---------- بحث وتصنيف ---------- */
    async search(q, scope, limit) {
      q = q.trim().toLowerCase();
      if (!q) return [];
      const all = scope && scope.vol ? await D().prefix('files', idOf(scope.vol, scope.path === '/' ? '/' : scope.path + '/')) : await D().all('files');
      const sh = FM.Settings.get('showHidden');
      const vols = new Set((await fs.volumes()).map(v => v.id));
      const out = [];
      for (const r of all) {
        if (!r.name || !vols.has(r.vol) || inTrash(r)) continue;
        if (!sh && isHidden(r)) continue;
        if (r.name.toLowerCase().includes(q)) { out.push(r); if (out.length >= (limit || 300)) break; }
      }
      return fs.sortRecs(out);
    },
    async byCats(cats) {
      const vols = new Set((await fs.volumes()).filter(v => v.kind === 'main' || v.kind === 'sd' || v.kind === 'cloud').map(v => v.id));
      const out = [];
      for (const c of cats) out.push(...await D().byIndex('files', 'cat', c));
      const sh = FM.Settings.get('showHidden');
      return out.filter(r => vols.has(r.vol) && !inTrash(r) && (sh || !isHidden(r)) && !r.path.split('/').some(s => s.startsWith('.') && s.length > 1 && !sh));
    },
    async counts() {
      const res = {};
      const c = async cats => (await fs.byCats(cats)).length;
      res.image = await c(['image']); res.audio = await c(['audio']); res.video = await c(['video']);
      res.doc = await c(['doc', 'apk', 'archive']);
      const dl = await D().prefix('files', 'main:/Download/'); res.downloads = dl.filter(r => !r.isDir).length;
      res.recent = (await fs.recent(7)).length;
      return res;
    },
    async recent(days) {
      const since = Date.now() - days * 86400000;
      const all = await fs.byCats(['image', 'audio', 'video', 'doc', 'apk', 'archive', 'other']);
      return all.filter(r => r.mtime >= since).sort((a, b) => b.mtime - a.mtime);
    },
    async downloads() {
      const out = [];
      for (const v of ['main', 'sd']) out.push(...(await D().prefix('files', v + ':/Download/')).filter(r => !r.isDir && !isHidden(r)));
      return out.sort((a, b) => b.mtime - a.mtime);
    }
  };

  /* ---------- المصغرات والبيانات الوصفية (كسولة) ---------- */
  const thumbs = {
    cache: new Map(), q: [], active: 0, pending: new Set(),
    get(rec) { return rec.thumb || thumbs.cache.get(rec.id) || null; },
    need(rec) {
      if (rec.isDir) return false;
      if (rec.cat === 'image') return !rec.thumb;
      if (rec.cat === 'video') return !rec.thumb || !(rec.meta && rec.meta.dur);
      if (rec.cat === 'audio') return !(rec.meta && rec.meta.dur);
      return false;
    },
    request(rec, cb) {
      if (!thumbs.need(rec) || thumbs.pending.has(rec.id)) return;
      thumbs.pending.add(rec.id);
      thumbs.q.push({ rec, cb });
      thumbs.pump();
    },
    pump() {
      while (thumbs.active < 2 && thumbs.q.length) {
        const job = thumbs.q.shift();
        thumbs.active++;
        thumbs.run(job.rec).then(r => { if (r && job.cb) job.cb(r); }).catch(() => { }).finally(() => { thumbs.active--; thumbs.pending.delete(job.rec.id); thumbs.pump(); });
      }
    },
    async run(rec) {
      const blob = await fs.readBlob(rec);
      if (!blob.size) return null;
      const patch = {};
      const url = URL.createObjectURL(blob);
      try {
        if (rec.cat === 'image') {
          const img = await loadEl(new Image(), url, 'load');
          patch.thumb = drawThumb(img, img.naturalWidth, img.naturalHeight);
          patch.meta = Object.assign({}, rec.meta, { w: img.naturalWidth, h: img.naturalHeight });
        } else if (rec.cat === 'video') {
          const v = document.createElement('video'); v.muted = true; v.preload = 'metadata';
          await loadEl(v, url, 'loadedmetadata', 'src');
          let dur = v.duration; if (!isFinite(dur)) dur = rec.meta && rec.meta.dur || 0;
          try { v.currentTime = Math.min(0.2, (dur || 1) / 2); await new Promise((res, rej) => { v.onseeked = res; setTimeout(res, 1500); }); patch.thumb = drawThumb(v, v.videoWidth, v.videoHeight); } catch (e) { }
          patch.meta = Object.assign({}, rec.meta, { dur: dur || 1, w: v.videoWidth, h: v.videoHeight });
        } else if (rec.cat === 'audio') {
          const a = new Audio(); a.preload = 'metadata';
          await loadEl(a, url, 'loadedmetadata', 'src');
          patch.meta = Object.assign({}, rec.meta, { dur: a.duration });
        }
      } finally { URL.revokeObjectURL(url); }
      const cur = await D().get('files', rec.id);
      if (!cur) return null;
      Object.assign(cur, patch);
      await D().put('files', cur);
      if (patch.thumb) thumbs.cache.set(cur.id, patch.thumb);
      return cur;
    }
  };
  function loadEl(el, url, evt) {
    return new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error('timeout')), 5000);
      el.addEventListener(evt, () => { clearTimeout(t); res(el); }, { once: true });
      el.addEventListener('error', () => { clearTimeout(t); rej(new Error('load')); }, { once: true });
      el.src = url;
    });
  }
  function drawThumb(src, w, h) {
    const W = 160, s = Math.min(1, W / Math.max(w, h, 1));
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.7);
  }

  FM.fs = fs;
  FM.thumbs = thumbs;
})(window.FM);

;

/* ===== seed.js ===== */
/* seed.js — بيانات تجريبية عند أول تشغيل (صور مولّدة، أصوات WAV، فيديو، نصوص، أرشيف، تطبيقات).
 * على الهاتف الحقيقي (محوّل الملفات الأصلي) لا حاجة لهذه البيانات؛ يُستخدم seed.apps فقط للمحاكاة. */
window.FM = window.FM || {};
(function (FM) {
  'use strict';
  const MB = 1024 * 1024, DAY = 86400000;
  const ago = d => Date.now() - d * DAY - Math.floor(Math.random() * 6) * 3600000;

  function makeImage(seed, w, h, label, type) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'), hue = (seed * 53) % 360;
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, 'hsl(' + hue + ',75%,72%)'); gr.addColorStop(1, 'hsl(' + ((hue + 50) % 360) + ',60%,32%)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(w * (0.2 + (seed % 5) * 0.15), h * 0.25, h * 0.09, 0, 7); g.fill();
    for (let i = 0; i < 3; i++) {
      g.fillStyle = 'hsla(' + ((hue + 120 + i * 20) % 360) + ',45%,' + (28 - i * 6) + '%,' + (0.9 - i * 0.15) + ')';
      g.beginPath(); g.moveTo(-10, h);
      const peaks = 4 + i;
      for (let k = 0; k <= peaks; k++) g.lineTo((k / peaks) * (w + 20) - 10, h * (0.55 + i * 0.1) - ((seed * 37 + k * 71 + i * 29) % 90));
      g.lineTo(w + 10, h); g.fill();
    }
    if (label) { g.fillStyle = 'rgba(255,255,255,.9)'; g.font = 'bold ' + Math.round(h / 14) + 'px sans-serif'; g.fillText(label, 14, h - 14); }
    return new Promise(r => c.toBlob(r, type || 'image/jpeg', 0.8));
  }

  function makeWav(freqs, noteDur) {
    const rate = 8000, n = Math.floor(rate * noteDur), total = n * freqs.length;
    const buf = new ArrayBuffer(44 + total), dv = new DataView(buf);
    const s = (o, t) => { for (let i = 0; i < t.length; i++) dv.setUint8(o + i, t.charCodeAt(i)); };
    s(0, 'RIFF'); dv.setUint32(4, 36 + total, true); s(8, 'WAVE'); s(12, 'fmt '); dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, rate, true); dv.setUint32(28, rate, true);
    dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); s(36, 'data'); dv.setUint32(40, total, true);
    freqs.forEach((f, k) => {
      for (let i = 0; i < n; i++) {
        const env = Math.min(1, i / 200, (n - i) / 400);
        dv.setUint8(44 + k * n + i, 128 + Math.round(90 * env * Math.sin(2 * Math.PI * f * i / rate)));
      }
    });
    return new Blob([buf], { type: 'audio/wav' });
  }

  async function makeVideo() {
    try {
      if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return null;
      const c = document.createElement('canvas'); c.width = 320; c.height = 180;
      const g = c.getContext('2d'), stream = c.captureStream(15);
      const mr = new MediaRecorder(stream, { mimeType: 'video/webm' }), chunks = [];
      mr.ondataavailable = e => e.data.size && chunks.push(e.data);
      const stopped = new Promise(r => mr.onstop = r);
      mr.start(100);
      const t0 = performance.now();
      await new Promise(res => (function draw() {
        const t = (performance.now() - t0) / 1000;
        g.fillStyle = 'hsl(' + (t * 120 % 360) + ',70%,45%)'; g.fillRect(0, 0, 320, 180);
        g.fillStyle = '#fff'; g.beginPath(); g.arc(160 + Math.cos(t * 4) * 90, 90 + Math.sin(t * 4) * 40, 22, 0, 7); g.fill();
        g.font = '16px sans-serif'; g.fillText('File Manager+ demo', 10, 24);
        if (t < 1.6) setTimeout(draw, 66); else res();
      })());
      mr.stop(); await stopped;
      return new Blob(chunks, { type: 'video/webm' });
    } catch (e) { return null; }
  }

  function makePdf(text) {
    const stream = 'BT /F1 20 Tf 20 100 Td (' + text + ') Tj ET';
    const s = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
      '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n' +
      '4 0 obj<</Length ' + stream.length + '>>stream\n' + stream + '\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R/Size 6>>\n%%EOF';
    return new Blob([s], { type: 'application/pdf' });
  }
  const txt = (s, type) => new Blob([s], { type: type || 'text/plain' });
  const fake = (n, type) => { const u = new Uint8Array(n); crypto.getRandomValues(u); u[0] = 0x50; u[1] = 0x4B; return new Blob([u], { type: type || 'application/octet-stream' }); };

  const APPS = [
    ['com.whatsapp', 'WhatsApp', '2.26.14.7', 182, '#25D366', 0, 64], ['com.android.chrome', 'Chrome', '140.0.7339', 241, '#4285F4', 0, 210],
    ['com.google.android.youtube', 'YouTube', '20.14.38', 160, '#FF0000', 0, 120], ['org.telegram.messenger', 'Telegram', '11.9.2', 98, '#229ED9', 0, 45],
    ['com.facebook.katana', 'Facebook', '510.0.0', 320, '#1877F2', 0, 140], ['com.instagram.android', 'Instagram', '390.1.0', 275, '#C13584', 0, 98],
    ['com.google.android.apps.maps', 'Maps', '25.40.1', 210, '#34A853', 0, 156], ['com.google.android.gm', 'Gmail', '2026.10.1', 112, '#EA4335', 0, 33],
    ['com.spotify.music', 'Spotify', '9.0.20', 164, '#1DB954', 0, 220], ['com.netflix.mediaclient', 'Netflix', '9.40.0', 130, '#E50914', 0, 87],
    ['com.android.calculator2', 'Calculator', '9.1', 4, '#607D8B', 0, 1], ['com.alphainventor.filemanager', 'File Manager+', '3.8.2', 22.69, '#FF9800', 0, 12],
    ['com.google.android.apps.photos', 'Photos', '7.20.0', 205, '#FBBC04', 0, 330],
    ['com.android.settings', 'Settings', '15', 42, '#455A64', 1, 8], ['com.android.dialer', 'Phone', '15', 36, '#388E3C', 1, 5],
    ['com.android.messaging', 'Messages', '15', 28, '#1976D2', 1, 9], ['com.android.contacts', 'Contacts', '15', 24, '#0097A7', 1, 4],
    ['com.android.deskclock', 'Clock', '15', 18, '#7B1FA2', 1, 3], ['com.google.android.gms', 'Google Play services', '25.40.30', 480, '#4285F4', 1, 300],
    ['com.google.android.webview', 'Android System WebView', '140.0.7339', 260, '#43A047', 1, 150], ['com.android.gallery3d', 'Gallery', '15', 31, '#F57C00', 1, 40]
  ];

  const seed = {
    appsList() {
      const day = DAY;
      return APPS.map((a, i) => ({ pkg: a[0], name: a[1], version: a[2], size: Math.round(a[3] * MB), color: a[4], system: !!a[5], cache: Math.round(a[6] * MB / 2), installed: Date.now() - (30 + i * 11) * day }));
    },
    async apps() { await FM.DB.putMany('apps', seed.appsList()); },

    async run(progress) {
      const P = progress || (() => { });
      const fs = FM.fs, put = (vol, dir, name, blob, d, size) => fs.writeFile(vol, dir, name, blob, { uniq: false, mark: false, mtime: ago(d), size: size != null ? size : undefined });
      await fs.ensureRoot('main'); await fs.ensureRoot('sd');
      for (const d of ['/Android/data/com.whatsapp/cache', '/Android/media', '/DCIM/Camera', '/DCIM/.thumbnails', '/Download', '/Documents/Work', '/Music', '/Movies', '/Pictures/Screenshots', '/WhatsApp/Media/WhatsApp Images', '/Backups'])
        await fs.mkdirp('main', d);
      for (const d of ['/DCIM/Camera', '/Music', '/Documents', '/Download']) await fs.mkdirp('sd', d);

      P(10);
      const cam = [['IMG_20261114_081530.jpg', 1], ['IMG_20261109_174201.jpg', 8], ['IMG_20261022_120045.jpg', 26], ['IMG_20260915_093312.jpg', 63], ['IMG_20260630_190007.jpg', 140]];
      let seedN = 1;
      for (const [n, d] of cam) {
        const b = await makeImage(seedN++, 800, 520, n.replace('.jpg', ''));
        await put('main', '/DCIM/Camera', n, b, d, (1.4 + seedN * 0.37) * MB | 0);
        if (n === 'IMG_20261109_174201.jpg') await put('main', '/Pictures', 'IMG_20261109_174201 (copy).jpg', b, 7, (1.4 + seedN * 0.37) * MB | 0);
      }
      for (const [n, d] of [['Screenshot_20261115-210344.png', 2], ['Screenshot_20261114-083012.png', 3], ['Screenshot_20261105-154421.png', 12]])
        await put('main', '/Pictures/Screenshots', n, await makeImage(seedN++, 540, 960, 'Screenshot', 'image/png'), d, 420 * 1024);
      for (let i = 1; i <= 3; i++)
        await put('main', '/WhatsApp/Media/WhatsApp Images', 'IMG-202611' + (10 + i) + '-WA000' + i + '.jpg', await makeImage(seedN++, 640, 480, 'WhatsApp'), i * 2, 310 * 1024);
      await put('main', '/Download', 'wallpaper_download.jpg', await makeImage(seedN++, 900, 600, 'Wallpaper'), 4, 2.3 * MB | 0);
      for (const [n, d] of [['Pic_A.jpg', 3], ['Pic_B.jpg', 5]]) await put('sd', '/DCIM/Camera', n, await makeImage(seedN++, 640, 420, n), d, 2.1 * MB | 0);

      P(35);
      const songs = [
        ['Layali - Desert Wind.mp3', [262, 330, 392, 330, 262, 330, 392, 523, 392, 330, 262, 196, 262, 330, 262, 196], 3, 4.8],
        ['Nour - Morning Light.m4a', [330, 392, 440, 392, 330, 294, 262, 294, 330, 392, 440, 523, 440, 392, 330, 294], 6, 5.6],
        ['Zaki Ensemble - Oasis.wav', [220, 262, 330, 262, 220, 196, 175, 196, 220, 262, 330, 392, 330, 262, 220, 196], 10, 21.4],
        ['Sahara Sounds - Night Caravan.ogg', [196, 247, 294, 247, 196, 175, 147, 175, 196, 247, 294, 349, 294, 247, 196, 147], 20, 6.2]
      ];
      for (const [n, f, d, mb] of songs) await put('main', '/Music', n, makeWav(f, 0.4), d, mb * MB | 0);
      await put('sd', '/Music', 'Sunrise Theme.wav', makeWav([392, 440, 494, 523, 494, 440, 392, 330], 0.5), 15, 3.4 * MB | 0);

      P(50);
      const vid = await makeVideo();
      const vmeta = { dur: 1.6, w: 320, h: 180 };
      for (const [n, d, mb] of [['Sample_Clip_720p.mp4', 2, 480], ['Family_Trip_2026.mkv', 18, 2100], ['Tutorial_Intro.webm', 40, 1300]]) {
        if (vid) { const r = await fs.writeFile('main', '/Movies', n, vid, { uniq: false, mark: false, mtime: ago(d), size: mb * MB, meta: vmeta }); }
        else await fs.writeFile('main', '/Movies', n, new Blob([], { type: 'video/webm' }), { uniq: false, mark: false, mtime: ago(d), size: mb * MB });
      }

      P(70);
      const D1 = '/Download';
      await put('main', D1, 'Report_Q3_2026.pdf', makePdf('Report Q3 2026'), 2, 1.2 * MB | 0);
      await put('main', D1, 'invoice_8841.pdf', makePdf('Invoice 8841'), 9, 240 * 1024);
      await put('main', D1, 'Budget_2026.xlsx', fake(2048), 5, 86 * 1024);
      await put('main', D1, 'presentation.pptx', fake(2048), 14, 3.4 * MB | 0);
      await put('main', D1, 'book_sample.epub', fake(2048), 30, 2.9 * MB | 0);
      await put('main', D1, 'app-release.apk', fake(4096), 6, 18.6 * MB | 0);
      await put('main', D1, 'setup.log', txt('[2026-11-10 09:12:01] INFO setup started\n[2026-11-10 09:12:05] WARN low memory\n[2026-11-10 09:12:09] INFO done\n'), 7);
      await put('main', D1, 'temp_download.tmp', fake(512), 11, 56 * MB | 0);
      await put('main', D1, '.nomedia', txt(''), 60);
      await put('main', '/DCIM/.thumbnails', '1700001.tmp', fake(300), 40, 14 * MB | 0);
      await put('main', '/DCIM/.thumbnails', '1700002.tmp', fake(300), 40, 11 * MB | 0);
      await put('main', '/Android/data/com.whatsapp/cache', 'image_cache.cache', fake(300), 9, 64 * MB | 0);
      await put('main', '/Android/data/com.whatsapp/cache', 'old.bak', fake(300), 50, 22 * MB | 0);

      const zip = FM.u.zipWrite([
        { name: 'photos/', data: null }, { name: 'photos/readme.txt', data: new TextEncoder().encode('Photos archive\n') },
        { name: 'notes.txt', data: new TextEncoder().encode('ملاحظات داخل الأرشيف — Notes inside the archive\n') },
        { name: 'data/config.json', data: new TextEncoder().encode('{"ok":true,"items":[1,2,3]}\n') }
      ]);
      await put('main', D1, 'project_files.zip', zip, 3, 12.4 * MB | 0);

      const DOC = '/Documents';
      await put('main', DOC, 'notes.txt', txt('ملاحظات المشروع\n================\n1) تصميم الواجهة\n2) قاعدة البيانات المحلية\n3) اختبار على الهاتف\n\nProject notes — edit me with the built-in text editor.\n'), 1);
      await put('main', DOC, 'todo.md', txt('# To-do\n- [x] Home grid\n- [ ] Cloud sync\n- [ ] Release 3.8.2\n', 'text/markdown'), 4);
      await put('main', DOC, 'config.json', txt('{\n  "app": "File Manager+",\n  "version": "3.8.2",\n  "build": 2103082,\n  "rtl": true\n}\n', 'application/json'), 12);
      await put('main', DOC, 'data.xml', txt('<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item id="1">Alpha</item>\n  <item id="2">Beta</item>\n</root>\n', 'text/xml'), 20);
      await put('main', DOC, 'page.html', txt('<!doctype html>\n<html><body><h1>Hello</h1></body></html>\n', 'text/html'), 25);
      await put('main', DOC, 'contacts.csv', txt('name,phone\nAli,0550000001\nSara,0550000002\n', 'text/csv'), 33);
      await put('main', DOC + '/Work', 'plan.txt', txt('Work plan Q4\n- Review\n- Ship\n'), 2);
      await put('main', DOC + '/Work', 'cv.docx', fake(2048), 90, 74 * 1024);
      await put('sd', '/Documents', 'SD_notes.txt', txt('Notes stored on the SD card.\n'), 16);

      P(90);
      await seed.apps();
      await FM.Settings.set('seeded', 1);
      P(100);
    },

    async cloud(vol, service) {
      const fs = FM.fs, put = (dir, n, b, d, size) => fs.writeFile(vol, dir, n, b, { uniq: false, mark: false, mtime: ago(d), size });
      await fs.ensureRoot(vol);
      await put('/Documents', 'Cloud_Notes.txt', txt('Synced from ' + fs.SERVICES[service].label + '\n'), 5);
      await put('/Documents', 'Contract.pdf', makePdf('Contract'), 12, 380 * 1024);
      await put('/Photos', 'cloud_1.jpg', await makeImage(41, 640, 420, 'Cloud 1'), 8, 1.8 * MB | 0);
      await put('/Photos', 'cloud_2.jpg', await makeImage(42, 640, 420, 'Cloud 2'), 9, 2.2 * MB | 0);
      await put('/Shared', 'readme.txt', txt('Shared folder\n'), 20);
    },
    async remote(vol) {
      const fs = FM.fs, put = (dir, n, b, d, size) => fs.writeFile(vol, dir, n, b, { uniq: false, mark: false, mtime: ago(d), size });
      await fs.ensureRoot(vol);
      await put('/public', 'index.html', txt('<h1>Remote server</h1>', 'text/html'), 3);
      await put('/public', 'readme.txt', txt('Simulated remote share (demo mode).\n'), 4);
      await put('/backup', 'data.csv', txt('id,value\n1,10\n2,20\n', 'text/csv'), 6);
      await fs.mkdirp(vol, '/uploads');
    }
  };
  FM.seed = seed;
})(window.FM);

;

/* ===== ui.js ===== */
/* ui.js — مكوّنات الواجهة المشتركة: حوارات، قوائم، إشعارات، مؤشر تقدم، أيقونات الملفات */
window.FM = window.FM || {};
(function (FM) {
  'use strict';
  const h = FM.h, t = (...a) => FM.t(...a);
  const ui = { stack: [] };

  ui.byId = id => document.getElementById(id);

  /* ---------- إشعارات ---------- */
  ui.toast = function (msg, ms) {
    const el = h('div', { class: 'toast' }, msg);
    ui.byId('toasts').append(el);
    setTimeout(() => el.classList.add('out'), ms || 2200);
    setTimeout(() => el.remove(), (ms || 2200) + 300);
  };
  ui.snackbar = function (msg, actions, ms) {
    const box = ui.byId('toasts');
    box.querySelectorAll('.snack').forEach(e => e.remove());
    const el = h('div', { class: 'snack' }, h('span', { class: 'msg' }, msg),
      (actions || []).map(a => h('button', { class: 'sbtn', onclick: () => { el.remove(); a.onclick(); } }, a.label)));
    box.append(el);
    setTimeout(() => el.classList.add('out'), ms || 8000);
    setTimeout(() => el.remove(), (ms || 8000) + 300);
    return el;
  };

  /* ---------- الطبقات (Overlays) ---------- */
  ui.overlay = function (el, opts) {
    opts = opts || {};
    const rec = { el, opts };
    rec.close = function () {
      const i = ui.stack.indexOf(rec);
      if (i < 0) return;
      ui.stack.splice(i, 1);
      el.classList.add('closing');
      setTimeout(() => el.remove(), opts.instant ? 0 : 160);
      opts.onClose && opts.onClose();
    };
    ui.stack.push(rec);
    ui.byId('overlays').append(el);
    return rec;
  };
  ui.closeTop = function () {
    const top = ui.stack[ui.stack.length - 1];
    if (!top) return false;
    if (top.opts.onBack && top.opts.onBack() === false) return true;
    top.close();
    return true;
  };

  ui.dialog = function (o) {
    const box = h('div', { class: 'dlg' },
      o.title ? h('div', { class: 'dlg-t' }, o.title) : null,
      h('div', { class: 'dlg-b' }, o.body),
      h('div', { class: 'dlg-f' }, (o.buttons || []).map(b => h('button', {
        class: 'dbtn' + (b.primary ? ' primary' : '') + (b.danger ? ' danger' : ''),
        onclick: async () => { const r = b.onclick ? await b.onclick() : undefined; if (r !== false) rec.close(); }
      }, b.label))));
    const scrim = h('div', { class: 'scrim center', onclick: e => { if (e.target === scrim && !o.persistent) rec.close(); } }, box);
    const rec = ui.overlay(scrim, { onClose: o.onClose, onBack: o.persistent ? () => false : undefined });
    return rec;
  };
  ui.confirm = (title, msg, ok, danger) => new Promise(res => {
    let done = false; const fin = v => { if (!done) { done = true; res(v); } };
    ui.dialog({
      title, body: h('p', null, msg), onClose: () => fin(false),
      buttons: [{ label: t('cancel'), onclick: () => fin(false) }, { label: ok || t('ok'), primary: true, danger, onclick: () => fin(true) }]
    });
  });
  ui.alert = (title, body) => ui.dialog({ title, body: typeof body === 'string' ? h('p', null, body) : body, buttons: [{ label: t('ok'), primary: true }] });
  ui.prompt = (title, value, opts) => new Promise(res => {
    opts = opts || {};
    let done = false; const fin = v => { if (!done) { done = true; res(v); } };
    const inp = h('input', { class: 'inp', type: opts.password ? 'password' : 'text', value: value || '', placeholder: opts.placeholder || '' });
    const d = ui.dialog({
      title, onClose: () => fin(null),
      body: h('div', null, opts.label ? h('label', { class: 'lbl' }, opts.label) : null, inp, opts.hint ? h('p', { class: 'hint' }, opts.hint) : null),
      buttons: [{ label: t('cancel'), onclick: () => fin(null) }, { label: t('ok'), primary: true, onclick: () => { fin(inp.value); } }]
    });
    setTimeout(() => {
      inp.focus();
      if (opts.selectName) { const i = inp.value.lastIndexOf('.'); inp.setSelectionRange(0, i > 0 ? i : inp.value.length); } else inp.select();
    }, 60);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { fin(inp.value); d.close(); } });
  });

  /** قائمة سفلية: items [{label, sub, icon, checked, danger, onclick}] */
  ui.sheet = function (title, items, opts) {
    const list = h('div', { class: 'sheet-l' }, items.filter(Boolean).map(it => h('button', {
      class: 'sheet-i' + (it.danger ? ' danger' : ''), disabled: it.disabled,
      onclick: () => { rec.close(); it.onclick && setTimeout(it.onclick, 30); }
    }, it.icon ? FM.icon(it.icon, 22) : null, h('span', { class: 'sl' }, it.label, it.sub ? h('small', null, it.sub) : null),
      it.checked != null ? h('span', { class: 'chk' }, it.checked ? FM.icon('check', 20) : '') : null)));
    const scrim = h('div', { class: 'scrim bottom', onclick: e => { if (e.target === scrim) rec.close(); } },
      h('div', { class: 'sheet' }, title ? h('div', { class: 'sheet-t' }, title) : null, list));
    const rec = ui.overlay(scrim, opts);
    return rec;
  };
  /** قائمة منبثقة بزاوية الشاشة (القائمة الإضافية) */
  ui.popup = function (items) {
    const box = h('div', { class: 'popup' }, items.filter(Boolean).map(it => h('button', {
      class: 'pop-i' + (it.danger ? ' danger' : ''),
      onclick: () => { rec.close(); it.onclick && setTimeout(it.onclick, 30); }
    }, it.label, it.checked != null ? h('span', { class: 'chk' }, it.checked ? '✓' : '') : null)));
    const scrim = h('div', { class: 'scrim clear', onclick: e => { if (e.target === scrim) rec.close(); } }, box);
    const rec = ui.overlay(scrim, { instant: true });
    return rec;
  };

  /* ---------- الشريط العلوي ---------- */
  ui.topbar = function (o) {
    const bar = h('header', { class: 'topbar' + (o.cls ? ' ' + o.cls : '') });
    if (o.left) {
      const ic = FM.icon(o.left === 'back' ? 'back' : o.left, 24);
      if (o.left === 'back') ic.classList.add('flip');
      bar.append(h('button', { class: 'ibtn', 'aria-label': o.left, onclick: o.onLeft }, ic));
    }
    bar.append(h('div', { class: 'tb-title' }, o.title || '', o.sub ? h('small', null, o.sub) : null));
    (o.actions || []).forEach(a => bar.append(h('button', {
      class: 'ibtn' + (a.text ? ' txt' : ''), 'aria-label': a.label || a.icon, onclick: a.onclick
    }, a.text ? a.text : FM.icon(a.icon, 24))));
    return bar;
  };

  /* ---------- أيقونات الملفات ---------- */
  const EXT_COL = { pdf: '#E53935', doc: '#1976D2', docx: '#1976D2', xls: '#2E7D32', xlsx: '#2E7D32', ppt: '#E65100', pptx: '#E65100', epub: '#6D4C41' };
  ui.fileStyle = function (rec) {
    if (rec.isDir) return { icon: 'folder', color: '#FBC02D', plain: true };
    switch (rec.cat) {
      case 'image': return { icon: 'image', color: '#E91E63' };
      case 'audio': return { icon: 'music', color: '#9C27B0' };
      case 'video': return { icon: 'video', color: '#F44336' };
      case 'apk': return { icon: 'android', color: '#FFC107' };
      case 'archive': return { icon: 'zip', color: '#795548' };
      case 'doc': return { icon: 'file', color: EXT_COL[rec.ext] || '#009688', label: EXT_COL[rec.ext] ? rec.ext.slice(0, 4).toUpperCase() : '' };
      default: return { icon: 'file', color: '#78909C' };
    }
  };
  ui.fileIcon = function (rec, size) {
    size = size || 40;
    const st = ui.fileStyle(rec);
    const box = h('div', { class: 'fi' + (st.plain ? ' plain' : ''), style: { width: size + 'px', height: size + 'px', background: st.plain ? 'transparent' : st.color, color: st.plain ? st.color : '#fff' } });
    const th = FM.thumbs.get(rec);
    if (th) { box.classList.add('thumb'); box.append(h('img', { src: th, alt: '', draggable: 'false' })); }
    else { box.append(FM.icon(st.icon, Math.round(size * (st.plain ? 0.95 : 0.55)))); if (st.label) box.append(h('b', { class: 'ext' }, st.label)); }
    if (rec.cat === 'video' && th) box.append(h('i', { class: 'playb' }, FM.icon('play', 16)));
    return box;
  };
  ui.circle = function (icon, color, size) {
    return h('div', { class: 'circ', style: { width: size + 'px', height: size + 'px', background: color } }, FM.icon(icon, Math.round(size * 0.5)));
  };

  /* ---------- مهمة بمؤشر تقدم (قابلة للإخفاء في الإشعارات) ---------- */
  ui.runTask = async function (title, worker) {
    const ctl = { cancelled: false };
    const bar = h('div', { class: 'bar' }, h('i')), pct = h('b', null, '0%'), nm = h('div', { class: 'tname' }, '…'), sp = h('span', null, ''), eta = h('span', null, '');
    const nb = h('div', { class: 'ntask' }, h('div', { class: 'nt' }, title), h('div', { class: 'bar' }, h('i')), h('small', null, ''));
    let hidden = false;
    const dlg = ui.dialog({
      title, persistent: true,
      body: h('div', { class: 'prog' }, nm, bar, h('div', { class: 'prow' }, pct, sp, eta)),
      buttons: [
        { label: t('hide'), onclick: () => { hidden = true; ui.byId('notifs').append(nb); } },
        { label: t('cancel'), onclick: () => { ctl.cancelled = true; return false; } }
      ]
    });
    const upd = p => {
      nm.textContent = p.name || '';
      bar.firstChild.style.width = p.pct + '%'; nb.querySelector('.bar i').style.width = p.pct + '%';
      pct.textContent = p.pct + '%';
      sp.textContent = p.speed ? FM.u.fmtSize(p.speed) + '/s' : '';
      eta.textContent = p.eta > 0.5 ? t('eta', { s: Math.ceil(p.eta) }) : '';
      nb.querySelector('small').textContent = p.pct + '% — ' + (p.name || '');
    };
    try { return await worker(upd, ctl); }
    finally { dlg.close(); nb.remove(); }
  };

  FM.ui = ui;
})(window.FM);

;

/* ===== viewers.js ===== */
/* viewers.js — عارض الصور، مشغل الصوت/الفيديو، محرر النصوص، عارض PDF */
window.FM = window.FM || {};
(function (FM) {
  'use strict';
  const h = FM.h, t = (...a) => FM.t(...a), ui = FM.ui, fs = FM.fs, u = FM.u;
  const flipIcon = n => { const i = FM.icon(n, 24); i.classList.add('flip'); return i; };

  function frame(cls, title, actions, onClose) {
    const bar = h('div', { class: 'vbar' }, h('button', { class: 'ibtn', onclick: () => FM.handleBack() }, flipIcon('back')), h('div', { class: 'vt' }, title),
      (actions || []).map(a => h('button', { class: 'ibtn', 'aria-label': a.label || a.icon, onclick: a.onclick }, a.node || FM.icon(a.icon, 24))));
    const el = h('div', { class: 'viewer ' + cls }, bar);
    return { el, bar };
  }

  const V = FM.viewers = {};

  /* ---------- الصور ---------- */
  V.image = function (rec, list) {
    if (!list.length) list = [rec];
    let idx = Math.max(0, list.findIndex(r => r.id === rec.id)), scale = 1, tx = 0, ty = 0, rot = 0, url = null, timer = null, uiOn = true;
    const img = h('img', { class: 'vimg', draggable: 'false', alt: '' });
    const stage = h('div', { class: 'stage' }, img);
    const counter = h('div', { class: 'vcount' });
    const slideBtn = h('span', null, FM.icon('play', 24));
    const f = frame('img', '', [
      { node: slideBtn, label: 'slideshow', onclick: toggleShow }, { icon: 'rotate', onclick: () => { rot = (rot + 90) % 360; apply(); } },
      { icon: 'more', onclick: menu }], () => cleanup());
    f.el.append(stage, counter);
    const prevB = h('button', { class: 'nav-b l', onclick: () => step(FM.rtl() ? 1 : -1) }, FM.icon('back', 24)), nextB = h('button', { class: 'nav-b r', onclick: () => step(FM.rtl() ? -1 : 1) }, FM.icon('chevron', 24));
    if (list.length > 1) f.el.append(prevB, nextB);
    const apply = () => { img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ') rotate(' + rot + 'deg)'; };
    async function load(i) {
      idx = (i + list.length) % list.length;
      const r = list[idx];
      f.el.querySelector('.vt').textContent = r.name;
      counter.textContent = (idx + 1) + ' / ' + list.length;
      scale = 1; tx = ty = 0; rot = 0; apply();
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(await fs.readBlob(r));
      img.src = url;
    }
    const step = d => load(idx + d);
    function toggleShow() {
      if (timer) { clearInterval(timer); timer = null; slideBtn.replaceChildren(FM.icon('play', 24)); }
      else { timer = setInterval(() => step(1), 3000); slideBtn.replaceChildren(FM.icon('pause', 24)); ui.toast(t('slideshow.on')); }
    }
    function cleanup() { clearInterval(timer); if (url) URL.revokeObjectURL(url); }
    function menu() {
      const r = list[idx];
      ui.sheet(r.name, [
        { label: t('wallpaper.set'), icon: 'image', onclick: async () => { await FM.DB.put('blobs', { id: 'wallpaper', blob: await fs.readBlob(r) }); await FM.Settings.set('wallpaper', 'wallpaper'); ui.toast(t('wallpaper.done')); } },
        { label: t('share'), icon: 'share', onclick: () => FM.share([r]) },
        { label: t('properties'), icon: 'info', onclick: () => FM.properties([r]) }]);
    }
    /* لمس: تكبير بإصبعين، تحريك، نقر مزدوج، سحب للتنقل */
    const ptrs = new Map(); let pinch0 = null, startX = 0, startY = 0, lastTap = 0, moved = 0, base = null;
    stage.addEventListener('pointerdown', e => {
      stage.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), s: scale }; }
      else { startX = e.clientX; startY = e.clientY; moved = 0; base = { tx, ty }; }
    });
    stage.addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2 && pinch0) { const [a, b] = [...ptrs.values()]; scale = Math.min(8, Math.max(1, pinch0.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch0.d)); apply(); }
      else if (ptrs.size === 1) {
        const dx = e.clientX - startX, dy = e.clientY - startY; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
        if (scale > 1.02) { tx = base.tx + dx; ty = base.ty + dy; apply(); }
      }
    });
    const end = e => {
      if (!ptrs.has(e.pointerId)) return;
      const was = ptrs.size; ptrs.delete(e.pointerId);
      if (was === 2) { pinch0 = null; if (scale < 1.05) { scale = 1; tx = ty = 0; apply(); } return; }
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (scale <= 1.02 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) { step((dx < 0 ? 1 : -1) * (FM.rtl() ? -1 : 1)); return; }
      if (moved < 8) {
        const now = Date.now();
        if (now - lastTap < 300) { if (scale > 1.2) { scale = 1; tx = ty = 0; } else scale = 2.5; apply(); lastTap = 0; }
        else { lastTap = now; setTimeout(() => { if (lastTap && Date.now() - lastTap >= 290) { uiOn = !uiOn; f.el.classList.toggle('hideui', !uiOn); lastTap = 0; } }, 300); }
      }
    };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', e => { e.preventDefault(); scale = Math.min(8, Math.max(1, scale * (e.deltaY < 0 ? 1.15 : 0.87))); if (scale === 1) tx = ty = 0; apply(); }, { passive: false });
    ui.overlay(f.el, { onClose: cleanup });
    load(idx);
  };

  /* ---------- الصوتيات ---------- */
  V.audio = function (rec, list) {
    if (!list.length) list = [rec];
    let idx = Math.max(0, list.findIndex(r => r.id === rec.id)), url = null;
    const exo = FM.Settings.get('audioEngine') === 'exo';
    const au = new Audio();
    const title = h('div', { class: 'at' }), artist = h('div', { class: 'aa' });
    const seek = h('input', { type: 'range', min: 0, max: 1000, value: 0, class: 'seek' });
    const cur = h('span', null, '0:00'), tot = h('span', null, '--:--');
    const ppIcon = h('span', null, FM.icon('play', 36));
    const pp = h('button', { class: 'bigplay', onclick: () => au.paused ? au.play() : au.pause() }, ppIcon);
    const speed = h('select', { class: 'sel' }, [0.75, 1, 1.25, 1.5, 2].map(s => h('option', { value: s, selected: s === 1 }, s + 'x')));
    speed.onchange = () => { au.playbackRate = +speed.value; };
    const f = frame('audio', t('player'), [], null);
    const art = h('div', { class: 'cover' }, FM.icon('music', 96));
    f.el.append(h('div', { class: 'abody' }, art, title, artist, h('div', { class: 'seekrow' }, cur, seek, tot),
      h('div', { class: 'ctrls' }, h('button', { class: 'ibtn', onclick: () => step(-1) }, FM.icon('prev', 32)), pp, h('button', { class: 'ibtn', onclick: () => step(1) }, FM.icon('next', 32))),
      h('div', { class: 'engine' }, 'Engine: ' + (exo ? 'ExoPlayer' : 'MediaPlayer'), exo ? speed : null)));
    async function load(i, autoplay) {
      idx = (i + list.length) % list.length; const r = list[idx];
      const base = r.name.replace(/\.[^.]+$/, ''), m = base.split(' - ');
      title.textContent = m.length > 1 ? m.slice(1).join(' - ') : base; artist.textContent = m.length > 1 ? m[0] : t('unknown.artist');
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(await fs.readBlob(r)); au.src = url; au.playbackRate = +speed.value;
      if (autoplay !== false) au.play().catch(() => { });
    }
    const step = d => load(idx + d);
    au.onplay = () => { ppIcon.replaceChildren(FM.icon('pause', 36)); art.classList.add('spin'); };
    au.onpause = () => { ppIcon.replaceChildren(FM.icon('play', 36)); art.classList.remove('spin'); };
    au.onended = () => step(1);
    au.onloadedmetadata = () => { tot.textContent = u.fmtDur(au.duration); };
    au.ontimeupdate = () => { cur.textContent = u.fmtDur(au.currentTime); if (au.duration) seek.value = au.currentTime / au.duration * 1000; };
    seek.oninput = () => { if (au.duration) au.currentTime = seek.value / 1000 * au.duration; };
    ui.overlay(f.el, { onClose: () => { au.pause(); au.src = ''; if (url) URL.revokeObjectURL(url); } });
    load(idx);
  };

  /* ---------- الفيديو (إيماءات سطوع/صوت/تقديم) ---------- */
  V.video = async function (rec, list) {
    if (!list.length) list = [rec];
    let idx = Math.max(0, list.findIndex(r => r.id === rec.id)), url = null, bright = 1, uiOn = true;
    const v = h('video', { class: 'vid', playsinline: true });
    const hud = h('div', { class: 'hud' });
    const seek = h('input', { type: 'range', min: 0, max: 1000, value: 0, class: 'seek' });
    const cur = h('span', null, '0:00'), tot = h('span', null, '--:--');
    const ppIcon = h('span', null, FM.icon('play', 30));
    const pp = h('button', { class: 'ibtn', onclick: () => v.paused ? v.play() : v.pause() }, ppIcon);
    const stage = h('div', { class: 'stage vstage' }, v, hud);
    const f = frame('video', '', [{ icon: 'more', onclick: () => ui.sheet(list[idx].name, [{ label: t('share'), icon: 'share', onclick: () => FM.share([list[idx]]) }, { label: t('properties'), icon: 'info', onclick: () => FM.properties([list[idx]]) }]) }]);
    const ctr = h('div', { class: 'vctrl' }, h('button', { class: 'ibtn', onclick: () => step(-1) }, FM.icon('prev', 26)), pp, h('button', { class: 'ibtn', onclick: () => step(1) }, FM.icon('next', 26)), cur, seek, tot);
    f.el.append(stage, ctr);
    const noData = h('div', { class: 'nodata' }, t('video.nodata'));
    const showHud = (txt) => { hud.textContent = txt; hud.classList.add('on'); clearTimeout(showHud.t); showHud.t = setTimeout(() => hud.classList.remove('on'), 700); };
    async function load(i) {
      idx = (i + list.length) % list.length; const r = list[idx];
      f.el.querySelector('.vt').textContent = r.name; noData.remove();
      if (url) URL.revokeObjectURL(url);
      const b = await fs.readBlob(r);
      if (!b.size) { v.removeAttribute('src'); stage.append(noData); return; }
      url = URL.createObjectURL(b); v.src = url; v.play().catch(() => { });
    }
    const step = d => load(idx + d);
    v.onplay = () => ppIcon.replaceChildren(FM.icon('pause', 30)); v.onpause = () => ppIcon.replaceChildren(FM.icon('play', 30));
    const dur = () => isFinite(v.duration) && v.duration > 0 ? v.duration : (list[idx].meta && list[idx].meta.dur) || 0;
    v.onloadedmetadata = () => { tot.textContent = u.fmtDur(dur()); };
    v.ontimeupdate = () => { cur.textContent = u.fmtDur(v.currentTime); const d = dur(); if (d) seek.value = Math.min(1000, v.currentTime / d * 1000); tot.textContent = u.fmtDur(dur()); };
    v.onended = () => { if (list.length > 1) step(1); };
    seek.oninput = () => { const d = dur(); if (d) v.currentTime = seek.value / 1000 * d; };
    /* الإيماءات */
    let g = null;
    stage.addEventListener('pointerdown', e => { stage.setPointerCapture(e.pointerId); const r = stage.getBoundingClientRect(); g = { x: e.clientX, y: e.clientY, side: (e.clientX - r.left) < r.width / 2 ? 'l' : 'r', mode: null, w: r.width, h: r.height, t0: v.currentTime, b0: bright, v0: v.volume, moved: 0 }; });
    stage.addEventListener('pointermove', e => {
      if (!g || !FM.Settings.get('gestures')) return;
      const dx = e.clientX - g.x, dy = e.clientY - g.y; g.moved = Math.max(g.moved, Math.abs(dx) + Math.abs(dy));
      if (!g.mode && g.moved > 14) g.mode = Math.abs(dx) > Math.abs(dy) ? 'seek' : (g.side === 'l' ? 'bright' : 'vol');
      if (g.mode === 'seek') { const d = dur(); const nt = Math.max(0, Math.min(d || 1e9, g.t0 + dx / g.w * 90)); v.currentTime = nt; showHud((dx >= 0 ? '▶▶ ' : '◀◀ ') + u.fmtDur(nt)); }
      if (g.mode === 'bright') { bright = Math.max(0.2, Math.min(1.6, g.b0 - dy / g.h * 1.6)); v.style.filter = 'brightness(' + bright + ')'; showHud(t('brightness') + ' ' + Math.round(bright / 1.6 * 100) + '%'); }
      if (g.mode === 'vol') { v.volume = Math.max(0, Math.min(1, g.v0 - dy / g.h * 1.3)); showHud(t('volume') + ' ' + Math.round(v.volume * 100) + '%'); }
    });
    stage.addEventListener('pointerup', () => { if (g && g.moved < 8) { uiOn = !uiOn; f.el.classList.toggle('hideui', !uiOn); } g = null; });
    stage.addEventListener('pointercancel', () => { g = null; });
    ui.overlay(f.el, { onClose: () => { v.pause(); v.removeAttribute('src'); if (url) URL.revokeObjectURL(url); } });
    load(idx);
  };

  /* ---------- PDF ---------- */
  V.pdf = async function (rec) {
    const blob = await fs.readBlob(rec); const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const f = frame('pdf', rec.name, [{ icon: 'share', onclick: () => FM.openWith(rec) }]);
    f.el.append(h('iframe', { class: 'pdf', src: url }), h('div', { class: 'hint pad' }, t('pdf.hint')));
    ui.overlay(f.el, { onClose: () => URL.revokeObjectURL(url) });
  };

  /* ---------- محرر النصوص ---------- */
  V.text = async function (rec) {
    const bytes = new Uint8Array(await (await fs.readBlob(rec)).arrayBuffer());
    let enc = 'utf-8', dirty = false, wrap = false, fsz = 14;
    const ta = h('textarea', { class: 'ta', spellcheck: 'false', wrap: 'off', dir: 'auto' });
    const gut = h('div', { class: 'gut' });
    const title = h('span', null, rec.name);
    const sel = h('select', { class: 'sel', onchange: () => { if (dirty) { ui.toast(t('enc.dirty')); sel.value = enc; return; } enc = sel.value; setText(); } },
      ['utf-8', 'utf-16le', 'iso-8859-1', 'windows-1252', 'windows-1256'].map(e => h('option', { value: e }, e.toUpperCase())));
    const f = frame('text', '', [
      { icon: 'check', label: t('save'), onclick: save }, { icon: 'more', onclick: menu }]);
    f.el.querySelector('.vt').replaceChildren(title, sel);
    const body = h('div', { class: 'tbody' }, gut, ta);
    f.el.append(body);
    function setText() { ta.value = new TextDecoder(enc).decode(bytes); lines(); }
    function lines() { const n = ta.value.split('\n').length; gut.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n'); }
    function mark(d) { dirty = d; title.textContent = (d ? '● ' : '') + rec.name; }
    ta.addEventListener('input', () => { mark(true); lines(); });
    ta.addEventListener('scroll', () => { gut.scrollTop = ta.scrollTop; });
    function applyView() { ta.style.fontSize = gut.style.fontSize = fsz + 'px'; ta.wrap = wrap ? 'soft' : 'off'; ta.classList.toggle('wrap', wrap); gut.style.display = wrap ? 'none' : ''; }
    function encode(text) {
      if (enc === 'utf-16le') { const b = new Uint8Array(text.length * 2); for (let i = 0; i < text.length; i++) { b[2 * i] = text.charCodeAt(i) & 255; b[2 * i + 1] = text.charCodeAt(i) >> 8; } return b; }
      if (enc === 'iso-8859-1' || enc === 'windows-1252') { const b = new Uint8Array(text.length); for (let i = 0; i < text.length; i++) b[i] = text.charCodeAt(i) & 255; return b; }
      return new TextEncoder().encode(text);
    }
    async function save() {
      if (enc === 'windows-1256') { enc = 'utf-8'; sel.value = enc; ui.toast(t('enc.saved.utf8')); }
      const blob = new Blob([encode(ta.value)], { type: rec.mime || 'text/plain' });
      await fs.overwrite(rec, blob); mark(false); ui.toast(t('saved'));
    }
    function menu() {
      ui.sheet(rec.name, [{ label: t('wrap'), checked: wrap, onclick: () => { wrap = !wrap; applyView(); } },
        { label: t('font.up'), onclick: () => { fsz = Math.min(28, fsz + 2); applyView(); } }, { label: t('font.down'), onclick: () => { fsz = Math.max(9, fsz - 2); applyView(); } },
        { label: t('share'), icon: 'share', onclick: () => FM.share([rec]) }]);
    }
    setText(); applyView();
    ui.overlay(f.el, {
      onBack() {
        if (!dirty) return true;
        ui.confirm(t('unsaved'), t('unsaved.msg'), t('discard'), true).then(ok => { if (ok) { dirty = false; FM.handleBack(); } });
        return false;
      }
    });
  };
})(window.FM);

;

/* ===== screen-browser.js ===== */
/* screen-browser.js — تصفح المجلدات، الفئات، البحث، وضع التحديد، الحافظة، الخصائص */
window.FM = window.FM || {};
(function (FM) {
  'use strict';
  const h = FM.h, t = (...a) => FM.t(...a), ui = FM.ui, fs = FM.fs, u = FM.u;

  FM.clip = null; // {items, mode, srcVol, srcDir}
  FM.lastPaste = null;

  /* ---------- فتح الملفات ---------- */
  FM.openFile = async function (rec, siblings) {
    const V = FM.viewers;
    if (rec.cat === 'image') return V.image(rec, (siblings || []).filter(r => r.cat === 'image'));
    if (rec.cat === 'audio') return V.audio(rec, (siblings || []).filter(r => r.cat === 'audio'));
    if (rec.cat === 'video') return V.video(rec, (siblings || []).filter(r => r.cat === 'video'));
    if (rec.ext === 'pdf') return V.pdf(rec);
    if (rec.cat === 'archive') return FM.nav.push('archive', { id: rec.id });
    if (rec.cat === 'apk') return FM.apkInfo(rec);
    if (fs.TEXT_EXT.has(rec.ext) || (rec.mime || '').startsWith('text/')) return V.text(rec);
    return FM.openWith(rec);
  };
  FM.openWith = async function (rec) {
    const blob = await fs.readBlob(rec);
    const file = new File([blob], rec.name, { type: rec.mime || blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: rec.name }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    FM.download(rec, blob);
  };
  FM.download = function (rec, blob) {
    const a = h('a', { href: URL.createObjectURL(blob), download: rec.name });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  FM.share = async function (recs) {
    const files = [];
    for (const r of recs.filter(r => !r.isDir)) files.push(new File([await fs.readBlob(r)], r.name, { type: r.mime }));
    if (files.length && navigator.canShare && navigator.canShare({ files })) { try { await navigator.share({ files }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    if (files.length === 1) return FM.download(recs.find(r => !r.isDir), files[0]);
    ui.toast(t('share.na'));
  };
  FM.apkInfo = function (rec) {
    ui.dialog({
      title: rec.name, body: h('div', null, h('p', null, t('apk.msg')), h('p', { class: 'hint' }, t('apk.native'))),
      buttons: [{ label: t('close') }]
    });
  };

  /* ---------- الخصائص ---------- */
  FM.properties = async function (recs) {
    const one = recs.length === 1 ? recs[0] : null;
    const rows = h('div', { class: 'props' });
    const add = (k, v) => rows.append(h('div', { class: 'pr' }, h('span', { class: 'pk' }, k), h('span', { class: 'pv' }, v)));
    let size = 0;
    for (const r of recs) size += await fs.dirSize(r);
    if (one) {
      add(t('p.name'), one.name || '/');
      add(t('p.path'), one.vol + ':' + one.path);
      add(t('p.type'), one.isDir ? t('p.folder') : (one.mime || one.ext || '—'));
      if (one.isDir) add(t('p.items'), String(await fs.childCount(one.id)));
      add(t('p.size'), u.fmtSize(size) + ' (' + size.toLocaleString() + ' ' + t('p.bytes') + ')');
      add(t('p.modified'), u.fmtDate(one.mtime));
      add(t('p.created'), u.fmtDate(one.ctime));
      add(t('p.perm'), 'rw-  ' + (one.vol.startsWith('rc_') || one.vol.startsWith('c_') ? t('p.remote') : t('p.local')));
      if (one.meta && one.meta.w) add(t('p.res'), one.meta.w + '×' + one.meta.h);
      if (one.meta && one.meta.dur) add(t('p.dur'), u.fmtDur(one.meta.dur));
    } else {
      add(t('p.count'), String(recs.length));
      add(t('p.size'), u.fmtSize(size));
    }
    const body = h('div', null, rows);
    if (one && !one.isDir) {
      const out = h('div', { class: 'hashes' });
      body.append(out, h('button', {
        class: 'dbtn', onclick: async e => {
          e.target.disabled = true;
          const buf = await (await fs.readBlob(one)).arrayBuffer();
          out.innerHTML = '';
          for (const [k, v] of [['MD5', u.md5(buf)], ['SHA-1', await u.digest('SHA-1', buf)], ['SHA-256', await u.digest('SHA-256', buf)]])
            out.append(h('div', { class: 'hash' }, h('b', null, k), h('code', null, v)));
          e.target.remove();
        }
      }, t('p.hash')));
    }
    ui.dialog({ title: t('properties'), body, buttons: [{ label: t('close'), primary: true }] });
  };

  /* ---------- شاشة التصفح ---------- */
  FM.screens = FM.screens || {};
  FM.screens.browser = function (params) {
    const S = { items: [], sel: new Set(), selMode: false, groups: null, anchor: null };
    const root = h('div', { class: 'screen browser' });
    const bar = h('div', { class: 'bar-slot' }), crumbs = h('nav', { class: 'crumbs' }), list = h('div', { class: 'flist' }), bottom = h('div', { class: 'bottom-slot' });
    const emptyEl = h('div', { class: 'empty' });
    root.append(bar, crumbs, list, emptyEl, bottom);

    const isDir = !!params.vol && !params.search && !params.special;
    const mode = () => FM.Settings.get('view');
    let volInfo = null;

    /* ----- تحميل البيانات ----- */
    async function load() {
      volInfo = params.vol ? await fs.volume(params.vol) : null;
      if (params.vol && !volInfo) { FM.nav.home(); return; }
      let items = [];
      S.groups = null;
      if (isDir) {
        if (params.vol.startsWith('rc_') && !(await fs.exists(params.vol, '/'))) await FM.seed.remote(params.vol);
        items = await fs.list(params.vol, params.path);
      } else if (params.special === 'trash') items = await fs.trashItems();
      else if (params.search != null) items = await fs.search(params.search, params.scope);
      else if (params.cat === 'downloads') items = await fs.downloads();
      else if (params.cat === 'recent') { items = await fs.recent(7); S.groups = 'date'; }
      else if (params.cat) {
        const map = { images: ['image'], audio: ['audio'], video: ['video'], docs: ['doc', 'apk', 'archive'] };
        items = fs.sortRecs(await fs.byCats(map[params.cat]));
        if (params.cat === 'images') S.groups = 'folder';
      }
      if (S.groups === 'folder') items = items.slice().sort((a, b) => (a.path.slice(0, a.path.lastIndexOf('/')) || '/').localeCompare(b.path.slice(0, b.path.lastIndexOf('/')) || '/') || b.mtime - a.mtime);
      S.items = items;
      S.sel = new Set([...S.sel].filter(id => items.some(i => i.id === id)));
      if (!S.sel.size) S.selMode = false;
      renderAll();
    }

    /* ----- أعلى الشاشة ----- */
    function title() {
      if (isDir) return params.path === '/' ? (volInfo ? volInfo.label : '') : fs.baseName(params.path);
      if (params.special === 'trash') return t('trash');
      if (params.search != null) return t('search');
      return params.title || t('cat.' + params.cat);
    }
    function renderBar() {
      bar.innerHTML = '';
      if (S.selMode) {
        bar.append(ui.topbar({
          cls: 'sel', left: 'close', onLeft: exitSel, title: t('selected', { n: S.sel.size }),
          actions: [{ text: t('all'), onclick: selectAll }, { text: t('range'), onclick: selectRange }]
        }));
        return;
      }
      const acts = [];
      if (isDir || params.search != null) acts.push({ icon: 'search', onclick: () => FM.nav.push('search', { scope: isDir ? { vol: params.vol, path: params.path } : null }) });
      acts.push({ icon: 'more', onclick: overflow });
      bar.append(ui.topbar({ left: 'back', onLeft: () => FM.handleBack(), title: title(), sub: isDir && params.path !== '/' ? undefined : undefined, actions: acts }));
    }
    function renderCrumbs() {
      crumbs.innerHTML = '';
      crumbs.style.display = isDir ? '' : 'none';
      if (!isDir) return;
      const sep = () => h('span', { class: 'sep flip' }, FM.icon('chevron', 16));
      crumbs.append(h('button', { class: 'cr', onclick: () => FM.nav.home() }, FM.icon('home', 18)), sep(),
        h('button', { class: 'cr', onclick: () => FM.nav.goPath(params.vol, '/') }, volInfo ? volInfo.label.split(' — ')[0] : params.vol));
      let cur = '/';
      params.path.split('/').filter(Boolean).forEach(s => {
        cur = fs.join(cur, s); const p = cur;
        crumbs.append(sep(), h('button', { class: 'cr', onclick: () => FM.nav.goPath(params.vol, p) }, s));
      });
      setTimeout(() => crumbs.scrollTo({ left: FM.rtl() ? -9999 : 9999 }), 0);
    }

    /* ----- عناصر القائمة ----- */
    function itemEl(rec) {
      const m = mode(), grid = m.startsWith('grid');
      const selected = S.sel.has(rec.id);
      const isNew = rec.mark && Date.now() - rec.mark < 600000;
      const sub = h('div', { class: 'sub' });
      if (!grid) {
        const extra = (params.search != null || params.cat || params.special) ? (rec.path.slice(0, rec.path.lastIndexOf('/')) || '/') : '';
        if (rec.isDir) { sub.replaceChildren(...u.parts([u.fmtDate(rec.mtime), extra])); fs.childCount(rec.id).then(n => sub.replaceChildren(...u.parts([t('n.items', { n }), u.fmtDate(rec.mtime), extra]))); }
        else {
          const m = rec.meta || {};
          sub.replaceChildren(...u.parts([(rec.cat === 'audio' || rec.cat === 'video') && m.dur ? u.fmtDur(m.dur) : '', rec.cat === 'video' && m.h ? m.h + 'p' : '', u.fmtSize(rec.size), u.fmtDate(rec.mtime), extra]));
        }
      }
      const size = grid ? (m === 'grid-large' ? 120 : 72) : (m === 'list-compact' ? 32 : 44);
      const row = h('div', { class: 'item ' + (grid ? 'grid ' + m : m) + (selected ? ' selected' : ''), 'data-id': rec.id },
        ui.fileIcon(rec, size),
        h('div', { class: 'meta' }, h('div', { class: 'nm' }, isNew ? h('i', { class: 'newdot' }) : null, rec.name), (m === 'list-compact' || grid) ? null : sub),
        h('div', { class: 'cb' + (selected ? ' on' : ''), onclick: e => { e.stopPropagation(); toggle(rec); } }, selected ? FM.icon('check', 16) : null));
      let timer, moved = false, lp = false;
      row.addEventListener('pointerdown', e => { moved = false; lp = false; timer = setTimeout(() => { lp = true; if (!S.selMode) { enterSel(rec); if (navigator.vibrate) navigator.vibrate(15); } }, 450); });
      const cancel = () => clearTimeout(timer);
      row.addEventListener('pointermove', e => { if (Math.abs(e.movementX) + Math.abs(e.movementY) > 6) { moved = true; cancel(); } });
      row.addEventListener('pointerup', cancel); row.addEventListener('pointerleave', cancel); row.addEventListener('pointercancel', cancel);
      row.addEventListener('contextmenu', e => e.preventDefault());
      row.addEventListener('click', () => { if (lp || moved) return; if (S.selMode) toggle(rec); else openItem(rec); });
      if (FM.thumbs.need(rec)) FM.thumbs.request(rec, nr => { const i = S.items.findIndex(x => x.id === nr.id); if (i >= 0) { S.items[i] = nr; const cur = list.querySelector('[data-id="' + CSS.escape(nr.id) + '"]'); if (cur) cur.replaceWith(itemEl(nr)); } });
      return row;
    }
    function renderList() {
      list.innerHTML = '';
      const m = mode();
      list.className = 'flist ' + (m.startsWith('grid') ? m : '');
      if (!S.items.length) {
        emptyEl.style.display = '';
        emptyEl.innerHTML = '';
        emptyEl.append(h('div', { class: 'big' }, FM.icon('folder', 64)), h('div', null, params.special === 'trash' ? t('trash.empty') : t('empty')));
      } else emptyEl.style.display = 'none';
      let lastG = null;
      for (const rec of S.items) {
        if (S.groups) {
          const g = S.groups === 'folder' ? (rec.path.slice(0, rec.path.lastIndexOf('/')) || '/') : dayLabel(rec.mtime);
          if (g !== lastG) { list.append(h('div', { class: 'group' }, g)); lastG = g; }
        }
        list.append(itemEl(rec));
      }
    }
    function dayLabel(ts) {
      const d = new Date(ts), n = new Date(); d.setHours(0, 0, 0, 0); n.setHours(0, 0, 0, 0);
      const diff = Math.round((n - d) / 86400000);
      return diff === 0 ? t('today') : diff === 1 ? t('yesterday') : t('days.ago', { n: diff });
    }
    function renderBottom() {
      bottom.innerHTML = '';
      if (S.selMode) {
        const one = S.sel.size === 1;
        const btn = (ic, lb, fn, dis) => h('button', { class: 'abtn', disabled: dis, onclick: fn }, FM.icon(ic, 24), h('span', null, lb));
        bottom.append(h('div', { class: 'actionbar' },
          btn('copy', t('copy'), () => setClip('copy')), btn('cut', t('move'), () => setClip('move')),
          btn('edit', t('rename'), doRename), btn('trash', t('delete'), doDelete), btn('more', t('more'), moreMenu)));
      } else if (FM.clip && isDir) {
        bottom.append(h('div', { class: 'pastebar' },
          h('span', null, t(FM.clip.mode === 'copy' ? 'clip.copy' : 'clip.move', { n: FM.clip.items.length })),
          h('button', { class: 'dbtn', onclick: () => { FM.clip = null; renderBottom(); } }, t('cancel')),
          h('button', { class: 'dbtn primary', onclick: paste }, t('paste'))));
      }
    }
    function renderAll() { renderBar(); renderCrumbs(); renderList(); renderBottom(); }

    /* ----- التحديد ----- */
    function enterSel(rec) { S.selMode = true; S.sel.add(rec.id); S.anchor = rec.id; renderAll(); }
    function exitSel() { S.selMode = false; S.sel.clear(); renderAll(); }
    function toggle(rec) {
      if (S.sel.has(rec.id)) S.sel.delete(rec.id); else S.sel.add(rec.id);
      S.selMode = S.sel.size > 0; renderAll();
    }
    function selectAll() { S.items.forEach(i => S.sel.add(i.id)); renderAll(); }
    function selectRange() {
      const idx = S.items.map((r, i) => S.sel.has(r.id) ? i : -1).filter(i => i >= 0);
      if (idx.length < 2) { ui.toast(t('range.hint')); return; }
      for (let i = Math.min(...idx); i <= Math.max(...idx); i++) S.sel.add(S.items[i].id);
      renderAll();
    }
    const selected = () => S.items.filter(i => S.sel.has(i.id));
    async function openItem(rec) {
      if (rec.isDir) FM.nav.push('browser', { vol: rec.vol, path: rec.path });
      else FM.openFile(rec, S.items.filter(r => !r.isDir));
    }

    /* ----- العمليات ----- */
    function setClip(mode) {
      const items = selected();
      FM.clip = { items, mode, srcVol: params.vol, srcDir: params.path };
      exitSel();
      ui.toast(t('clip.set', { n: items.length }));
      if (!isDir) ui.toast(t('clip.hint'), 3000);
    }
    async function paste() {
      const clip = FM.clip; if (!clip) return;
      const srcCopy = clip.mode === 'copy';
      try {
        await ui.runTask(t(srcCopy ? 'copying' : 'moving'), (upd, ctl) => fs.transfer(clip.items, params.vol, params.path, clip.mode, upd, ctl));
      } catch (e) { ui.toast(e.message === 'into-self' ? t('err.self') : t('err.generic')); return; }
      FM.lastPaste = { clip, vol: params.vol, dir: params.path };
      if (!srcCopy) FM.clip = null;
      await load();
      const acts = [];
      if (srcCopy) acts.push({ label: t('copy.again'), onclick: () => { FM.clip = clip; if (FM.lastPaste) renderBottom(); ui.toast(t('clip.set', { n: clip.items.length })); } });
      if (clip.srcVol && (clip.srcVol !== params.vol || clip.srcDir !== params.path))
        acts.push({ label: t('return.src'), onclick: () => FM.nav.goPath(clip.srcVol, clip.srcDir) });
      ui.snackbar(t('paste.done', { n: clip.items.length }), acts, 9000);
    }
    async function doDelete() {
      const items = selected(), trash = FM.Settings.get('trash');
      if (!(await ui.confirm(t('delete'), t(trash && params.special !== 'trash' ? 'del.trash' : 'del.perm', { n: items.length }), t('delete'), true))) return;
      await fs.remove(items, params.special === 'trash');
      exitSel(); await load(); ui.toast(t('deleted'));
    }
    async function doRename() {
      const items = selected();
      if (items.length === 1) {
        const r = items[0];
        const nn = await ui.prompt(t('rename'), r.name, { selectName: !r.isDir });
        if (nn == null) return;
        try { await fs.rename(r, nn); exitSel(); await load(); } catch (e) { ui.toast(e.message === 'exists' ? t('err.exists') : t('err.name')); }
      } else {
        const base = await ui.prompt(t('rename.batch'), 'File', { hint: t('rename.hint') });
        if (!base) return;
        let i = 1;
        for (const r of items) {
          const n = base.includes('{n}') ? base.replace('{n}', i) : base + '_' + i;
          try { await fs.rename(r, n + (r.ext ? '.' + r.ext : '')); } catch (e) { }
          i++;
        }
        exitSel(); await load();
      }
    }
    function moreMenu() {
      const items = selected(), one = items.length === 1 ? items[0] : null;
      ui.sheet(t('more'), [
        { label: t('zip.create'), icon: 'zip', onclick: () => compress(items) },
        one && one.cat === 'archive' ? { label: t('zip.extract'), icon: 'zip', onclick: () => FM.extractHere(one, params.vol, params.path).then(load) } : null,
        { label: t('share'), icon: 'share', onclick: () => FM.share(items) },
        { label: t('hide'), icon: 'info', onclick: async () => { for (const r of items) await fs.update(r.id, { hidden: true }); exitSel(); load(); } },
        { label: t('bookmark.add'), icon: 'star', onclick: async () => { for (const r of items.filter(r => r.isDir)) await FM.DB.put('bookmarks', { id: r.id, vol: r.vol, path: r.path, name: r.name }); ui.toast(t('bookmarked')); exitSel(); } },
        { label: t('shortcut.add'), icon: 'home', onclick: async () => { const sc = (FM.Settings.get('shortcuts') || []).slice(); items.forEach(r => { if (!sc.find(s => s.id === r.id)) sc.push({ id: r.id, name: r.name, isDir: r.isDir }); }); await FM.Settings.set('shortcuts', sc); ui.toast(t('shortcut.done')); exitSel(); } },
        one && !one.isDir ? { label: t('open.with'), icon: 'share', onclick: () => FM.openWith(one) } : null,
        params.special === 'trash' ? { label: t('restore'), icon: 'refresh', onclick: async () => { for (const r of items) await fs.restore(r); exitSel(); load(); } } : null,
        { label: t('properties'), icon: 'info', onclick: () => FM.properties(items) }
      ]);
    }
    async function compress(items) {
      const pw = await ui.prompt(t('zip.create'), '', { password: true, label: t('zip.pw'), hint: t('zip.pw.hint') });
      if (pw == null) return;
      const entries = [];
      async function walk(r, prefix) {
        if (r.isDir) {
          entries.push({ name: prefix + r.name + '/', data: null, date: r.mtime });
          for (const c of await fs.list(r.vol, r.path, { all: true })) await walk(c, prefix + r.name + '/');
        } else entries.push({ name: prefix + r.name, data: new Uint8Array(await (await fs.readBlob(r)).arrayBuffer()), date: r.mtime });
      }
      for (const r of items) await walk(r, '');
      const base = items.length === 1 ? items[0].name.replace(/\.[^.]+$/, '') : 'Archive';
      const blob = u.zipWrite(entries, pw || undefined);
      const dir = isDir ? params.path : '/'; const vol = isDir ? params.vol : 'main';
      await fs.writeFile(vol, dir, base + '.zip', blob);
      exitSel(); await load(); ui.toast(t('zip.done'));
    }
    async function createNew(kind) {
      const nm = await ui.prompt(t(kind === 'dir' ? 'new.folder' : 'new.file'), kind === 'dir' ? t('folder') : 'new.txt', { selectName: kind !== 'dir' });
      if (!nm) return;
      if (kind === 'dir') await fs.makeDir(params.vol, params.path, nm);
      else await fs.writeFile(params.vol, params.path, nm, new Blob([''], { type: 'text/plain' }));
      await load();
    }
    function upload(dirMode) {
      const inp = h('input', { type: 'file', multiple: true, style: { display: 'none' } });
      if (dirMode) inp.setAttribute('webkitdirectory', '');
      inp.onchange = async () => {
        for (const f of inp.files) {
          const rel = dirMode && f.webkitRelativePath ? f.webkitRelativePath.split('/').slice(0, -1).join('/') : '';
          await fs.writeFile(params.vol, rel ? fs.join(params.path, rel) : params.path, f.name, f, { mtime: f.lastModified });
        }
        ui.toast(t('uploaded', { n: inp.files.length })); load();
      };
      document.body.append(inp); inp.click(); setTimeout(() => inp.remove(), 60000);
    }
    function overflow() {
      const items = [];
      if (isDir) items.push(
        { label: t('new.folder'), onclick: () => createNew('dir') }, { label: t('new.file'), onclick: () => createNew('file') },
        { label: t('upload'), onclick: () => upload(false) }, { label: t('upload.dir'), onclick: () => upload(true) });
      items.push({ label: t('sort'), onclick: sortMenu }, { label: t('view'), onclick: viewMenu },
        { label: t('show.hidden'), checked: FM.Settings.get('showHidden'), onclick: async () => { await FM.Settings.set('showHidden', !FM.Settings.get('showHidden')); load(); } },
        { label: t('select.all'), onclick: () => { if (S.items.length) { S.selMode = true; selectAll(); } } });
      if (isDir && params.path !== '/') items.push(
        { label: t('bookmark.add'), onclick: async () => { await FM.DB.put('bookmarks', { id: params.vol + ':' + params.path, vol: params.vol, path: params.path, name: fs.baseName(params.path) }); ui.toast(t('bookmarked')); } },
        { label: t('properties'), onclick: async () => FM.properties([await fs.get(fs.idOf(params.vol, params.path))]) });
      if (params.special === 'trash') items.push({ label: t('trash.emptyall'), danger: true, onclick: async () => { if (await ui.confirm(t('trash'), t('trash.confirm'), t('ok'), true)) { await fs.emptyTrash(); load(); } } });
      items.push({ label: t('refresh'), onclick: load });
      ui.popup(items);
    }
    function sortMenu() {
      const by = FM.Settings.get('sortBy'), dir = FM.Settings.get('sortDir');
      const set = (k, v) => async () => { await FM.Settings.set(k, v); load(); };
      ui.sheet(t('sort'), [
        ...['name', 'size', 'date', 'type'].map(k => ({ label: t('sort.' + k), checked: by === k, onclick: set('sortBy', k) })),
        { label: t('sort.asc'), checked: dir === 'asc', onclick: set('sortDir', 'asc') }, { label: t('sort.desc'), checked: dir === 'desc', onclick: set('sortDir', 'desc') }]);
    }
    function viewMenu() {
      const m = mode();
      ui.sheet(t('view'), ['list-compact', 'list-detailed', 'grid-medium', 'grid-large'].map(k => ({
        label: t('view.' + k), checked: m === k, onclick: async () => { await FM.Settings.set('view', k); renderList(); }
      })));
    }

    root.__screen = {
      onBack() { if (S.selMode) { exitSel(); return true; } return false; },
      refresh: load
    };
    load();
    return root;
  };

  /* ---------- شاشة البحث ---------- */
  FM.screens.search = function (params) {
    const root = h('div', { class: 'screen' });
    const res = h('div', { class: 'flist' }), info = h('div', { class: 'hint pad' });
    const inp = h('input', { class: 'sinp', type: 'search', placeholder: t('search.ph'), autofocus: true });
    const doSearch = u.debounce(async () => {
      const q = inp.value.trim(); res.innerHTML = '';
      if (!q) { info.textContent = ''; return; }
      const items = await fs.search(q, params.scope);
      info.textContent = t('search.n', { n: items.length });
      items.forEach(rec => {
        const row = h('div', { class: 'item list-detailed' }, ui.fileIcon(rec, 40),
          h('div', { class: 'meta' }, h('div', { class: 'nm' }, rec.name), h('div', { class: 'sub' }, rec.vol + ':' + rec.path)));
        row.onclick = () => rec.isDir ? FM.nav.push('browser', { vol: rec.vol, path: rec.path }) : FM.openFile(rec, items.filter(r => !r.isDir));
        res.append(row);
        if (FM.thumbs.need(rec)) FM.thumbs.request(rec, nr => { const n = ui.fileIcon(nr, 40); row.firstChild.replaceWith(n); });
      });
    }, 180);
    inp.addEventListener('input', doSearch);
    root.append(h('header', { class: 'topbar' }, h('button', { class: 'ibtn', onclick: () => FM.handleBack() }, (() => { const i = FM.icon('back', 24); i.classList.add('flip'); return i; })()), inp,
      h('button', { class: 'ibtn', onclick: () => { inp.value = ''; doSearch(); inp.focus(); } }, FM.icon('close', 22))), info, res);
    setTimeout(() => inp.focus(), 80);
    return root;
  };
})(window.FM);

;

/* ===== screen-home.js ===== */
/* screen-home.js — الشاشة الرئيسية (شبكة 3 أعمدة) + القائمة الجانبية */
window.FM = window.FM || {};
(function (FM) {
  'use strict';
  const h = FM.h, t = (...a) => FM.t(...a), ui = FM.ui, fs = FM.fs, u = FM.u;
  FM.screens = FM.screens || {};

  const TILES = [
    ['main', 'phone', '#FF9800', 'v.main'], ['sd', 'sd', '#2196F3', 'v.sd'], ['downloads', 'download', '#4CAF50', 'cat.downloads'],
    ['recent', 'recent', '#8BC34A', 'cat.recent'], ['images', 'image', '#E91E63', 'cat.images'], ['audio', 'music', '#9C27B0', 'cat.audio'],
    ['video', 'video', '#F44336', 'cat.video'], ['docs', 'file', '#009688', 'cat.docs'], ['apps', 'apps', '#FFC107', 'apps'],
    ['cloud', 'cloud', '#03A9F4', 'cloud'], ['analyze', 'pie', '#607D8B', 'analyzer'], ['pc', 'pc', '#3F51B5', 'pc.access']
  ];
  const COUNT_KEY = { downloads: 'downloads', recent: 'recent', images: 'image', audio: 'audio', video: 'video', docs: 'doc' };

  FM.openTile = function (id) {
    const N = FM.nav;
    if (id === 'main' || id === 'sd') return N.push('browser', { vol: id, path: '/' });
    if (id === 'apps') return N.push('apps');
    if (id === 'cloud') return N.push('cloud', { tab: 'cloud' });
    if (id === 'pc') return N.push('cloud', { tab: 'ftp' });
    if (id === 'analyze') return N.push('analyzer');
    return N.push('browser', { cat: id });
  };

  FM.screens.home = function () {
    const root = h('div', { class: 'screen home' });
    const grid = h('div', { class: 'tiles' }), sc = h('div', { class: 'shortcuts' });
    const bar = ui.topbar({
      left: 'menu', onLeft: FM.openDrawer, title: t('app.name'),
      actions: [{ icon: 'search', onclick: () => FM.nav.push('search', { scope: null }) },
        { icon: 'more', onclick: () => ui.popup([{ label: t('trash'), onclick: () => FM.nav.push('browser', { special: 'trash' }) }, { label: t('settings'), onclick: () => FM.nav.push('settings') }, { label: t('refresh'), onclick: () => FM.nav.render() }, { label: t('about'), onclick: FM.about }]) }]
    });
    root.append(bar, grid, sc);
    (async () => {
      const wp = FM.Settings.get('wallpaper');
      if (wp) { const b = await FM.DB.get('blobs', wp); if (b) { root.style.backgroundImage = 'linear-gradient(var(--wp),var(--wp)),url(' + URL.createObjectURL(b.blob) + ')'; root.style.backgroundSize = 'cover'; root.classList.add('wp'); } }
      const counts = await fs.counts();
      const vols = await fs.volumes();
      for (const [id, icon, color, lab] of TILES) {
        if (id === 'sd' && !vols.find(v => v.id === 'sd')) continue;
        const sub = h('div', { class: 'ts' });
        const tile = h('button', { class: 'tile', onclick: () => FM.openTile(id) }, ui.circle(icon, color, 64), h('div', { class: 'tl' }, t(lab)), sub);
        grid.append(tile);
        if (id === 'main' || id === 'sd') {
          fs.usage(id).then(us => {
            sub.append(h('div', { class: 'meter' }, h('i', { style: { width: Math.min(100, us.used / us.total * 100) + '%', background: color } })),
              h('div', { dir: 'ltr' }, t('used.of', { u: u.fmtSize(us.used), t: Math.round(us.total / fs.GB) + ' GB' })));
          });
        } else if (COUNT_KEY[id]) sub.textContent = t('n.files', { n: counts[COUNT_KEY[id]] });
        else if (id === 'apps') FM.DB.all('apps').then(a => sub.textContent = t('n.apps', { n: a.length }));
        else if (id === 'cloud') FM.DB.all('accounts').then(a => sub.textContent = a.length ? t('n.acc', { n: a.length }) : '');
      }
      const list = FM.Settings.get('shortcuts') || [];
      if (list.length) {
        sc.append(h('div', { class: 'group' }, t('shortcuts')));
        const g = h('div', { class: 'tiles' }); sc.append(g);
        for (const s of list) {
          const rec = await fs.get(s.id);
          if (!rec) continue;
          let timer, lp = false;
          const el = h('button', { class: 'tile' }, rec.isDir ? ui.circle('folder', '#FBC02D', 56) : ui.fileIcon(rec, 56), h('div', { class: 'tl' }, rec.name));
          el.onpointerdown = () => { lp = false; timer = setTimeout(async () => { lp = true; if (await ui.confirm(t('shortcut.remove'), rec.name, t('ok'))) { await FM.Settings.set('shortcuts', list.filter(x => x.id !== s.id)); FM.nav.render(); } }, 500); };
          el.onpointerup = el.onpointerleave = () => clearTimeout(timer);
          el.onclick = () => { if (lp) return; rec.isDir ? FM.nav.push('browser', { vol: rec.vol, path: rec.path }) : FM.openFile(rec, []); };
          g.append(el);
        }
      }
    })();
    return root;
  };

  FM.about = function () {
    ui.dialog({
      title: t('app.name'),
      body: h('div', { class: 'props' },
        [['Version', '3.8.2 (Build 2103082)'], ['Package', 'com.alphainventor.filemanager'], ['Min SDK', 'API 21 (Android 5.0)'], ['Target SDK', 'API 35 (Android 15)'], [t('storage.engine'), FM.DB.engine]]
          .map(([k, v]) => h('div', { class: 'pr' }, h('span', { class: 'pk' }, k), h('span', { class: 'pv' }, v)))),
      buttons: [{ label: t('close'), primary: true }]
    });
  };

  /* ---------- القائمة الجانبية ---------- */
  FM.openDrawer = async function () {
    const vols = await fs.volumes(), bms = await FM.DB.all('bookmarks');
    const go = fn => () => { rec.close(); setTimeout(fn, 60); };
    const item = (ic, label, fn, color) => h('button', { class: 'dr-i', onclick: go(fn) }, h('span', { class: 'dri', style: { color: color || 'inherit' } }, FM.icon(ic, 22)), h('span', null, label));
    const panel = h('aside', { class: 'drawer' },
      h('div', { class: 'dr-h' }, h('div', { class: 'logo' }, FM.icon('folder', 34)), h('div', null, h('b', null, t('app.name')), h('small', null, 'v3.8.2'))),
      item('home', t('home'), () => FM.nav.home()),
      item('phone', t('v.main'), () => FM.nav.push('browser', { vol: 'main', path: '/' }), '#FF9800'),
      vols.find(v => v.id === 'sd') ? item('sd', t('v.sd'), () => FM.nav.push('browser', { vol: 'sd', path: '/' }), '#2196F3') : null,
      item('download', t('cat.downloads'), () => FM.nav.push('browser', { cat: 'downloads' }), '#4CAF50'),
      h('div', { class: 'dr-s' }, t('drawer.quick')),
      item('recent', t('cat.recent'), () => FM.nav.push('browser', { cat: 'recent' }), '#8BC34A'),
      item('image', t('cat.images'), () => FM.nav.push('browser', { cat: 'images' }), '#E91E63'),
      item('music', t('cat.audio'), () => FM.nav.push('browser', { cat: 'audio' }), '#9C27B0'),
      item('video', t('cat.video'), () => FM.nav.push('browser', { cat: 'video' }), '#F44336'),
      item('file', t('cat.docs'), () => FM.nav.push('browser', { cat: 'docs' }), '#009688'),
      item('apps', t('apps'), () => FM.nav.push('apps'), '#FFC107'),
      h('div', { class: 'dr-s' }, t('cloud')),
      vols.filter(v => v.kind === 'cloud' || v.kind === 'remote').map(v => item(v.kind === 'cloud' ? 'cloud' : 'pc', v.label, () => FM.nav.push('browser', { vol: v.id, path: '/' }), v.color)),
      item('add', t('cloud.manage'), () => FM.nav.push('cloud', { tab: 'cloud' }), '#03A9F4'),
      bms.length ? h('div', { class: 'dr-s' }, t('bookmarks')) : null,
      bms.map(b => item('star', b.name, () => FM.nav.push('browser', { vol: b.vol, path: b.path }), '#FFB300')),
      h('div', { class: 'dr-s' }, ''),
      FM.Settings.get('trash') ? item('trash', t('trash'), () => FM.nav.push('browser', { special: 'trash' })) : null,
      item('pie', t('analyzer'), () => FM.nav.push('analyzer'), '#607D8B'),
      item('settings', t('settings'), () => FM.nav.push('settings')));
    const scrim = h('div', { class: 'scrim side', onclick: e => { if (e.target === scrim) rec.close(); } }, panel);
    const rec = ui.overlay(scrim);
  };
})(window.FM);

;

/* ===== screen-tools.js ===== */
/* screen-tools.js — الأرشيف، التطبيقات، تحليل المساحة، السحابة/FTP، الإعدادات */
window.FM = window.FM || {};
(function (FM) {
  'use strict';
  const h = FM.h, t = (...a) => FM.t(...a), ui = FM.ui, fs = FM.fs, u = FM.u, DB = () => FM.DB;
  FM.screens = FM.screens || {};
  const flip = n => { const i = FM.icon(n, 24); i.classList.add('flip'); return i; };
  const tabs = (items, cur, on) => h('div', { class: 'tabs' }, items.map(([id, label]) => h('button', { class: 'tab' + (id === cur ? ' on' : ''), onclick: () => on(id) }, label)));
  const switchEl = (on, fn) => { const s = h('button', { class: 'sw' + (on ? ' on' : ''), role: 'switch', onclick: () => { s.classList.toggle('on'); fn(s.classList.contains('on')); } }, h('i')); return s; };
  const empty = (ic, msg) => h('div', { class: 'empty' }, h('div', { class: 'big' }, FM.icon(ic, 64)), h('div', null, msg));

  /* ================= الأرشيف ================= */
  FM.archiveEntries = async function (rec) {
    const blob = await fs.readBlob(rec), name = rec.name.toLowerCase();
    if (name.endsWith('.zip')) {
      const z = await u.zipRead(blob);
      return z.entries.map(e => ({ name: e.name, isDir: e.isDir, size: e.usize, mtime: e.mtime, enc: e.enc, get: pw => z.extract(e, pw) }));
    }
    let bytes = new Uint8Array(await blob.arrayBuffer());
    if (name.endsWith('.xz')) throw Object.assign(new Error('xz'), { code: 'XZ' });
    if (name.endsWith('.gz') || name.endsWith('.tgz')) {
      bytes = await u.inflate(bytes, 'gzip');
      if (!(name.endsWith('.tar.gz') || name.endsWith('.tgz'))) {
        const n = rec.name.replace(/\.gz$/i, ''); const d = bytes;
        return [{ name: n, isDir: false, size: d.length, mtime: rec.mtime, get: async () => d }];
      }
    }
    return (await u.tarRead(bytes)).map(e => ({ name: e.name, isDir: e.isDir, size: e.usize, mtime: e.mtime, get: async () => e.data || new Uint8Array(0) }));
  };
  async function askPw(state) {
    const pw = await ui.prompt(t('zip.enter.pw'), '', { password: true });
    if (pw == null) return null; state.pw = pw; return pw;
  }
  async function getData(entry, state) {
    for (let k = 0; k < 3; k++) {
      try { return await entry.get(state.pw); }
      catch (e) {
        if (e.code === 'PASSWORD' || e.code === 'WRONG') { if (e.code === 'WRONG') ui.toast(t('zip.wrong.pw')); if ((await askPw(state)) == null) return null; } else throw e;
      }
    }
    return null;
  }
  FM.extractHere = async function (rec, vol, dir) {
    let entries; const state = {};
    try { entries = await FM.archiveEntries(rec); } catch (e) { ui.toast(e.code === 'XZ' ? t('xz.na') : t('err.generic')); return 0; }
    const base = await fs.uniqueName(vol, dir, rec.name.replace(/\.(tar\.gz|tgz|zip|tar|gz)$/i, ''));
    const root = fs.join(dir, base);
    await fs.mkdirp(vol, root);
    let n = 0;
    await ui.runTask(t('extracting'), async (upd, ctl) => {
      for (let i = 0; i < entries.length && !ctl.cancelled; i++) {
        const e = entries[i], p = fs.join(root, e.name.replace(/\/$/, ''));
        upd({ name: e.name, pct: Math.round((i + 1) / entries.length * 100) });
        if (e.isDir) { await fs.mkdirp(vol, p); continue; }
        const data = await getData(e, state); if (!data) { ctl.cancelled = true; break; }
        await fs.writeFile(vol, fs.parentPath(p), fs.baseName(p), new Blob([data], { type: fs.mimeOf(fs.extOf(e.name)) }), { uniq: false, mtime: e.mtime });
        n++;
      }
    });
    ui.toast(t('extracted', { n }));
    return n;
  };

  FM.screens.archive = function (params) {
    const root = h('div', { class: 'screen' });
    const bar = h('div', { class: 'bar-slot' }), list = h('div', { class: 'flist' }), crumb = h('div', { class: 'hint pad' });
    root.append(bar, crumb, list);
    let rec, entries = [], cwd = '', state = {};
    async function init() {
      rec = await fs.get(params.id);
      if (!rec) { FM.handleBack(); return; }
      try { entries = await FM.archiveEntries(rec); } catch (e) { ui.alert(rec.name, e.code === 'XZ' ? t('xz.na') : t('err.generic')); entries = []; }
      try { await fs.deleteTree(await fs.get('main:/.cache')); } catch (e) { }
      render();
    }
    function render() {
      bar.innerHTML = '';
      bar.append(ui.topbar({
        left: 'back', onLeft: () => FM.handleBack(), title: rec.name,
        actions: [{ icon: 'zip', label: t('zip.extract'), onclick: async () => { await FM.extractHere(rec, rec.vol, fs.parentPath(rec.path)); } }]
      }));
      crumb.textContent = '/' + cwd + '  ·  ' + t('n.items', { n: entries.length });
      const seen = new Set(), rows = [];
      for (const e of entries) {
        const full = e.name.replace(/\/$/, '');
        if (cwd && !full.startsWith(cwd + '/')) continue;
        const rel = cwd ? full.slice(cwd.length + 1) : full; if (!rel) continue;
        const first = rel.split('/')[0], isFolder = rel.includes('/') || e.isDir;
        if (seen.has(first)) continue; seen.add(first);
        rows.push({ name: first, isDir: isFolder, entry: isFolder ? null : e, path: (cwd ? cwd + '/' : '') + first });
      }
      rows.sort((a, b) => (b.isDir - a.isDir) || a.name.localeCompare(b.name));
      list.innerHTML = '';
      if (!rows.length) list.append(empty('zip', t('empty')));
      for (const r of rows) {
        const fake = { name: r.name, isDir: r.isDir, ext: fs.extOf(r.name), cat: r.isDir ? 'dir' : fs.catOf(fs.extOf(r.name)) };
        const row = h('div', { class: 'item list-detailed' }, ui.fileIcon(fake, 40), h('div', { class: 'meta' }, h('div', { class: 'nm' }, r.name),
          h('div', { class: 'sub' }, r.isDir ? '' : u.fmtSize(r.entry.size) + (r.entry.enc ? ' · 🔒' : '') + (r.entry.mtime ? ' · ' + u.fmtDate(r.entry.mtime) : ''))));
        row.onclick = () => {
          if (r.isDir) { cwd = r.path; render(); return; }
          ui.sheet(r.name, [{ label: t('preview'), icon: 'file', onclick: () => preview(r) }, { label: t('extract.here'), icon: 'zip', onclick: () => extractOne(r) }]);
        };
        list.append(row);
      }
    }
    async function extractOne(r) {
      const data = await getData(r.entry, state); if (!data) return;
      const out = await fs.writeFile(rec.vol, fs.parentPath(rec.path), r.name, new Blob([data], { type: fs.mimeOf(fs.extOf(r.name)) }), { mtime: r.entry.mtime });
      ui.toast(t('extracted', { n: 1 }) + ' → ' + out.name);
    }
    async function preview(r) {
      const data = await getData(r.entry, state); if (!data) return;
      const out = await fs.writeFile('main', '/.cache/archive', r.name, new Blob([data], { type: fs.mimeOf(fs.extOf(r.name)) }), { mark: false });
      FM.openFile(out, []);
    }
    root.__screen = { onBack() { if (cwd) { cwd = cwd.includes('/') ? cwd.slice(0, cwd.lastIndexOf('/')) : ''; render(); return true; } return false; } };
    init();
    return root;
  };

  /* ================= التطبيقات ================= */
  FM.screens.apps = function () {
    const root = h('div', { class: 'screen' });
    const bar = h('div', { class: 'bar-slot' }), tabsEl = h('div'), list = h('div', { class: 'flist' }), bottom = h('div', { class: 'bottom-slot' });
    root.append(bar, tabsEl, list, bottom);
    let apps = [], tab = 'user', sel = new Set(), selMode = false;
    const OURS = 'com.alphainventor.filemanager';
    async function load() { apps = (await DB().all('apps')).sort((a, b) => a.name.localeCompare(b.name)); render(); }
    function render() {
      bar.innerHTML = '';
      if (selMode) bar.append(ui.topbar({ cls: 'sel', left: 'close', onLeft: exit, title: t('selected', { n: sel.size }), actions: [{ text: t('all'), onclick: () => { cur().forEach(a => sel.add(a.pkg)); render(); } }] }));
      else bar.append(ui.topbar({ left: 'back', onLeft: () => FM.handleBack(), title: t('apps'), actions: [{ icon: 'more', onclick: () => ui.popup([{ label: t('cache.clearall'), onclick: clearAll }]) }] }));
      tabsEl.replaceChildren(tabs([['user', t('apps.user') + ' (' + apps.filter(a => !a.system).length + ')'], ['sys', t('apps.sys') + ' (' + apps.filter(a => a.system).length + ')']], tab, id => { tab = id; sel.clear(); selMode = false; render(); }));
      list.innerHTML = '';
      cur().forEach(a => {
        const on = sel.has(a.pkg);
        let timer, lp = false;
        const row = h('div', { class: 'item list-detailed' + (on ? ' selected' : '') },
          h('div', { class: 'appic', style: { background: a.color } }, a.name[0]),
          h('div', { class: 'meta' }, h('div', { class: 'nm' }, a.name), h('div', { class: 'sub' }, 'v' + a.version + ' · ' + u.fmtSize(a.size))),
          h('div', { class: 'cb' + (on ? ' on' : ''), onclick: e => { e.stopPropagation(); toggle(a); } }, on ? FM.icon('check', 16) : null));
        row.onpointerdown = () => { lp = false; timer = setTimeout(() => { lp = true; if (!selMode) { selMode = true; sel.add(a.pkg); render(); } }, 450); };
        row.onpointerup = row.onpointerleave = () => clearTimeout(timer);
        row.onclick = () => { if (lp) return; selMode ? toggle(a) : menu(a); };
        list.append(row);
      });
      bottom.innerHTML = '';
      if (selMode) bottom.append(h('div', { class: 'actionbar' },
        h('button', { class: 'abtn', onclick: () => backup(sel2()) }, FM.icon('download', 24), h('span', null, t('backup'))),
        h('button', { class: 'abtn', onclick: () => uninstall(sel2()) }, FM.icon('trash', 24), h('span', null, t('uninstall'))),
        h('button', { class: 'abtn', onclick: () => clearCache(sel2()) }, FM.icon('refresh', 24), h('span', null, t('cache.clear')))));
    }
    const cur = () => apps.filter(a => (tab === 'sys') === !!a.system), sel2 = () => apps.filter(a => sel.has(a.pkg));
    function toggle(a) { sel.has(a.pkg) ? sel.delete(a.pkg) : sel.add(a.pkg); selMode = sel.size > 0; render(); }
    function exit() { selMode = false; sel.clear(); render(); }
    function menu(a) {
      ui.sheet(a.name, [
        { label: t('app.open'), icon: 'apps', onclick: () => ui.toast(t('app.open.native')) },
        { label: t('backup'), icon: 'download', onclick: () => backup([a]) },
        { label: t('app.info'), icon: 'info', onclick: () => info(a) },
        { label: t('cache.clear') + ' (' + u.fmtSize(a.cache) + ')', icon: 'refresh', onclick: () => clearCache([a]) },
        a.system ? null : { label: t('uninstall'), icon: 'trash', danger: true, onclick: () => uninstall([a]) }]);
    }
    function info(a) {
      ui.dialog({
        title: a.name, body: h('div', { class: 'props' }, [[t('p.pkg'), a.pkg], [t('p.version'), a.version], [t('p.size'), u.fmtSize(a.size)], [t('p.cache'), u.fmtSize(a.cache)], [t('p.installed'), u.fmtDate(a.installed)], [t('p.type'), a.system ? t('apps.sys') : t('apps.user')]]
          .map(([k, v]) => h('div', { class: 'pr' }, h('span', { class: 'pk' }, k), h('span', { class: 'pv' }, v)))),
        buttons: [{ label: t('close'), primary: true }]
      });
    }
    async function backup(items) {
      let n = 0;
      for (const a of items) {
        const bytes = new Uint8Array(2048); crypto.getRandomValues(bytes); bytes[0] = 0x50; bytes[1] = 0x4B;
        await fs.writeFile('main', '/Backups', a.name.replace(/\s+/g, '_') + '_' + a.version + '.apk', new Blob([bytes], { type: 'application/vnd.android.package-archive' }), { size: a.size }); n++;
      }
      exit(); ui.snackbar(t('backup.done', { n }), [{ label: t('open.folder'), onclick: () => FM.nav.push('browser', { vol: 'main', path: '/Backups' }) }]);
    }
    async function uninstall(items) {
      items = items.filter(a => !a.system);
      if (!items.length) { ui.toast(t('app.sys.na')); return; }
      if (items.some(a => a.pkg === OURS)) { ui.toast(t('app.self')); items = items.filter(a => a.pkg !== OURS); if (!items.length) return; }
      if (!(await ui.confirm(t('uninstall'), t('uninstall.msg', { n: items.length }), t('uninstall'), true))) return;
      await DB().delMany('apps', items.map(a => a.pkg)); exit(); load(); ui.toast(t('uninstalled'));
    }
    async function clearCache(items) {
      for (const a of items) await DB().put('apps', Object.assign({}, a, { cache: 0 }));
      exit(); load(); ui.toast(t('cache.cleared'));
    }
    async function clearAll() { const tot = apps.reduce((s, a) => s + a.cache, 0); await clearCache(apps); ui.toast(t('cache.cleared') + ' · ' + u.fmtSize(tot)); }
    root.__screen = { onBack() { if (selMode) { exit(); return true; } return false; } };
    load();
    return root;
  };

  /* ================= تحليل المساحة والتنظيف ================= */
  FM.screens.analyzer = function (params) {
    const root = h('div', { class: 'screen' });
    const bar = h('div', { class: 'bar-slot' }), tabsEl = h('div'), body = h('div', { class: 'abody2' });
    root.append(bar, tabsEl, body);
    let tab = params.tab || 'over', files = [], apps = [], busy = false;
    const COLORS = { apps: '#FFC107', image: '#E91E63', video: '#F44336', audio: '#9C27B0', doc: '#009688', other: '#78909C', system: '#3F51B5' };
    async function scan() {
      body.innerHTML = ''; body.append(h('div', { class: 'empty' }, h('div', null, t('scanning'))));
      const vols = ['main'].concat(FM.Settings.get('sdMounted') ? ['sd'] : []);
      files = []; for (const v of vols) files.push(...(await DB().prefix('files', v + ':/')).filter(r => !r.isDir && !fs.inTrash(r)));
      apps = await DB().all('apps');
      render();
    }
    function render() {
      bar.replaceChildren(ui.topbar({ left: 'back', onLeft: () => FM.handleBack(), title: t('analyzer'), actions: [{ icon: 'refresh', onclick: scan }] }));
      tabsEl.replaceChildren(tabs([['over', t('an.over')], ['large', t('an.large')], ['junk', t('an.junk')], ['dup', t('an.dup')]], tab, id => { tab = id; render(); }));
      body.innerHTML = '';
      ({ over, large, junk, dup })[tab]();
    }
    function over() {
      const sum = c => files.filter(f => c.includes(f.cat)).reduce((a, f) => a + (f.size || 0), 0);
      const appsSize = apps.reduce((a, x) => a + x.size, 0);
      const cats = [['apps', t('apps'), appsSize], ['image', t('cat.images'), sum(['image'])], ['video', t('cat.video'), sum(['video'])], ['audio', t('cat.audio'), sum(['audio'])],
        ['doc', t('cat.docs'), sum(['doc', 'archive', 'apk'])], ['other', t('other'), sum(['other'])], ['system', t('system'), 15 * fs.GB]];
      const total = cats.reduce((a, c) => a + c[2], 0) || 1;
      let acc = 0; const R = 70, C = 2 * Math.PI * R;
      const segs = cats.map(([id, , v]) => { const len = v / total * C; const s = '<circle r="' + R + '" cx="90" cy="90" fill="none" stroke="' + COLORS[id] + '" stroke-width="26" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + (-acc) + '" transform="rotate(-90 90 90)"/>'; acc += len; return s; }).join('');
      const donut = h('div', { class: 'donut' }); donut.innerHTML = '<svg viewBox="0 0 180 180" width="190" height="190">' + segs + '</svg>';
      donut.append(h('div', { class: 'dtxt' }, h('b', null, u.fmtSize(total)), h('small', null, t('total'))));
      const legend = h('div', { class: 'legend' }, cats.map(([id, label, v]) => h('button', {
        class: 'lg', onclick: () => ({ image: 'images', video: 'video', audio: 'audio', doc: 'docs' })[id] ? FM.nav.push('browser', { cat: ({ image: 'images', video: 'video', audio: 'audio', doc: 'docs' })[id] }) : id === 'apps' ? FM.nav.push('apps') : null
      }, h('i', { style: { background: COLORS[id] } }), h('span', null, label), h('b', null, u.fmtSize(v), ' · ', Math.round(v / total * 100) + '%'))));
      // استهلاك كل مجلد
      const byDir = {};
      files.filter(f => f.vol === 'main').forEach(f => { const seg = f.path.split('/')[1]; const k = f.path.split('/').length > 2 ? seg : '/'; byDir[k] = (byDir[k] || 0) + (f.size || 0); });
      const dirs = Object.entries(byDir).sort((a, b) => b[1] - a[1]), mx = dirs.length ? dirs[0][1] : 1, tot2 = dirs.reduce((a, d) => a + d[1], 0) || 1;
      const dl = h('div', { class: 'dirlist' }, h('div', { class: 'group' }, t('an.folders')), dirs.map(([d, s]) => h('button', {
        class: 'dr', onclick: () => d !== '/' && FM.nav.push('browser', { vol: 'main', path: '/' + d })
      }, FM.icon('folder', 28), h('div', { class: 'dm' }, h('div', { class: 'dn' }, d === '/' ? t('root') : d, h('b', null, u.fmtSize(s) + ' · ' + Math.round(s / tot2 * 100) + '%')), h('div', { class: 'meter' }, h('i', { style: { width: (s / mx * 100) + '%', background: '#2196F3' } }))))));
      body.append(h('div', { class: 'donutwrap' }, donut), legend, h('p', { class: 'hint pad' }, t('an.note')), dl);
    }
    function pickList(items, mk, delLabel, onDelete, preSel) {
      const sel = new Set(preSel || []); const total = h('b', null, ''), btn = h('button', { class: 'dbtn primary danger', onclick: async () => {
        const chosen = items.filter(i => sel.has(i.key)); if (!chosen.length) return;
        if (!(await ui.confirm(delLabel, t('del.perm', { n: chosen.length }), t('delete'), true))) return;
        await onDelete(chosen); ui.toast(t('cleaned')); scan();
      } }, delLabel);
      const upd = () => { total.textContent = t('selected.size', { s: u.fmtSize(items.filter(i => sel.has(i.key)).reduce((a, i) => a + i.size, 0)) }); };
      const lst = h('div', { class: 'flist' });
      items.forEach(it => {
        const cb = h('div', { class: 'cb' + (sel.has(it.key) ? ' on' : '') }, sel.has(it.key) ? FM.icon('check', 16) : null);
        const row = h('div', { class: 'item list-detailed' }, mk(it), cb);
        row.onclick = () => { sel.has(it.key) ? sel.delete(it.key) : sel.add(it.key); cb.classList.toggle('on', sel.has(it.key)); cb.replaceChildren(sel.has(it.key) ? FM.icon('check', 16) : ''); upd(); };
        lst.append(row);
      });
      upd();
      body.append(lst, h('div', { class: 'cleanbar' }, total, btn));
    }
    const fileRow = (r, extra) => [ui.fileIcon(r, 40), h('div', { class: 'meta' }, h('div', { class: 'nm' }, r.name), h('div', { class: 'sub' }, u.fmtSize(r.size) + ' · ' + r.vol + ':' + r.path + (extra || '')))];
    function large() {
      const top = files.slice().sort((a, b) => (b.size || 0) - (a.size || 0)).slice(0, 30).map(r => Object.assign({ key: r.id }, r));
      if (!top.length) return body.append(empty('file', t('empty')));
      pickList(top, r => fileRow(r), t('delete'), async ch => fs.remove(ch, false), []);
    }
    function junk() {
      const isJunk = r => /\.(tmp|temp|log|bak|cache|thumb|thumbdata)$/i.test(r.name) || /\/(\.thumbnails|cache)\//i.test(r.path + '/') || r.name.toLowerCase() === 'thumbs.db';
      const items = files.filter(isJunk).map(r => Object.assign({ key: r.id, kind: 'file' }, r));
      const cacheTotal = apps.reduce((a, x) => a + x.cache, 0);
      if (cacheTotal) items.push({ key: '__apps', kind: 'apps', name: t('an.appcache'), size: cacheTotal, cat: 'other', isDir: false, vol: '', path: '', ext: '' });
      if (!items.length) return body.append(empty('check', t('an.clean')));
      pickList(items, r => r.kind === 'apps' ? [ui.circle('apps', '#FFC107', 40), h('div', { class: 'meta' }, h('div', { class: 'nm' }, r.name), h('div', { class: 'sub' }, u.fmtSize(r.size)))] : fileRow(r), t('an.cleanbtn'), async ch => {
        for (const c of ch) { if (c.kind === 'apps') for (const a of apps) await DB().put('apps', Object.assign({}, a, { cache: 0 })); else await fs.remove([c], true); }
      }, items.map(i => i.key));
    }
    async function dup() {
      if (busy) return; busy = true;
      body.append(h('div', { class: 'empty' }, t('scanning')));
      const groups = {}; files.filter(f => f.size > 0).forEach(f => { (groups[f.size + '|' + f.ext] = groups[f.size + '|' + f.ext] || []).push(f); });
      const cand = Object.values(groups).filter(g => g.length > 1).slice(0, 60), out = [];
      for (const g of cand) {
        const byHash = {};
        for (const f of g) { const b = await (await fs.readBlob(f)).arrayBuffer(); if (!b.byteLength) continue; (byHash[await u.digest('SHA-256', b)] = byHash[await u.digest('SHA-256', b)] || []).push(f); }
        Object.values(byHash).filter(x => x.length > 1).forEach(x => out.push(x.sort((a, b) => a.mtime - b.mtime)));
      }
      busy = false;
      if (tab !== 'dup') return;
      body.innerHTML = '';
      if (!out.length) return body.append(empty('check', t('an.nodup')));
      const items = [], pre = [];
      out.forEach((g, gi) => g.forEach((f, i) => { items.push(Object.assign({ key: f.id, gi }, f)); if (i > 0) pre.push(f.id); }));
      pickList(items, r => fileRow(r, ' · #' + (r.gi + 1)), t('delete'), async ch => fs.remove(ch, true), pre);
    }
    root.__screen = {};
    scan().then(() => { });
    return root;
  };

  /* ================= السحابة وFTP والشبكة ================= */
  const RTYPES = { ftp: 21, ftps: 990, sftp: 22, smb: 445, webdav: 443 };
  FM.screens.cloud = function (params) {
    const root = h('div', { class: 'screen' });
    const bar = h('div', { class: 'bar-slot' }), tabsEl = h('div'), body = h('div', { class: 'cbody' });
    root.append(bar, tabsEl, body);
    let tab = params.tab || 'cloud';
    async function render() {
      bar.replaceChildren(ui.topbar({ left: 'back', onLeft: () => FM.handleBack(), title: t('cloud') }));
      tabsEl.replaceChildren(tabs([['cloud', t('tab.cloud')], ['ftp', t('tab.ftp')]], tab, id => { tab = id; render(); }));
      body.innerHTML = '';
      tab === 'cloud' ? await cloudTab() : await ftpTab();
    }
    async function cloudTab() {
      const acc = await DB().all('accounts');
      body.append(h('div', { class: 'group' }, t('linked')));
      if (!acc.length) body.append(h('p', { class: 'hint pad' }, t('linked.none')));
      const g = h('div', { class: 'tiles small' });
      acc.forEach(a => {
        const s = fs.SERVICES[a.service]; let timer, lp = false;
        const tile = h('button', { class: 'tile' }, h('div', { class: 'circ', style: { width: '56px', height: '56px', background: s.color, color: '#fff', fontWeight: 700 } }, s.letter), h('div', { class: 'tl' }, s.label), h('div', { class: 'ts' }, a.email));
        tile.onpointerdown = () => { lp = false; timer = setTimeout(() => { lp = true; accMenu(a); }, 500); };
        tile.onpointerup = tile.onpointerleave = () => clearTimeout(timer);
        tile.onclick = () => { if (!lp) FM.nav.push('browser', { vol: a.id, path: '/' }); };
        g.append(tile);
      });
      body.append(g, h('div', { class: 'group' }, t('add.service')));
      Object.entries(fs.SERVICES).forEach(([id, s]) => body.append(h('button', { class: 'rowbtn', onclick: () => addAccount(id) }, h('div', { class: 'circ', style: { width: '36px', height: '36px', background: s.color, color: '#fff', fontWeight: 700, fontSize: '13px' } }, s.letter), h('span', null, t('add.x', { x: s.label })), FM.icon('add', 22))));
      body.append(h('p', { class: 'hint pad' }, t('cloud.demo')));
    }
    function accMenu(a) {
      ui.sheet(fs.SERVICES[a.service].label + ' — ' + a.email, [
        { label: t('open'), icon: 'folder', onclick: () => FM.nav.push('browser', { vol: a.id, path: '/' }) },
        { label: t('signout'), icon: 'trash', danger: true, onclick: async () => { if (await ui.confirm(t('signout'), a.email, t('signout'), true)) { await fs.deleteTree({ id: a.id + ':/', isDir: true, path: '/', vol: a.id }); await DB().del('accounts', a.id); render(); } } }]);
    }
    function addAccount(service) {
      const s = fs.SERVICES[service], em = h('input', { class: 'inp', type: 'email', placeholder: 'name@example.com' });
      ui.dialog({
        title: t('signin.to', { x: s.label }),
        body: h('div', null, h('p', { class: 'hint' }, t('oauth.demo')), h('label', { class: 'lbl' }, t('email')), em),
        buttons: [{ label: t('cancel') }, {
          label: t('signin'), primary: true, onclick: async () => {
            const email = em.value.trim(); if (!/^\S+@\S+\.\S+$/.test(email)) { ui.toast(t('err.email')); return false; }
            const acc = { id: 'c_' + service + '_' + u.uid(), service, email, added: Date.now() };
            await DB().put('accounts', acc); await FM.seed.cloud(acc.id, service); ui.toast(t('linked.ok')); render();
          }
        }]
      });
    }
    async function ftpTab() {
      const S = FM.Settings;
      if (!S.get('ftpIp')) await S.set('ftpIp', '192.168.1.' + (10 + Math.floor(Math.random() * 200)));
      const addr = () => 'ftp://' + S.get('ftpIp') + ':' + S.get('ftpPort');
      const addrEl = h('div', { class: 'addr' }, addr()), stat = h('div', { class: 'hint' }, '');
      const refresh = () => { addrEl.textContent = addr(); addrEl.classList.toggle('off', !S.get('ftpOn')); stat.textContent = S.get('ftpOn') ? t('ftp.running') : t('ftp.stopped'); };
      body.append(h('div', { class: 'card' },
        h('div', { class: 'row2' }, h('div', null, h('b', null, t('ftp.title')), h('small', null, t('ftp.sub'))), switchEl(S.get('ftpOn'), async v => { await S.set('ftpOn', v); refresh(); ui.toast(v ? t('ftp.started') : t('ftp.stopped')); })),
        h('div', { class: 'lbl' }, t('ftp.addr')), addrEl, stat,
        h('div', { class: 'btns' }, h('button', { class: 'dbtn primary', onclick: async () => { const a = addr(); if (navigator.share) { try { await navigator.share({ text: a }); return; } catch (e) { } } try { await navigator.clipboard.writeText(a); ui.toast(t('copied')); } catch (e) { ui.prompt(t('ftp.addr'), a); } } }, t('share.addr')),
          h('button', { class: 'dbtn', onclick: ftpSettings }, t('ftp.settings')))));
      refresh();
      body.append(h('div', { class: 'group' }, t('remote.conns')));
      const conns = await DB().all('connections');
      if (!conns.length) body.append(h('p', { class: 'hint pad' }, t('remote.none')));
      conns.forEach(c => {
        let timer, lp = false;
        const row = h('button', { class: 'rowbtn' }, ui.circle('pc', '#607D8B', 40), h('span', { class: 'two' }, h('b', null, c.name), h('small', null, c.type + '://' + c.host + ':' + c.port + (c.path || ''))), h('span', { class: 'ibtn', onclick: e => { e.stopPropagation(); connMenu(c); } }, FM.icon('more', 22)));
        row.onpointerdown = () => { lp = false; timer = setTimeout(() => { lp = true; connMenu(c); }, 500); }; row.onpointerup = row.onpointerleave = () => clearTimeout(timer);
        row.onclick = () => { if (!lp) FM.nav.push('browser', { vol: 'rc_' + c.id, path: '/' }); };
        body.append(row);
      });
      body.append(h('button', { class: 'rowbtn', onclick: () => connDialog() }, ui.circle('add', '#4CAF50', 40), h('span', null, t('remote.add'))), h('p', { class: 'hint pad' }, t('ftp.demo')));
    }
    function ftpSettings() {
      const S = FM.Settings;
      const port = h('input', { class: 'inp', type: 'number', value: S.get('ftpPort') }), user = h('input', { class: 'inp', value: S.get('ftpUser') }), pass = h('input', { class: 'inp', type: 'password', value: S.get('ftpPass') });
      let anon = S.get('ftpAnon');
      ui.dialog({
        title: t('ftp.settings'),
        body: h('div', null, h('label', { class: 'lbl' }, t('port')), port, h('div', { class: 'row2' }, h('span', null, t('ftp.anon')), switchEl(anon, v => { anon = v; })), h('label', { class: 'lbl' }, t('username')), user, h('label', { class: 'lbl' }, t('password')), pass),
        buttons: [{ label: t('cancel') }, { label: t('save'), primary: true, onclick: async () => { await S.set('ftpPort', Math.max(1024, +port.value || 2121)); await S.set('ftpUser', user.value); await S.set('ftpPass', pass.value); await S.set('ftpAnon', anon); render(); } }]
      });
    }
    function connMenu(c) {
      ui.sheet(c.name, [{ label: t('open'), icon: 'folder', onclick: () => FM.nav.push('browser', { vol: 'rc_' + c.id, path: '/' }) },
        { label: t('edit'), icon: 'edit', onclick: () => connDialog(c) },
        { label: t('delete'), icon: 'trash', danger: true, onclick: async () => { if (await ui.confirm(t('delete'), c.name, t('delete'), true)) { await fs.deleteTree({ id: 'rc_' + c.id + ':/', isDir: true, path: '/', vol: 'rc_' + c.id }); await DB().del('connections', c.id); render(); } } }]);
    }
    function connDialog(c) {
      const typ = h('select', { class: 'inp' }, Object.keys(RTYPES).map(k => h('option', { value: k, selected: c && c.type === k }, k.toUpperCase())));
      const name = h('input', { class: 'inp', value: c ? c.name : '' }), host = h('input', { class: 'inp', value: c ? c.host : '', placeholder: '192.168.1.100', dir: 'ltr' });
      const port = h('input', { class: 'inp', type: 'number', value: c ? c.port : 21 }), user = h('input', { class: 'inp', value: c ? c.user : '', dir: 'ltr' });
      const pass = h('input', { class: 'inp', type: 'password', placeholder: c ? t('keep.pw') : '' }), path = h('input', { class: 'inp', value: c ? c.path : '/', dir: 'ltr' });
      typ.onchange = () => { port.value = RTYPES[typ.value]; };
      ui.dialog({
        title: t(c ? 'edit' : 'remote.add'),
        body: h('div', null, h('label', { class: 'lbl' }, t('protocol')), typ, h('label', { class: 'lbl' }, t('name')), name, h('label', { class: 'lbl' }, t('host')), host, h('label', { class: 'lbl' }, t('port')), port,
          h('label', { class: 'lbl' }, t('username')), user, h('label', { class: 'lbl' }, t('password')), pass, h('p', { class: 'hint' }, t('pw.enc')), h('label', { class: 'lbl' }, t('path')), path),
        buttons: [{ label: t('cancel') }, {
          label: t('save'), primary: true, onclick: async () => {
            if (!host.value.trim()) { ui.toast(t('err.host')); return false; }
            const rec = { id: c ? c.id : u.uid(), type: typ.value, name: name.value.trim() || host.value, host: host.value.trim(), port: +port.value || RTYPES[typ.value], user: user.value, path: path.value || '/', pass: c ? c.pass : '' };
            if (pass.value) rec.pass = await u.Vault.enc(pass.value);
            await DB().put('connections', rec); render();
          }
        }]
      });
    }
    root.__screen = {};
    render();
    return root;
  };

  /* ================= الإعدادات ================= */
  FM.screens.settings = function () {
    const root = h('div', { class: 'screen' });
    const S = FM.Settings;
    function build() {
      root.innerHTML = '';
      root.append(ui.topbar({ left: 'back', onLeft: () => FM.handleBack(), title: t('settings') }));
      const row = (label, value, fn) => h('button', { class: 'setrow', onclick: fn }, h('span', { class: 'sl' }, label, h('small', null, value || '')), FM.icon('chevron', 20));
      const swr = (label, key, after) => h('div', { class: 'setrow' }, h('span', { class: 'sl' }, label), switchEl(S.get(key), async v => { await S.set(key, v); after && after(); }));
      const choose = (label, key, opts, after) => row(label, opts.find(o => o[0] === S.get(key))[1], () => ui.sheet(label, opts.map(([v, l]) => ({ label: l, checked: S.get(key) === v, onclick: async () => { await S.set(key, v); after && after(); build(); } }))));
      root.append(h('div', { class: 'setl' },
        h('div', { class: 'group' }, t('set.general')),
        choose(t('language'), 'lang', [['ar', 'العربية'], ['fr', 'Français'], ['en', 'English']], () => { FM.applyLang(); build(); }),
        choose(t('theme'), 'theme', [['system', t('theme.system')], ['light', t('theme.light')], ['dark', t('theme.dark')]], FM.applyTheme),
        h('div', { class: 'group' }, t('set.files')),
        choose(t('view'), 'view', ['list-compact', 'list-detailed', 'grid-medium', 'grid-large'].map(k => [k, t('view.' + k)])),
        choose(t('sort'), 'sortBy', ['name', 'size', 'date', 'type'].map(k => [k, t('sort.' + k)])),
        choose(t('sort.order'), 'sortDir', [['asc', t('sort.asc')], ['desc', t('sort.desc')]]),
        choose(t('date.format'), 'dateFmt', [['dmy', 'DD/MM/YYYY HH:mm'], ['mdy', 'MM/DD/YYYY HH:mm'], ['ymd', 'YYYY-MM-DD HH:mm']]),
        swr(t('show.hidden'), 'showHidden'), swr(t('trash.enable'), 'trash'),
        h('div', { class: 'group' }, t('set.media')),
        choose(t('audio.engine'), 'audioEngine', [['exo', 'ExoPlayer (' + t('advanced') + ')'], ['mp', 'MediaPlayer (' + t('system') + ')']]),
        swr(t('video.gestures'), 'gestures'),
        h('div', { class: 'group' }, t('set.device')),
        swr(t('sd.sim'), 'sdMounted'),
        S.get('wallpaper') ? row(t('wallpaper.clear'), '', async () => { await S.set('wallpaper', null); build(); ui.toast(t('ok')); }) : null,
        row(t('reset'), t('reset.sub'), async () => { if (await ui.confirm(t('reset'), t('reset.msg'), t('reset'), true)) { await FM.DB.wipe(); location.reload(); } }),
        row(t('about'), 'v3.8.2 (2103082)', FM.about)));
    }
    build();
    return root;
  };
})(window.FM);

;

/* ===== app.js ===== */
/* app.js — الموجّه (Router)، زر الرجوع، الإقلاع */
window.FM = window.FM || {};
(function (FM) {
  'use strict';
  const h = FM.h, t = (...a) => FM.t(...a), ui = FM.ui;

  FM.nav = {
    stack: [],
    cur() { return this.stack[this.stack.length - 1]; },
    push(name, params) { this.save(); this.stack.push({ name, params: params || {} }); this.render(); },
    replace(name, params) { this.stack[this.stack.length - 1] = { name, params: params || {} }; this.render(); },
    home() { this.stack = [{ name: 'home', params: {} }]; this.render(); },
    pop() { if (this.stack.length > 1) { this.stack.pop(); this.render(true); return true; } return false; },
    save() { const c = this.cur(), el = document.querySelector('#screen > .screen'); if (c && el) c.scroll = el.scrollTop; },
    /** الانتقال إلى مسار: يرجع داخل المكدس إن كان سلفاً، وإلا يضيف */
    goPath(vol, path) {
      const isB = e => e && e.name === 'browser' && e.params.vol === vol && e.params.path != null;
      let top = this.cur();
      while (this.stack.length > 1 && isB(top) && top.params.path !== path && top.params.path.startsWith(path === '/' ? '/' : path + '/')) { this.stack.pop(); top = this.cur(); }
      if (isB(top) && top.params.path === path) this.render(true); else this.push('browser', { vol, path });
    },
    render(restore) {
      const c = this.cur(), host = ui.byId('screen');
      const fn = FM.screens[c.name];
      const el = fn(c.params);
      host.innerHTML = '';
      host.append(el);
      if (restore && c.scroll) setTimeout(() => { el.scrollTop = c.scroll; }, 90);
    }
  };

  FM.handleBack = function () {
    if (ui.closeTop()) return;
    const el = document.querySelector('#screen > .screen');
    if (el && el.__screen && el.__screen.onBack && el.__screen.onBack()) return;
    if (FM.nav.pop()) return;
    const now = Date.now();
    if (FM.lastBack && now - FM.lastBack < 2000) {
      try { window.Capacitor && Capacitor.Plugins.App.exitApp(); } catch (e) { }
      ui.toast(t('exit.web')); FM.lastBack = 0; return;
    }
    FM.lastBack = now; ui.toast(t('exit.press'));
  };

  FM.applyTheme = function () {
    const th = FM.Settings.get('theme');
    if (th === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', th);
    const dark = th === 'dark' || (th === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#121212' : '#ffffff';
  };
  FM.applyLang = function () {
    FM.setLang(FM.Settings.get('lang'));
    document.title = t('app.name');
  };

  FM.boot = async function () {
    const splash = ui.byId('splash'), msg = splash.querySelector('small');
    try {
      await FM.DB.open();
      await FM.Settings.load();
      FM.applyTheme(); FM.applyLang();
      if (!FM.Settings.get('seeded')) {
        msg.textContent = t('seeding');
        await FM.seed.run(p => { splash.querySelector('i').style.width = p + '%'; });
      }
      FM.nav.home();
      splash.classList.add('gone'); setTimeout(() => splash.remove(), 400);
      history.pushState({ g: 1 }, '');
      window.addEventListener('popstate', () => { FM.handleBack(); history.pushState({ g: 1 }, ''); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') FM.handleBack(); });
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', FM.applyTheme);
      if (location.protocol.startsWith('http') && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
      // Capacitor: زر الرجوع في أندرويد
      if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App) Capacitor.Plugins.App.addListener('backButton', () => FM.handleBack());
    } catch (e) {
      console.error(e);
      splash.querySelector('small').textContent = 'Error: ' + e.message;
    }
  };
  window.addEventListener('DOMContentLoaded', () => FM.boot());
})(window.FM);

;

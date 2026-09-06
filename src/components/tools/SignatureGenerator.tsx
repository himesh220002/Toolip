'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  CreditCard,
  Copy,
  Check,
  Sparkles,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  Sliders,
  RotateCcw,
  QrCode as QrIcon,
  Download,
  Printer,
  MapPin,
  Building2,
  User,
  Share2,
  FileCode,
  Layers,
  ExternalLink,
  Type
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Preset Card Themes
const CARD_THEMES = {
  midnight: {
    name: 'Midnight Corporate',
    bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950',
    cssGradient: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)',
    cssBorder: '1px solid rgba(99, 102, 241, 0.3)',
    cardBorder: 'border-indigo-500/30',
    accent: '#6366f1',
    textColor: 'text-white',
    hexTextColor: '#ffffff',
    subTextColor: 'text-slate-300',
    hexSubTextColor: '#cbd5e1',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  neon: {
    name: 'Neon Cyberpunk',
    bg: 'bg-gradient-to-br from-gray-950 via-slate-900 to-cyan-950',
    cssGradient: 'linear-gradient(135deg, #030712 0%, #0f172a 50%, #083344 100%)',
    cssBorder: '1px solid rgba(6, 182, 212, 0.3)',
    cardBorder: 'border-cyan-500/30',
    accent: '#06b6d4',
    textColor: 'text-white',
    hexTextColor: '#ffffff',
    subTextColor: 'text-cyan-200',
    hexSubTextColor: '#a5f3fc',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  gold: {
    name: 'Luxury Gold',
    bg: 'bg-gradient-to-br from-stone-950 via-neutral-900 to-amber-950',
    cssGradient: 'linear-gradient(135deg, #0c0a09 0%, #171717 50%, #451a03 100%)',
    cssBorder: '1px solid rgba(245, 158, 11, 0.4)',
    cardBorder: 'border-amber-500/40',
    accent: '#f59e0b',
    textColor: 'text-amber-100',
    hexTextColor: '#fef3c7',
    subTextColor: 'text-amber-200/80',
    hexSubTextColor: 'rgba(253, 230, 138, 0.8)',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  emerald: {
    name: 'Gradient Emerald',
    bg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950',
    cssGradient: 'linear-gradient(135deg, #022c22 0%, #0f172a 50%, #042f2e 100%)',
    cssBorder: '1px solid rgba(16, 185, 129, 0.3)',
    cardBorder: 'border-emerald-500/30',
    accent: '#10b981',
    textColor: 'text-white',
    hexTextColor: '#ffffff',
    subTextColor: 'text-emerald-200',
    hexSubTextColor: '#a7f3d0',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  minimal: {
    name: 'Minimal Clean',
    bg: 'bg-white',
    cssGradient: '#ffffff',
    cssBorder: '1px solid #cbd5e1',
    cardBorder: 'border-slate-300',
    accent: '#0f172a',
    textColor: 'text-slate-900',
    hexTextColor: '#0f172a',
    subTextColor: 'text-slate-600',
    hexSubTextColor: '#475569',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
  },
};

// Helper to convert Google Drive view links to direct viewable image URLs
const sanitizeImageUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  if (trimmed.includes('lh3.googleusercontent.com/d/')) {
    return trimmed;
  }

  // Convert Google Drive view/sharing URLs (including /u/0/d/, /u/1/d/, open?id=, uc?id=, etc.)
  const fileIdMatch =
    trimmed.match(/(?:drive|docs)\.google\.com\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/(?:drive|docs)\.google\.com\/(?:open|uc|thumbnail)\?.*id=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/drive\.usercontent\.google\.com\/.*id=([a-zA-Z0-9_-]+)/);

  if (fileIdMatch && fileIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
  }

  return trimmed;
};

export const SignatureGenerator: React.FC = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Card Content State
  const [fullName, setFullName, resetFullName] = useLocalStorage<string>('toolip_card_name', 'Alex Johnson');
  const [role, setRole, resetRole] = useLocalStorage<string>('toolip_card_role', 'Senior Software Engineer & Architect');
  const [company, setCompany, resetCompany] = useLocalStorage<string>('toolip_card_company', 'Toolip Developer Suite');
  const [tagline, setTagline, resetTagline] = useLocalStorage<string>('toolip_card_tagline', 'Empowering Private Web Utilities');
  const [email, setEmail, resetEmail] = useLocalStorage<string>('toolip_card_email', 'alex.johnson@toolip.app');
  const [phone, setPhone, resetPhone] = useLocalStorage<string>('toolip_card_phone', '+1 (555) 839-2041');
  const [website, setWebsite, resetWebsite] = useLocalStorage<string>('toolip_card_website', 'https://toolip.app');
  const [address, setAddress, resetAddress] = useLocalStorage<string>('toolip_card_address', '100 Innovation Way, Suite 400, San Francisco, CA');

  // Media / Logo / Avatar State
  const [logoUrl, setLogoUrl, resetLogoUrl] = useLocalStorage<string>(
    'toolip_card_logo',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'
  );
  const [avatarUrl, setAvatarUrl, resetAvatarUrl] = useLocalStorage<string>(
    'toolip_card_avatar',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  );

  // Theme & Layout Options
  const [themeSyncMode, setThemeSyncMode] = useLocalStorage<'same' | 'different'>('toolip_card_theme_sync_mode', 'same');
  const [cardTheme, setCardTheme] = useLocalStorage<keyof typeof CARD_THEMES>('toolip_card_theme', 'midnight');
  const [frontCardTheme, setFrontCardTheme] = useLocalStorage<keyof typeof CARD_THEMES>('toolip_card_front_theme', 'midnight');
  const [backCardTheme, setBackCardTheme] = useLocalStorage<keyof typeof CARD_THEMES>('toolip_card_back_theme', 'midnight');
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('both');

  const handleSelectUnifiedTheme = (tKey: keyof typeof CARD_THEMES) => {
    setCardTheme(tKey);
    setFrontCardTheme(tKey);
    setBackCardTheme(tKey);
  };

  // Typography & Slideable Font Sizing Controls (All Measurements Strictly in PX)
  const [cardFontFamily, setCardFontFamily] = useLocalStorage<string>('toolip_card_font', 'Inter');
  const [cardWidth, setCardWidth] = useLocalStorage<number>('toolip_card_width', 420);
  const [cardHeight, setCardHeight] = useLocalStorage<number>('toolip_card_height', 240);
  const [cardPadding, setCardPadding] = useLocalStorage<number>('toolip_card_padding', 22);
  const [logoSize, setLogoSize] = useLocalStorage<number>('toolip_card_logo_size', 72);
  const [avatarSize, setAvatarSize] = useLocalStorage<number>('toolip_card_avatar_size', 44);
  const [qrCodeSize, setQrCodeSize] = useLocalStorage<number>('toolip_card_qr_size', 58);
  const [companyFontSize, setCompanyFontSize] = useLocalStorage<number>('toolip_card_company_fs', 20);
  const [taglineFontSize, setTaglineFontSize] = useLocalStorage<number>('toolip_card_tagline_fs', 11);
  const [nameFontSize, setNameFontSize] = useLocalStorage<number>('toolip_card_name_fs', 16);
  const [roleFontSize, setRoleFontSize] = useLocalStorage<number>('toolip_card_role_fs', 11);
  const [contactFontSize, setContactFontSize] = useLocalStorage<number>('toolip_card_contact_fs', 11);
  const [avatarLayout, setAvatarLayout] = useLocalStorage<'col' | 'row'>('toolip_avatar_layout', 'col');

  // Text Visibility Below Logo Controls (50% and 40%)
  const [companyOpacity, setCompanyOpacity] = useState<number>(50); // 50% default
  const [taglineOpacity, setTaglineOpacity] = useState<number>(40); // 40% default

  // Standalone Business Card Sharing QR Code State & Notice Text
  const [sharePdfQrDataUrl, setSharePdfQrDataUrl] = useState<string>('');
  const [businessQrNoticeText, setBusinessQrNoticeText] = useState<string>('Hi, scan to save contact');

  // Paste Custom HTML State & Parser
  const [showPasteHtmlPanel, setShowPasteHtmlPanel] = useState<boolean>(false);
  const [pastedHtmlCode, setPastedHtmlCode] = useState<string>('');
  const [renderCustomHtmlDirectly, setRenderCustomHtmlDirectly] = useState<boolean>(false);
  const [htmlParseStatus, setHtmlParseStatus] = useState<string>('');

  const handleApplyPastedHtml = (codeToParse?: string) => {
    const rawHtml = codeToParse !== undefined ? codeToParse : pastedHtmlCode;
    if (!rawHtml.trim()) {
      setHtmlParseStatus('Please paste HTML code first.');
      return;
    }

    try {
      if (typeof window === 'undefined') return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      // 1. Remove SVG, script, and style tags so SVG viewBox="0 0 24 24" or CSS rules never pollute phone or text parsing
      doc.querySelectorAll('svg, script, style').forEach((node) => node.remove());

      // 2. Extract Image URLs for Logo & Avatar
      const imgMatches = Array.from(rawHtml.matchAll(/src=["']([^"']+)["']/g));
      if (imgMatches.length > 0 && imgMatches[0][1]) setLogoUrl(imgMatches[0][1]);
      if (imgMatches.length > 1 && imgMatches[1][1]) setAvatarUrl(imgMatches[1][1]);

      // 3. Class-based Extraction (if present)
      let foundCompany = doc.querySelector('.company-title')?.textContent?.trim();
      let foundTagline = doc.querySelector('.company-tagline')?.textContent?.trim();
      let foundName = doc.querySelector('.person-name')?.textContent?.trim();
      let foundRole = doc.querySelector('.person-role')?.textContent?.trim();

      // 4. Extract all clean leaf text elements from SVG-stripped DOM tree
      const allLeafTexts = Array.from(doc.querySelectorAll('h1, h2, h3, h4, p, span, div, td, b, strong, a'))
        .filter((el) => el.children.length === 0)
        .map((el) => el.textContent?.trim())
        .filter((txt): txt is string => Boolean(txt && txt.length > 1 && !txt.includes('<') && !txt.includes('{') && !txt.includes('}')));

      // 5. Intelligent Field Classifier for Email, Phone, Website & Address
      let foundEmail = '';
      let foundPhone = '';
      let foundWebsite = '';
      let foundAddress = '';
      const headerTexts: string[] = [];

      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const phoneRegex = /(?:\+?\d{1,4}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;
      const domainRegex = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+(?:com|app|online|io|net|org|dev|co|in|edu|tech|site|xyz|store|agency|design|me|info)(?:\/[^\s"'<>]*)?/i;

      for (const txt of allLeafTexts) {
        // Email matching
        if (!foundEmail && emailRegex.test(txt)) {
          const m = txt.match(emailRegex);
          if (m) foundEmail = m[0];
          continue;
        }

        // Website matching (domain extension, no @)
        if (!foundWebsite && !txt.includes('@') && domainRegex.test(txt)) {
          const m = txt.match(domainRegex);
          if (m) foundWebsite = m[0];
          continue;
        }

        // Phone matching (must start with +, (###), or match phone digits with 7+ digits)
        if (!foundPhone && (txt.includes('+') || phoneRegex.test(txt)) && txt.replace(/\D/g, '').length >= 7) {
          const m = txt.match(/(\+?[0-9][0-9\s\-\(\)]{7,}[0-9])/);
          if (m && m[1].replace(/\D/g, '').length >= 7) {
            foundPhone = m[1].trim();
            continue;
          }
        }

        // Address matching (contains comma or location terms)
        if (!foundAddress && (txt.includes(',') || /\b(street|st|way|suite|route|rd|road|ave|avenue|blvd|po box|box|bihar|katihar|san francisco|ca|ny|usa|uk|india|in)\b/i.test(txt)) && txt.length > 5) {
          foundAddress = txt;
          continue;
        }

        // Collect remaining clean texts for branding headers
        headerTexts.push(txt);
      }

      // Apply Contact Information
      if (foundEmail) setEmail(foundEmail);
      if (foundPhone) setPhone(foundPhone);
      if (foundWebsite) setWebsite(foundWebsite);
      if (foundAddress) setAddress(foundAddress);

      // Apply Branding / Person Information
      if (!foundCompany && headerTexts.length > 0) foundCompany = headerTexts[0];
      if (!foundTagline && headerTexts.length > 1) foundTagline = headerTexts[1];
      if (!foundName && headerTexts.length > 2) foundName = headerTexts[2];
      if (!foundRole && headerTexts.length > 3) foundRole = headerTexts[3];

      if (foundCompany) setCompany(foundCompany);
      if (foundTagline) setTagline(foundTagline);
      if (foundName) setFullName(foundName);
      if (foundRole) setRole(foundRole);

      setHtmlParseStatus('✓ HTML imported! Email, Phone, Website & Address auto-filled accurately!');
      setTimeout(() => setHtmlParseStatus(''), 3500);
    } catch (e) {
      setHtmlParseStatus('HTML code ready for direct custom rendering.');
    }
  };

  // Internal Card QR Code State
  const [qrSourceMode, setQrSourceMode] = useState<'auto' | 'upload'>('auto');
  const [uploadedQrUrl, setUploadedQrUrl] = useState<string>('');
  const [internalQrDataUrl, setInternalQrDataUrl] = useState<string>('');

  // Exact QR Custom Dimensions (Requested by User)
  const [qrPadding, setQrPadding] = useState<number>(30); // 30px
  const [qrBorderRadius, setQrBorderRadius] = useState<number>(34); // 34px
  const [eyeRadius, setEyeRadius] = useState<number>(10); // 10px
  const [qrFgColor, setQrFgColor] = useState<string>('#032326'); // #032326
  const [qrBgColor, setQrBgColor] = useState<string>('#ffffff'); // #ffffff

  // Copy Feedback States
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
  const qrFileInputRef = useRef<HTMLInputElement | null>(null);

  // Re-generate Embedded Internal Card QR Code & Composite Share QR PNG
  useEffect(() => {
    generateInternalQrCanvas();
    generateSharePdfQrCanvas();
  }, [website, qrPadding, qrBorderRadius, eyeRadius, qrFgColor, qrBgColor, fullName, company, role, phone, email, logoUrl, businessQrNoticeText]);

  const drawPositionEye = (
    ctx: CanvasRenderingContext2D,
    pad: number,
    startCol: number,
    startRow: number,
    moduleSize: number,
    fg: string,
    bg: string,
    eyeR: number
  ) => {
    const x = pad + startCol * moduleSize;
    const y = pad + startRow * moduleSize;
    const outerW = 7 * moduleSize;
    const innerW = 5 * moduleSize;
    const innerOffset = 1 * moduleSize;
    const dotW = 3 * moduleSize;
    const dotOffset = 2 * moduleSize;

    // 1. Outer 7x7 Ring
    ctx.fillStyle = fg;
    ctx.beginPath();
    if (eyeR > 0) {
      ctx.roundRect(x, y, outerW, outerW, Math.min(eyeR, outerW / 2));
    } else {
      ctx.rect(x, y, outerW, outerW);
    }
    ctx.fill();

    // 2. Inner 5x5 Cutout
    ctx.fillStyle = bg;
    ctx.beginPath();
    if (eyeR > 0) {
      ctx.roundRect(x + innerOffset, y + innerOffset, innerW, innerW, Math.max(0, eyeR - 2));
    } else {
      ctx.rect(x + innerOffset, y + innerOffset, innerW, innerW);
    }
    ctx.fill();

    // 3. Center 3x3 Dot
    ctx.fillStyle = fg;
    ctx.beginPath();
    if (eyeR > 0) {
      ctx.roundRect(x + dotOffset, y + dotOffset, dotW, dotW, Math.max(0, eyeR - 4));
    } else {
      ctx.rect(x + dotOffset, y + dotOffset, dotW, dotW);
    }
    ctx.fill();
  };

  const drawCustomQrCanvas = (payloadText: string): string => {
    if (!payloadText.trim()) return '';

    try {
      const qrMatrix = QRCode.create(payloadText, { errorCorrectionLevel: 'H' });
      const moduleCount = qrMatrix.modules.size;
      const baseSize = 240;
      const pad = qrPadding;
      const totalWidth = baseSize + pad * 2;
      const totalHeight = baseSize + pad * 2;
      const moduleSize = baseSize / moduleCount;

      const canvas = document.createElement('canvas');
      canvas.width = totalWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Outer Rounded Background (Padding + Corner Radius)
      ctx.save();
      ctx.fillStyle = qrBgColor;
      ctx.beginPath();
      if (qrBorderRadius > 0) {
        ctx.roundRect(0, 0, totalWidth, totalHeight, qrBorderRadius);
      } else {
        ctx.rect(0, 0, totalWidth, totalHeight);
      }
      ctx.fill();

      if (qrBorderRadius > 0) ctx.clip();

      // Custom Position Eyes with Position Eye Roundness (10px)
      drawPositionEye(ctx, pad, 0, 0, moduleSize, qrFgColor, qrBgColor, eyeRadius);
      drawPositionEye(ctx, pad, moduleCount - 7, 0, moduleSize, qrFgColor, qrBgColor, eyeRadius);
      drawPositionEye(ctx, pad, 0, moduleCount - 7, moduleSize, qrFgColor, qrBgColor, eyeRadius);

      // Draw Data Modules (#032326)
      ctx.fillStyle = qrFgColor;
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          const isTopLeftEye = col < 7 && row < 7;
          const isTopRightEye = col >= moduleCount - 7 && row < 7;
          const isBottomLeftEye = col < 7 && row >= moduleCount - 7;
          if (isTopLeftEye || isTopRightEye || isBottomLeftEye) continue;

          if (qrMatrix.modules.get(row, col)) {
            const x = pad + col * moduleSize;
            const y = pad + row * moduleSize;
            ctx.fillRect(x, y, moduleSize + 0.4, moduleSize + 0.4);
          }
        }
      }

      ctx.restore();
      return canvas.toDataURL('image/png');
    } catch (e) {
      return '';
    }
  };

  // Generate Composite PNG Canvas for Download (1:1 Square QR Card + Padded Notice Text below)
  const drawCompositeShareQrCanvas = async (payloadText: string): Promise<string> => {
    if (!payloadText.trim()) return '';

    try {
      const qrMatrix = QRCode.create(payloadText, { errorCorrectionLevel: 'H' });
      const moduleCount = qrMatrix.modules.size;
      const baseSize = 280;
      const pad = qrPadding;
      const moduleSize = baseSize / moduleCount;

      // 1:1 SQUARE QR Card Dimensions
      const qrSquareSize = baseSize + pad * 2;
      const textGap = 20; // 20px padding gap below QR square card
      const badgeHeight = 92; // Height for column badge (logo top + text bottom)
      const totalWidth = qrSquareSize;
      const totalHeight = qrSquareSize + textGap + badgeHeight + 16;

      const canvas = document.createElement('canvas');
      canvas.width = totalWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Clear canvas (transparent wrapper)
      ctx.clearRect(0, 0, totalWidth, totalHeight);

      // 1. Draw 1:1 SQUARE White QR Card
      ctx.save();
      ctx.fillStyle = qrBgColor;
      ctx.beginPath();
      if (qrBorderRadius > 0) {
        ctx.roundRect(0, 0, qrSquareSize, qrSquareSize, qrBorderRadius);
      } else {
        ctx.rect(0, 0, qrSquareSize, qrSquareSize);
      }
      ctx.fill();

      // Clip to keep modules inside 1:1 SQUARE
      if (qrBorderRadius > 0) ctx.clip();

      // 2. Draw Position Eyes inside 1:1 SQUARE
      drawPositionEye(ctx, pad, 0, 0, moduleSize, qrFgColor, qrBgColor, eyeRadius);
      drawPositionEye(ctx, pad, moduleCount - 7, 0, moduleSize, qrFgColor, qrBgColor, eyeRadius);
      drawPositionEye(ctx, pad, 0, moduleCount - 7, moduleSize, qrFgColor, qrBgColor, eyeRadius);

      // 3. Draw Data Modules (#032326) inside 1:1 SQUARE
      ctx.fillStyle = qrFgColor;
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          const isTopLeftEye = col < 7 && row < 7;
          const isTopRightEye = col >= moduleCount - 7 && row < 7;
          const isBottomLeftEye = col < 7 && row >= moduleCount - 7;
          if (isTopLeftEye || isTopRightEye || isBottomLeftEye) continue;

          if (qrMatrix.modules.get(row, col)) {
            const x = pad + col * moduleSize;
            const y = pad + row * moduleSize;
            ctx.fillRect(x, y, moduleSize + 0.4, moduleSize + 0.4);
          }
        }
      }
      ctx.restore();

      // 4. Draw Column Badge BELOW QR Square (Logo Top Centered, Text Bottom Centered)
      const noticeText = businessQrNoticeText || 'Hi, scan to save contact';
      const badgeY = qrSquareSize + textGap;
      const cleanLogoUrl = sanitizeImageUrl(logoUrl);

      if (cleanLogoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          logoImg.onload = () => {
            ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const textMetrics = ctx.measureText(noticeText);
            const textWidth = textMetrics.width;
            const badgeW = Math.min(totalWidth, Math.max(textWidth + 48, 220));
            const badgeH = 92;
            const badgeX = (totalWidth - badgeW) / 2;

            // Draw Pill Container Badge Below QR Square
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 20);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw 32px Logo Image (Centered at top of column)
            ctx.save();
            ctx.beginPath();
            const logoCenterX = totalWidth / 2;
            const logoCenterY = badgeY + 28;
            ctx.arc(logoCenterX, logoCenterY, 16, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logoImg, logoCenterX - 16, logoCenterY - 16, 32, 32);
            ctx.restore();

            // Draw 24px Notice Text (Centered below logo in column)
            ctx.fillStyle = '#f59e0b';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(noticeText, totalWidth / 2, badgeY + 66);
            resolve();
          };
          logoImg.onerror = () => {
            const retryImg = new Image();
            retryImg.onload = () => {
              ctx.save();
              ctx.beginPath();
              const logoCenterX = totalWidth / 2;
              const logoCenterY = badgeY + 28;
              ctx.arc(logoCenterX, logoCenterY, 16, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(retryImg, logoCenterX - 16, logoCenterY - 16, 32, 32);
              ctx.restore();

              ctx.fillStyle = '#f59e0b';
              ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(noticeText, totalWidth / 2, badgeY + 66);
              resolve();
            };
            retryImg.onerror = () => {
              ctx.fillStyle = '#0f172a';
              ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(noticeText, totalWidth / 2, badgeY + 46);
              resolve();
            };
            retryImg.src = cleanLogoUrl;
          };
          logoImg.src = cleanLogoUrl.includes('googleusercontent.com')
            ? `${cleanLogoUrl}?v=${Date.now()}`
            : cleanLogoUrl;
        });
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(noticeText, totalWidth / 2, badgeY + 46);
      }

      return canvas.toDataURL('image/png');
    } catch (e) {
      return '';
    }
  };

  const generateInternalQrCanvas = async () => {
    if (!website.trim()) return;
    const url = drawCustomQrCanvas(website);
    if (url) setInternalQrDataUrl(url);
  };

  // Generate Standalone Share QR (Direct Card File Download Payload with embedded Logo + Notice Text)
  const generateSharePdfQrCanvas = async () => {
    try {
      const cardPayload = `BEGIN:VCARD\nVERSION:3.0\nN:${fullName}\nORG:${company}\nTITLE:${role}\nTEL:${phone}\nEMAIL:${email}\nURL:${website}\nEND:VCARD`;
      const url = await drawCompositeShareQrCanvas(cardPayload);
      if (url) setSharePdfQrDataUrl(url);
    } catch (e) { }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setLogoUrl(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setAvatarUrl(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedQrUrl(event.target?.result as string);
      setQrSourceMode('upload');
    };
    reader.readAsDataURL(file);
  };

  const resetAllCard = () => {
    resetFullName();
    resetRole();
    resetCompany();
    resetTagline();
    resetEmail();
    resetPhone();
    resetWebsite();
    resetAddress();
    resetLogoUrl();
    resetAvatarUrl();
  };

  // Get Contact Details Plain Text for 1-Click Copy
  const getDetailsText = () => {
    return `BUSINESS CARD: ${fullName}
--------------------------------------------------
👤 Title: ${role}
🏢 Company: ${company}
📧 Email: ${email}
📞 Phone: ${phone}
🌐 Website: ${website}
📍 Address: ${address}
--------------------------------------------------
Generated via Toolip Premium Business Card Generator`;
  };

  const copyDetailsText = () => {
    navigator.clipboard.writeText(getDetailsText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Get Full HTML Code of Front & Back Cards
  const getFullCardHtml = () => {
    const activeQr = qrSourceMode === 'upload' && uploadedQrUrl ? uploadedQrUrl : internalQrDataUrl;
    const frontTheme = CARD_THEMES[themeSyncMode === 'different' ? frontCardTheme : cardTheme];
    const backTheme = CARD_THEMES[themeSyncMode === 'different' ? backCardTheme : cardTheme];
    const backKey = themeSyncMode === 'different' ? backCardTheme : cardTheme;
    const cleanLogoUrl = sanitizeImageUrl(logoUrl);
    const cleanAvatarUrl = sanitizeImageUrl(avatarUrl);

    return `<!-- Toolip Premium Business Card HTML -->
<div style="display: flex; flex-wrap: wrap; gap: 24px; font-family: '${cardFontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
  <!-- FRONT SIDE CARD -->
  <div style="width: ${cardWidth}px; height: ${cardHeight}px; border-radius: 24px; padding: ${cardPadding}px; background: ${frontTheme.cssGradient}; border: ${frontTheme.cssBorder}; color: ${frontTheme.hexTextColor}; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; position: relative; overflow: hidden; box-shadow: 0 14px 28px -5px rgba(0,0,0,0.35);">
    <div style="position: absolute; top: -50px; right: -50px; width: 180px; height: 180px; border-radius: 50%; background: rgba(99, 102, 241, 0.15); filter: blur(25px); pointer-events: none;"></div>
    <div style="position: absolute; bottom: -50px; left: -50px; width: 180px; height: 180px; border-radius: 50%; background: rgba(14, 165, 233, 0.15); filter: blur(25px); pointer-events: none;"></div>
    <div style="z-index: 10; display: flex; flex-direction: column; align-items: center;">
      <img src="${cleanLogoUrl}" style="height: ${logoSize}px; width: ${logoSize}px; object-fit: contain; margin-bottom: 8px;" />
      <div>
        <div style="font-size: ${companyFontSize}px; font-weight: 900; letter-spacing: -0.02em; opacity: ${companyOpacity / 100}; line-height: 1.15;">${company}</div>
        <div style="font-size: ${taglineFontSize}px; color: ${frontTheme.hexSubTextColor}; font-weight: 700; margin-top: 4px; opacity: ${taglineOpacity / 100}; line-height: 1.15;">${tagline}</div>
      </div>
    </div>
  </div>

  <!-- BACK SIDE CARD -->
  <div style="width: ${cardWidth}px; height: ${cardHeight}px; border-radius: 24px; padding: ${cardPadding}px; background: ${backTheme.cssGradient}; border: ${backTheme.cssBorder}; color: ${backTheme.hexTextColor}; display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden; box-shadow: 0 14px 28px -5px rgba(0,0,0,0.35);">
    <div style="position: absolute; top: -50px; right: -50px; width: 180px; height: 180px; border-radius: 50%; background: rgba(99, 102, 241, 0.15); filter: blur(25px); pointer-events: none;"></div>
    <div style="position: absolute; bottom: -50px; left: -50px; width: 180px; height: 180px; border-radius: 50%; background: rgba(14, 165, 233, 0.15); filter: blur(25px); pointer-events: none;"></div>
    <div style="flex: 1; padding-right: 10px; z-index: 10; overflow: hidden; min-width: 0;">
      <div style="display: flex; ${avatarLayout === 'col' ? 'flex-direction: column; align-items: flex-start; gap: 6px;' : 'align-items: center; gap: 10px;'} margin-bottom: 8px;">
        <img src="${cleanAvatarUrl}" style="height: ${avatarSize}px; width: ${avatarSize}px; border-radius: 50%; object-fit: cover; border: 2px solid ${backKey === 'minimal' ? '#cbd5e1' : 'rgba(255,255,255,0.2)'};" />
        <div style="min-width: 0;">
          <div style="font-size: ${nameFontSize}px; font-weight: 900; line-height: 1.2; color: ${backTheme.hexTextColor};">${fullName}</div>
          <div style="font-size: ${roleFontSize}px; color: ${backTheme.hexSubTextColor}; font-weight: 700; line-height: 1.25; margin-top: 2px; word-break: break-word;">${role}</div>
        </div>
      </div>
      <div style="font-size: ${contactFontSize}px; font-weight: 500; opacity: 0.92; display: flex; flex-direction: column; gap: 3.5px; color: ${backTheme.hexTextColor};">
        <div style="display: flex; align-items: center; gap: 6px; line-height: 1.25; word-break: break-word;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <span>${email}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; line-height: 1.25; word-break: break-word;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>${phone}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; line-height: 1.25; word-break: break-word;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <span>${website.replace(/^https?:\/\//, '')}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; line-height: 1.25; word-break: break-word;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${address}</span>
        </div>
      </div>
    </div>
    ${activeQr ? `
      <div style="padding: 6px; background: #ffffff; border-radius: 14px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; flex-shrink: 0; z-index: 10;">
        <img src="${activeQr}" style="height: ${qrCodeSize}px; width: ${qrCodeSize}px; object-fit: contain; display: block;" />
      </div>
    ` : ''}
  </div>
</div>`;
  };

  const copyCardHtml = () => {
    navigator.clipboard.writeText(getFullCardHtml());
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  // 🖨️ Professional Press-Ready 300 DPI PDF Engine (2 Separate Pages, 3mm Bleed, Crop Marks, CMYK Print Space)
  const downloadPressReadyPdf = () => {
    const activeQr = qrSourceMode === 'upload' && uploadedQrUrl ? uploadedQrUrl : internalQrDataUrl;
    const frontTheme = CARD_THEMES[themeSyncMode === 'different' ? frontCardTheme : cardTheme];
    const backTheme = CARD_THEMES[themeSyncMode === 'different' ? backCardTheme : cardTheme];
    const backKey = themeSyncMode === 'different' ? backCardTheme : cardTheme;
    const cleanLogoUrl = sanitizeImageUrl(logoUrl);
    const cleanAvatarUrl = sanitizeImageUrl(avatarUrl);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fullName} — Press Ready Business Card (Separated Pages + 3mm Bleed)</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Fira+Code:wght@400;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;600;700;800;900&family=Outfit:wght@300;400;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Poppins:wght@300;400;600;700;800;900&family=Roboto:wght@300;400;500;700;900&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            /* 🎯 Commercial Printer Setup: Card (3.5" x 2.0" / 88.9mm x 50.8mm) + 3mm Bleed = 94.9mm x 56.8mm */
            @page {
              size: 94.9mm 56.8mm;
              margin: 0;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body {
              width: 94.9mm;
              height: 56.8mm;
              margin: 0;
              padding: 0;
              background: #ffffff;
              font-family: '${cardFontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            /* SEPARATED PAGES FOR COMMERCIAL PRINTING */
            .press-page {
              width: 94.9mm;
              height: 56.8mm;
              position: relative;
              overflow: hidden;
              page-break-after: always;
              break-after: page;
              background: #ffffff;
            }
            .press-page:last-child {
              page-break-after: avoid;
              break-after: avoid;
            }

            /* 3mm Bleed Area Backgrounds */
            .front-bleed-bg {
              position: absolute;
              top: 0;
              left: 0;
              width: 94.9mm;
              height: 56.8mm;
              background: ${frontTheme.cssGradient};
              border: ${frontTheme.cssBorder};
              z-index: 1;
            }
            .back-bleed-bg {
              position: absolute;
              top: 0;
              left: 0;
              width: 94.9mm;
              height: 56.8mm;
              background: ${backTheme.cssGradient};
              border: ${backTheme.cssBorder};
              z-index: 1;
            }

            /* Trim Boundary Box (88.9mm x 50.8mm centered inside 3mm bleed) */
            .trim-box {
              position: absolute;
              top: 3mm;
              left: 3mm;
              width: 88.9mm;
              height: 50.8mm;
              padding: ${cardPadding}px;
              display: flex;
              z-index: 10;
              box-sizing: border-box;
              overflow: hidden;
            }
            .trim-front {
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .trim-back {
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
            }

            /* High Precision Vector Corner Crop Ticks (0.5px hair-lines) */
            .crop-tick {
              position: absolute;
              z-index: 20;
              background: rgba(255, 255, 255, 0.9);
              mix-blend-mode: difference;
            }
            /* Top Left Ticks */
            .crop-tl-h { top: 3mm; left: 0; width: 2.5mm; height: 0.5px; }
            .crop-tl-v { top: 0; left: 3mm; width: 0.5px; height: 2.5mm; }
            /* Top Right Ticks */
            .crop-tr-h { top: 3mm; right: 0; width: 2.5mm; height: 0.5px; }
            .crop-tr-v { top: 0; right: 3mm; width: 0.5px; height: 2.5mm; }
            /* Bottom Left Ticks */
            .crop-bl-h { bottom: 3mm; left: 0; width: 2.5mm; height: 0.5px; }
            .crop-bl-v { bottom: 0; left: 3mm; width: 0.5px; height: 2.5mm; }
            /* Bottom Right Ticks */
            .crop-br-h { bottom: 3mm; right: 0; width: 2.5mm; height: 0.5px; }
            .crop-br-v { bottom: 0; right: 3mm; width: 0.5px; height: 2.5mm; }

            .glow-bg-1 {
              position: absolute;
              top: -50px;
              right: -50px;
              width: 180px;
              height: 180px;
              border-radius: 50%;
              background: rgba(99, 102, 241, 0.15);
              filter: blur(25px);
              pointer-events: none;
            }
            .glow-bg-2 {
              position: absolute;
              bottom: -50px;
              left: -50px;
              width: 180px;
              height: 180px;
              border-radius: 50%;
              background: rgba(14, 165, 233, 0.15);
              filter: blur(25px);
              pointer-events: none;
            }
            .content-layer {
              z-index: 10;
              position: relative;
            }
            .front-logo {
              width: ${logoSize}px;
              height: ${logoSize}px;
              object-fit: contain;
              margin-bottom: 8px;
            }
            .company-title {
              font-size: ${companyFontSize}px;
              font-weight: 900;
              letter-spacing: -0.02em;
              color: ${frontTheme.hexTextColor};
              opacity: ${companyOpacity / 100};
              margin: 0;
              line-height: 1.15;
            }
            .company-tagline {
              font-size: ${taglineFontSize}px;
              font-weight: 700;
              color: ${frontTheme.hexSubTextColor};
              opacity: ${taglineOpacity / 100};
              margin-top: 4px;
              line-height: 1.15;
            }
            .avatar-img {
              width: ${avatarSize}px;
              height: ${avatarSize}px;
              border-radius: 50%;
              object-fit: cover;
              border: 2px solid ${backKey === 'minimal' ? '#cbd5e1' : 'rgba(255,255,255,0.2)'};
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
              flex-shrink: 0;
            }
            .person-name {
              font-size: ${nameFontSize}px;
              font-weight: 900;
              color: ${backTheme.hexTextColor};
              margin: 0;
              line-height: 1.15;
            }
            .person-role {
              font-size: ${roleFontSize}px;
              font-weight: 700;
              color: ${backTheme.hexSubTextColor};
              margin: 2px 0 0 0;
              line-height: 1.25;
              word-break: break-word;
            }
            .contact-list {
              margin-top: 8px;
              font-size: ${contactFontSize}px;
              font-weight: 500;
              color: ${backTheme.hexTextColor};
              opacity: 0.92;
              display: flex;
              flex-direction: column;
              gap: 3.5px;
            }
            .contact-item {
              display: flex;
              align-items: center;
              gap: 6px;
              line-height: 1.25;
              word-break: break-word;
            }
            .icon-svg {
              width: 13px;
              height: 13px;
              flex-shrink: 0;
              display: inline-block;
              vertical-align: middle;
            }
            .qr-badge {
              padding: 6px;
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
              border: 1px solid #e2e8f0;
              display: flex;
              flex-direction: column;
              align-items: center;
              flex-shrink: 0;
              z-index: 10;
            }
            .qr-img {
              width: ${qrCodeSize}px;
              height: ${qrCodeSize}px;
              object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          <!-- PAGE 1: FRONT SIDE (COMMERCIAL PRESS READY) -->
          <div class="press-page">
            <div class="front-bleed-bg"></div>
            <div class="crop-tick crop-tl-h"></div>
            <div class="crop-tick crop-tl-v"></div>
            <div class="crop-tick crop-tr-h"></div>
            <div class="crop-tick crop-tr-v"></div>
            <div class="crop-tick crop-bl-h"></div>
            <div class="crop-tick crop-bl-v"></div>
            <div class="crop-tick crop-br-h"></div>
            <div class="crop-tick crop-br-v"></div>

            <div class="trim-box trim-front">
              <div class="glow-bg-1"></div>
              <div class="glow-bg-2"></div>
              <div class="content-layer" style="display: flex; flex-direction: column; align-items: center;">
                <img src="${cleanLogoUrl}" class="front-logo" />
                <div>
                  <div class="company-title">${company}</div>
                  <div class="company-tagline">${tagline}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PAGE 2: BACK SIDE (COMMERCIAL PRESS READY) -->
          <div class="press-page">
            <div class="back-bleed-bg"></div>
            <div class="crop-tick crop-tl-h"></div>
            <div class="crop-tick crop-tl-v"></div>
            <div class="crop-tick crop-tr-h"></div>
            <div class="crop-tick crop-tr-v"></div>
            <div class="crop-tick crop-bl-h"></div>
            <div class="crop-tick crop-bl-v"></div>
            <div class="crop-tick crop-br-h"></div>
            <div class="crop-tick crop-br-v"></div>

            <div class="trim-box trim-back">
              <div class="glow-bg-1"></div>
              <div class="glow-bg-2"></div>
              <div class="content-layer" style="flex: 1; padding-right: 10px; overflow: hidden; min-width: 0;">
                <div style="display: flex; ${avatarLayout === 'col' ? 'flex-direction: column; align-items: flex-start; gap: 6px;' : 'align-items: center; gap: 10px;'} margin-bottom: 8px;">
                  <img src="${cleanAvatarUrl}" class="avatar-img" />
                  <div style="min-width: 0;">
                    <div class="person-name">${fullName}</div>
                    <div class="person-role">${role}</div>
                  </div>
                </div>

                <div class="contact-list">
                  <div class="contact-item">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <span>${email}</span>
                  </div>
                  <div class="contact-item">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>${phone}</span>
                  </div>
                  <div class="contact-item">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <span>${website.replace(/^https?:\/\//, '')}</span>
                  </div>
                  <div class="contact-item">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>${address}</span>
                  </div>
                </div>
              </div>

              ${activeQr ? `
                <div class="qr-badge">
                  <img src="${activeQr}" class="qr-img" />
                </div>
              ` : ''}
            </div>
          </div>

          <script>
            window.onload = function() {
              if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 800);
                  }, 400);
                });
              } else {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 800);
                }, 800);
              }
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Digital Showcase A4 Sheet PDF Download Engine
  const downloadTwoSidedPdf = () => {
    const activeQr = qrSourceMode === 'upload' && uploadedQrUrl ? uploadedQrUrl : internalQrDataUrl;
    const frontTheme = CARD_THEMES[themeSyncMode === 'different' ? frontCardTheme : cardTheme];
    const backTheme = CARD_THEMES[themeSyncMode === 'different' ? backCardTheme : cardTheme];
    const cleanLogoUrl = sanitizeImageUrl(logoUrl);
    const cleanAvatarUrl = sanitizeImageUrl(avatarUrl);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fullName} — Business Card Showcase PDF</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Fira+Code:wght@400;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;600;700;800;900&family=Outfit:wght@300;400;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Poppins:wght@300;400;600;700;800;900&family=Roboto:wght@300;400;500;700;900&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            body {
              font-family: '${cardFontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #ffffff;
              color: #0f172a;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 36px;
              padding: 40px 20px;
              margin: 0;
            }
            .card-box {
              width: ${cardWidth}px !important;
              height: ${cardHeight}px !important;
              min-width: ${cardWidth}px !important;
              min-height: ${cardHeight}px !important;
              border-radius: 24px;
              padding: ${cardPadding}px;
              font-family: '${cardFontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              box-sizing: border-box;
              display: flex;
              position: relative;
              overflow: hidden;
              page-break-inside: avoid;
              box-shadow: 0 14px 28px -5px rgba(0,0,0,0.35);
            }
            .card-front {
              background: ${frontTheme.cssGradient};
              border: ${frontTheme.cssBorder};
              color: ${frontTheme.hexTextColor};
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .card-back {
              background: ${backTheme.cssGradient};
              border: ${backTheme.cssBorder};
              color: ${backTheme.hexTextColor};
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
            }
            .glow-bg-1 {
              position: absolute;
              top: -50px;
              right: -50px;
              width: 180px;
              height: 180px;
              border-radius: 50%;
              background: rgba(99, 102, 241, 0.15);
              filter: blur(25px);
              pointer-events: none;
            }
            .glow-bg-2 {
              position: absolute;
              bottom: -50px;
              left: -50px;
              width: 180px;
              height: 180px;
              border-radius: 50%;
              background: rgba(14, 165, 233, 0.15);
              filter: blur(25px);
              pointer-events: none;
            }
            .content-layer {
              z-index: 10;
              position: relative;
            }
            .front-logo {
              width: ${logoSize}px;
              height: ${logoSize}px;
              object-fit: contain;
              margin-bottom: 8px;
            }
            .company-title {
              font-size: ${companyFontSize}px;
              font-weight: 900;
              letter-spacing: -0.02em;
              color: ${frontTheme.hexTextColor};
              opacity: ${companyOpacity / 100};
              margin: 0;
              line-height: 1.15;
            }
            .company-tagline {
              font-size: ${taglineFontSize}px;
              font-weight: 700;
              color: ${frontTheme.hexSubTextColor};
              opacity: ${taglineOpacity / 100};
              margin-top: 4px;
              line-height: 1.15;
            }
            .avatar-img {
              width: ${avatarSize}px;
              height: ${avatarSize}px;
              border-radius: 50%;
              object-fit: cover;
              border: 2px solid ${themeSyncMode === 'different' && backCardTheme === 'minimal' || themeSyncMode === 'same' && cardTheme === 'minimal' ? '#cbd5e1' : 'rgba(255,255,255,0.2)'};
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
              flex-shrink: 0;
            }
            .person-name {
              font-size: ${nameFontSize}px;
              font-weight: 900;
              color: ${backTheme.hexTextColor};
              margin: 0;
              line-height: 1.15;
            }
            .person-role {
              font-size: ${roleFontSize}px;
              font-weight: 700;
              color: ${backTheme.hexSubTextColor};
              margin: 2px 0 0 0;
              line-height: 1.25;
              word-break: break-word;
            }
            .contact-list {
              margin-top: 8px;
              font-size: ${contactFontSize}px;
              font-weight: 500;
              color: ${backTheme.hexTextColor};
              opacity: 0.92;
              display: flex;
              flex-direction: column;
              gap: 3.5px;
            }
            .contact-item {
              display: flex;
              align-items: center;
              gap: 6px;
              line-height: 1.25;
              word-break: break-word;
            }
            .icon-svg {
              width: 13px;
              height: 13px;
              flex-shrink: 0;
              display: inline-block;
              vertical-align: middle;
            }
            .qr-badge {
              padding: 6px;
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
              border: 1px solid #e2e8f0;
              display: flex;
              flex-direction: column;
              align-items: center;
              flex-shrink: 0;
              z-index: 10;
            }
            .qr-img {
              width: ${qrCodeSize}px;
              height: ${qrCodeSize}px;
              object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          <!-- FRONT SIDE CARD -->
          <div class="card-box card-front">
            <div class="glow-bg-1"></div>
            <div class="glow-bg-2"></div>
            <div class="content-layer" style="display: flex; flex-direction: column; align-items: center;">
              <img src="${cleanLogoUrl}" class="front-logo" />
              <div>
                <div class="company-title">${company}</div>
                <div class="company-tagline">${tagline}</div>
              </div>
            </div>
          </div>

          <!-- BACK SIDE CARD -->
          <div class="card-box card-back">
            <div class="glow-bg-1"></div>
            <div class="glow-bg-2"></div>
            <div class="content-layer" style="flex: 1; padding-right: 10px; overflow: hidden; min-width: 0;">
              <div style="display: flex; ${avatarLayout === 'col' ? 'flex-direction: column; align-items: flex-start; gap: 6px;' : 'align-items: center; gap: 10px;'} margin-bottom: 8px;">
                <img src="${cleanAvatarUrl}" class="avatar-img" />
                <div style="min-width: 0;">
                  <div class="person-name">${fullName}</div>
                  <div class="person-role">${role}</div>
                </div>
              </div>

              <div class="contact-list">
                <div class="contact-item">
                  <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <span>${email}</span>
                </div>
                <div class="contact-item">
                  <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>${phone}</span>
                </div>
                <div class="contact-item">
                  <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                  <span>${website.replace(/^https?:\/\//, '')}</span>
                </div>
                <div class="contact-item">
                  <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>${address}</span>
                </div>
              </div>
            </div>

            ${activeQr ? `
              <div class="qr-badge">
                <img src="${activeQr}" class="qr-img" />
              </div>
            ` : ''}
          </div>

          <script>
            window.onload = function() {
              if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 800);
                  }, 400);
                });
              } else {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 800);
                }, 800);
              }
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const effectiveFrontKey = themeSyncMode === 'different' ? frontCardTheme : cardTheme;
  const effectiveBackKey = themeSyncMode === 'different' ? backCardTheme : cardTheme;

  const currentFrontTheme = CARD_THEMES[effectiveFrontKey];
  const currentBackTheme = CARD_THEMES[effectiveBackKey];
  const currentTheme = currentBackTheme;
  const activeInternalQr = qrSourceMode === 'upload' && uploadedQrUrl ? uploadedQrUrl : internalQrDataUrl;

  return (
    <div className="space-y-6">
      {/* 🎨 DYNAMIC GOOGLE FONTS ENGINE (Instant Font Switching on Click/Select) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Fira+Code:wght@400;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;600;700;800;900&family=Outfit:wght@300;400;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Poppins:wght@300;400;600;700;800;900&family=Roboto:wght@300;400;500;700;900&family=Space+Grotesk:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Top Workspace Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-2 text-sm font-bold text-white">
          <CreditCard className="h-5 w-5 text-indigo-400" />
          <span>Premium Business Card Studio (Two-Sided Design & Dual QR System)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPasteHtmlPanel(!showPasteHtmlPanel)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${showPasteHtmlPanel || renderCustomHtmlDirectly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md scale-105'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
          >
            <FileCode className="h-3.5 w-3.5 text-amber-400" />
            <span>{renderCustomHtmlDirectly ? '✓ Pasted HTML Active' : 'Paste HTML Code'}</span>
          </button>

          <button
            onClick={resetAllCard}
            title="Reset all card details back to defaults"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-rose-400 font-semibold text-xs border border-slate-700/60 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={copyDetailsText}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-slate-700 transition-all"
          >
            {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedText ? 'Copied Details!' : 'Copy Text Details'}</span>
          </button>

          <button
            onClick={copyCardHtml}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs border border-slate-700 transition-all"
          >
            {copiedHtml ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <FileCode className="h-3.5 w-3.5" />}
            <span>{copiedHtml ? 'Copied Card HTML!' : 'Copy Card HTML'}</span>
          </button>

          <button
            onClick={downloadPressReadyPdf}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-400 hover:from-emerald-400 hover:to-sky-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
          >
            <Printer className="h-4 w-4" />
            <span>1-Click Press PDF (300 DPI + 3mm Bleed)</span>
          </button>

          <button
            onClick={downloadTwoSidedPdf}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs border border-slate-700 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            <span>A4 Showcase Sheet PDF</span>
          </button>
        </div>
      </div>

      {/* PASTE HTML CODE IMPORT STUDIO PANEL (Expandable) */}
      {showPasteHtmlPanel && (
        <div className="p-5 bg-amber-950/20 border border-amber-500/30 rounded-3xl space-y-4 backdrop-blur-xl shadow-2xl animate-in fade-in duration-200">
          <div className="flex justify-between items-center text-xs font-bold text-amber-300 uppercase tracking-widest">
            <span className="flex items-center space-x-2">
              <FileCode className="h-4 w-4 text-amber-400" />
              <span>Paste HTML Code to Auto-Fill & Render Design-Ready Business Card</span>
            </span>
            <button
              onClick={() => setShowPasteHtmlPanel(false)}
              className="text-gray-400 hover:text-white text-xs font-mono font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-2">
            <textarea
              rows={5}
              value={pastedHtmlCode}
              onChange={(e) => {
                setPastedHtmlCode(e.target.value);
              }}
              placeholder="Paste your business card HTML code here..."
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
            />
            {htmlParseStatus && (
              <div className="text-xs font-bold text-emerald-400 font-mono flex items-center space-x-1">
                <Check className="h-3.5 w-3.5" />
                <span>{htmlParseStatus}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleApplyPastedHtml()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md hover:scale-105"
              >
                1-Click Auto-Fill Fields & Apply
              </button>

              <button
                onClick={() => setRenderCustomHtmlDirectly(!renderCustomHtmlDirectly)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${renderCustomHtmlDirectly
                  ? 'bg-amber-500/30 text-amber-200 border-amber-400 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-gray-300 hover:text-white'
                  }`}
              >
                {renderCustomHtmlDirectly ? '✓ Rendering Pasted HTML Direct' : 'Render Pasted HTML Direct'}
              </button>

              <button
                onClick={() => {
                  const sampleHtml = getFullCardHtml();
                  setPastedHtmlCode(sampleHtml);
                  handleApplyPastedHtml(sampleHtml);
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 text-xs font-bold border border-slate-800 transition-all"
              >
                Load Sample Toolip Card HTML
              </button>
            </div>

            {pastedHtmlCode && (
              <button
                onClick={() => {
                  setPastedHtmlCode('');
                  setRenderCustomHtmlDirectly(false);
                  setHtmlParseStatus('');
                }}
                className="text-xs text-rose-400 hover:underline font-semibold"
              >
                Clear Pasted HTML
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Studio Grid (Controls & Previews) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Card Inputs & Theme Pickers (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">

          {/* Card Theme Picker (Same Both Sides vs Different Both Sides) */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/80">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                <Palette className="h-4 w-4 text-indigo-400" />
                <span>Select Premium Card Theme</span>
              </div>

              {/* Mode Switcher: Same Both Sides vs Different Both Sides */}
              <div className="inline-flex p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl text-[11px] font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setThemeSyncMode('same')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    themeSyncMode === 'same'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Same Both Sides
                </button>
                <button
                  type="button"
                  onClick={() => setThemeSyncMode('different')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    themeSyncMode === 'different'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Different Both Sides
                </button>
              </div>
            </div>

            {themeSyncMode === 'same' ? (
              /* Unified Theme Selector */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.keys(CARD_THEMES) as Array<keyof typeof CARD_THEMES>).map((tKey) => (
                  <button
                    key={tKey}
                    onClick={() => handleSelectUnifiedTheme(tKey)}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center space-x-2 ${
                      cardTheme === tKey
                        ? 'bg-slate-800 border-indigo-400 text-white shadow-lg scale-105'
                        : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-gray-600 shrink-0"
                      style={{ backgroundColor: CARD_THEMES[tKey].accent }}
                    />
                    <span className="truncate">{CARD_THEMES[tKey].name}</span>
                  </button>
                ))}
              </div>
            ) : (
              /* Independent Theme Selectors Per Side */
              <div className="space-y-4 pt-1">
                {/* Front Side Theme Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                    <span>Front Side Theme (Logo Card)</span>
                    <span className="text-[10px] font-mono text-slate-400">{CARD_THEMES[frontCardTheme].name}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(CARD_THEMES) as Array<keyof typeof CARD_THEMES>).map((tKey) => (
                      <button
                        key={`front-${tKey}`}
                        onClick={() => setFrontCardTheme(tKey)}
                        className={`p-2 rounded-xl border text-[11px] font-bold transition-all flex items-center space-x-2 ${
                          frontCardTheme === tKey
                            ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow-md scale-105'
                            : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-gray-600 shrink-0"
                          style={{ backgroundColor: CARD_THEMES[tKey].accent }}
                        />
                        <span className="truncate">{CARD_THEMES[tKey].name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Back Side Theme Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    <span>Back Side Theme (Info & QR Card)</span>
                    <span className="text-[10px] font-mono text-slate-400">{CARD_THEMES[backCardTheme].name}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(CARD_THEMES) as Array<keyof typeof CARD_THEMES>).map((tKey) => (
                      <button
                        key={`back-${tKey}`}
                        onClick={() => setBackCardTheme(tKey)}
                        className={`p-2 rounded-xl border text-[11px] font-bold transition-all flex items-center space-x-2 ${
                          backCardTheme === tKey
                            ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-md scale-105'
                            : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-gray-600 shrink-0"
                          style={{ backgroundColor: CARD_THEMES[tKey].accent }}
                        />
                        <span className="truncate">{CARD_THEMES[tKey].name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Slideable Typography & Font Sizing Controls */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-center text-xs font-bold text-amber-400 uppercase tracking-widest">
              <span className="flex items-center space-x-1.5">
                <Type className="h-4 w-4 text-amber-400" />
                <span>Typography & Slideable Sizing Controls</span>
              </span>
            </div>

            {/* Font Family Selection (Interactive Buttons + Dropdown Select) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                <span>Select Card Font Family:</span>
                <span className="text-amber-400 font-mono text-[11px]">{cardFontFamily}</span>
              </div>

              {/* Quick Pill Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  'Inter',
                  'Outfit',
                  'Poppins',
                  'Roboto',
                  'Montserrat',
                  'Playfair Display',
                  'Cinzel',
                  'Space Grotesk',
                  'Fira Code',
                  'Segoe UI',
                ].map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => setCardFontFamily(font)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all truncate ${cardFontFamily === font
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                      }`}
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>

              {/* Direct Select Dropdown */}
              <select
                value={cardFontFamily}
                onChange={(e) => setCardFontFamily(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="Inter">Inter (Modern Clean Sans)</option>
                <option value="Outfit">Outfit (Tech Bold Display)</option>
                <option value="Poppins">Poppins (Geometric Friendly)</option>
                <option value="Roboto">Roboto (Standard Corporate)</option>
                <option value="Montserrat">Montserrat (Luxury Premium)</option>
                <option value="Playfair Display">Playfair Display (Classic Elegant Serif)</option>
                <option value="Cinzel">Cinzel (High Luxury Roman Serif)</option>
                <option value="Space Grotesk">Space Grotesk (Futuristic Cyber)</option>
                <option value="Fira Code">Fira Code (Developer Monospace)</option>
                <option value="Segoe UI">Segoe UI (System Native)</option>
              </select>
            </div>

            {/* Slideable Font Size & Padding Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Card Width (px):</span>
                  <span className="text-amber-400 font-mono text-[11px]">{cardWidth}px</span>
                </div>
                <input
                  type="range"
                  min={350}
                  max={500}
                  value={cardWidth}
                  onChange={(e) => setCardWidth(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Card Height (px):</span>
                  <span className="text-amber-400 font-mono text-[11px]">{cardHeight}px</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={300}
                  value={cardHeight}
                  onChange={(e) => setCardHeight(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Card Inner Padding:</span>
                  <span className="text-amber-400 font-mono text-[11px]">{cardPadding}px</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={36}
                  value={cardPadding}
                  onChange={(e) => setCardPadding(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Logo Image Size:</span>
                  <span className="text-amber-400 font-mono text-[11px]">{logoSize}px</span>
                </div>
                <input
                  type="range"
                  min={48}
                  max={96}
                  value={logoSize}
                  onChange={(e) => setLogoSize(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Photo / Avatar Size:</span>
                  <span className="text-amber-400 font-mono text-[11px]">{avatarSize}px</span>
                </div>
                <input
                  type="range"
                  min={32}
                  max={64}
                  value={avatarSize}
                  onChange={(e) => setAvatarSize(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Internal QR Size:</span>
                  <span className="text-amber-400 font-mono text-[11px]">{qrCodeSize}px</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={80}
                  value={qrCodeSize}
                  onChange={(e) => setQrCodeSize(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Company Title Size:</span>
                  <span className="text-amber-400 font-mono text-[11px]">{companyFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={14}
                  max={32}
                  value={companyFontSize}
                  onChange={(e) => setCompanyFontSize(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Tagline Font Size:</span>
                  <span className="text-amber-400 font-mono text-[11px]">{taglineFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={9}
                  max={18}
                  value={taglineFontSize}
                  onChange={(e) => setTaglineFontSize(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Person Name Size:</span>
                  <span className="text-amber-400 font-mono text-[11px]">{nameFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={24}
                  value={nameFontSize}
                  onChange={(e) => setNameFontSize(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Job Role Size:</span>
                  <span className="text-amber-400 font-mono text-[11px]">{roleFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={9}
                  max={18}
                  value={roleFontSize}
                  onChange={(e) => setRoleFontSize(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Contact Info Size:</span>
                  <span className="text-amber-400 font-mono text-[11px]">{contactFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={9}
                  max={18}
                  value={contactFontSize}
                  onChange={(e) => setContactFontSize(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Avatar & Header Alignment Toggle */}
              <div className="space-y-1 sm:col-span-2 pt-1">
                <label className="text-xs font-bold text-gray-200">Photo & Name Structure:</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setAvatarLayout('col')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${avatarLayout === 'col'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                      }`}
                  >
                    Column (Photo Top)
                  </button>
                  <button
                    onClick={() => setAvatarLayout('row')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${avatarLayout === 'row'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                      }`}
                  >
                    Row (Photo Side)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Front Card Branding Form */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Building2 className="h-4 w-4" />
                <span>Front Side — Logo & Branding</span>
              </span>

              <label className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold cursor-pointer border border-slate-700 transition-all">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Logo Image</span>
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-200">Logo Image URL (HTTP/HTTPS):</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(sanitizeImageUrl(e.target.value))}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Company / Brand Name:</span>
                  <span className="text-sky-400 font-mono text-[11px]">{companyOpacity}% Visibility</span>
                </div>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={companyOpacity}
                  onChange={(e) => setCompanyOpacity(Number(e.target.value))}
                  className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-200">
                  <span>Company Tagline / Slogan:</span>
                  <span className="text-sky-400 font-mono text-[11px]">{taglineOpacity}% Visibility</span>
                </div>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={taglineOpacity}
                  onChange={(e) => setTaglineOpacity(Number(e.target.value))}
                  className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Back Card Info & Contact Form */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5">
                <User className="h-4 w-4" />
                <span>Back Side — Contact Details & Headshot</span>
              </span>

              <label className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold cursor-pointer border border-slate-700 transition-all">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Headshot</span>
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-200">Headshot / Photo URL:</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(sanitizeImageUrl(e.target.value))}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-sky-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-200">Full Name:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-200">Job Title / Position:</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-200">Email Address:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-200">Phone Number:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-200">Business Website URL (Encodes Internal QR):</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-sky-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-200">Physical Address / Office:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Internal Card QR Source & Exact Dimension Settings */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-center text-xs font-bold text-amber-400 uppercase tracking-widest">
              <span className="flex items-center space-x-1.5">
                <QrIcon className="h-4 w-4 text-amber-400" />
                <span>Internal Details QR Code Settings</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                Exact Custom Specs
              </span>
            </div>

            {/* QR Mode Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQrSourceMode('auto')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${qrSourceMode === 'auto'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                  }`}
              >
                Auto-Generate URL QR Code
              </button>

              <button
                onClick={() => {
                  setQrSourceMode('upload');
                  qrFileInputRef.current?.click();
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${qrSourceMode === 'upload'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                  }`}
              >
                {uploadedQrUrl ? '✓ Custom QR Uploaded' : 'Upload Custom QR Image'}
              </button>
              <input
                ref={qrFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="hidden"
              />
            </div>

            {/* Exact Dimension & Color Controls Specified by User */}
            {qrSourceMode === 'auto' && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 1. Outer Padding: 30px */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span className="font-semibold">Outer Padding:</span>
                      <span className="font-mono text-amber-400 font-bold">{qrPadding}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={qrPadding}
                      onChange={(e) => setQrPadding(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-1">
                      {[0, 10, 18, 30].map((p) => (
                        <button
                          key={p}
                          onClick={() => setQrPadding(p)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${qrPadding === p ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                            }`}
                        >
                          {p === 0 ? 'None (0px)' : `${p}px`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Outer Corner Radius: 34px */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span className="font-semibold">Corner Radius:</span>
                      <span className="font-mono text-amber-400 font-bold">{qrBorderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={48}
                      value={qrBorderRadius}
                      onChange={(e) => setQrBorderRadius(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-1">
                      {[
                        { value: 0, label: '0px Sharp' },
                        { value: 16, label: '16px Soft' },
                        { value: 24, label: '24px Round' },
                        { value: 40, label: '40px Curved' },
                      ].map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setQrBorderRadius(r.value)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${qrBorderRadius === r.value ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                            }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Position Eye Roundness: 10px */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span className="font-semibold">Position Eye Roundness:</span>
                      <span className="font-mono text-amber-400 font-bold">{eyeRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={16}
                      value={eyeRadius}
                      onChange={(e) => setEyeRadius(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-400">Eye corner curve (default: 10px)</div>
                  </div>
                </div>

                {/* Modules Color & Background Color Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-gray-300 font-semibold">QR Modules Color:</span>
                    <div className="flex items-center space-x-2">
                      {isMounted ? (
                        <input
                          type="color"
                          value={qrFgColor}
                          onChange={(e) => setQrFgColor(e.target.value)}
                          className="h-6 w-8 rounded bg-transparent border-0 cursor-pointer"
                        />
                      ) : (
                        <div className="h-6 w-8 rounded border border-slate-700" style={{ backgroundColor: qrFgColor }} />
                      )}
                      <span className="text-xs font-mono text-amber-300 font-bold">{qrFgColor}</span>
                      <button
                        onClick={() => setQrFgColor('#032326')}
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 hover:bg-slate-700 text-gray-300"
                      >
                        Reset #032326
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-gray-300 font-semibold">Background Color:</span>
                    <div className="flex items-center space-x-2">
                      {isMounted ? (
                        <input
                          type="color"
                          value={qrBgColor}
                          onChange={(e) => setQrBgColor(e.target.value)}
                          className="h-6 w-8 rounded bg-transparent border-0 cursor-pointer"
                        />
                      ) : (
                        <div className="h-6 w-8 rounded border border-slate-700" style={{ backgroundColor: qrBgColor }} />
                      )}
                      <span className="text-xs font-mono text-amber-300 font-bold">{qrBgColor}</span>
                      <button
                        onClick={() => setQrBgColor('#ffffff')}
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 hover:bg-slate-700 text-gray-300"
                      >
                        Reset #ffffff
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Two-Sided Card Preview & Dual QR System (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Card Side View Switcher */}
          <div className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs font-bold text-gray-300 ml-2 uppercase tracking-wider">Card Preview Mode:</span>
            <div className="flex gap-1">
              {[
                { id: 'both', label: 'Both Sides' },
                { id: 'front', label: 'Front Only' },
                { id: 'back', label: 'Back Only' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSide(s.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${activeSide === s.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* DIRECT PASTED HTML CUSTOM DESIGN PREVIEW */}
          {renderCustomHtmlDirectly && pastedHtmlCode.trim() && (
            <div className="space-y-2 p-4 bg-amber-950/20 border border-amber-500/40 rounded-3xl backdrop-blur-xl shadow-2xl">
              <div className="flex justify-between items-center text-xs font-bold text-amber-300 uppercase tracking-widest px-1">
                <span className="flex items-center space-x-1.5">
                  <FileCode className="h-4 w-4 text-amber-400" />
                  <span>Direct Pasted HTML Design Ready Preview</span>
                </span>
                <button
                  onClick={() => setRenderCustomHtmlDirectly(false)}
                  className="text-[10px] font-mono text-gray-400 hover:text-white underline"
                >
                  Switch to Dynamic Cards
                </button>
              </div>

              <div
                className="w-full min-h-[220px] rounded-2xl p-4 bg-slate-950 border border-slate-800 shadow-inner overflow-auto text-white"
                dangerouslySetInnerHTML={{ __html: pastedHtmlCode }}
              />
            </div>
          )}

          {/* FRONT SIDE CARD PREVIEW */}
          {(activeSide === 'both' || activeSide === 'front') && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-sky-400 uppercase tracking-widest px-1">
                <span>Front Side — Logo Card</span>
                <span className="text-[10px] font-mono text-gray-500">{cardWidth}px × {cardHeight}px</span>
              </div>

              <div
                className={`mx-auto rounded-3xl border shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300 ${currentFrontTheme.bg} ${currentFrontTheme.cardBorder}`}
                style={{ width: `${cardWidth}px`, height: `${cardHeight}px`, maxWidth: '100%', padding: `${cardPadding}px`, fontFamily: `'${cardFontFamily}', sans-serif` }}
              >
                {/* Decorative geometry background glow */}
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-sky-500/10 blur-2xl pointer-events-none" />

                <div className="z-10 flex flex-col items-center justify-center space-y-3">
                  <img src={sanitizeImageUrl(logoUrl)} crossOrigin="anonymous" alt="Logo" className="object-contain mb-1" style={{ width: `${logoSize}px`, height: `${logoSize}px` }} />
                  <div className="space-y-1">
                    <h2 className={`font-black tracking-tight ${currentFrontTheme.textColor}`} style={{ fontSize: `${companyFontSize}px`, opacity: companyOpacity / 100, fontFamily: 'inherit' }}>{company}</h2>
                    <p className={`font-bold ${currentFrontTheme.subTextColor}`} style={{ fontSize: `${taglineFontSize}px`, opacity: taglineOpacity / 100, fontFamily: 'inherit' }}>{tagline}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BACK SIDE CARD PREVIEW */}
          {(activeSide === 'both' || activeSide === 'back') && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-400 uppercase tracking-widest px-1">
                <span>Back Side — Info & Embedded Internal QR Card</span>
                <span className="text-[10px] font-mono text-gray-500">{cardWidth}px × {cardHeight}px</span>
              </div>

              <div
                className={`mx-auto rounded-3xl border shadow-2xl flex items-center justify-between relative overflow-hidden transition-all duration-300 ${currentBackTheme.bg} ${currentBackTheme.cardBorder} ${currentBackTheme.textColor}`}
                style={{ width: `${cardWidth}px`, height: `${cardHeight}px`, maxWidth: '100%', padding: `${cardPadding}px`, fontFamily: `'${cardFontFamily}', sans-serif` }}
              >
                {/* Left Side: Photo + Contact Info */}
                <div className="flex-1 pr-3 space-y-2 z-10 min-w-0">
                  <div className={`flex ${avatarLayout === 'col' ? 'flex-col gap-2 items-start' : 'items-center space-x-3'} mb-2`}>
                    <img src={sanitizeImageUrl(avatarUrl)} crossOrigin="anonymous" alt={fullName} className={`rounded-full object-cover border-2 ${effectiveBackKey === 'minimal' ? 'border-slate-300' : 'border-white/20'} shadow-md shrink-0`} style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }} />
                    <div className="min-w-0">
                      <h3 className={`font-black tracking-tight leading-tight ${currentBackTheme.textColor}`} style={{ fontSize: `${nameFontSize}px`, fontFamily: 'inherit' }}>{fullName}</h3>
                      <p className={`font-bold leading-tight ${currentBackTheme.subTextColor}`} style={{ fontSize: `${roleFontSize}px`, fontFamily: 'inherit' }}>{role}</p>
                    </div>
                  </div>

                  <div className={`space-y-1 font-medium opacity-90 leading-tight ${currentBackTheme.textColor}`} style={{ fontSize: `${contactFontSize}px` }}>
                    <div className="flex items-center space-x-1.5">
                      <Mail className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                      <span className="break-all sm:break-words">{email}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="break-words">{phone}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Globe className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span className="break-all sm:break-words">{website.replace(/^https?:\/\//, '')}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="break-words">{address}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Embedded Internal Details QR Code */}
                {activeInternalQr && (
                  <div className="z-10 shrink-0 p-1.5 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center">
                    <img src={activeInternalQr} alt="Internal QR Code" className="object-contain" style={{ width: `${qrCodeSize}px`, height: `${qrCodeSize}px` }} />
                    {/* <span className="text-[8px] font-mono font-bold text-gray-500 mt-1">SCAN</span> */}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🎯 DUAL QR SYSTEM — STANDALONE CARD FILE DOWNLOAD QR PANEL */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-widest">
              <span className="flex items-center space-x-1.5">
                <QrIcon className="h-4 w-4 text-amber-400" />
                <span>Dual QR System — Business Card Sharing QR</span>
              </span>
              <span className="text-[10px] font-mono text-gray-500">Standalone Share Payload</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              {sharePdfQrDataUrl && (
                <div className="flex flex-col items-center shrink-0">
                  <img
                    src={sharePdfQrDataUrl}
                    alt="Business Card Share QR"
                    className="w-48 h-auto object-contain rounded-2xl drop-shadow-2xl"
                  />
                </div>
              )}

              <div className="space-y-2 flex-1">
                <div className="text-xs font-bold text-white">Direct Business Card File Download QR</div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Encodes direct contact vCard payload using exact custom 30px padding, 34px corner radius, and 10px eye roundness.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Text Below Business QR Code:</label>
                  <input
                    type="text"
                    value={businessQrNoticeText}
                    onChange={(e) => setBusinessQrNoticeText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {sharePdfQrDataUrl && (
                  <a
                    href={sharePdfQrDataUrl}
                    download={`business_card_qr_${Date.now()}.png`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all hover:scale-105"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Share QR PNG</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

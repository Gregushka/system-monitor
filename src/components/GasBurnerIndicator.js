import React, { useId } from 'react';
import './css/GasBurnerIndicator.css';

/**
 * GasBurnerIndicator  –  continuous 0–100 % flame indicator
 * ══════════════════════════════════════════════════════════
 *
 * Registry config fields (via GasBurnerIndicatorCreate):
 *   ind_id      {string}            Sensor id — must match /read_data "name"
 *   bg_id       {string}            Background id
 *   label       {string}            Display label
 *   top         {number}            0–2000 vertical position
 *   left        {number}            0–2000 horizontal position
 *   burnerType  {"large"|"small"}   Body style (default "large")
 *                                     "large" — industrial register burner
 *                                     "small" — compact tube burner
 *   scale       {number}            Uniform scale factor (default 1.0)
 *   direction   {number}            Flame direction in degrees, 0–360
 *                                     0 / 360 = pointing straight up
 *                                     90      = pointing right  (default)
 *                                     180     = pointing down
 *                                     270     = pointing left
 *
 * Value from API:
 *   number 0–100   →  flame intensity percentage
 *                     0   = off (no flame)
 *                     1–24 = low  (blue flame)
 *                     25–59 = mid  (orange flame)
 *                     60–100 = high (yellow/white flame)
 *   null / undefined  →  OFFLINE state (grey body, no flame, "OFFLINE" label)
 */

// ─── Colour helpers ───────────────────────────────────────────────────────────
function lerpColor(a, b, t) {
  const pa  = [parseInt(a.slice(1,3),16), parseInt(a.slice(3,5),16), parseInt(a.slice(5,7),16)];
  const pb  = [parseInt(b.slice(1,3),16), parseInt(b.slice(3,5),16), parseInt(b.slice(5,7),16)];
  const r   = Math.round(pa[0] + (pb[0]-pa[0])*t);
  const g   = Math.round(pa[1] + (pb[1]-pa[1])*t);
  const bl  = Math.round(pa[2] + (pb[2]-pa[2])*t);
  return `rgb(${r},${g},${bl})`;
}

function powerColor(power) {
  if (power === 0)  return '#445566';
  if (power < 25)   return '#42a5f5';
  if (power < 60)   return '#ff9100';
  return '#ffab00';
}

// ─── Flame shape ──────────────────────────────────────────────────────────────
function Flame({ x, y, power, maxLen, maxThick, uid }) {
  if (power <= 0) return null;

  const t      = power / 100;
  const lenT   = Math.pow(t, 0.7);
  const thickT = Math.pow(t, 0.6);
  const len    = maxLen   * lenT;
  const thick  = maxThick * thickT;
  const halfT  = thick / 2;

  let coreColor, midColor, outerColor, glowColor;
  if (t < 0.25) {
    coreColor  = lerpColor('#1565c0', '#42a5f5', t * 4);
    midColor   = lerpColor('#0d47a1', '#1976d2', t * 4);
    outerColor = lerpColor('#0a1929', '#1565c0', t * 4);
    glowColor  = '#1565c0';
  } else if (t < 0.6) {
    const s    = (t - 0.25) / 0.35;
    coreColor  = lerpColor('#42a5f5', '#ff9100', s);
    midColor   = lerpColor('#1976d2', '#ff6d00', s);
    outerColor = lerpColor('#1565c0', '#e65100', s);
    glowColor  = lerpColor('#1565c0', '#ff6d00', s);
  } else {
    const s    = (t - 0.6) / 0.4;
    coreColor  = lerpColor('#ff9100', '#fff9c4', s);
    midColor   = lerpColor('#ff6d00', '#ffab00', s);
    outerColor = lerpColor('#e65100', '#ff6d00', s);
    glowColor  = lerpColor('#ff6d00', '#ffab00', s);
  }

  const gid      = `fg-${uid}`;
  const fid      = `ff-${uid}`;
  const tipX     = x + len;
  const bulgeX   = x + len * 0.15;
  const midX     = x + len * 0.45;

  const path = `
    M ${x},${y}
    C ${bulgeX},${y - halfT * 1.05}  ${midX},${y - halfT * 0.7}  ${tipX},${y}
    C ${midX},${y + halfT * 0.7}  ${bulgeX},${y + halfT * 1.05}  ${x},${y}
    Z`;

  const coreLen    = len * 0.55;
  const coreTipX   = x + coreLen;
  const coreHalfT  = halfT * 0.35;
  const coreBulgeX = x + coreLen * 0.2;
  const coreMidX   = x + coreLen * 0.5;

  const corePath = `
    M ${x},${y}
    C ${coreBulgeX},${y - coreHalfT}  ${coreMidX},${y - coreHalfT * 0.6}  ${coreTipX},${y}
    C ${coreMidX},${y + coreHalfT * 0.6}  ${coreBulgeX},${y + coreHalfT}  ${x},${y}
    Z`;

  const glowR = thick * 0.6 + len * 0.1;

  return (
    <>
      <defs>
        <radialGradient id={gid} cx="0.15" cy="0.5" r="0.85">
          <stop offset="0%"   stopColor={coreColor}  stopOpacity="0.95" />
          <stop offset="40%"  stopColor={midColor}   stopOpacity="0.8"  />
          <stop offset="100%" stopColor={outerColor} stopOpacity="0.15" />
        </radialGradient>
        <filter id={fid} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation={Math.max(1.5, thick * 0.08)} />
        </filter>
      </defs>
      <ellipse cx={x + len * 0.25} cy={y} rx={glowR} ry={glowR * 0.6}
        fill={glowColor} opacity={0.12 + t * 0.12} filter={`url(#${fid})`} />
      <path d={path} fill={`url(#${gid})`} opacity={0.85 + t * 0.15}
        style={{ filter: `drop-shadow(0 0 ${3 + t * 8}px ${glowColor})` }} />
      {t > 0.1 && (
        <path d={corePath} fill={coreColor} opacity={0.6 + t * 0.35}
          style={{ filter: `blur(${1 + t}px)` }} />
      )}
    </>
  );
}

// ─── Large industrial register burner ────────────────────────────────────────
function LargeBurner({ power, label, offline, uid, direction }) {
  const W = 360, H = 120;
  const bodyW = 110, bodyH = 88;
  const bodyY = (H - bodyH) / 2;
  const nozzleW = 18, nozzleH = 50;
  const nozzleX = bodyW;
  const nozzleY = (H - nozzleH) / 2;
  const flameStartX = nozzleX + nozzleW;

  // Nozzle tip is the rotation pivot (the point attached to the pipe)
  const pivotX = bodyW + nozzleW;   // 128
  const pivotY = H / 2;             // 60
  // direction=90 → pointing right (natural SVG orientation); 0/360 → up
  const rotateDeg = direction - 90;

  const bodyFill   = offline ? `url(#lb-off-${uid})` : `url(#lb-${uid})`;
  const strokeCol  = offline ? '#2a3040' : '#3a4249';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`lb-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#b0b8c0" />
          <stop offset="30%"  stopColor="#8a9299" />
          <stop offset="70%"  stopColor="#6b737a" />
          <stop offset="100%" stopColor="#4a5259" />
        </linearGradient>
        <linearGradient id={`lb-off-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3a4048" />
          <stop offset="100%" stopColor="#22282e" />
        </linearGradient>
      </defs>

      <g transform={`rotate(${rotateDeg}, ${pivotX}, ${pivotY})`}>
        {/* body */}
        <rect x={0} y={bodyY} width={bodyW} height={bodyH} rx={3}
          fill={bodyFill} stroke={strokeCol} strokeWidth={1.5} />

        {/* internal tubes */}
        {[0.25, 0.42, 0.58, 0.75].map((f, i) => (
          <g key={i}>
            <line x1={10} y1={bodyY + bodyH * f} x2={bodyW - 4} y2={bodyY + bodyH * f}
              stroke={offline ? '#2a3040' : '#555e66'} strokeWidth={5} strokeLinecap="round" />
            <line x1={10} y1={bodyY + bodyH * f} x2={bodyW - 4} y2={bodyY + bodyH * f}
              stroke={offline ? '#303840' : '#6b757e'} strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}

        {/* vertical divider */}
        <line x1={bodyW * 0.55} y1={bodyY + 4} x2={bodyW * 0.55} y2={bodyY + bodyH - 4}
          stroke={strokeCol} strokeWidth={1} />

        {/* nozzle cone */}
        <polygon
          points={`${nozzleX},${bodyY+6} ${nozzleX+nozzleW},${nozzleY} ${nozzleX+nozzleW},${nozzleY+nozzleH} ${nozzleX},${bodyY+bodyH-6}`}
          fill={offline ? '#2a3040' : '#7a8490'} stroke={strokeCol} strokeWidth={1.2} />

        {/* nozzle ring */}
        <rect x={nozzleX+nozzleW-3} y={nozzleY-2} width={5} height={nozzleH+4} rx={1}
          fill={offline ? '#22282e' : '#5a6470'} stroke={strokeCol} strokeWidth={0.8} />

        {/* flame or offline mark */}
        {offline
          ? <text x={flameStartX + 30} y={H / 2 + 5} fontSize={13} fill="#445566"
              fontFamily="'Courier New', monospace" letterSpacing="0.15em">OFFLINE</text>
          : <Flame x={flameStartX} y={H / 2} power={power} maxLen={210} maxThick={78} uid={`lg-${uid}`} />
        }
      </g>
    </svg>
  );
}

// ─── Small compact tube burner ────────────────────────────────────────────────
function SmallBurner({ power, label, offline, uid, direction }) {
  const W = 300, H = 56;
  const bodyW = 74, bodyH = 32;
  const bodyY = (H - bodyH) / 2;
  const nozzleW = 14, nozzleH = 22;
  const nozzleX = bodyW;
  const nozzleY = (H - nozzleH) / 2;
  const flameStartX = nozzleX + nozzleW;

  // Nozzle tip pivot: x = bodyW + nozzleW, y = H/2
  const pivotX = bodyW + nozzleW;   // 88
  const pivotY = H / 2;             // 28
  const rotateDeg = direction - 90;

  const strokeCol = offline ? '#1e2830' : '#2a3238';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sb-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#8a9299" />
          <stop offset="50%"  stopColor="#5a6268" />
          <stop offset="100%" stopColor="#3a4248" />
        </linearGradient>
        <linearGradient id={`sb-off-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#303840" />
          <stop offset="100%" stopColor="#1e2430" />
        </linearGradient>
      </defs>

      <g transform={`rotate(${rotateDeg}, ${pivotX}, ${pivotY})`}>
        {/* cable stub */}
        <rect x={0} y={H/2-5} width={16} height={10} rx={2}
          fill={offline ? '#1e2430' : '#3a4248'} stroke={strokeCol} strokeWidth={0.8} />

        {/* body cylinder */}
        <rect x={14} y={bodyY} width={bodyW-14} height={bodyH} rx={4}
          fill={offline ? `url(#sb-off-${uid})` : `url(#sb-${uid})`}
          stroke={strokeCol} strokeWidth={1.2} />

        {/* body highlight */}
        <line x1={18} y1={bodyY+5} x2={bodyW-2} y2={bodyY+5}
          stroke={offline ? '#252e38' : '#9aa2a9'} strokeWidth={0.7} opacity={0.5} />

        {/* nozzle taper */}
        <polygon
          points={`${nozzleX},${bodyY+3} ${nozzleX+nozzleW},${nozzleY} ${nozzleX+nozzleW},${nozzleY+nozzleH} ${nozzleX},${bodyY+bodyH-3}`}
          fill={offline ? '#1e2830' : '#5a6470'} stroke={strokeCol} strokeWidth={1} />

        {/* nozzle tip ring */}
        <rect x={nozzleX+nozzleW-2} y={nozzleY-1} width={4} height={nozzleH+2} rx={1}
          fill={offline ? '#181e28' : '#4a5460'} stroke={strokeCol} strokeWidth={0.6} />

        {/* flame or offline mark */}
        {offline
          ? <text x={flameStartX + 20} y={H / 2 + 5} fontSize={11} fill="#445566"
              fontFamily="'Courier New', monospace" letterSpacing="0.15em">OFFLINE</text>
          : <Flame x={flameStartX} y={H / 2} power={power} maxLen={190} maxThick={38} uid={`sm-${uid}`} />
        }
      </g>
    </svg>
  );
}

// ─── Exported indicator component ────────────────────────────────────────────
export default function GasBurnerIndicator({ config, value }) {
  const { label = 'Burner', burnerType = 'large', scale = 1, direction = 90 } = config;
  const rawUid  = useId().replace(/:/g, '');

  const isOffline = value === null || value === undefined;
  const power     = isOffline ? 0 : Math.max(0, Math.min(100, Number(value)));
  const pctColor  = isOffline ? '#445566' : powerColor(power);

  const BurnerBody = burnerType === 'small' ? SmallBurner : LargeBurner;

  return (
    <div
      className="gb-wrap"
      style={{ transform: scale !== 1 ? `scale(${scale})` : undefined,
               transformOrigin: 'left center' }}
    >
      <BurnerBody power={power} label={label} offline={isOffline} uid={rawUid} direction={direction} />

      <div className="gb-meta">
        <span className="gb-label">{label}</span>
        <span className="gb-pct" style={{ color: pctColor }}>
          {isOffline ? 'OFFLINE' : `${power}%`}
        </span>
      </div>
    </div>
  );
}

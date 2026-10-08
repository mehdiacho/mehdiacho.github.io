import React from 'react';

/**
 * Line drawings, in the same hairline language as the blueprints in the
 * gallery below them — thin strokes, tick marks, leader lines, the odd
 * dimension call-out.
 *
 * They are drawn rather than photographed on purpose: the site is about
 * measuring things before building them, and a drawing says that in a way
 * a stock icon cannot.
 *
 * All of them are decorative — every one sits beside text that already
 * carries the meaning — so they are hidden from assistive technology and
 * none of them is given a title. The one exception is `IsometricDesk`,
 * which stands in for a product and takes a label.
 */

const STROKE = {
  fill: 'none' as const,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

type DrawingProps = { className?: string };

/* ------------------------------------------------------------------ *
 * Hero: a part held in a caliper, with the measurement called out.
 * ------------------------------------------------------------------ */
export const CaliperMeasuring: React.FC<DrawingProps> = ({ className }) => (
  <svg viewBox="0 0 440 300" className={className} aria-hidden="true" focusable="false">
    <g {...STROKE} stroke="currentColor" strokeWidth="1.4">
      {/* the bracket being measured */}
      <path d="M150 112 h108 a6 6 0 0 1 6 6 v24 h30 a6 6 0 0 1 6 6 v54 a6 6 0 0 1-6 6 h-144 a6 6 0 0 1-6-6 v-84 a6 6 0 0 1 6-6 z" />
      <path d="M264 142 h30" strokeOpacity=".35" />
      {/* bolt holes */}
      <circle cx="176" cy="178" r="9" />
      <circle cx="176" cy="178" r="3.2" strokeOpacity=".5" />
      <circle cx="268" cy="178" r="9" />
      <circle cx="268" cy="178" r="3.2" strokeOpacity=".5" />
      {/* a fillet, drawn the way a drawing calls one out */}
      <path d="M150 142 q14 0 14-14" strokeOpacity=".4" />

      {/* caliper: beam, fixed jaw, sliding jaw */}
      <path d="M72 96 h300" strokeWidth="1.8" />
      <path d="M72 96 v76 a4 4 0 0 0 4 4 h12" strokeWidth="1.8" />
      <path d="M330 96 v58 a4 4 0 0 1-4 4 h-10" strokeWidth="1.8" />
      <rect x="300" y="78" width="54" height="22" rx="2" strokeOpacity=".6" />
      {/* the depth rod sliding out of the beam's tail */}
      <path d="M372 96 h44" strokeOpacity=".45" />
      {/* graduations along the beam */}
      <g strokeOpacity=".45">
        <path d="M96 96 v-9 M120 96 v-6 M144 96 v-6 M168 96 v-9 M192 96 v-6 M216 96 v-6 M240 96 v-9 M264 96 v-6 M288 96 v-6" />
      </g>

      {/* dimension line under the part */}
      <path d="M150 248 h144" strokeOpacity=".8" />
      <path d="M150 242 v12 M294 242 v12" strokeOpacity=".8" />
      {/* extension lines up to the feature being dimensioned */}
      <path d="M150 214 v28 M294 214 v28" strokeOpacity=".3" strokeDasharray="3 4" />
    </g>

    {/* the measurement itself, in the label voice */}
    <text
      x="222" y="272" textAnchor="middle"
      fill="currentColor" fillOpacity=".75"
      style={{ font: "500 13px 'Fira Code Variable', ui-monospace, monospace", letterSpacing: '.1em' }}
    >
      48.60
    </text>

    {/* leader line to a tagged corner, as on the key blueprint */}
    <g {...STROKE} stroke="currentColor" strokeWidth="1.1" strokeOpacity=".55">
      <path d="M150 112 l-34-30 h-26" />
    </g>
    <circle cx="150" cy="112" r="3.4" fill="currentColor" fillOpacity=".8" />
    <text
      x="84" y="78"
      fill="currentColor" fillOpacity=".7"
      style={{ font: "500 12px 'Fira Code Variable', ui-monospace, monospace", letterSpacing: '.12em' }}
    >
      A
    </text>
  </svg>
);

/* ------------------------------------------------------------------ *
 * The four steps. Each one is deliberately readable at 64px.
 * ------------------------------------------------------------------ */

export const StepMeasure: React.FC<DrawingProps> = ({ className }) => (
  <svg viewBox="0 0 96 96" className={className} aria-hidden="true" focusable="false">
    <g {...STROKE} stroke="currentColor" strokeWidth="1.6">
      <path d="M14 34 h68" />
      <path d="M14 34 v22 h8" />
      <path d="M70 34 v16 h-6" />
      <rect x="62" y="24" width="22" height="11" rx="1.5" strokeOpacity=".6" />
      <g strokeOpacity=".45">
        <path d="M24 34 v-7 M32 34 v-5 M40 34 v-5 M48 34 v-7 M56 34 v-5" />
      </g>
      <rect x="26" y="56" width="34" height="20" rx="2.5" />
      <path d="M26 70 h34" strokeOpacity=".3" />
    </g>
  </svg>
);

export const StepDraw: React.FC<DrawingProps> = ({ className }) => (
  <svg viewBox="0 0 96 96" className={className} aria-hidden="true" focusable="false">
    <g {...STROKE} stroke="currentColor" strokeWidth="1.6">
      <rect x="16" y="14" width="64" height="68" rx="2" />
      <path d="M16 70 h64" strokeOpacity=".35" />
      {/* two orthographic views */}
      <rect x="27" y="26" width="19" height="19" rx="1.5" />
      <path d="M55 26 h14 v19 h-14 z" strokeOpacity=".55" strokeDasharray="3 3" />
      {/* a dimension between them */}
      <path d="M27 56 h42" strokeOpacity=".7" />
      <path d="M27 52 v8 M69 52 v8" strokeOpacity=".7" />
      {/* the schedule along the bottom */}
      <g strokeOpacity=".3">
        <path d="M24 76 h20 M50 76 h22" />
      </g>
    </g>
  </svg>
);

export const StepModel: React.FC<DrawingProps> = ({ className }) => (
  <svg viewBox="0 0 96 96" className={className} aria-hidden="true" focusable="false">
    <g {...STROKE} stroke="currentColor" strokeWidth="1.6">
      {/* an isometric box with its hidden edges dashed, as a wireframe */}
      <path d="M48 16 L78 33 v34 L48 84 L18 67 V33 z" />
      <path d="M48 16 L48 50 M48 50 L78 33 M48 50 L18 33" strokeOpacity=".75" />
      <path d="M18 67 L48 50 L78 67" strokeOpacity=".3" strokeDasharray="3 3" />
      <path d="M48 50 v34" strokeOpacity=".3" strokeDasharray="3 3" />
      {/* a vertex handle, the way a parametric model shows a driven point */}
      <circle cx="48" cy="16" r="3" fill="currentColor" fillOpacity=".8" strokeOpacity="0" />
      <circle cx="78" cy="33" r="2.4" strokeOpacity=".6" />
      <circle cx="18" cy="33" r="2.4" strokeOpacity=".6" />
    </g>
  </svg>
);

export const StepPrint: React.FC<DrawingProps> = ({ className }) => (
  <svg viewBox="0 0 96 96" className={className} aria-hidden="true" focusable="false">
    <g {...STROKE} stroke="currentColor" strokeWidth="1.6">
      {/* gantry */}
      <path d="M14 20 h68" />
      <path d="M40 20 v12 h16 v-12" />
      {/* nozzle */}
      <path d="M44 32 l4 8 l4 -8" />
      {/* the part, printing in layers */}
      <path d="M30 74 h36" strokeWidth="2" />
      <g strokeOpacity=".65">
        <path d="M34 70 h28 M34 66 h28 M34 62 h28 M36 58 h24 M38 54 h20" />
      </g>
      {/* bed */}
      <path d="M18 80 h60" strokeWidth="2" />
      <path d="M26 80 v6 M70 80 v6" strokeOpacity=".5" />
    </g>
  </svg>
);

/* ------------------------------------------------------------------ *
 * Service marks.
 * ------------------------------------------------------------------ */

export const MarkCad: React.FC<DrawingProps> = ({ className }) => (
  <svg viewBox="0 0 72 72" className={className} aria-hidden="true" focusable="false">
    <g {...STROKE} stroke="currentColor" strokeWidth="1.5">
      <path d="M20 22 h22 a4 4 0 0 1 4 4 v6 h6 a4 4 0 0 1 4 4 v14 a4 4 0 0 1-4 4 h-32 a4 4 0 0 1-4-4 v-24 a4 4 0 0 1 4-4 z" />
      <circle cx="28" cy="44" r="4.5" strokeOpacity=".6" />
      <path d="M20 54 v8 M52 54 v8" strokeOpacity=".3" strokeDasharray="3 3" />
      <path d="M20 60 h32" strokeOpacity=".75" />
      <path d="M20 56 v8 M52 56 v8" strokeOpacity=".75" />
    </g>
  </svg>
);

export const MarkWeb: React.FC<DrawingProps> = ({ className }) => (
  <svg viewBox="0 0 72 72" className={className} aria-hidden="true" focusable="false">
    <g {...STROKE} stroke="currentColor" strokeWidth="1.5">
      <rect x="12" y="16" width="48" height="36" rx="2.5" />
      <path d="M12 26 h48" />
      <circle cx="19" cy="21" r="1.6" strokeOpacity=".6" />
      <circle cx="25" cy="21" r="1.6" strokeOpacity=".6" />
      {/* a wireframed layout inside */}
      <rect x="18" y="32" width="15" height="14" rx="1.5" strokeOpacity=".55" />
      <g strokeOpacity=".4">
        <path d="M38 33 h16 M38 38 h16 M38 43 h10" />
      </g>
      {/* and the same page on a handset beside it */}
      <rect x="46" y="44" width="14" height="22" rx="2.5" />
      <path d="M50 62 h6" strokeOpacity=".4" />
    </g>
  </svg>
);

export const MarkLearning: React.FC<DrawingProps> = ({ className }) => (
  <svg viewBox="0 0 72 72" className={className} aria-hidden="true" focusable="false">
    <g {...STROKE} stroke="currentColor" strokeWidth="1.5">
      <g strokeOpacity=".4">
        <path d="M22 24 L42 20 M22 24 L42 36 M22 24 L42 52 M22 44 L42 20 M22 44 L42 36 M22 44 L42 52" />
        <path d="M42 20 L58 36 M42 36 L58 36 M42 52 L58 36" />
      </g>
      <circle cx="22" cy="24" r="3.6" />
      <circle cx="22" cy="44" r="3.6" />
      <circle cx="42" cy="20" r="3.2" />
      <circle cx="42" cy="36" r="3.2" fill="currentColor" fillOpacity=".75" strokeOpacity="0" />
      <circle cx="42" cy="52" r="3.2" />
      <circle cx="58" cy="36" r="3.6" />
    </g>
  </svg>
);

/* ------------------------------------------------------------------ *
 * Desk Twin. Stands in for the product, so it is labelled rather than
 * hidden — the section heading names it, this says what it looks like.
 * ------------------------------------------------------------------ */
export const IsometricDesk: React.FC<DrawingProps> = ({ className }) => (
  <svg
    viewBox="0 0 320 220"
    className={className}
    role="img"
    aria-label="An isometric line drawing of a desk: a monitor on an arm, a laptop on a stand, a keyboard and a tower under the desk, with a width dimension called out along the front edge."
  >
    <g {...STROKE} stroke="currentColor" strokeWidth="1.3">
      {/* desktop surface, in isometric */}
      <path d="M40 132 L160 78 L280 132 L160 186 z" />
      <path d="M40 132 v12 L160 198 v-12" strokeOpacity=".7" />
      <path d="M280 132 v12 L160 198" strokeOpacity=".7" />
      {/* legs */}
      <path d="M52 150 v30 M268 150 v30 M160 204 v26" strokeOpacity=".55" />

      {/* monitor on an arm */}
      <path d="M150 96 L150 62" strokeOpacity=".7" />
      <path d="M150 62 L118 44 L170 18 L202 36 z" />
      <path d="M150 62 v-8" strokeOpacity=".5" />
      <path d="M124 45 L170 22 L196 36 L150 59 z" strokeOpacity=".35" />

      {/* laptop on a stand, lid open */}
      <path d="M66 126 L104 104 L128 118 L90 140 z" strokeOpacity=".8" />
      <path d="M104 104 L112 74 L136 88 L128 118" strokeOpacity=".8" />
      <path d="M108 102 L114 79 L132 89 L126 112 z" strokeOpacity=".3" />

      {/* keyboard */}
      <path d="M176 140 L218 116 L244 130 L202 154 z" strokeOpacity=".7" />
      <g strokeOpacity=".3">
        <path d="M186 140 L222 120 M194 145 L230 125 M202 150 L238 130" />
      </g>

      {/* tower under the desk */}
      <path d="M196 170 L226 152 v34 L196 204 z" strokeOpacity=".5" />
      <path d="M196 170 L226 152 L240 160 L210 178 z" strokeOpacity=".5" />
      <path d="M226 152 v34 L240 194 v-34" strokeOpacity=".5" />
      <path d="M196 204 L210 212 L240 194" strokeOpacity=".5" />
    </g>

    {/* a width dimension along the front edge */}
    <g {...STROKE} stroke="currentColor" strokeWidth="1.1" strokeOpacity=".8">
      <path d="M44 206 L156 256" transform="translate(0,-48)" />
    </g>
    <text
      x="96" y="200"
      fill="currentColor" fillOpacity=".65"
      style={{ font: "500 11px 'Fira Code Variable', ui-monospace, monospace", letterSpacing: '.1em' }}
    >
      1420
    </text>
  </svg>
);

/* ------------------------------------------------------------------ *
 * A compass rose / crosshair for the location block. Not a map: an
 * invented coastline would be worse than no map at all.
 * ------------------------------------------------------------------ */
export const Crosshair: React.FC<DrawingProps> = ({ className }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true" focusable="false">
    <g {...STROKE} stroke="currentColor" strokeWidth="1.3">
      <circle cx="60" cy="60" r="38" strokeOpacity=".5" />
      <circle cx="60" cy="60" r="22" strokeOpacity=".3" />
      <path d="M60 8 v22 M60 90 v22 M8 60 h22 M90 60 h22" strokeOpacity=".6" />
      <path d="M60 36 v48 M36 60 h48" strokeOpacity=".25" />
      <circle cx="60" cy="60" r="3.4" fill="currentColor" fillOpacity=".85" strokeOpacity="0" />
      {/* north mark */}
      <path d="M60 14 l-5 10 h10 z" fill="currentColor" fillOpacity=".7" strokeOpacity="0" />
    </g>
  </svg>
);

/* ------------------------------------------------------------------ *
 * A full-width dimension rule used between sections.
 * ------------------------------------------------------------------ */
export const SectionRule: React.FC<DrawingProps> = ({ className }) => (
  <svg viewBox="0 0 1200 16" preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false">
    <g {...STROKE} stroke="currentColor" strokeWidth="1">
      <path d="M0 8 H1200" strokeOpacity=".55" />
      <path d="M0 2 v12 M1200 2 v12" />
      <path d="M300 4 v8 M600 4 v8 M900 4 v8" strokeOpacity=".35" />
    </g>
  </svg>
);

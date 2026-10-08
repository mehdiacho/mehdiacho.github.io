import React, { useCallback, useMemo, useState } from 'react';

import { WORKS_3D } from '../constants';
import { Work3D as Work3DItem, ProjectStatus } from '../types';

/**
 * `<model-viewer>` is a custom element, not a React one. It is pinned, it is
 * about a megabyte, and most visitors will never press the button that needs
 * it — so the script is injected on first use rather than shipped with the
 * page or bundled into the build.
 */
const MODEL_VIEWER_SRC =
  'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';

let modelViewerLoad: Promise<void> | null = null;

const loadModelViewer = (): Promise<void> =>
  (modelViewerLoad ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = MODEL_VIEWER_SRC;
    script.onload = () => resolve();
    script.onerror = () => {
      // Let a later press try again rather than caching the failure forever.
      modelViewerLoad = null;
      reject(new Error('model-viewer could not be loaded'));
    };
    document.head.append(script);
  }));

/**
 * Rendered through createElement on purpose: React 19's types no longer let a
 * component file add entries to the intrinsic-element table, and a custom
 * element does not need to be in it.
 */
const ModelViewer: React.FC<Record<string, unknown>> = (props) =>
  React.createElement('model-viewer', props);

/**
 * Plain words. A part that is drawn but not printed should say so.
 *
 * The colours are the section's own, not fixed ones — this grid sits on the
 * blueprint ground, where a Tailwind green would disappear.
 */
const STATUS_META: Record<ProjectStatus, { label: string; className: string }> = {
  live: { label: 'Printed', className: 'text-accent' },
  wip: { label: 'Modelled', className: 'text-red' },
  concept: { label: 'Drawn', className: 'text-ink-faint' },
};

type ViewerState = 'still' | 'loading' | 'live' | 'failed';

const WorkCard: React.FC<{ item: Work3DItem; onImageError: (id: string) => void }> = ({
  item,
  onImageError,
}) => {
  const [viewer, setViewer] = useState<ViewerState>('still');
  const status = STATUS_META[item.status];

  const show3D = useCallback(async () => {
    setViewer('loading');
    try {
      await loadModelViewer();
      setViewer('live');
    } catch {
      setViewer('failed');
    }
  }, []);

  return (
    <figure className="panel-lift ticked m-0 flex flex-col">
      {/* The renders are drawn on light paper, so they keep a white ground
          rather than being tinted to match the sheet. */}
      <div className="relative aspect-[4/3] border-b border-rule bg-white">
        {viewer === 'live' && item.model ? (
          <ModelViewer
            src={item.model}
            poster={item.image}
            alt={item.alt}
            /* React sets `alt` on a custom element as a property, and
               model-viewer only mirrors the attribute into an accessible
               name — so the description never reaches a screen reader.
               Labelling the host directly does not depend on that. */
            role="img"
            aria-label={item.alt}
            camera-controls=""
            auto-rotate=""
            touch-action="pan-y"
            shadow-intensity="1"
            style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}
          />
        ) : (
          <img
            src={item.image}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            onError={() => onImageError(item.id)}
            className="h-full w-full object-contain p-2"
          />
        )}

        {item.model && viewer !== 'live' && (
          <button
            onClick={show3D}
            disabled={viewer === 'loading'}
            className="btn absolute bottom-3 right-3 px-4 py-2.5 disabled:opacity-60"
          >
            {viewer === 'loading' ? 'Loading…' : 'Turn it around'}
          </button>
        )}
      </div>

      <figcaption className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl font-bold tracking-tight text-ink">
            {item.title}
          </h3>
          <span className={`stamp ${status.className}`}>
            {status.label}
          </span>
        </div>

        <p className="mt-4 flex-1 text-base leading-relaxed text-ink-soft">{item.caption}</p>

        {viewer === 'failed' && (
          <p className="mt-4 border-l-2 border-red pl-3 text-sm text-ink-soft">
            The 3D viewer did not load. The picture above is the same part, and
            the file is linked below.
          </p>
        )}

        {item.specs && item.specs.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2 p-0 list-none">
            {item.specs.map((spec) => (
              <li
                key={spec}
                className="border border-rule px-2 py-1 font-label text-[11px] text-ink-soft"
              >
                {spec}
              </li>
            ))}
          </ul>
        )}

        {item.model && (
          <a
            href={item.model}
            download
            className="mt-5 inline-block self-start border-b-2 border-accent pb-1 font-label text-[12px] text-ink transition-colors hover:text-accent"
          >
            Download the model file ↓
          </a>
        )}
      </figcaption>
    </figure>
  );
};

/**
 * The 3D / CAD gallery.
 *
 * Entries come from WORKS_3D; files come from `public/portfolio-3d/`. The two
 * can drift — a file gets renamed, an entry lands before the render does — so
 * an item whose still fails to load is dropped, and if that empties the list
 * the section removes itself rather than leaving a heading over nothing.
 */
const Work3D: React.FC = () => {
  const [broken, setBroken] = useState<string[]>([]);

  const onImageError = useCallback((id: string) => {
    setBroken((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const items = useMemo(() => WORKS_3D.filter((w) => !broken.includes(w.id)), [broken]);

  if (items.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {items.map((item) => (
          <WorkCard key={item.id} item={item} onImageError={onImageError} />
        ))}
      </div>

      {/* The two crawlable pages behind this section, linked in prose so the
          section is not a dead end for either a reader or a crawler. */}
      <p className="mt-10 max-w-[70ch] border-t border-rule pt-7 text-base leading-relaxed text-ink-soft">
        There is more on{' '}
        <a
          href="/3d-modeling-botswana/"
          className="text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent"
        >
          3D modeling in Botswana
        </a>{' '}
        and{' '}
        <a
          href="/cad-modeling-botswana/"
          className="text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent"
        >
          CAD modeling
        </a>
        , if you want the longer version.
      </p>
    </>
  );
};

export default Work3D;

# Mr. Pops Technical Stack Analysis

- Framework: older Next.js pages-router application.
- Hydration data: inline `__NEXT_DATA__` with `page: "/"` and `__N_SSP: true`.
- Build asset pattern: hashed `_next/static` CSS and JS chunks.
- Media strategy: first-party assets on `mrpops.ua` plus binary/image/video payloads on `data.mrpops.ua`.
- Clone strategy used in this repo: local static mirror of the original HTML plus bundled CSS/JS/assets, rendered inside an isolated iframe so the original runtime remains intact.

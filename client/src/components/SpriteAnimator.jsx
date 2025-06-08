import React, { useRef, useEffect, useState } from 'react';

/**
 * SpriteAnimator
 * - Loads Aseprite JSON + sprite sheet image
 * - Parses meta.slices into frames [{x,y,w,h,name}] sorted by numeric suffix
 * - Plays animation at `fps`, loops if `loop`=true
 * - Optionally filters by sliceBaseName prefix
 */
export default function SpriteAnimator({
    jsonUrl,
    imageUrl,
    fps = 12,
    loop = true,
    sliceBaseName = null,
}) {
    const canvasRef = useRef(null);
    const [sheet, setSheet] = useState({ image: null, frames: [] });
    const frameIndex = useRef(0);

    // Load JSON metadata and image, then set sheet state
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(jsonUrl);
                if (!res.ok) throw new Error(`Failed to load JSON: ${res.status}`);
                const data = await res.json();
                // Extract slices
                const slices = data.meta?.slices || [];
                let frames = slices.map(s => {
                    const { x, y, w, h } = s.keys[0].bounds;
                    return { name: s.name, x, y, w, h };
                });
                // Optionally filter by base name
                if (sliceBaseName) {
                    frames = frames.filter(f => f.name.startsWith(`${sliceBaseName}`));
                }
                // Sort by numeric suffix
                frames.sort((a, b) => {
                    const numA = parseInt((a.name.match(/\d+$/) || ['0'])[0], 10);
                    const numB = parseInt((b.name.match(/\d+$/) || ['0'])[0], 10);
                    return numA - numB;
                });
                // Load image
                const img = new Image();
                img.src = imageUrl;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                if (!cancelled) {
                    setSheet({ image: img, frames });
                }
            } catch (err) {
                console.error('[SpriteAnimator] load error:', err);
            }
        })();
        return () => { cancelled = true; };
    }, [jsonUrl, imageUrl, sliceBaseName]);

    // Animation loop with requestAnimationFrame for smooth timing
    useEffect(() => {
        const { image, frames } = sheet;
        if (!image || frames.length === 0) return;

        const ctx = canvasRef.current.getContext('2d');
        let lastTime = performance.now();
        const frameDuration = 1000 / fps;

        function draw(now) {
            const delta = now - lastTime;
            if (delta >= frameDuration) {
                lastTime = now - (delta % frameDuration);
                const f = frames[frameIndex.current];
                const { x, y, w, h } = f;
                canvasRef.current.width = w;
                canvasRef.current.height = h;
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
                // Advance frame
                frameIndex.current = frameIndex.current + 1 < frames.length
                    ? frameIndex.current + 1
                    : (loop ? 0 : frameIndex.current);
            }
            requestAnimationFrame(draw);
        }

        const rafId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(rafId);
    }, [sheet, fps, loop]);

    return (
        <canvas ref={canvasRef} style={{ imageRendering: 'pixelated' }} />
    );
}

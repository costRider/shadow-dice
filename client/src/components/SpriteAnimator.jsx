import React, { useRef, useEffect, useState } from 'react';

export default function SpriteAnimator({
    jsonUrl,
    imageUrl,
    fps = 8,
    loop = true,
    sliceBaseName = null,
}) {
    const canvasRef = useRef(null);
    const [sheet, setSheet] = useState({ image: null, frames: [] });
    const frameIndex = useRef(0);

    // 메타시트 · 이미지 로드
    useEffect(() => {
        let cancelled = false;
        frameIndex.current = 0;  // ← jsonUrl/sliceBaseName 변경 시 인덱스 초기화

        (async () => {
            try {
                const res = await fetch(jsonUrl);
                if (!res.ok) throw new Error(`JSON 로드 실패: ${res.status}`);
                const data = await res.json();

                // slices → frames
                let frames = (data.meta?.slices || []).map(s => {
                    const { x, y, w, h } = s.keys[0].bounds;
                    return { name: s.name, x, y, w, h };
                });
                if (sliceBaseName) {
                    frames = frames.filter(f => f.name.startsWith(sliceBaseName));
                }
                frames.sort((a, b) => {
                    const na = parseInt(a.name.match(/\d+$/)?.[0] || '0', 10);
                    const nb = parseInt(b.name.match(/\d+$/)?.[0] || '0', 10);
                    return na - nb;
                });

                const img = new Image();
                img.src = imageUrl;
                await new Promise((r, e) => { img.onload = r; img.onerror = e; });

                if (!cancelled) setSheet({ image: img, frames });
            } catch (err) {
                console.error('[SpriteAnimator] load 에러:', err);
            }
        })();

        return () => { cancelled = true; };
    }, [jsonUrl, imageUrl, sliceBaseName]);

    // 애니메이션 루프
    useEffect(() => {
        const { image, frames } = sheet;
        if (!canvasRef.current || !image || frames.length === 0) return;

        const ctx = canvasRef.current.getContext('2d');
        let lastTime = performance.now();
        const frameDuration = 1000 / fps;
        let cancelled = false;

        function draw(now) {
            if (cancelled) return;
            const delta = now - lastTime;
            if (delta >= frameDuration) {
                lastTime = now - (delta % frameDuration);
                const f = frames[frameIndex.current];
                canvasRef.current.width = f.w;
                canvasRef.current.height = f.h;
                ctx.clearRect(0, 0, f.w, f.h);
                ctx.drawImage(image, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);

                frameIndex.current =
                    frameIndex.current + 1 < frames.length
                        ? frameIndex.current + 1
                        : (loop ? 0 : frameIndex.current);
            }
            requestAnimationFrame(draw);
        }

        const rafId = requestAnimationFrame(draw);
        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
        };
    }, [sheet, fps, loop]);

    return <canvas ref={canvasRef} style={{ imageRendering: 'pixelated' }} />;
}

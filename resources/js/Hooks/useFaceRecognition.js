import * as faceapi from '@vladmandic/face-api';
import { useCallback, useEffect, useRef, useState } from 'react';

let modelsLoadedPromise = null;

async function loadFaceApiAndModels() {
    if (!modelsLoadedPromise) {
        modelsLoadedPromise = Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models/face-api'),
            faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models/face-api'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models/face-api'),
        ]).catch((err) => {
            modelsLoadedPromise = null;
            throw err;
        });
    }

    await modelsLoadedPromise;
    return faceapi;
}

function drawTrackingBracketBox(ctx, x, y, w, h, color, badgeText) {
    const cornerLen = Math.max(14, Math.min(26, Math.min(w, h) * 0.22));
    const radius = 8;

    ctx.save();

    // Subtle translucent frame outline
    ctx.strokeStyle = `${color}44`;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, radius);
    } else {
        ctx.rect(x, y, w, h);
    }
    ctx.stroke();

    // Crisp corner brackets
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x, y + cornerLen);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerLen, y);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + w - cornerLen, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + cornerLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x, y + h - cornerLen);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + cornerLen, y + h);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + w - cornerLen, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - cornerLen);
    ctx.stroke();

    // Floating status badge above box
    if (badgeText) {
        ctx.font = '700 11px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif';
        const textWidth = ctx.measureText(badgeText).width;
        const padX = 9;
        const pillH = 22;
        const pillW = textWidth + padX * 2;
        const pillX = Math.max(8, x + (w - pillW) / 2);
        const pillY = y > pillH + 10 ? y - pillH - 6 : y + h + 6;

        ctx.fillStyle = 'rgba(8, 28, 21, 0.86)';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(pillX, pillY, pillW, pillH, 6);
        } else {
            ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, pillX + padX, pillY + pillH / 2 + 0.5);
    }

    ctx.restore();
}

export function useFaceRecognition({
    videoRef,
    overlayCanvasRef,
    active,
    faceProfile,
    userName = '',
}) {
    const [modelsReady, setModelsReady] = useState(false);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelError, setModelError] = useState(null);
    const [faceState, setFaceState] = useState({
        status: 'idle', // idle | loading | no_face | multiple_faces | ready_enroll | matched | mismatch
        canSubmit: false,
        matched: false,
        descriptor: null,
        similarity: null,
        distance: null,
        faceCount: 0,
        label: 'Menyiapkan sensor wajah...',
    });

    const latestDescriptorRef = useRef(null);
    const shortName = (userName || 'Pegawai').trim().split(/\s+/).slice(0, 2).join(' ');

    const clearOverlay = useCallback(() => {
        const canvas = overlayCanvasRef?.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [overlayCanvasRef]);

    useEffect(() => {
        if (!active) {
            latestDescriptorRef.current = null;
            clearOverlay();
            return;
        }

        let cancelled = false;
        let timerId = null;

        const bootAndLoop = async () => {
            setModelsLoading(true);
            setModelError(null);

            let faceapi;
            try {
                faceapi = await loadFaceApiAndModels();
                if (cancelled) return;
                setModelsReady(true);
                setModelsLoading(false);
            } catch {
                if (cancelled) return;
                setModelsLoading(false);
                setModelError('Gagal memuat model Face Recognition. Muat ulang halaman lalu coba kembali.');
                return;
            }

            const detectorOptions = new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.45,
            });

            const tick = async () => {
                if (cancelled) return;

                const video = videoRef?.current;
                const overlay = overlayCanvasRef?.current;

                if (
                    !video ||
                    video.paused ||
                    video.ended ||
                    video.readyState < 2 ||
                    video.videoWidth === 0 ||
                    video.videoHeight === 0
                ) {
                    timerId = setTimeout(tick, 180);
                    return;
                }

                try {
                    const detections = await faceapi
                        .detectAllFaces(video, detectorOptions)
                        .withFaceLandmarks(true)
                        .withFaceDescriptors();

                    if (cancelled) return;

                    const cw = video.clientWidth || video.videoWidth;
                    const ch = video.clientHeight || video.videoHeight;
                    const vw = video.videoWidth;
                    const vh = video.videoHeight;
                    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

                    let ctx = null;
                    if (overlay && cw > 0 && ch > 0) {
                        const targetW = Math.round(cw * dpr);
                        const targetH = Math.round(ch * dpr);
                        if (overlay.width !== targetW || overlay.height !== targetH) {
                            overlay.width = targetW;
                            overlay.height = targetH;
                        }
                        ctx = overlay.getContext('2d');
                        if (ctx) {
                            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                            ctx.clearRect(0, 0, cw, ch);
                        }
                    }

                    const mapBoxToOverlay = (box) => {
                        const scale = Math.max(cw / vw, ch / vh);
                        const offsetX = (vw * scale - cw) / 2;
                        const offsetY = (vh * scale - ch) / 2;
                        const rawX = box.x * scale - offsetX;
                        const rawY = box.y * scale - offsetY;
                        const boxW = box.width * scale;
                        const boxH = box.height * scale;
                        const mirroredX = cw - (rawX + boxW);

                        return { x: mirroredX, y: rawY, w: boxW, h: boxH };
                    };

                    if (detections.length === 0) {
                        latestDescriptorRef.current = null;
                        setFaceState({
                            status: 'no_face',
                            canSubmit: false,
                            matched: false,
                            descriptor: null,
                            similarity: null,
                            distance: null,
                            faceCount: 0,
                            label: 'Arahkan wajah menghadap kamera',
                        });
                    } else if (detections.length > 1) {
                        latestDescriptorRef.current = null;
                        if (ctx) {
                            detections.forEach((d, idx) => {
                                const mapped = mapBoxToOverlay(d.detection.box);
                                drawTrackingBracketBox(
                                    ctx,
                                    mapped.x,
                                    mapped.y,
                                    mapped.w,
                                    mapped.h,
                                    '#FBBF24',
                                    idx === 0 ? `${detections.length} Wajah Terdeteksi` : ''
                                );
                            });
                        }
                        setFaceState({
                            status: 'multiple_faces',
                            canSubmit: false,
                            matched: false,
                            descriptor: null,
                            similarity: null,
                            distance: null,
                            faceCount: detections.length,
                            label: 'Pastikan hanya 1 wajah berada di depan kamera',
                        });
                    } else {
                        const primary = detections[0];
                        const mapped = mapBoxToOverlay(primary.detection.box);
                        const descriptorArr = Array.from(primary.descriptor).map((v) =>
                            Number(v.toFixed(6))
                        );

                        const hasRegistered =
                            faceProfile?.registered &&
                            Array.isArray(faceProfile?.descriptor) &&
                            faceProfile.descriptor.length === 128;

                        if (hasRegistered) {
                            const threshold = Number(faceProfile.threshold ?? 0.55);
                            const dist = faceapi.euclideanDistance(
                                primary.descriptor,
                                faceProfile.descriptor
                            );
                            const isMatch = dist <= threshold;
                            const similarity = Number(
                                Math.max(50, Math.min(99.9, (1 - dist / 1.15) * 100)).toFixed(1)
                            );

                            if (isMatch) {
                                latestDescriptorRef.current = descriptorArr;
                                if (ctx) {
                                    drawTrackingBracketBox(
                                        ctx,
                                        mapped.x,
                                        mapped.y,
                                        mapped.w,
                                        mapped.h,
                                        '#34D399',
                                        `✓ ${shortName} (${similarity}%)`
                                    );
                                }
                                setFaceState({
                                    status: 'matched',
                                    canSubmit: true,
                                    matched: true,
                                    descriptor: descriptorArr,
                                    similarity,
                                    distance: Number(dist.toFixed(3)),
                                    faceCount: 1,
                                    label: `Wajah Cocok (${similarity}%)`,
                                });
                            } else {
                                latestDescriptorRef.current = null;
                                if (ctx) {
                                    drawTrackingBracketBox(
                                        ctx,
                                        mapped.x,
                                        mapped.y,
                                        mapped.w,
                                        mapped.h,
                                        '#F87171',
                                        '✕ Wajah Tidak Cocok'
                                    );
                                }
                                setFaceState({
                                    status: 'mismatch',
                                    canSubmit: false,
                                    matched: false,
                                    descriptor: null,
                                    similarity: null,
                                    distance: Number(dist.toFixed(3)),
                                    faceCount: 1,
                                    label: 'Wajah tidak cocok dengan pemilik akun!',
                                });
                            }
                        } else {
                            latestDescriptorRef.current = descriptorArr;
                            if (ctx) {
                                drawTrackingBracketBox(
                                    ctx,
                                    mapped.x,
                                    mapped.y,
                                    mapped.w,
                                    mapped.h,
                                    '#6EE7B7',
                                    '◉ Wajah Siap Didaftarkan'
                                );
                            }
                            setFaceState({
                                status: 'ready_enroll',
                                canSubmit: true,
                                matched: false,
                                descriptor: descriptorArr,
                                similarity: null,
                                distance: null,
                                faceCount: 1,
                                label: 'Wajah terdeteksi • Siap didaftarkan ke akun Anda',
                            });
                        }
                    }
                } catch {
                    // Lewati satu frame bila video baru berubah dimensi
                }

                if (!cancelled) {
                    timerId = setTimeout(tick, 150);
                }
            };

            tick();
        };

        bootAndLoop();

        return () => {
            cancelled = true;
            if (timerId) clearTimeout(timerId);
            clearOverlay();
        };
    }, [active, videoRef, overlayCanvasRef, faceProfile, shortName, clearOverlay]);

    return {
        modelsReady,
        modelsLoading,
        modelError,
        faceState,
        latestDescriptorRef,
        clearOverlay,
    };
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Check, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

/**
 * 专业图片裁剪预览窗口（视窗固定、图片移动缩放方案）。
 * - 拖动图片平移，滚轮/滑杆缩放
 * - 比例锁定：自由 / 1:1 / 4:3 / 3:2 / 16:9
 * - 三分线网格、暗角遮罩、实时结果预览、输出尺寸提示
 */
const RATIOS: { label: string; value: number | null }[] = [
  { label: "自由", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
];

const STAGE_W = 560;
const STAGE_H = 400;
const MAX_OUT_W = 1600;

type Pt = { x: number; y: number };

export function ImageCropper({
  file,
  onConfirm,
  onCancel,
}: {
  file: File;
  onConfirm: (f: File) => void;
  onCancel: () => void;
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [ratio, setRatio] = useState<number | null>(4 / 3);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Pt>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<Pt>({ x: 0, y: 0 });
  const offsetStart = useRef<Pt>({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  /* 加载图片 */
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => setImg(im);
    im.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  /* 裁剪框尺寸（按舞台内最大适配） */
  const crop = useMemo(() => {
    const r = ratio ?? (img ? img.width / img.height : 4 / 3);
    let w = STAGE_W * 0.8;
    let h = w / r;
    if (h > STAGE_H * 0.8) {
      h = STAGE_H * 0.8;
      w = h * r;
    }
    return { w, h, r };
  }, [ratio, img]);

  /* 最小缩放：保证图片 cover 裁剪框 */
  const minScale = useMemo(() => {
    if (!img) return 1;
    return Math.max(crop.w / img.width, crop.h / img.height);
  }, [img, crop]);

  /* 初始/比例变化时重置缩放居中 */
  useEffect(() => {
    if (!img) return;
    setScale(minScale * 1.02);
    setOffset({ x: 0, y: 0 });
  }, [img, minScale, crop.w, crop.h]);

  const clampOffset = useCallback(
    (o: Pt, s: number): Pt => {
      if (!img) return o;
      const dw = img.width * s;
      const dh = img.height * s;
      const maxX = Math.max(0, (dw - crop.w) / 2);
      const maxY = Math.max(0, (dh - crop.h) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, o.x)),
        y: Math.max(-maxY, Math.min(maxY, o.y)),
      };
    },
    [img, crop]
  );

  const applyScale = useCallback(
    (s: number) => {
      const ns = Math.max(minScale, Math.min(minScale * 6, s));
      setScale(ns);
      setOffset((o) => clampOffset(o, ns));
    },
    [minScale, clampOffset]
  );

  /* 拖动 */
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = offset;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(
      clampOffset(
        { x: offsetStart.current.x + dx, y: offsetStart.current.y + dy },
        scale
      )
    );
  };
  const onPointerUp = () => setDragging(false);

  /* 滚轮缩放 */
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    applyScale(scale * (e.deltaY < 0 ? 1.06 : 0.94));
  };

  /* 输出裁剪结果 */
  const confirm = async () => {
    if (!img || busy) return;
    setBusy(true);
    try {
      const outW = Math.min(MAX_OUT_W, Math.round(img.width / (scale / (crop.w / crop.w)) * (crop.w / crop.w)));
      // 输出宽度：按显示比例换算——裁剪框像素对应图片像素 = crop.w / scale
      const srcW = crop.w / scale;
      const srcH = crop.h / scale;
      const outWidth = Math.min(MAX_OUT_W, Math.round(srcW));
      const outHeight = Math.round(outWidth / crop.r);

      const canvas = document.createElement("canvas");
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outWidth, outHeight);

      // 裁剪框左上在图片坐标系中的位置：
      // 图片显示在舞台中心 + offset；裁剪框位于舞台中心。
      const imgLeftOnStage = (STAGE_W - img.width * scale) / 2 + offset.x;
      const imgTopOnStage = (STAGE_H - img.height * scale) / 2 + offset.y;
      const cropLeftOnStage = (STAGE_W - crop.w) / 2;
      const cropTopOnStage = (STAGE_H - crop.h) / 2;
      const sx = (cropLeftOnStage - imgLeftOnStage) / scale;
      const sy = (cropTopOnStage - imgTopOnStage) / scale;

      ctx.drawImage(img, sx, sy, srcW, srcH, 0, 0, outWidth, outHeight);
      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("导出失败");
      const name = file.name.replace(/\.[^.]+$/, "") + "-crop.jpg";
      onConfirm(new File([blob], name, { type: "image/jpeg" }));
    } finally {
      setBusy(false);
    }
  };

  /* 实时预览（小图） */
  const previewRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!img || !previewRef.current) return;
    const cv = previewRef.current;
    const pw = 150;
    const ph = Math.round(pw / crop.r);
    cv.width = pw;
    cv.height = ph;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, pw, ph);
    const imgLeftOnStage = (STAGE_W - img.width * scale) / 2 + offset.x;
    const imgTopOnStage = (STAGE_H - img.height * scale) / 2 + offset.y;
    const cropLeftOnStage = (STAGE_W - crop.w) / 2;
    const cropTopOnStage = (STAGE_H - crop.h) / 2;
    const sx = (cropLeftOnStage - imgLeftOnStage) / scale;
    const sy = (cropTopOnStage - imgTopOnStage) / scale;
    ctx.drawImage(img, sx, sy, crop.w / scale, crop.h / scale, 0, 0, pw, ph);
  }, [img, scale, offset, crop]);

  const outSizeText = img
    ? `${Math.round(crop.w / scale)} × ${Math.round(crop.h / scale)} px`
    : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl border border-white/15 bg-[#101010]">
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">
            裁剪封面 · Crop & Preview
          </p>
          <button
            onClick={onCancel}
            className="text-white/50 hover:text-white"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[1fr_190px]">
          {/* 工作区 */}
          <div
            ref={stageRef}
            className="relative select-none overflow-hidden bg-black"
            style={{
              width: "100%",
              height: STAGE_H,
              cursor: dragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={onWheel}
          >
            {img && (
              <img
                src={img.src}
                alt=""
                draggable={false}
                className="pointer-events-none absolute"
                style={{
                  width: img.width * scale,
                  height: img.height * scale,
                  left: (STAGE_W - img.width * scale) / 2 + offset.x,
                  top: (STAGE_H - img.height * scale) / 2 + offset.y,
                  maxWidth: "none",
                }}
              />
            )}
            {/* 暗角 + 裁剪框 */}
            <div
              className="pointer-events-none absolute"
              style={{
                left: (STAGE_W - crop.w) / 2,
                top: (STAGE_H - crop.h) / 2,
                width: crop.w,
                height: crop.h,
                boxShadow: "0 0 0 9999px rgba(0,0,0,.62)",
                outline: "1px solid rgba(255,255,255,.9)",
              }}
            >
              {/* 三分线 */}
              {[1, 2].map((i) => (
                <div key={"v" + i} className="absolute top-0 bottom-0 w-px bg-white/35" style={{ left: `${(i * 100) / 3}%` }} />
              ))}
              {[1, 2].map((i) => (
                <div key={"h" + i} className="absolute left-0 right-0 h-px bg-white/35" style={{ top: `${(i * 100) / 3}%` }} />
              ))}
            </div>
          </div>

          {/* 控制面板 */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
                比例 / Ratio
              </p>
              <div className="flex flex-wrap gap-1.5">
                {RATIOS.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setRatio(r.value)}
                    className={`border px-2.5 py-1 text-[11px] transition ${
                      ratio === r.value
                        ? "border-white bg-white text-black"
                        : "border-white/20 text-white/70 hover:border-white/50"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
                缩放 / Zoom
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => applyScale(scale * 0.9)} className="text-white/60 hover:text-white">
                  <ZoomOut size={15} />
                </button>
                <input
                  type="range"
                  min={minScale}
                  max={minScale * 6}
                  step={minScale * 0.02}
                  value={scale}
                  onChange={(e) => applyScale(parseFloat(e.target.value))}
                  className="w-full accent-white"
                />
                <button onClick={() => applyScale(scale * 1.1)} className="text-white/60 hover:text-white">
                  <ZoomIn size={15} />
                </button>
              </div>
              <button
                onClick={() => {
                  setScale(minScale * 1.02);
                  setOffset({ x: 0, y: 0 });
                }}
                className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-white/45 hover:text-white"
              >
                <RotateCcw size={11} /> 重置 Reset
              </button>
            </div>

            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
                预览 / Preview
              </p>
              <canvas ref={previewRef} className="border border-white/15" />
              <p className="mt-1 text-[10px] text-white/40">输出 {outSizeText}</p>
            </div>

            <div className="mt-auto flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 border border-white/20 px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-white/70 hover:bg-white/5"
              >
                取消
              </button>
              <button
                onClick={confirm}
                disabled={!img || busy}
                className="flex flex-1 items-center justify-center gap-1.5 bg-white px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-black hover:bg-white/90 disabled:opacity-60"
              >
                <Check size={13} /> {busy ? "导出…" : "使用裁剪"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

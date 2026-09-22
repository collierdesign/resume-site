/**
 * CloudBase 云存储上传（图片不再内嵌 base64 到配置文档，避免 512KB 文档上限）。
 * 存储 ACL 已设为 READONLY（公有读 / 创建者与管理员可写），
 * 因此上传后直接拼接稳定 URL 即可被前台访客访问，无需带签名。
 */
import { tcbApp, ensureTcbAuth, TCB_ENV } from "./cloudbase";

/** 存储桶的稳定公开域名（来自 uploadFile 返回的 download_url 前缀） */
const BUCKET_HOST = "https://6c65-lenhe1026-4gpfachbe3c7625b-1258454420.tcb.qcloud.la";

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3MB

export type ProgressFn = (percent: number) => void;

/** 上传图片到云存储，返回公开稳定 URL。失败抛错。 */
export async function uploadImage(
  file: File | Blob,
  filename: string,
  onProgress?: ProgressFn
): Promise<string> {
  const size = (file as File).size ?? 0;
  if (size > MAX_IMAGE_BYTES) {
    throw new Error(`图片 ${(size / 1024 / 1024).toFixed(1)}MB 超过 3MB 上限`);
  }
  await ensureTcbAuth();

  const app: any = tcbApp();
  const safeName = filename.replace(/[^\w.-]+/g, "-").slice(-48) || "image.png";
  const cloudPath = `uploads/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${safeName}`;

  const res = await app.uploadFile({
    cloudPath,
    filePath: file,
    onUploadProgress: (e: any) => {
      if (e?.total > 0 && onProgress) {
        onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
      }
    },
  });
  if (!res?.fileID) throw new Error("上传失败：未返回 fileID");
  onProgress?.(100);
  return `${BUCKET_HOST}/${cloudPath}`;
}

/** 上传 PDF 等附件（同桶同规则），返回稳定 URL。 */
export async function uploadFile(
  file: File,
  onProgress?: ProgressFn
): Promise<string> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`文件 ${(file.size / 1024 / 1024).toFixed(1)}MB 超过 10MB 上限`);
  }
  return uploadImage(file, file.name, onProgress);
}

/** 从 dataURL（旧数据迁移用）生成 Blob */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",");
  const mime = head.match(/data:(.*?);/)?.[1] || "image/png";
  const bin = atob(body);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/** 判断是否为内嵌 base64 数据地址 */
export function isDataUrl(src: string | undefined | null): boolean {
  return !!src && src.startsWith("data:");
}

export { TCB_ENV };

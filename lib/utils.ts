/**
 * ContractGuard - 通用工具函数
 * 功能：文本提取、文件处理、格式化、验证
 */

// ============================================================
// 文本提取函数
// ============================================================

/**
 * 从 Buffer 中提取文本内容
 * 支持：PDF、DOCX、TXT 格式
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: string
): Promise<{ text: string; pageCount: number }> {
  const mimeType = fileType.toLowerCase();

  if (mimeType.includes('pdf') || mimeType === 'application/pdf') {
    return extractFromPdf(buffer);
  }

  if (
    mimeType.includes('docx') ||
    mimeType.includes('word') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractFromDocx(buffer);
  }

  if (mimeType.includes('text') || mimeType === 'text/plain') {
    return extractFromTxt(buffer);
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

/**
 * 从 PDF Buffer 提取文本
 */
async function extractFromPdf(
  buffer: Buffer
): Promise<{ text: string; pageCount: number }> {
  try {
    // 动态导入 pdf-parse（避免 Edge runtime 问题）
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);

    return {
      text: data.text || '',
      pageCount: data.numpages || 0,
    };
  } catch (error) {
    console.error('[Utils] PDF extraction error:', error);
    throw new Error(
      'Failed to extract text from PDF. The file may be encrypted, scanned, or corrupted.'
    );
  }
}

/**
 * 从 DOCX Buffer 提取文本
 */
async function extractFromDocx(
  buffer: Buffer
): Promise<{ text: string; pageCount: number }> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });

    // DOCX 没有直接的页数概念，估算
    const estimatedPages = Math.ceil(result.value.length / 3000);

    return {
      text: result.value || '',
      pageCount: estimatedPages,
    };
  } catch (error) {
    console.error('[Utils] DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX file.');
  }
}

/**
 * 从 TXT Buffer 提取文本
 */
async function extractFromTxt(
  buffer: Buffer
): Promise<{ text: string; pageCount: number }> {
  const text = buffer.toString('utf-8');
  const estimatedPages = Math.ceil(text.length / 3000);

  return {
    text,
    pageCount: estimatedPages,
  };
}

// ============================================================
// 文件处理函数
// ============================================================

/** 允许的文件类型 */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

/** 允许的文件扩展名 */
export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

/** 默认最大文件大小 (20MB) */
export const DEFAULT_MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * 验证文件类型是否支持
 */
export function isValidFileType(fileType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(fileType) || 
    ALLOWED_EXTENSIONS.some(ext => fileType.toLowerCase().endsWith(ext));
}

/**
 * 验证文件大小
 */
export function isValidFileSize(
  fileSize: number,
  maxSize: number = DEFAULT_MAX_FILE_SIZE
): boolean {
  return fileSize <= maxSize;
}

/**
 * 生成唯一文件名
 */
export function generateFileName(userId: string, originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'pdf';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${timestamp}-${random}.${ext}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================================
// 格式化函数
// ============================================================

/**
 * 格式化日期
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * 格式化日期时间
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 获取相对时间
 */
export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ============================================================
// 风险评分相关
// ============================================================

/**
 * 获取风险等级标签
 */
export function getRiskLevelLabel(score: number): 'Low Risk' | 'Medium Risk' | 'High Risk' {
  if (score <= 3) return 'Low Risk';
  if (score <= 6) return 'Medium Risk';
  return 'High Risk';
}

/**
 * 获取风险等级颜色
 */
export function getRiskColor(score: number): string {
  if (score <= 3) return 'text-green-600 bg-green-50';
  if (score <= 6) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

/**
 * 获取风险等级圆环颜色
 */
export function getRiskRingColor(score: number): string {
  if (score <= 3) return '#22c55e';
  if (score <= 6) return '#f59e0b';
  return '#ef4444';
}

/**
 * 获取风险等级对应的图标
 */
export function getRiskIcon(level: string): string {
  switch (level) {
    case 'high':
      return '🔴';
    case 'medium':
      return '🟡';
    case 'low':
      return '🟢';
    default:
      return '🔵';
  }
}

// ============================================================
// 验证函数
// ============================================================

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证 UUID 格式
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// ============================================================
// URL 和路径
// ============================================================

/**
 * 获取 Supabase Storage 公共 URL
 */
export function getPublicFileUrl(bucketPath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return `${supabaseUrl}/storage/v1/object/public/contracts/${bucketPath}`;
}

/**
 * 获取 Supabase Storage 签名 URL（私密文件）
 */
export async function getSignedFileUrl(
  bucketPath: string,
  expiresIn = 3600
): Promise<string> {
  const { supabaseAdmin } = await import('./db');
  const { data } = await supabaseAdmin.storage
    .from('contracts')
    .createSignedUrl(bucketPath, expiresIn);

  if (!data?.signedUrl) {
    throw new Error('Failed to generate signed URL');
  }

  return data.signedUrl;
}

// ============================================================
// 错误处理
// ============================================================

/**
 * 统一错误响应格式
 */
export function apiError(message: string, code: string, status = 400): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * 统一成功响应格式
 */
export function apiSuccess(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ============================================================
// 截断和清理
// ============================================================

/**
 * 截断文本到指定长度
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '...';
}

/**
 * 清理文本（移除多余空白）
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

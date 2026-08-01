/**
 * ContractGuard - 文件上传 API
 * 功能：接收合同文件、验证、存储到Supabase、创建数据库记录
 * 路由：POST /api/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/db';
import { extractTextFromBuffer, generateFileName, isValidFileType, isValidFileSize } from '@/lib/utils';
import { createContract, updateContractStatus, checkContractLimit } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // 认证检查（使用 NextAuth session）
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 检查合约限制
    const withinLimit = await checkContractLimit(userId);
    if (!withinLimit) {
      return NextResponse.json(
        {
          error: 'Contract limit reached',
          code: 'LIMIT_REACHED',
          details: 'You have reached your monthly contract limit. Please upgrade your plan.',
        },
        { status: 403 }
      );
    }

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', code: 'NO_FILE' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!isValidFileType(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Please upload PDF, DOCX, or TXT.`,
          code: 'INVALID_TYPE',
        },
        { status: 400 }
      );
    }

    // 验证文件大小
    const maxSizeMB = Number(process.env.UPLOAD_MAX_SIZE_MB || 20);
    if (!isValidFileSize(file.size, maxSizeMB * 1024 * 1024)) {
      return NextResponse.json(
        {
          error: `File size exceeds ${maxSizeMB}MB limit.`,
          code: 'FILE_TOO_LARGE',
        },
        { status: 400 }
      );
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 生成唯一文件名
    const storagePath = generateFileName(userId, file.name);

    // 上传到 Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('contracts')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload] Storage error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage', code: 'UPLOAD_FAILED' },
        { status: 500 }
      );
    }

    // 获取文件URL
    const { data: urlData } = await supabaseAdmin.storage
      .from('contracts')
      .createSignedUrl(storagePath, 3600);

    const fileUrl = urlData?.signedUrl || storagePath;

    // 创建数据库记录
    const contract = await createContract({
      userId,
      fileName: file.name,
      fileUrl: storagePath,
      fileSize: file.size,
      fileType: file.type,
    });

    // 异步提取文本并触发AI审阅（后台处理）
    triggerAsyncReview(contract.id, buffer, file.type).catch((err) => {
      console.error('[Upload] Async review trigger error:', err);
    });

    return NextResponse.json({
      success: true,
      contractId: contract.id,
      fileUrl,
      message: 'File uploaded successfully. Review is being processed.',
    });
  } catch (error) {
    console.error('[Upload] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * 异步触发AI审阅（不阻塞响应）
 */
async function triggerAsyncReview(contractId: string, buffer: Buffer, fileType: string) {
  try {
    // 更新状态为处理中
    await updateContractStatus(contractId, 'processing');

    // 提取文本
    const { text, pageCount } = await extractTextFromBuffer(buffer, fileType);

    // 调用内部审阅API
    const reviewUrl = new URL('/api/review', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const response = await fetch(reviewUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractId,
        contractText: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Review API returned ${response.status}`);
    }

    console.log(`[Upload] Review completed for contract ${contractId}`);
  } catch (error) {
    console.error(`[Upload] Review failed for contract ${contractId}:`, error);
    await updateContractStatus(contractId, 'failed');
  }
}

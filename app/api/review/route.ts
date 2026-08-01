/**
 * ContractGuard - AI审阅 API
 * 功能：接收合同文本、调用AI分析、存储结果到数据库
 * 路由：POST /api/review (触发审阅) | GET /api/review?contractId=xxx (获取审阅结果)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeContract } from '@/lib/ai-review';
import { createReview, updateContractStatus, getReviewByContractId, getContractById, supabaseAdmin } from '@/lib/db';
import { extractTextFromBuffer } from '@/lib/utils';

/** POST: 触发合同审阅 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { contractId, contractText, industry } = body;

    if (!contractId || !contractText) {
      return NextResponse.json(
        { error: 'contractId and contractText are required', code: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    if (contractText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Contract text is too short for meaningful analysis', code: 'TEXT_TOO_SHORT' },
        { status: 400 }
      );
    }

    console.log(`[Review API] Starting review for contract: ${contractId}`);
    console.log(`[Review API] Text length: ${contractText.length} chars`);

    // 调用AI分析
    const reviewResult = await analyzeContract(contractText, industry);

    // 关联合同ID
    reviewResult.contractId = contractId;

    // 存储审阅结果
    await createReview({
      contractId,
      summary: reviewResult.summary,
      overallScore: reviewResult.overallScore,
      risks: reviewResult.risks,
      recommendations: reviewResult.recommendations,
      missingClauses: reviewResult.missingClauses,
      negotiationTips: reviewResult.negotiationTips,
      industryCompliance: reviewResult.industryCompliance,
      riskDistribution: reviewResult.riskDistribution,
    });

    // 更新合同状态和评分
    await updateContractStatus(contractId, 'completed', reviewResult.overallScore);

    const processingTimeMs = Date.now() - startTime;

    console.log(`[Review API] Review completed in ${processingTimeMs}ms, score: ${reviewResult.overallScore}`);

    return NextResponse.json({
      success: true,
      review: reviewResult,
      processingTimeMs,
    });
  } catch (error) {
    console.error('[Review API] Error:', error);

    // 尝试更新合同状态为失败
    try {
      const body = await request.clone().json().catch(() => null);
      if (body?.contractId) {
        await updateContractStatus(body.contractId, 'failed');
      }
    } catch {}

    const message = error instanceof Error ? error.message : 'AI review failed';
    return NextResponse.json(
      { error: message, code: 'REVIEW_FAILED' },
      { status: 500 }
    );
  }
}

/** GET: 获取合同的审阅结果 */
export async function GET(request: NextRequest) {
  try {
    // 认证检查（NextAuth session）
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const contractId = url.searchParams.get('contractId');

    if (!contractId) {
      return NextResponse.json(
        { error: 'contractId is required', code: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    // 获取合同信息
    const contract = await getContractById(contractId);

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 验证所有权
    if (contract.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 获取合同原文（从 Storage 下载并提取文本）
    let contractText = '';
    try {
      if (contract.file_url) {
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
          .from('contracts')
          .download(contract.file_url);

        if (!downloadError && fileData) {
          const buffer = Buffer.from(await fileData.arrayBuffer());
          const extracted = await extractTextFromBuffer(buffer, contract.file_type || '');
          contractText = extracted.text;
        } else if (downloadError) {
          console.error('[Review GET] Storage download error:', downloadError);
        }
      }
    } catch (textError) {
      console.error('[Review GET] Failed to extract contract text:', textError);
    }

    // 获取审阅结果
    const review = await getReviewByContractId(contractId);

    if (!review) {
      return NextResponse.json({
        contractName: contract.file_name,
        contractText,
        review: null,
        status: contract.status,
        message: 'Review is still being processed. Please check back shortly.',
      });
    }

    return NextResponse.json({
      contractName: contract.file_name,
      contractText,
      review: {
        contractId: review.contract_id,
        summary: review.summary,
        overallScore: review.overall_score,
        risks: review.risks,
        recommendations: review.recommendations,
        missingClauses: review.missing_clauses,
        negotiationTips: review.negotiation_tips,
        industryCompliance: review.industry_compliance,
        riskDistribution: review.risk_distribution,
      },
      status: 'completed',
    });
  } catch (error) {
    console.error('[Review GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review', code: 'FETCH_FAILED' },
      { status: 500 }
    );
  }
}

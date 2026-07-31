/**
 * ContractGuard - 定价组件
 * 功能：三档定价展示、Stripe Checkout 集成
 */

'use client';

import { useState } from 'react';
import type { PlanType } from '@/types';

interface PricingTableProps {
  currentPlan?: PlanType;
  onSelectPlan?: (plan: PlanType) => void;
}

interface PlanInfo {
  name: string;
  price: number;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  highlighted: boolean;
  cta: string;
}

const plans: Record<PlanType, PlanInfo> = {
  free: {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Try ContractGuard with 1 free review',
    features: [
      { text: '1 contract review', included: true },
      { text: 'Risk scoring & highlights', included: true },
      { text: 'Basic clause analysis', included: true },
      { text: 'PDF & DOCX support', included: true },
      { text: 'Suggested revisions', included: false },
      { text: 'Negotiation playbook', included: false },
      { text: 'Industry compliance', included: false },
      { text: 'Priority support', included: false },
    ],
    highlighted: false,
    cta: 'Get Started Free',
  },
  starter: {
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'For solo freelancers and independent contractors',
    features: [
      { text: '5 contracts/month', included: true },
      { text: 'Risk scoring & highlights', included: true },
      { text: 'Basic clause analysis', included: true },
      { text: 'PDF & DOCX support', included: true },
      { text: 'Email support', included: true },
      { text: 'Suggested revisions', included: false },
      { text: 'Negotiation playbook', included: false },
      { text: 'Industry compliance', included: false },
    ],
    highlighted: false,
    cta: 'Start Free Trial',
  },
  pro: {
    name: 'Pro',
    price: 79,
    period: 'month',
    description: 'For growing businesses and consultants',
    features: [
      { text: '20 contracts/month', included: true },
      { text: 'Everything in Starter', included: true },
      { text: 'Suggested revisions', included: true },
      { text: 'Negotiation playbook', included: true },
      { text: 'Industry compliance check', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: false },
      { text: 'Custom templates', included: false },
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  business: {
    name: 'Business',
    price: 199,
    period: 'month',
    description: 'For teams, agencies, and high-volume users',
    features: [
      { text: 'Unlimited contracts', included: true },
      { text: 'Everything in Pro', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Custom clause templates', included: true },
      { text: 'API access', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SSO / SAML', included: true },
      { text: 'Custom integrations', included: true },
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
};

export default function PricingTable({ currentPlan, onSelectPlan }: PricingTableProps) {
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

  const handleSelectPlan = async (plan: PlanType) => {
    if (plan === 'free') return;

    setLoadingPlan(plan);

    try {
      // 调用 Stripe Checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoadingPlan(null);
      // 回调让父组件处理
      if (onSelectPlan) {
        onSelectPlan(plan);
      }
    }
  };

  const displayPlans: PlanType[] = ['starter', 'pro', 'business'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {displayPlans.map((planKey) => {
        const plan = plans[planKey];
        const isCurrentPlan = currentPlan === planKey;
        const isLoading = loadingPlan === planKey;

        return (
          <div
            key={planKey}
            className={`
              relative rounded-2xl p-6 border transition-all
              ${
                plan.highlighted
                  ? 'border-brand-600 shadow-lg shadow-brand-100 transform md:-translate-y-2'
                  : 'border-gray-200 hover:shadow-md'
              }
              ${isCurrentPlan ? 'ring-2 ring-brand-500' : ''}
              bg-white
            `}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                MOST POPULAR
              </div>
            )}

            {/* Plan Header */}
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{plan.description}</p>

            {/* Price */}
            <div className="mt-5 mb-6">
              <span className="text-4xl font-extrabold text-gray-900">
                ${plan.price}
              </span>
              <span className="text-sm text-gray-500">
                /{plan.period}
              </span>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleSelectPlan(planKey)}
              disabled={isLoading || isCurrentPlan}
              className={`
                w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all mb-6
                ${
                  plan.highlighted
                    ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md'
                    : 'bg-brand-50 text-brand-600 hover:bg-brand-100 border border-brand-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </span>
              ) : isCurrentPlan ? (
                'Current Plan'
              ) : (
                plan.cta
              )}
            </button>

            {/* Features List */}
            <ul className="space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  {feature.included ? (
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* 7-day trial notice */}
            <p className="text-xs text-center text-gray-400 mt-6">
              7-day free trial · Cancel anytime
            </p>
          </div>
        );
      })}
    </div>
  );
}

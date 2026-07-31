/**
 * ContractGuard - 导航栏组件
 * 功能：顶部导航、用户菜单、响应式移动菜单
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isLoggedIn = !!user;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">ContractGuard</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
            >
              Upload Contract
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">
                    {user?.name || 'User'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <Link
                        href="/api/auth/signout"
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Sign Out
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/pricing"
                  className="btn-primary text-sm !px-4 !py-2"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/dashboard"
              className="block text-sm font-medium text-gray-600 hover:text-brand-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="block text-sm font-medium text-gray-600 hover:text-brand-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Upload Contract
            </Link>
            <Link
              href="/pricing"
              className="block text-sm font-medium text-gray-600 hover:text-brand-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="border-t border-gray-100 pt-3 mt-3">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium">{user?.name || 'User'}</span>
                  </div>
                  <Link
                    href="/api/auth/signout"
                    className="block w-full text-center py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Out
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block w-full text-center py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/pricing"
                    className="block w-full text-center py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

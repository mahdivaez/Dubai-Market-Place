"use client"

import Link from "next/link"

interface EmptyStateProps {
  error: string | null
}

export default function EmptyState({ error }: EmptyStateProps) {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="text-center py-20">
      <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 max-w-lg mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <span className="text-white text-3xl">📊</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {error ? 'مشکل اتصال به دیتابیس' : 'مشاوری یافت نشد'}
        </h3>
        <p className="text-gray-500 mb-8 text-lg leading-relaxed">
          {error 
            ? 'لطفاً اتصال دیتابیس MySQL خود را بررسی کنید و اطمینان حاصل کنید که جداول ایجاد شده‌اند.' 
            : 'در حال حاضر هیچ مشاوری در دیتابیس موجود نیست. لطفاً چند دقیقه صبر کنید تا داده‌های نمونه بارگذاری شوند.'
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/api/test-db" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-lg"
          >
            تست اتصال دیتابیس
          </Link>
          <Link 
            href="/api/agents" 
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold shadow-lg"
          >
            بررسی API مشاوران
          </Link>
          <button 
            onClick={handleReload}
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-bold shadow-lg"
          >
            بارگذاری مجدد
          </button>
        </div>
      </div>
    </div>
  )
}
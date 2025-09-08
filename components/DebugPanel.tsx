"use client"

import Link from "next/link"
import { getImagePath } from "@/lib/utils/imageUtils"

interface DebugPanelProps {
  error: string | null
  agents: any[]
  showInProduction?: boolean
}

export default function DebugPanel({ error, agents, showInProduction = false }: DebugPanelProps) {
  // Only show in development or when there are issues or explicitly requested
  const shouldShow = process.env.NODE_ENV === 'production' || error || agents.length === 0 || showInProduction

  if (!shouldShow) return null

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
      <h3 className="text-lg font-bold text-blue-900 mb-3">وضعیت سیستم</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-white rounded-xl p-4 border border-blue-100">
          <p className="font-semibold text-blue-800">وضعیت دیتابیس</p>
          <p className={`font-medium ${error ? 'text-red-600' : 'text-green-600'}`}>
            {error ? 'قطع شده' : 'متصل'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-100">
          <p className="font-semibold text-blue-800">مشاوران یافت شده</p>
          <p className="text-blue-600">{agents?.length || 0} مشاور</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-100">
          <p className="font-semibold text-blue-800">محیط</p>
          <p className="text-blue-600">{process.env.NODE_ENV === 'production' ? 'توسعه' : 'تولید'}</p>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-800 font-medium">خطا: {error}</p>
        </div>
      )}
      
      {agents && agents.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
          <p className="text-green-800 font-medium">
            مشاور نمونه: {agents[0]?.name} ({agents[0]?.id})
          </p>
          {agents[0]?.profileImage && (
            <p className="text-xs text-green-600 mt-1">
              تصویر پروفایل: {agents[0].profileImage} → {getImagePath(agents[0].profileImage)}
            </p>
          )}
        </div>
      )}
      
      {/* API Test Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link 
          href="/api/test-db" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
        >
          تست دیتابیس
        </Link>
        <Link 
          href="/api/agents" 
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
        >
          API مشاوران
        </Link>
        <button 
          onClick={handleReload}
          className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-xs font-medium"
        >
          بارگذاری مجدد
        </button>
      </div>
    </div>
  )
}
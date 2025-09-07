import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">۴۰۴</h1>
        <p className="text-gray-600 mb-8">صفحه یافت نشد</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
          بازگشت به خانه
        </Link>
      </div>
    </div>
  )
}

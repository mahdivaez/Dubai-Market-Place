import { getAllAgents } from "@/lib/data"
import Link from "next/link"
import ClientOnly from "@/components/ClientOnly"
import ImageWithFallback from "@/components/ImageWithFallback"
import { getImagePath, getInitials } from "@/lib/utils/imageUtils"
import DebugPanel from "@/components/DebugPanel"
import EmptyState from "@/components/EmptyState"

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let agents: any[] = [];
  let error = null;
  
  try {
    console.log('Homepage: Starting to fetch agents...');
    agents = await getAllAgents();
    console.log('Homepage: Received agents:', agents?.length || 0);
    
    if (agents && agents.length > 0) {
      console.log('Homepage: First agent sample:', {
        id: agents[0]?.id,
        name: agents[0]?.name,
        profileImage: agents[0]?.profileImage,
        instagram: agents[0]?.instagram
      });
    }
    
  } catch (err) {
    console.error('Homepage: Error fetching agents:', err);
    agents = [];
    error = 'Failed to load agents. Please check database connection.';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between" dir="rtl">
            {/* Premium Logo */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">د</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  دبی الیت
                </h1>
                <p className="text-sm text-amber-600 font-medium">املاک لوکس</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6 space-x-reverse">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-amber-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-amber-50"
              >
                خانه
              </Link>
              <Link 
                href="/api/test-db" 
                className="text-gray-700 hover:text-amber-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-amber-50"
              >
                تست دیتابیس
              </Link>
              <Link 
                href="/api/agents" 
                className="text-gray-700 hover:text-amber-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-amber-50"
              >
                API مشاوران
              </Link>
              <Link 
                href="#contact" 
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-bold shadow-lg"
              >
                تماس
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12" dir="rtl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            بازار املاک دبی الیت
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            با بهترین متخصصان املاک دبی ارتباط برقرار کنید و خانه رویایی خود را در پویاترین شهر جهان کشف کنید
          </p>
        </div>

        {/* Debug Info - Show in development and when there are issues */}
        <ClientOnly>
          <DebugPanel error={error} agents={agents} />
        </ClientOnly>

        {/* Agent Cards Grid */}
        {agents && agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => (
              <Link key={agent.id} href={`/agents/${agent.id}`}>
                <div className="group bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-amber-200 transform hover:-translate-y-2">
                  {/* Profile Image */}
                  <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl mx-auto mb-6 relative overflow-hidden flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    {agent.profileImage ? (
                      <ImageWithFallback
                        src={getImagePath(agent.profileImage)}
                        alt={agent.name || "Agent"}
                        fill
                        className="object-cover"
                        fallbackSrc="/placeholder-user.jpg"
                      />
                    ) : (
                      <span className="text-white font-bold text-3xl">
                        {getInitials(agent.name || "Agent")}
                      </span>
                    )}
                  </div>

                  {/* Agent Name */}
                  <h3 className="text-2xl font-bold text-gray-900 text-center mb-3 group-hover:text-amber-600 transition-colors">
                    {agent.name || 'مشاور ناشناس'}
                  </h3>

                  {/* Agent Details */}
                  <div className="text-center space-y-2 mb-6">
                    <p className="text-gray-600 font-medium">متخصص املاک</p>
                    <p className="text-gray-500 text-sm">{agent.address || 'دبی، امارات'}</p>
                  </div>

                  {/* Bio Preview */}
                  {agent.bio && (
                    <p className="text-gray-600 text-center text-sm leading-relaxed mb-6 line-clamp-3">
                      {agent.bio}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="pt-6 border-t border-gray-100 space-y-2">
                    {agent.instagram && (
                      <p className="text-xs text-amber-600 text-center font-medium">
                        @{agent.instagram}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 text-center">
                      تماس از طریق اینستاگرام
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className="mt-6 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-amber-600 font-bold text-sm">مشاهده پروفایل ←</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState error={error} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-24">
        <div className="max-w-7xl mx-auto px-6 py-16" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 space-x-reverse mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">د</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">دبی الیت</h3>
                  <p className="text-amber-400 font-medium">املاک لوکس</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                اتصال مشتریان باذوق با منحصر به فردترین املاک دبی از طریق شبکه متخصصان املاک نخبه ما.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6 text-amber-400">لینک‌های سریع</h4>
              <div className="space-y-3">
                <Link href="/" className="block text-gray-300 hover:text-white transition-colors text-lg">خانه</Link>
                <Link href="#" className="block text-gray-300 hover:text-white transition-colors text-lg">املاک</Link>
                <Link href="#" className="block text-gray-300 hover:text-white transition-colors text-lg">مشاوران</Link>
                <Link href="#" className="block text-gray-300 hover:text-white transition-colors text-lg">درباره ما</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6 text-amber-400">قانونی</h4>
              <div className="space-y-3">
                <Link href="#" className="block text-gray-300 hover:text-white transition-colors text-lg">سیاست حفظ حریم خصوصی</Link>
                <Link href="#" className="block text-gray-300 hover:text-white transition-colors text-lg">شرایط خدمات</Link>
                <Link href="#" className="block text-gray-300 hover:text-white transition-colors text-lg">تماس</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-lg">&copy; ۲۰۲۴ بازار املاک دبی الیت. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
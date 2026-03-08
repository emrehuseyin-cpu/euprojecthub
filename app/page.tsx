import React from 'react';
import { 
  BarChart3, 
  FolderKanban, 
  Users, 
  Activity, 
  Wallet, 
  GraduationCap, 
  FileText, 
  Settings,
  Bell,
  Search,
  MoreVertical
} from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center justify-center border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            <span className="text-blue-500">EU</span>ProjectHub
          </h1>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg transition-colors">
            <BarChart3 size={20} />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <FolderKanban size={20} />
            <span className="font-medium">Projeler</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Users size={20} />
            <span className="font-medium">Ortaklar</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Activity size={20} />
            <span className="font-medium">Faaliyetler</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Wallet size={20} />
            <span className="font-medium">Bütçe</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <GraduationCap size={20} />
            <span className="font-medium">LMS</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <FileText size={20} />
            <span className="font-medium">Raporlar</span>
          </a>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={20} />
            <span className="font-medium">Ayarlar</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 hidden md:flex">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Proje veya ortak ara..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6">
            <div className="md:hidden">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 border border-slate-200 p-2 rounded-lg">
                <span className="text-blue-600">EU</span>PH
              </h1>
            </div>
          
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white">
                  EY
                </div>
                <div className="hidden sm:block text-sm">
                  <p className="font-semibold text-gray-900">Emre Yiğit</p>
                  <p className="text-gray-500 text-xs">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Ana Sayfa</h2>
                <p className="text-gray-500 mt-1">Platform özetinize ve güncel proje verilerine buradan ulaşabilirsiniz.</p>
              </div>
              <button className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20">
                <span>Yeni Proje</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Aktif Projeler</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">12</h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <FolderKanban size={24} />
                  </div>
                </div>
                <div className="mt-auto flex items-center text-sm">
                  <span className="text-emerald-500 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +2
                  </span>
                  <span className="text-gray-400 ml-2">geçen aydan</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Toplam Bütçe</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">€2.4M</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Wallet size={24} />
                  </div>
                </div>
                <div className="mt-auto flex items-center text-sm">
                  <span className="text-emerald-500 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +15%
                  </span>
                  <span className="text-gray-400 ml-2">geçen yıla göre</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Aktif Ortaklar</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">48</h3>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <Users size={24} />
                  </div>
                </div>
                <div className="mt-auto flex items-center text-sm">
                  <span className="text-emerald-500 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +5
                  </span>
                  <span className="text-gray-400 ml-2">yeni katılım</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tamamlanan Faaliyetler</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">156</h3>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                    <Activity size={24} />
                  </div>
                </div>
                <div className="mt-auto flex items-center text-sm">
                  <span className="text-gray-500 font-medium">89%</span>
                  <span className="text-gray-400 ml-2">tamamlanma oranı</span>
                </div>
              </div>
            </div>

            {/* Project List Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Son Projeler</h3>
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Tümünü Gör</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">Proje Adı</th>
                      <th className="px-6 py-4 font-medium">Program</th>
                      <th className="px-6 py-4 font-medium">Başlangıç</th>
                      <th className="px-6 py-4 font-medium">Bütçe</th>
                      <th className="px-6 py-4 font-medium">Durum</th>
                      <th className="px-6 py-4 text-right font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">GreenFuture EU</div>
                        <div className="text-gray-500 text-xs mt-0.5">Erasmus+ KA220</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">Erasmus+</td>
                      <td className="px-6 py-4 text-gray-600">12 Oca 2026</td>
                      <td className="px-6 py-4 font-medium text-gray-900">€250,000</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">Digital Youth Hub</div>
                        <div className="text-gray-500 text-xs mt-0.5">Erasmus+ KA210</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">Erasmus+</td>
                      <td className="px-6 py-4 text-gray-600">05 Şub 2026</td>
                      <td className="px-6 py-4 font-medium text-gray-900">€60,000</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">Tech Women Network</div>
                        <div className="text-gray-500 text-xs mt-0.5">ESC30 Dayanışma</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">ESC</td>
                      <td className="px-6 py-4 text-gray-600">20 Ara 2025</td>
                      <td className="px-6 py-4 font-medium text-gray-900">€45,000</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          İnceleniyor
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">Rural Development Initiative</div>
                        <div className="text-gray-500 text-xs mt-0.5">Horizon Europe</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">Horizon EU</td>
                      <td className="px-6 py-4 text-gray-600">10 Kas 2025</td>
                      <td className="px-6 py-4 font-medium text-gray-900">€1,200,000</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Tamamlandı
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

export default function LMSLoading() {
  return (
    <div className="flex h-screen bg-gray-50 animate-pulse">
      <div className="w-64 bg-white border-r border-gray-200 hidden lg:block"></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-white border-b border-gray-200 shrink-0"></div>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-100 rounded-lg"></div>
                <div className="h-4 w-96 bg-gray-50 rounded-lg"></div>
              </div>
              <div className="h-10 w-32 bg-blue-50 rounded-lg"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 h-64 space-y-4">
                  <div className="flex justify-between">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                    <div className="w-16 h-5 bg-gray-50 rounded"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-gray-100 rounded"></div>
                  <div className="h-4 w-full bg-gray-50 rounded"></div>
                  <div className="pt-4 border-t border-gray-50 mt-auto space-y-3">
                    <div className="flex justify-between">
                      <div className="h-3 w-20 bg-gray-100 rounded"></div>
                      <div className="h-3 w-12 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full"></div>
                    <div className="h-8 w-full bg-blue-50/50 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

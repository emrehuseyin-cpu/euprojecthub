'use client';

export default function BudgetLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-gray-100 rounded-lg"></div>
          <div className="h-4 w-56 bg-gray-50 rounded-lg"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
            <div className="h-6 w-32 bg-gray-100 rounded-lg mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-100 rounded-lg"></div>
                      <div className="h-3 w-48 bg-gray-50 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
            <div className="h-6 w-24 bg-gray-100 rounded-lg mb-6"></div>
            <div className="flex justify-center py-8">
              <div className="w-48 h-48 rounded-full border-8 border-gray-50 animate-pulse"></div>
            </div>
            <div className="space-y-2 mt-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 w-20 bg-gray-50 rounded-lg"></div>
                  <div className="h-3 w-12 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

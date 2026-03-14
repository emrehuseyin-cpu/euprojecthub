'use client';

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-100 rounded-lg"></div>
          <div className="h-4 w-64 bg-gray-50 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-indigo-50 rounded-xl"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 bg-gray-100 rounded-xl"></div>
              <div className="h-6 w-20 bg-emerald-50 rounded-full"></div>
            </div>
            <div className="h-6 w-3/4 bg-gray-100 rounded-lg mb-2"></div>
            <div className="h-4 w-full bg-gray-50 rounded-lg mb-1"></div>
            <div className="h-4 w-2/3 bg-gray-50 rounded-lg mb-6"></div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <div className="h-4 w-24 bg-gray-100 rounded-lg"></div>
              <div className="h-4 w-16 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

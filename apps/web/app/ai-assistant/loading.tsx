'use client';

export default function AILoading() {
  return (
    <div className="flex h-screen bg-gray-50 animate-pulse">
      <div className="w-64 bg-white border-r border-gray-200 hidden lg:block"></div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b border-gray-200"></div>
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl h-full border border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-100 rounded"></div>
                  <div className="h-3 w-48 bg-gray-50 rounded"></div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 space-y-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                <div className="h-20 w-3/4 bg-gray-50 rounded-2xl"></div>
              </div>
              <div className="flex flex-row-reverse gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-12 w-1/2 bg-indigo-50 rounded-2xl"></div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100">
              <div className="h-12 w-full bg-gray-50 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

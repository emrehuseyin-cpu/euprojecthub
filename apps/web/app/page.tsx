import { createSupabaseServerClient } from './lib/supabase-server';
import { getRecentPosts } from './lib/wordpress';
import DashboardClient from './DashboardClient';
import { cache, Suspense } from 'react';

// Cached data fetching functions to prevent duplicate requests in the same render cycle
const getDashboardStats = cache(async () => {
  const supabase = await createSupabaseServerClient();
  
  const [activeProjectsRes, projectsDataRes, activePartnersRes, completedActivitiesRes] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Aktif'),
    supabase.from('projects').select('budget'),
    supabase.from('partners').select('*', { count: 'exact', head: true }),
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('status', 'Tamamlandı')
  ]);

  const totalBudget = projectsDataRes.data?.reduce((sum: number, p: any) => sum + (Number(p.budget) || 0), 0) || 0;

  return {
    activeProjects: activeProjectsRes.count || 0,
    totalBudget,
    activePartners: activePartnersRes.count || 0,
    completedActivities: completedActivitiesRes.count || 0
  };
});

const getRecentDashboardData = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().split('T')[0];

  const [projectsRes, activitiesRes, participantsRes, budgetItemsRes, newsRes] = await Promise.all([
    supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('activities').select('*, project:projects(name)').gte('start_date', today).order('start_date', { ascending: true }).limit(3),
    supabase.from('participants').select('*, project:projects(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('budget_items').select('*'),
    getRecentPosts(3).catch(() => [])
  ]);

  const bItems = budgetItemsRes.data || [];
  const groupedBudget = bItems.reduce((acc: any, curr: any) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {});

  return {
    projects: projectsRes.data || [],
    activities: activitiesRes.data || [],
    participants: participantsRes.data || [],
    budget: Object.keys(groupedBudget).map(k => ({ name: k, value: groupedBudget[k] })),
    news: newsRes || []
  };
});

export default async function DashboardPage() {
  // Fetch data in parallel on the server
  // This improves performance significantly over client-side fetching
  const [stats, data] = await Promise.all([
    getDashboardStats(),
    getRecentDashboardData()
  ]);

  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
        <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-200 rounded-lg animate-bounce"></div>
            </div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <DashboardClient 
        initialStats={stats}
        initialProjects={data.projects}
        initialActivities={data.activities}
        initialParticipants={data.participants}
        initialBudget={data.budget}
        initialNews={data.news}
      />
    </Suspense>
  );
}

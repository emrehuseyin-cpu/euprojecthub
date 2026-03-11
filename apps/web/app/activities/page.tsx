"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Activity,
    Plus,
    Search,
    Filter,
    Calendar as CalendarIcon,
    List as ListIcon,
    MapPin,
    Users,
    Clock,
    CheckCircle2,
    FolderKanban,
    Loader2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO
} from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        async function fetchActivities() {
            try {
                const { data, error } = await supabase
                    .from('activities')
                    .select(`
            *,
            project:projects(name)
          `)
                    .order('start_date', { ascending: true });

                if (error) {
                    console.error('Error fetching activities:', error);
                } else if (data) {
                    setActivities(data.map(a => ({
                        ...a,
                        projectName: a.project ? a.project.name : 'Bağımsız',
                        parsedStartDate: parseISO(a.start_date),
                        parsedEndDate: parseISO(a.end_date)
                    })));
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchActivities();
    }, []);

    const statuses = ['Tümü', 'Planlandı', 'Devam Ediyor', 'Tamamlandı'];

    const filteredActivities = activities.filter(activity => {
        const matchesFilter = filterStatus === 'Tümü' || activity.status === filterStatus;
        const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.projectName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Devam Ediyor': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Planlandı': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Tamamlandı': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Devam Ediyor': return <Clock className="w-3.5 h-3.5 mr-1" />;
            case 'Planlandı': return <CalendarIcon className="w-3.5 h-3.5 mr-1" />;
            case 'Tamamlandı': return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
            default: return null;
        }
    };

    // Calendar Logic
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;

                // Find activities for this day
                const dayActivities = filteredActivities.filter(a => isSameDay(a.parsedStartDate, cloneDay) || (cloneDay >= a.parsedStartDate && cloneDay <= a.parsedEndDate));

                days.push(
                    <div
                        className={`min-h-[100px] border border-gray-100 p-2 flex flex-col ${!isSameMonth(day, monthStart)
                            ? 'bg-gray-50/50 text-gray-400'
                            : isSameDay(day, new Date()) ? 'bg-blue-50/30' : 'bg-white'
                            }`}
                        key={day.toString()}
                    >
                        <div className={`text-right text-xs font-medium mb-1 ${isSameDay(day, new Date()) ? 'text-blue-600 bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center ml-auto' : 'text-gray-500'}`}>
                            {formattedDate}
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {dayActivities.map((act, idx) => (
                                <div key={`${act.id}-${idx}`} className={`text-[10px] px-1.5 py-1 rounded border leading-tight truncate ${getStatusColor(act.status)}`} title={`${act.title} - ${act.projectName}`}>
                                    {act.title}
                                </div>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return rows;
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Activity className="text-blue-600 w-6 h-6" />
                                    Faaliyetler ve Etkinlikler
                                </h2>
                                <p className="text-gray-500 mt-1">Projelerinizin aktivitelerini, toplantılarını ve kilometre taşlarını planlayın.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <ListIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('calendar')}
                                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <CalendarIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <Link
                                    href="/activities/new"
                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20"
                                >
                                    <Plus size={20} />
                                    <span className="hidden sm:inline">Yeni Faaliyet Planla</span>
                                    <span className="sm:hidden">Yeni</span>
                                </Link>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                                {statuses.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilterStatus(tab)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterStatus === tab
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Faaliyet veya proje ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                {viewMode === 'calendar' && (
                                    <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                                        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
                                        <span className="text-sm font-semibold px-2 min-w-[100px] text-center">{format(currentDate, 'MMMM yyyy', { locale: tr })}</span>
                                        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronRight className="w-5 h-5" /></button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Faaliyetler yükleniyor...</p>
                            </div>
                        ) : viewMode === 'list' ? (
                            <div className="space-y-4">
                                {filteredActivities.map((activity) => (
                                    <div key={activity.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 md:p-6 flex flex-col md:flex-row gap-6">
                                        {/* Left Date Column */}
                                        <div className="flex md:flex-col items-center justify-center md:items-end gap-3 md:gap-1 md:w-32 shrink-0 md:pr-6 md:border-r border-gray-100">
                                            <div className="text-3xl font-bold text-gray-900">{format(activity.parsedStartDate, 'dd')}</div>
                                            <div className="text-sm font-medium text-gray-500 uppercase">{format(activity.parsedStartDate, 'MMM yyyy', { locale: tr })}</div>
                                            {activity.parsedStartDate.getTime() !== activity.parsedEndDate.getTime() && (
                                                <div className="text-xs text-gray-400 mt-1 border-t pt-1 w-full text-center md:text-right">
                                                    Bitiş: {format(activity.parsedEndDate, 'dd MMM', { locale: tr })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Middle Content Column */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(activity.status)}`}>
                                                    {getStatusIcon(activity.status)}
                                                    {activity.status}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <FolderKanban className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium">{activity.projectName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span>{activity.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span>{activity.participant_count || 0} Katılımcı</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {filteredActivities.length === 0 && (
                                    <div className="py-16 flex flex-col items-center justify-center bg-white border border-dashed border-gray-300 rounded-xl">
                                        <CalendarIcon className="w-12 h-12 text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900">Faaliyet bulunamadı</h3>
                                        <p className="text-gray-500 mt-1">Belirlediğiniz kriterlere uygun faaliyet kaydı yok.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Calendar View
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                                        <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-0">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white">
                                    {renderCalendar()}
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}

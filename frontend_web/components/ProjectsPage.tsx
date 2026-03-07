'use client';

import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import Navigation from './Navigation';
import {
    Search,
    Video,
    Image as ImageIcon,
    Camera,
    Clock,
    CheckCircle2,
    XCircle,
    MoreVertical,
    FolderOpen,
    Grid,
    X
} from 'lucide-react';
import {DetectionTaskService} from "@/lib/service/detection_task";
import {Results} from "@/lib/api";
import {notification} from "@/utils/notification";

// Task Type Enum
enum TaskType {
    IMAGE = 0,
    CAP = 1,
    STREAM = 2,
    BATCH = 3
}

// Task Status Enum
enum TaskStatus {
    PENDING = 0,
    RUNNING = 1,
    FAILED = 2,
    COMPLETED = 3
}

interface Project {
    id: number;
    name: string;
    type: 'image' | 'cap' | 'stream' | 'batch';
    date: string;
    objects: number;
    classes: number;
    conf: number;
    status: 'pending' | 'running' | 'failed' | 'completed';
    thumbnail?: string;
}

export default function ProjectsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'running' | 'failed' | 'completed'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 6,
        total: 0,
        pages: 0,
    });
    const statusMap: Record<number, 'pending' | 'running' | 'failed' | 'completed'> = {
        [TaskStatus.PENDING]: 'pending',
        [TaskStatus.RUNNING]: 'running',
        [TaskStatus.FAILED]: 'failed',
        [TaskStatus.COMPLETED]: 'completed',
    };

    const typeMap: Record<number, 'image' | 'cap' | 'stream' | 'batch'> = {
        [TaskType.IMAGE]: 'image',
        [TaskType.CAP]: 'cap',
        [TaskType.STREAM]: 'stream',
        [TaskType.BATCH]: 'batch',
    };
    useEffect(() => {
        fetchProject();
    }, [pagination.page]);

    const fetchProject = () => {
        setLoading(true);
        DetectionTaskService.get_task_data(pagination.page, pagination.page_size).then((results) => {
            if (results.code === 200 && results.data?.records) {
                const mappedProjects: Project[] = results.data.records.map((record: Results) => {
                    let thumbnail: string | undefined;
                    try {
                        const paths = JSON.parse(record.output_path);
                        if (Array.isArray(paths) && paths.length > 0) {
                            thumbnail = paths[0];
                        } else if (typeof paths === 'string') {
                            thumbnail = paths;
                        }
                    } catch (e) {
                        if (record.output_path && !record.output_path.startsWith('[')) {
                            thumbnail = record.output_path;
                        }
                    }

                    const objects = record.details?.length || 0;
                    const classes = record.details ? [...new Set(record.details.map((d: any) => d.class_name))].length : 0;
                    return {
                        id: record.task_id,
                        name: record.task_name,
                        type: typeMap[record.task_type] || 'image',
                        date: record.create_time.split('T')[0],
                        objects,
                        classes,
                        conf: record.conf_threshold,
                        status: statusMap[record.task_status] || 'pending',
                        thumbnail,
                    };
                });
                setProjects(mappedProjects);

                setPagination({
                    page: results.data.current || 1,
                    page_size: pagination.page_size,
                    total: results.data.total || 0,
                    pages: results.data.pages || 1,
                });
            }
        }).catch((error) => {
            notification.error(error?.message);
        }).finally(() => {
            setLoading(false);
        });
    };

    const handlePageChange = (page: number) => {
        setPagination({...pagination, page: page});
    };

    const filteredProjects = projects.filter(project => {
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        const matchesSearch = searchQuery === '' || project.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });


    const ProjectCard = ({project, index}: { project: Project; index: number }) => {
        const statusConfig = {
            pending: {icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending'},
            running: {icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Running'},
            completed: {icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Completed'},
            failed: {icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Failed'}
        };

        const typeConfig = {
            image: {icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-50'},
            cap: {icon: Video, color: 'text-violet-500', bg: 'bg-violet-50'},
            stream: {icon: Camera, color: 'text-emerald-500', bg: 'bg-emerald-50'},
            batch: {icon: Video, color: 'text-orange-500', bg: 'bg-orange-50'}
        };

        const status = statusConfig[project.status as keyof typeof statusConfig];
        const type = typeConfig[project.type as keyof typeof typeConfig];
        const StatusIcon = status.icon;
        const TypeIcon = type.icon;

        return (
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.05}}
                className="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 hover:shadow-2xl transition-all"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2.5 rounded-xl ${type.bg}`}>
                                <TypeIcon className={type.color} size={20}/>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-gray-500">{project.date}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical size={18} className="text-gray-400"/>
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Objects</div>
                        <div className="text-sm font-medium text-gray-900">{project.objects}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Classes</div>
                        <div className="text-sm font-medium text-gray-900">{project.classes}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Conf</div>
                        <div className="text-sm font-medium text-gray-900">{project.conf.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
                            <StatusIcon size={14}/>
                            {status.label}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navigation/>

            <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">
                {/* Header */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
                    <p className="text-gray-500">Manage your classroom analysis projects</p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1}}
                    className="flex flex-wrap items-center gap-4 mb-6"
                >
                    {/* Status Filters */}
                    <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
                        {(['all', 'pending', 'running', 'failed', 'completed'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                                    filterStatus === status
                                        ? 'bg-black text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Search & View Toggle */}
                    <div className="flex items-center gap-2 ml-auto">
                        {/* Search Bar */}
                        {showSearch ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 h-10 pl-10 pr-10 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setShowSearch(false);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16}/>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowSearch(true)}
                                className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                                title="Search projects"
                            >
                                <Search size={18} className="text-gray-600"/>
                            </button>
                        )}

                        {/* View Mode Toggle */}
                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                        >
                            <Grid size={18} className="text-gray-600"/>
                        </button>
                    </div>
                </motion.div>

                {/* Projects Grid/List */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        <p className="mt-4 text-gray-500">Loading projects...</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredProjects.map((project, index) => (
                                    <ProjectCard key={project.id} project={project} index={index}/>
                                ))}
                            </div>
                        ) : (
                            /* List View */
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                {filteredProjects.map((project, index) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: index * 0.03}}
                                        className="flex items-center gap-6 p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-20 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                            {project.thumbnail ? (
                                                <img
                                                    src={project.thumbnail}
                                                    alt={project.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon size={20} className="text-gray-400"/>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                                            <p className="text-sm text-gray-500">{project.date}</p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500">Objects</div>
                                                <div
                                                    className="text-sm font-medium text-gray-900">{project.objects}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500">Classes</div>
                                                <div
                                                    className="text-sm font-medium text-gray-900">{project.classes}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500">Conf</div>
                                                <div
                                                    className="text-sm font-medium text-gray-900">{project.conf.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            {(() => {
                                                const statusConfig = {
                                                    pending: {
                                                        icon: Clock,
                                                        color: 'text-amber-500',
                                                        bg: 'bg-amber-50',
                                                        label: 'Pending'
                                                    },
                                                    running: {
                                                        icon: Clock,
                                                        color: 'text-blue-500',
                                                        bg: 'bg-blue-50',
                                                        label: 'Running'
                                                    },
                                                    completed: {
                                                        icon: CheckCircle2,
                                                        color: 'text-emerald-500',
                                                        bg: 'bg-emerald-50',
                                                        label: 'Completed'
                                                    },
                                                    failed: {
                                                        icon: XCircle,
                                                        color: 'text-rose-500',
                                                        bg: 'bg-rose-50',
                                                        label: 'Failed'
                                                    }
                                                };
                                                const status = statusConfig[project.status];
                                                const StatusIcon = status.icon;
                                                return (
                                                    <div
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${status.bg} ${status.color}`}>
                                                        <StatusIcon size={16}/>
                                                        {status.label}
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Actions */}
                                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                            <MoreVertical size={18} className="text-gray-400"/>
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredProjects.length === 0 && (
                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                className="text-center py-20"
                            >
                                <div
                                    className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FolderOpen size={40} className="text-gray-400"/>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search query</p>
                            </motion.div>
                        )}

                        {/* Pagination */}
                        {!loading && filteredProjects.length > 0 && pagination.pages > 1 && (
                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                className="flex justify-center items-center gap-2 mt-8"
                            >
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="p-2 bg-white rounded-xl border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M15 19l-7-7 7-7"/>
                                    </svg>
                                </button>

                                {Array.from({length: pagination.pages}, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`min-w-[40px] px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                            pagination.page === page
                                                ? 'bg-black text-white shadow-md'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="p-2 bg-white rounded-xl border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M9 5l7 7-7 7"/>
                                    </svg>
                                </button>

                                <span className="ml-4 text-sm text-gray-500">
                                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                                </span>
                            </motion.div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
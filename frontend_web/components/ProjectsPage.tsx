'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import {
  Search,
  Plus,
  Filter,
  Video,
  Image as ImageIcon,
  Camera,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MoreVertical,
  Calendar,
  FolderOpen,
  Trash2,
  Edit,
  Grid
} from 'lucide-react';

// Mock data
const projectsData = [
  {
    id: 1,
    name: 'Classroom 3A Analysis',
    type: 'video',
    date: '2024-01-30',
    duration: '45:23',
    students: 45,
    status: 'completed',
    accuracy: '99.2%',
    behaviors: { attentive: 38, distracted: 5, sleeping: 2, phone: 0 }
  },
  {
    id: 2,
    name: 'Lecture Hall B Session',
    type: 'live',
    date: '2024-01-30',
    duration: '23:45',
    students: 120,
    status: 'processing',
    accuracy: '-',
    behaviors: null
  },
  {
    id: 3,
    name: 'Lab Room 101 Check',
    type: 'image',
    date: '2024-01-29',
    duration: '-',
    students: 32,
    status: 'completed',
    accuracy: '97.8%',
    behaviors: { attentive: 28, distracted: 3, sleeping: 1, phone: 0 }
  },
  {
    id: 4,
    name: 'Study Hall C Monitor',
    type: 'video',
    date: '2024-01-28',
    duration: '1:12:30',
    students: 67,
    status: 'failed',
    accuracy: '-',
    behaviors: null
  },
  {
    id: 5,
    name: 'Classroom 2B Recording',
    type: 'image',
    date: '2024-01-27',
    duration: '-',
    students: 38,
    status: 'completed',
    accuracy: '98.5%',
    behaviors: { attentive: 35, distracted: 2, sleeping: 1, phone: 0 }
  },
  {
    id: 6,
    name: 'Seminar Hall A',
    type: 'live',
    date: '2024-01-27',
    duration: '45:10',
    students: 85,
    status: 'completed',
    accuracy: '99.0%',
    behaviors: { attentive: 78, distracted: 5, sleeping: 2, phone: 0 }
  }
];

const ProjectCard = ({ project, index }: { project: typeof projectsData[0]; index: number }) => {
  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Completed' },
    processing: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Processing' },
    failed: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Failed' }
  };

  const typeConfig = {
    video: { icon: Video, color: 'text-violet-500', bg: 'bg-violet-50' },
    image: { icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
    live: { icon: Camera, color: 'text-emerald-500', bg: 'bg-emerald-50' }
  };

  const status = statusConfig[project.status as keyof typeof statusConfig];
  const type = typeConfig[project.type as keyof typeof typeConfig];
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 hover:shadow-2xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2.5 rounded-xl ${type.bg}`}>
              <TypeIcon className={type.color} size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500">{project.date}</p>
            </div>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
          <MoreVertical size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Duration</div>
          <div className="text-sm font-medium text-gray-900">{project.duration}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Students</div>
          <div className="text-sm font-medium text-gray-900">{project.students}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Accuracy</div>
          <div className="text-sm font-medium text-gray-900">{project.accuracy}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Status</div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
            <StatusIcon size={14} />
            {status.label}
          </div>
        </div>
      </div>

      {project.behaviors && (
        <div className="pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Behavior Breakdown</div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-gray-600">{project.behaviors.attentive} attentive</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-gray-600">{project.behaviors.distracted} distracted</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 bg-rose-500 rounded-full" />
              <span className="text-gray-600">{project.behaviors.sleeping} sleeping</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');

  const filteredProjects = projectsData.filter(project =>
    filterStatus === 'all' || project.status === filterStatus
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-500">Manage your classroom analysis projects</p>
          </div>

          <button className="group px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2">
            <Plus size={20} />
            New Project
            <Eye size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-4 mb-6"
        >
          <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
            {(['all', 'completed', 'processing', 'failed'] as const).map((status) => (
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

          <div className="flex items-center gap-2 ml-auto">
            <button className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
              <Filter size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Grid size={18} className="text-gray-600" />
            </button>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500">Try adjusting your filters or create a new project</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
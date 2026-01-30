'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './Navigation';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Eye,
  Trash2,
  Edit,
  Search,
  Filter,
  ChevronRight,
  FileSpreadsheet,
  FileImage,
  BarChart3,
  MoreVertical
} from 'lucide-react';

// Mock data
const reportsData = [
  {
    id: 1,
    title: 'Weekly Summary - Classroom 3A',
    type: 'summary',
    date: '2024-01-30',
    period: 'Jan 24 - Jan 30, 2024',
    status: 'completed',
    size: '2.4 MB'
  },
  {
    id: 2,
    title: 'Behavior Analysis - Lecture Hall B',
    type: 'analysis',
    date: '2024-01-29',
    period: 'Jan 22 - Jan 29, 2024',
    status: 'completed',
    size: '3.1 MB'
  },
  {
    id: 3,
    title: 'Monthly Overview - All Classes',
    type: 'overview',
    date: '2024-01-28',
    period: 'January 2024',
    status: 'completed',
    size: '8.7 MB'
  },
  {
    id: 4,
    title: 'Comparison Report - Week 3 vs Week 4',
    type: 'comparison',
    date: '2024-01-27',
    period: 'Week 3-4, January',
    status: 'completed',
    size: '1.9 MB'
  },
  {
    id: 5,
    title: 'Classroom 2B Detailed Analysis',
    type: 'detailed',
    date: '2024-01-26',
    period: 'Jan 20 - Jan 26, 2024',
    status: 'completed',
    size: '4.2 MB'
  }
];

// Create Report Modal
const CreateReportModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  if (!isOpen) return null;

  const reportTypes = [
    { id: 'summary', label: 'Weekly Summary', icon: BarChart3, desc: 'Overview of the week' },
    { id: 'analysis', label: 'Behavior Analysis', icon: FileSpreadsheet, desc: 'Detailed behavior breakdown' },
    { id: 'comparison', label: 'Comparison', icon: FileImage, desc: 'Compare multiple periods' },
    { id: 'detailed', label: 'Detailed Report', icon: FileText, desc: 'Comprehensive analysis' }
  ];

  const periods = ['This Week', 'Last Week', 'This Month', 'Last Month', 'Custom Range'];
  const classes = ['Classroom 3A', 'Classroom 2B', 'Lecture Hall B', 'Lab Room 101'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Generate New Report</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Trash2 size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {reportTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`mb-2 ${selectedType === type.id ? 'text-blue-600' : 'text-gray-400'}`}>
                        <type.icon size={24} />
                      </div>
                      <div className="font-semibold text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Time Period</h3>
                <div className="space-y-2">
                  {periods.map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        selectedPeriod === period
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Classes</h3>
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => {
                        setSelectedClasses(prev =>
                          prev.includes(cls)
                            ? prev.filter(c => c !== cls)
                            : [...prev, cls]
                        );
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        selectedClasses.includes(cls)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={selectedClasses.includes(cls) ? 'text-blue-700' : 'text-gray-700'}>{cls}</span>
                      {selectedClasses.includes(cls) && (
                        <CheckCircle2 size={18} className="text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Back
            </button>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  // Generate report
                  onClose();
                }
              }}
              className="px-6 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
            >
              {step === 3 ? 'Generate Report' : 'Next'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'summary' | 'analysis' | 'comparison' | 'detailed'>('all');

  const filteredReports = reportsData.filter(report =>
    (filterType === 'all' || report.type === filterType) &&
    (report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     report.period.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'summary': return BarChart3;
      case 'analysis': return FileSpreadsheet;
      case 'comparison': return FileImage;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'summary': return 'bg-blue-50 text-blue-600';
      case 'analysis': return 'bg-emerald-50 text-emerald-600';
      case 'comparison': return 'bg-violet-50 text-violet-600';
      case 'detailed': return 'bg-amber-50 text-amber-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      <CreateReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-gray-500">View and generate analysis reports</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Generate Report
            <FileText size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-4 mb-6"
        >
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
            {(['all', 'summary', 'analysis', 'comparison', 'detailed'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  filterType === type
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <Filter size={18} className="text-gray-600" />
          </button>
        </motion.div>

        {/* Reports Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredReports.map((report, index) => {
            const TypeIcon = getTypeIcon(report.type);

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${getTypeColor(report.type)}`}>
                    <TypeIcon size={24} />
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={18} className="text-gray-400" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {report.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    {report.period}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    {report.date}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{report.size}</span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                      <Download size={18} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                      <Eye size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500">Try adjusting your filters or generate a new report</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
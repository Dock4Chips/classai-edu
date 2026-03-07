'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import { ReportService } from '@/lib/service/report';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Eye,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Box,
  FileJson,
  Cpu,
  Network,
  Activity,
  Grid3x3
} from 'lucide-react';

const reportsData = [
  {
    id: 'onnx',
    title: 'Model Export - ONNX Format',
    type: 'model',
    date: '2025-12-23',
    period: 'ONNX',
    status: 'completed',
    size: 'model.onnx',
    downloadType: 'model' as const,
    downloadKey: 'onnx' as const
  },
  {
    id: 'coreml',
    title: 'Model Export - CoreML Format',
    type: 'model',
    date: '2025-12-23',
    period: 'CoreML',
    status: 'completed',
    size: 'model.mlmodel',
    downloadType: 'model' as const,
    downloadKey: 'coreml' as const
  },
  {
    id: 'torchscript',
    title: 'Model Export - TorchScript Format',
    type: 'model',
    date: '2025-12-23',
    period: 'TorchScript',
    status: 'completed',
    size: 'model.torchscript',
    downloadType: 'model' as const,
    downloadKey: 'torchscript' as const
  },
  {
    id: 'box-curves',
    title: 'Metrics - Box Curves Data',
    type: 'metrics',
    date: '2025-12-23',
    period: 'Box Curves',
    status: 'completed',
    size: 'box_curves.json',
    downloadType: 'metrics' as const,
    downloadKey: 'box-curves' as const
  },
  {
    id: 'confusion-matrix',
    title: 'Metrics - Confusion Matrix',
    type: 'metrics',
    date: '2025-12-23',
    period: 'Confusion Matrix',
    status: 'completed',
    size: 'confusion_matrix.json',
    downloadType: 'metrics' as const,
    downloadKey: 'confusion-matrix' as const
  },
  {
    id: 'results',
    title: 'Metrics - Training Results',
    type: 'metrics',
    date: '2025-12-23',
    period: 'Results',
    status: 'completed',
    size: 'results.json',
    downloadType: 'metrics' as const,
    downloadKey: 'results' as const
  }
];

// JSON Preview Modal
const JsonPreviewModal = ({ isOpen, onClose, title, data }: { isOpen: boolean; onClose: () => void; title: string; data: any }) => {
  if (!isOpen) return null;

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
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Trash2 size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-auto flex-1 bg-gray-50">
          <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'model' | 'metrics'>('all');
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; title: string; data: any }>({
    isOpen: false,
    title: '',
    data: null
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  const filteredReports = reportsData.filter(report =>
    (filterType === 'all' || report.type === filterType) &&
    (report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     report.period.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTypeIcon = (id: string) => {
    switch (id) {
      case 'onnx': return Box;
      case 'coreml': return Cpu;
      case 'torchscript': return Network;
      case 'box-curves': return Activity;
      case 'confusion-matrix': return Grid3x3;
      case 'results': return FileJson;
      default: return FileText;
    }
  };

  const getTypeColor = (id: string) => {
    switch (id) {
      case 'onnx': return 'bg-blue-50 text-blue-600';
      case 'coreml': return 'bg-purple-50 text-purple-600';
      case 'torchscript': return 'bg-orange-50 text-orange-600';
      case 'box-curves': return 'bg-emerald-50 text-emerald-600';
      case 'confusion-matrix': return 'bg-rose-50 text-rose-600';
      case 'results': return 'bg-cyan-50 text-cyan-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const handleDownload = (report: typeof reportsData[0]) => {
    if (report.downloadType === 'model') {
      ReportService.downloadModel(report.downloadKey);
    } else {
      ReportService.downloadMetrics(report.downloadKey);
    }
  };

  const handlePreview = (report: typeof reportsData[0]) => {
    const fileMap = {
      'box-curves': '/metrics/box_curves.json',
      'confusion-matrix': '/metrics/confusion_matrix.json',
      'results': '/metrics/results.json'
    };

    fetch(fileMap[report.downloadKey as keyof typeof fileMap])
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load JSON');
        }
        return response.json();
      })
      .then((data) => {
        setPreviewModal({
          isOpen: true,
          title: report.title,
          data
        });
      })
      .catch((error) => {
        console.error('Failed to load JSON:', error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      <JsonPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, title: '', data: null })}
        title={previewModal.title}
        data={previewModal.data}
      />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-gray-500">View and generate analysis reports</p>
          </div>
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

          <motion.div
            initial={false}
            animate={{
              width: isFilterExpanded ? 'auto' : '0px',
              opacity: isFilterExpanded ? 1 : 0,
              overflow: 'hidden'
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 p-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {(['all', 'model', 'metrics'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${
                  filterType === type
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </motion.div>

          <motion.button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            animate={{ rotate: isFilterExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors flex-shrink-0"
          >
            <Filter size={18} className={isFilterExpanded ? "text-blue-600" : "text-gray-600"} />
          </motion.button>
        </motion.div>

        {/* Reports Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredReports.map((report, index) => {
            const TypeIcon = getTypeIcon(report.id);

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${getTypeColor(report.id)}`}>
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
                    <button
                      onClick={() => handleDownload(report)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={18} className="text-gray-600" />
                    </button>
                    {report.downloadType === 'metrics' && (
                      <button
                        onClick={() => handlePreview(report)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={18} className="text-gray-600" />
                      </button>
                    )}
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
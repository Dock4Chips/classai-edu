'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {MoreVertical, Eye, Trash2, Sparkles, Search} from 'lucide-react';
import {DetectionDetailService} from '@/lib/service/detectionDetail';
import {Table, Column} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Dropdown} from '@/components/ui/dropdown';
import {notification} from '@/utils/notification';
import {confirm} from '@/utils/confirm';
import {Results} from '@/lib/api';

export default function DetectionDetailPage() {
    const [details, setDetails] = useState<Results[]>([]);
    const [loading, setLoading] = useState(false);

    const [queryParams, setQueryParams] = useState<Results>({
        current: 1,
        pageSize: 10,
        total: 0,
        task_id: null,
        class_name: null,
    });

    const columns: Column<Results>[] = [
        {key: 'detail_id', title: 'ID'},
        {key: 'task_id', title: 'Task ID'},
        {key: 'student_id', title: 'Student ID'},
        {key: 'student_name', title: 'Student Name'},
        {
            key: 'behavior_type',
            title: 'Behavior',
            render: v => {
                const colors: Record<string, string> = {
                    raising_hand: 'bg-blue-100 text-blue-800',
                    listening: 'bg-green-100 text-green-800',
                    reading: 'bg-purple-100 text-purple-800',
                    writing: 'bg-yellow-100 text-yellow-800',
                    sleeping: 'bg-red-100 text-red-800',
                    looking_around: 'bg-orange-100 text-orange-800',
                };
                return <Badge className={colors[v] || ''}>{v}</Badge>;
            },
        },
        {key: 'confidence', title: 'Confidence', render: v => `${(v * 100).toFixed(1)}%`},
        {key: 'timestamp', title: 'Time', render: v => v ? new Date(v).toLocaleString() : '-'},
        {
            key: 'actions',
            title: 'Actions',
            render: (_, record) => (
                <Dropdown
                    trigger={
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-4 h-4"/>
                        </button>
                    }
                    items={[
                        {
                            key: 'view',
                            label: 'View Detail',
                            icon: <Eye className="w-4 h-4"/>,
                            onClick: () => handleViewDetail(record),
                        },
                        {
                            key: 'delete',
                            label: 'Delete',
                            icon: <Trash2 className="w-4 h-4"/>,
                            danger: true,
                            onClick: () => handleDelete(record),
                        },
                    ]}
                />
            ),
        },
    ];

    useEffect(() => {
        void fetchDetails();
    }, [queryParams.current, queryParams.pageSize]);

    const fetchDetails = async () => {
        setLoading(true);
        const params = {
            page: queryParams.current,
            page_size: queryParams.pageSize,
            task_id: queryParams.task_id,
            class_name: queryParams.class_name,
        };
        const results = await DetectionDetailService.getDetailList(params);
        if (results.code === 200) {
            setDetails(results.data?.items || []);
            setQueryParams(prev => ({...prev, total: results.data?.total || 0}));
        }
        setLoading(false);
    };

    const handleViewDetail = (detail: Results) => {
        console.log('View detail:', detail);
        // TODO: Implement detail view modal
    };

    const handleDelete = async (detail: Results) => {
        const confirmed = await confirm.danger('Are you sure you want to delete this detail?');
        if (!confirmed) return;

        setLoading(true);
        const results = await DetectionDetailService.deleteDetail(detail.detail_id);
        if (results.code === 200) {
            notification.success('Deleted successfully');
            void fetchDetails();
        }
        setLoading(false);
    };

    const handleFilterByTask = (taskId: number | null) => {
        setQueryParams(prev => ({...prev, task_id: taskId, current: 1}));
    };

    return (
        <div className="space-y-6">
            {/* header */}
            <motion.div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Detection Details</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Sparkles size={18}/>
                        View detailed detection results
                    </p>
                </div>
                {queryParams.task_id && (
                    <button
                        onClick={() => handleFilterByTask(null)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                    >
                        Clear Filter
                    </button>
                )}
            </motion.div>

            {/* search */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        type="number"
                        value={queryParams.task_id ?? ''}
                        onChange={e => handleFilterByTask(e.target.value ? Number(e.target.value) : null)}
                        placeholder="Filter by task ID..."
                        className="w-full pl-10 pr-4 py-3 border rounded-2xl"
                    />
                </div>
            </div>

            {/* table */}
            <Table
                columns={columns}
                data={details}
                loading={loading}
                pagination={{
                    current: queryParams.current,
                    total: queryParams.total,
                    pageSize: queryParams.pageSize,
                    onChange: page => setQueryParams(prev => ({...prev, current: page})),
                }}
            />
        </div>
    );
}
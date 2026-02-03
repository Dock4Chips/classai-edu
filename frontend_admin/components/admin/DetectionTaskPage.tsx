'use client';

import {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {Plus, MoreVertical, Pencil, Trash2, Sparkles, Search} from 'lucide-react';
import {DetectionTaskService} from '@/lib/service/detectionTask';
import {Table, Column} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Dropdown} from '@/components/ui/dropdown';
import {Modal} from '@/components/ui/modal';
import {FormField} from '@/components/ui/form/Field';
import type {FormFieldConfig} from '@/components/ui/form/types';
import {notification} from '@/utils/notification';
import {confirm} from '@/utils/confirm';
import {Results} from '@/lib/api';

export default function DetectionTaskPage() {
    const [tasks, setTasks] = useState<Results[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Results>({});

    const [queryParams, setQueryParams] = useState<Results>({
        current: 1,
        pageSize: 10,
        total: 0,
        task_status: null,
        task_type: null,
    });

    const formFields: FormFieldConfig[] = [
        {key: 'task_name', label: 'Task Name', type: 'text', colSpan: 2, placeholder: 'Enter task name', required: true},
        {
            key: 'task_type',
            label: 'Task Type',
            type: 'select',
            options: [
                {value: 'behavior', label: 'Behavior Detection'},
                {value: 'attendance', label: 'Attendance Detection'},
                {value: 'engagement', label: 'Engagement Detection'},
            ],
            placeholder: 'Select task type',
            colSpan: 1,
        },
        {
            key: 'task_status',
            label: 'Status',
            type: 'select',
            options: [
                {value: 'pending', label: 'Pending'},
                {value: 'running', label: 'Running'},
                {value: 'completed', label: 'Completed'},
                {value: 'failed', label: 'Failed'},
            ],
            placeholder: 'Select status',
            colSpan: 1,
        },
        {key: 'class_name', label: 'Class Name', type: 'text', colSpan: 2, placeholder: 'Enter class name'},
        {key: 'video_path', label: 'Video Path', type: 'text', colSpan: 2, placeholder: 'Enter video path'},
        {key: 'description', label: 'Description', type: 'textarea', rows: 3, colSpan: 2, placeholder: 'Enter description'},
    ];

    const columns: Column<Results>[] = [
        {key: 'task_id', title: 'ID'},
        {key: 'task_name', title: 'Task Name'},
        {key: 'task_type', title: 'Type', render: v => <Badge>{v}</Badge>},
        {
            key: 'task_status',
            title: 'Status',
            render: v => {
                const colors: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    running: 'bg-blue-100 text-blue-800',
                    completed: 'bg-green-100 text-green-800',
                    failed: 'bg-red-100 text-red-800',
                };
                return <Badge className={colors[v] || ''}>{v}</Badge>;
            },
        },
        {key: 'class_name', title: 'Class'},
        {key: 'created_at', title: 'Created At', render: v => v ? new Date(v).toLocaleString() : '-'},
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
                            key: 'edit',
                            label: 'Edit',
                            icon: <Pencil className="w-4 h-4"/>,
                            onClick: () => handleEdit(record),
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
        void fetchTasks();
    }, [queryParams.current, queryParams.pageSize]);

    const fetchTasks = async () => {
        setLoading(true);
        const params = {
            page: queryParams.current,
            page_size: queryParams.pageSize,
            task_status: queryParams.task_status,
            task_type: queryParams.task_type,
        };
        const results = await DetectionTaskService.getTaskList(params);
        if (results.code === 200) {
            setTasks(results.data?.items || []);
            setQueryParams(prev => ({...prev, total: results.data?.total || 0}));
        }
        setLoading(false);
    };

    const handleAdd = () => {
        setIsEditMode(false);
        setFormData({});
        formFields.forEach(f => {
            formData[f.key] = null;
        });
        setModalOpen(true);
    };

    const handleEdit = (task: Results) => {
        setIsEditMode(true);
        setFormData({...task});
        setModalOpen(true);
    };

    const handleDelete = async (task: Results) => {
        const confirmed = await confirm.danger('Are you sure you want to delete this task?');
        if (!confirmed) return;

        setLoading(true);
        const results = await DetectionTaskService.deleteTask(task.task_id);
        if (results.code === 200) {
            notification.success('Deleted successfully');
            void fetchTasks();
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        const data = Object.fromEntries(formFields.map(f => [f.key, formData[f.key]]));

        setLoading(true);
        const results = isEditMode
            ? await DetectionTaskService.updateTask(formData.task_id, data)
            : await DetectionTaskService.createTask(data);

        if (results.code === 200) {
            notification.success(isEditMode ? 'Updated successfully' : 'Created successfully');
            setModalOpen(false);
            void fetchTasks();
            return;
        }
        notification.error(results.msg);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* header */}
            <motion.div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Detection Tasks</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Sparkles size={18}/>
                        Manage AI detection tasks
                    </p>
                </div>
                <button onClick={handleAdd} className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2">
                    <Plus size={16}/> Add Task
                </button>
            </motion.div>

            {/* search */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        value={queryParams.task_type ?? ''}
                        onChange={e => setQueryParams(prev => ({...prev, task_type: e.target.value.trim() || null, current: 1}))}
                        placeholder="Search by task type..."
                        className="w-full pl-10 pr-4 py-3 border rounded-2xl"
                    />
                </div>
            </div>

            {/* search */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        value={queryParams.task_type ?? ''}
                        onChange={e => setQueryParams(prev => ({...prev, task_type: e.target.value || null, current: 1}))}
                        placeholder="Search by task type..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                </div>
            </div>

            {/* table */}
            <Table
                columns={columns}
                data={tasks}
                loading={loading}
                pagination={{
                    current: queryParams.current,
                    total: queryParams.total,
                    pageSize: queryParams.pageSize,
                    onChange: page => setQueryParams(prev => ({...prev, current: page})),
                }}
            />

            {/* modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditMode ? 'Edit Task' : 'Add Task'}>
                <div className="grid grid-cols-2 gap-4">
                    {formFields.map(field => (
                        <div key={field.key} className={field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}>
                            <FormField
                                field={field}
                                value={formData[field.key]}
                                onChange={value => setFormData(prev => ({...prev, [field.key]: value}))}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="bg-black text-white px-5 py-2 rounded-xl">
                        {isEditMode ? 'Update' : 'Create'}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
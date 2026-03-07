'use client';

import {useState, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import {Plus, Trash2, Sparkles, Image as ImageIcon, Upload, X, Loader2, RefreshCw} from 'lucide-react';
import {BannerService} from '@/lib/service/banner';
import {Table, Column} from '@/components/ui/table';
import {Modal} from '@/components/ui/modal';
import {notification} from '@/utils/notification';
import {confirm} from '@/utils/confirm';
import {usePermissions} from '@/lib/contexts/PermissionsContext';

export default function BannersPage() {
    const {hasPermission} = usePermissions();
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxBanner, setLightboxBanner] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBanners();
    }, []);


    const fetchBanners = () => {
        setLoading(true);
        BannerService.getBannerList().then((res) => {
            if (res?.data) {
                setBanners(res.data || []);
            }
        }).finally(() => {
            setLoading(false);
        });
    };


    const handleDelete = (id: number) => {
        confirm.danger('Are you sure you want to delete this banner?').then((confirmed) => {
            if (!confirmed) return;
            setLoading(true);
            return BannerService.deleteBanner(id);
        }).then((res) => {
            if (!res) return;
            if (res.code === 200) {
                notification.success('Deleted successfully');
                fetchBanners();
            }
        }).finally(() => {
            setLoading(false);
        });
    };


    const handleAdd = () => {
        setEditingBannerId(null);
        setPreviewUrl(null);
        setSelectedFile(null);
        setModalOpen(true);
    };


    const handleEdit = (banner: any) => {
        setEditingBannerId(banner.id);
        setPreviewUrl(banner.resource_url);
        setSelectedFile(null);
        setModalOpen(true);
    };


    const handleImageClick = (banner: any) => {
        setLightboxBanner(banner);
        setLightboxOpen(true);
    };


    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            notification.error('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            notification.error('Image size must be less than 10MB');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };


    const handleSave = () => {
        if (!selectedFile) {
            notification.error('Please select an image');
            return;
        }
        setUploading(true);
        const request = editingBannerId
            ? BannerService.updateBanner(editingBannerId, selectedFile)
            : BannerService.createBanner(selectedFile);

        request.then((results) => {
            if (results.code === 200) {
                notification.success(
                    editingBannerId ? 'Updated successfully' : 'Created successfully'
                );
                setModalOpen(false);
                fetchBanners();
                return;
            }
            notification.error(results.msg);
        }).finally(() => {
            setUploading(false);
        });
    };

    const columns: Column<any>[] = [
        {
            key: 'id',
            title: 'ID',
            render: value => <span className="text-gray-500 font-mono text-sm">#{value}</span>,
        },
        {
            key: 'resource_url',
            title: 'Image',
            render: (_, record) => (
                <div className="relative group">
                    <img
                        src={record.resource_url}
                        alt="banner"
                        className="h-16 w-auto rounded-lg object-cover shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(record)}
                    />
                </div>
            ),
        },
        {
            key: 'width',
            title: 'Size',
            render: (_, record) => (
                <span className="text-gray-600 text-sm">
          {record.width} × {record.height}
        </span>
            ),
        },
        {
            key: 'num_boxes',
            title: 'Detections',
            render: value => (
                <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium">
          {value} actions
        </span>
            ),
        },
        {
            key: 'max_confidence',
            title: 'Confidence',
            render: value => {
                const conf = parseFloat(value);
                const color = conf >= 0.8 ? 'text-emerald-600' : conf >= 0.6 ? 'text-amber-600' : 'text-rose-600';
                return (
                    <span className={`text-sm font-medium ${color}`}>
            {(conf * 100).toFixed(1)}%
          </span>
                );
            },
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    {hasPermission('banners:edit') && (
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={() => handleEdit(record)}
                            className="p-2.5 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Replace image"
                        >
                            <RefreshCw className="w-4 h-4"/>
                        </motion.button>
                    )}
                    {hasPermission('banners:delete') && (
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={() => handleDelete(record.id)}
                            className="p-2.5 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4"/>
                        </motion.button>
                    )}
                    {!hasPermission('banners:edit') && !hasPermission('banners:delete') && (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Banner Management</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Sparkles size={18}/>
                        Manage homepage carousel banners
                    </p>
                </div>
                {hasPermission('banners:add') && (
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 bg-black text-white rounded-xl flex gap-2 hover:bg-gray-800 transition-all"
                    >
                        <Plus size={16}/> Add Banner
                    </button>
                )}
            </motion.div>

            {/* Table */}
            <Table
                columns={columns}
                data={banners}
                loading={loading}
                pagination={undefined}
            />

            {/* Upload Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
                   title={editingBannerId ? 'Replace Banner' : 'Add Banner'}>
                <div className="space-y-6">
                    {/* Upload Area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Banner Image
                        </label>
                        <div className="relative">
                            {!previewUrl ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer group"
                                >
                                    <Upload
                                        className="mx-auto h-12 w-12 text-gray-400 group-hover:text-gray-600 mb-4 transition-colors"/>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full rounded-xl shadow-lg"
                                    />
                                    <button
                                        onClick={() => {
                                            setPreviewUrl(null);
                                            setSelectedFile(null);
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                                    >
                                        <X size={18}/>
                                    </button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> The uploaded image will be automatically processed with YOLO
                            detection to identify objects.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!selectedFile || uploading}
                            className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                    {editingBannerId ? 'Replacing...' : 'Uploading...'}
                                </>
                            ) : (
                                <>
                                    <Upload size={16}/>
                                    {editingBannerId ? 'Replace' : 'Upload'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Image Lightbox */}
            <Modal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} title="">
                <div className="flex items-center justify-center p-4" style={{maxHeight: '70vh'}}>
                    {lightboxBanner && (
                        <img
                            src={lightboxBanner.resource_url}
                            alt="Full size banner"
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
}
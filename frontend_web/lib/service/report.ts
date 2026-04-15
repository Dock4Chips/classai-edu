import { apiClient, Results } from '../api';

export interface ModelReportListItem {
    id: 'onnx' | 'coreml' | 'torchscript';
    titleKey: string;
    type: 'model';
    date: string;
    periodKey: string;
    status: string;
    size: string;
    downloadType: 'model';
    downloadKey: 'onnx' | 'coreml' | 'torchscript';
}

export interface MetricsReportListItem {
    id: 'box-curves' | 'confusion-matrix' | 'results';
    titleKey: string;
    type: 'metrics';
    date: string;
    periodKey: string;
    status: string;
    size: string;
    downloadType: 'metrics';
    downloadKey: 'box-curves' | 'confusion-matrix' | 'results';
}

export type ReportListItem = ModelReportListItem | MetricsReportListItem;

export class ReportService {
    static getReportList(): Promise<Results> {
        return apiClient.get<Results>('/api/report/page/data/list');
    }

    static getMetricsJson(file: 'box-curves' | 'confusion-matrix' | 'results'): Promise<Results> {
        return apiClient.get<Results>(`/api/dashboard/web/metrics/${file}`);
    }

    /**
     * 下载模型文件 (onnx / coreml / torchscript)
     */
    static async downloadModel(fmt: 'onnx' | 'coreml' | 'torchscript'): Promise<void> {
        try {
            const response = await apiClient.getWithConfig<Blob>(
                `/api/report/page/data/model-export/${fmt}`,
                {
                    responseType: 'blob',
                }
            );
            
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            const extMap = {
                onnx: 'onnx',
                coreml: 'mlmodel',
                torchscript: 'torchscript',
            };
            link.setAttribute('download', `model.${extMap[fmt]}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: unknown) {
            console.error('模型下载失败:', error);
        }
    }

    /**
     * 下载 Metrics JSON 文件
     */
    static async downloadMetrics(file: 'box-curves' | 'confusion-matrix' | 'results'): Promise<void> {
        try {
            const response = await apiClient.getWithConfig<Blob>(
                `/api/report/page/data/metrics/${file}`,
                {
                    responseType: 'blob',
                }
            );

            // 使用原文件名
            const filenameMap = {
                'box-curves': 'box_curves.json',
                'confusion-matrix': 'confusion_matrix.json',
                'results': 'results.json'
            };
            const filename = filenameMap[file];

            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: unknown) {
            console.error('Metrics 下载失败:', error);
        }
    }
}

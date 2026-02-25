import { apiClient } from '../api';

export class ReportService {

    /**
     * 下载模型文件 (onnx / coreml / torchscript)
     */
    static async downloadModel(fmt: 'onnx' | 'coreml' | 'torchscript'): Promise<void> {
        try {
            const response = await apiClient.get<Blob>(
                `/api/report/page/data/model-export/${fmt}`,
                {
                    responseType: 'blob',
                }
            );

            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `model.${fmt}`); // 保存为 model.onnx / model.mlmodel
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('模型下载失败:', error);
        }
    }

    /**
     * 下载 Metrics JSON 文件
     */
    static async downloadMetrics(file: 'box-curves' | 'confusion-matrix' | 'results'): Promise<void> {
        try {
            const response = await apiClient.get<Blob>(
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
        } catch (error: any) {
            console.error('Metrics 下载失败:', error);
        }
    }
}
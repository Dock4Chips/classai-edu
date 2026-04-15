import {apiClient, Results} from '../api';

export interface DashboardMetricsData {
    results?: {
        epoch?: number[];
        'metrics/precision(B)'?: number[];
        'metrics/recall(B)'?: number[];
        'metrics/mAP50(B)'?: number[];
    };
    'box-curves'?: {
        confidence?: number[];
        precision?: number[][] | number[];
        recall?: number[][] | number[];
        f1?: number[][] | number[];
        pr_recall?: number[];
        pr_precision?: number[];
    };
    'confusion-matrix'?: {
        normalized?: number[][];
    };
}

export class DashboardService {

    static async get_metrics(): Promise<Results> {
        return await apiClient.get<Results>('/api/dashboard/web/metrics');
    }
}

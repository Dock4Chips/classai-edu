import {apiClient, Results} from '../api';

export interface DashboardMetricsData {
    results?: {
        epoch?: number[];
        time?: number[];
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
    'overview-metrics'?: {
        preprocess_ms?: number;
        inference_ms?: number;
        postprocess_ms?: number;
        latency_ms?: number;
        fps?: number;
        precision?: number;
        recall?: number;
        map50?: number;
        map50_95?: number;
        f1_best?: number;
        epochs?: number;
    };
}

export class DashboardService {

    static async get_metrics(): Promise<Results> {
        return await apiClient.get<Results>('/api/dashboard/web/metrics');
    }
}

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

    /**
     * 获取 dashboard 统计数据
     */
    static async get_recent_projects(): Promise<Results> {
        return await apiClient.get<Results>('/api/dashboard/web/recent-projects');
    }

    static async get_behavior_breakdown(): Promise<Results> {
        return await apiClient.get<Results>('/api/dashboard/web/behavior-breakdown');
    }

    static async get_activity_feed(): Promise<Results> {
        return await apiClient.get<Results>('/api/dashboard/web/activity-feed');
    }

    static async get_metrics(): Promise<Results> {
        return await apiClient.get<Results>('/api/dashboard/web/metrics');
    }
}

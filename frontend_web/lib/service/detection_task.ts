import {apiClient, Results} from '../api';

export enum DetectionTaskType {
    IMAGE = 0,
    CAP = 1,
}

export interface CreateTaskParams {
    task_name: string;
    task_type: DetectionTaskType;
    model_id?: number;
    conf_threshold?: number;
    iou_threshold?: number;
    device_id?: number;
    files: File[];
}

export class DetectionTaskService {

    /**
     * 获取任务列表
     */
    static async get_task_data(page: number = 1, page_size: number = 6): Promise<Results> {
        return await apiClient.get<Results>(`/api/detection/task/list?page=${page}&page_size=${page_size}`);
    }

    /**
     * 创建检测任务（图片或视频）
     * task_name, task_type, model_id, conf_threshold 是 query 参数
     * files 是 form-data
     */
    static async createTask(formData: FormData, queryParams: URLSearchParams): Promise<Results> {
        return await apiClient.post<Results>(`/api/detection/task?${queryParams.toString()}`, formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        });
    }
}
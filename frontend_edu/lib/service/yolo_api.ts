import {apiClient, Results} from '../api'

export class YoloService {
    static async predictAct(): Promise<Results> {
        return apiClient.get<Results>('/yolo/img/predict/act');
    }

    static async predictPos(): Promise<Results> {
        return apiClient.get<Results>('/yolo/img/predict/pos');
    }
}
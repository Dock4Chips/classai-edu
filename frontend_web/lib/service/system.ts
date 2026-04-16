import {apiClient, Results} from '../api';

export interface PublicSystemBasic {
    system_name?: string;
    system_url?: string;
    system_logo_url?: string;
}

export class SystemService {
    static async getPublicSystemBasic(): Promise<Results> {
        return await apiClient.get<Results>('/api/public/system/basic');
    }
}

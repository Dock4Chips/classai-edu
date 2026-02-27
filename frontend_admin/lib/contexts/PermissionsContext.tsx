'use client';

import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {MenuService} from '@/lib/service/menu';

interface PermissionsContextType {
    allowedMenuKeys: Set<string>;
    hasPermission: (key: string) => boolean;
    hasAnyPermission: (keys: string[]) => boolean;
    loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({children}: { children: ReactNode }) {
    const [allowedMenuKeys, setAllowedMenuKeys] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void fetchPermissions();
    }, []);

    const fetchPermissions = () => {
        MenuService.getUserMenus().then((result) => {
                if (result.code === 200 && result.data) {
                    const extractKeys = (menus: any[]): string[] => {
                        const keys: string[] = [];
                        menus.forEach((menu: any) => {
                            if (menu.menu_key) {
                                keys.push(menu.menu_key);
                            }
                            if (menu.children?.length) {
                                keys.push(...extractKeys(menu.children));
                            }
                        });
                        return keys;
                    };
                    const keys = extractKeys(result.data);
                    setAllowedMenuKeys(new Set(keys));
                }
            })
            .catch((error) => {
                console.error('Failed to load user permissions:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const hasPermission = (key: string): boolean => {
        return allowedMenuKeys.has(key);
    };

    const hasAnyPermission = (keys: string[]): boolean => {
        return keys.some(key => allowedMenuKeys.has(key));
    };

    return (
        <PermissionsContext.Provider value={{allowedMenuKeys, hasPermission, hasAnyPermission, loading}}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissions() {
    const context = useContext(PermissionsContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a PermissionsProvider');
    }
    return context;
}
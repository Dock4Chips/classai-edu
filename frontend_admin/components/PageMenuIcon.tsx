'use client';

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import type {LucideIcon} from 'lucide-react';
import {
    Activity,
    Bell,
    BrainCircuit,
    Camera,
    ImageIcon,
    Key,
    LayoutDashboard,
    ListTree,
    Palette,
    Pencil,
    Plus,
    Settings,
    Shield,
    Sliders,
    Tags,
    Trash2,
    Users,
} from 'lucide-react';
import {MenuService} from '@/lib/service/menu';

type MenuNode = {
    path?: string;
    icon?: string;
    children?: MenuNode[];
};

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Users,
    Shield,
    ListTree,
    Camera,
    BrainCircuit,
    ImageIcon,
    Settings,
    Bell,
    Activity,
    Plus,
    Pencil,
    Trash2,
    Key,
    Palette,
    Tags,
};

let cachedMenus: MenuNode[] | null = null;
let menusPromise: Promise<MenuNode[]> | null = null;

const loadMenus = async (): Promise<MenuNode[]> => {
    if (cachedMenus) return cachedMenus;
    if (menusPromise) return menusPromise;

    menusPromise = MenuService.getUserMenus()
        .then((res) => {
            if (res?.code === 200 && Array.isArray(res?.data)) {
                cachedMenus = res.data;
                return res.data;
            }
            return [];
        })
        .catch(() => [])
        .finally(() => {
            menusPromise = null;
        });

    return menusPromise;
};

const findIconByPath = (menus: MenuNode[], pathname: string): string | undefined => {
    let bestMatch: {pathLen: number; icon?: string} = {pathLen: -1, icon: undefined};

    const walk = (nodes: MenuNode[]) => {
        nodes.forEach((node) => {
            const path = (node.path || '').trim();
            if (path && path !== '-') {
                const exact = pathname === path;
                const prefix = pathname.startsWith(`${path}/`);
                if ((exact || prefix) && path.length > bestMatch.pathLen) {
                    bestMatch = {pathLen: path.length, icon: node.icon};
                }
            }
            if (Array.isArray(node.children) && node.children.length) {
                walk(node.children);
            }
        });
    };

    walk(menus);
    return bestMatch.icon;
};

interface PageMenuIconProps {
    className?: string;
    size?: number;
    fallback?: LucideIcon;
}

export function PageMenuIcon({className = 'text-indigo-500', size = 18, fallback = Sliders}: PageMenuIconProps) {
    const pathname = usePathname();
    const [iconName, setIconName] = useState<string | undefined>(undefined);

    useEffect(() => {
        loadMenus().then((menus) => {
            setIconName(findIconByPath(menus, pathname));
        });
    }, [pathname]);

    const Icon = (iconName && iconMap[iconName]) || fallback;
    return <Icon className={className} size={size}/>;
}


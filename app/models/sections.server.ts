export interface Section {
    path: string;
    name: string;
    icon: string;
}


export function getSections() {
    const sections: Array<Section> = [
        {path: 'products', name: 'Products', icon: ''},
        {path: 'customers', name: 'Customers', icon: ''},
        {path: 'analytics', name: 'Analytics', icon: ''},
        {path: 'settings', name: 'Settings', icon: ''},
    ];
    return sections
}
export interface Service {
    id: number;
    name: string;
    description: string;
    averageTime: number;
    abstractServiceId: number;
    businessUnitId: number;
    prices: any[];
    serviceConfigType: number
}
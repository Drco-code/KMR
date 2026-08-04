// Shape returned by the AdminJS dashboard `handler` (see
// AdminModuleService.getDashboardData) and consumed by Dashboard.tsx.
// Duplicated here rather than imported from the backend service because
// this whole `dashboard/` folder is compiled separately, by AdminJS's own
// frontend bundler, not by the Nest backend's tsc build (see tsconfig.json).
export interface DashboardData {
  stats: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    outOfStockProducts: number;
    featuredProducts: number;
  };
  categoryBreakdown: { category: string; count: number }[];
  topByQuantity: { productName: string; quantity: number }[];
  topByRequests: { productName: string; requests: number }[];
  trend: {
    products: string[];
    // Each row is { date: '2026-08-01', 'Planed Oak Timber 2x4': 12, ... }.
    days: Array<Record<string, number | string>>;
  };
}

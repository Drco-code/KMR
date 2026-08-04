import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import { Box, H2, Loader, MessageBox, Text } from '@adminjs/design-system';
import StatTiles from './StatTiles.js';
import TopProductsChart from './TopProductsChart.js';
import CategoryBreakdownChart from './CategoryBreakdownChart.js';
import DemandTrendChart from './DemandTrendChart.js';
import type { DashboardData } from './types.js';

const api = new ApiClient();

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getDashboard<DashboardData>()
      .then((response) => setData(response.data))
      .catch(() => setError('Could not load dashboard data.'));
  }, []);

  if (error) {
    return (
      <Box p="xl">
        <MessageBox message={error} variant="danger" />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p="xxl" flex justifyContent="center">
        <Loader />
      </Box>
    );
  }

  return (
    <Box p="xl">
      <H2 mb="lg">Product overview</H2>
      <StatTiles stats={data.stats} />

      <Box flex flexWrap="wrap" style={{ gap: '16px' }} mb="xl">
        <TopProductsChart
          title="Most demanded — by quantity requested"
          data={data.topByQuantity.map((p) => ({ productName: p.productName, value: p.quantity }))}
          barColor="#2d69f0"
          valueLabel="Quantity requested"
        />
        <TopProductsChart
          title="Most demanded — by number of requests"
          data={data.topByRequests.map((p) => ({ productName: p.productName, value: p.requests }))}
          barColor="#22a06b"
          valueLabel="Requests"
        />
      </Box>

      <Box mb="xl">
        <DemandTrendChart trend={data.trend} />
      </Box>

      <Box>
        <CategoryBreakdownChart data={data.categoryBreakdown} />
      </Box>

      {data.stats.totalProducts > 0 && data.topByQuantity.length === 0 && (
        <Text mt="lg" color="grey60" fontSize="sm">
          Demand charts fill in once staff-recorded quote requests come in.
        </Text>
      )}
    </Box>
  );
};

export default Dashboard;

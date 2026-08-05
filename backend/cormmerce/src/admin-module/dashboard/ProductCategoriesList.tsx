import React from 'react';
import type { ShowPropertyProps } from 'adminjs';
import { Badge, Box } from '@adminjs/design-system';

interface AssignedCategory {
  id: string;
  name: string;
  isPrimary: boolean;
}

const ProductCategoriesList: React.FC<ShowPropertyProps> = ({ record }) => {
  const categories: AssignedCategory[] = record.params.categories ?? [];

  if (categories.length === 0) {
    return <Box color="grey60">No categories assigned</Box>;
  }

  return (
    <Box flex flexWrap="wrap" style={{ gap: '6px' }}>
      {categories.map((category) => (
        <Badge key={category.id} variant={category.isPrimary ? 'primary' : 'default'}>
          {category.name}
          {category.isPrimary ? ' (Primary)' : ''}
        </Badge>
      ))}
    </Box>
  );
};

export default ProductCategoriesList;

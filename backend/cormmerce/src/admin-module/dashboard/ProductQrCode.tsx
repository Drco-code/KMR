import React from 'react';
import type { ShowPropertyProps } from 'adminjs';
import { Box, Button, Text } from '@adminjs/design-system';

const ProductQrCode: React.FC<ShowPropertyProps> = ({ record }) => {
  const productId = record.params.id;
  if (!productId) {
    return <Box color="grey60">Save the product first to generate a QR code</Box>;
  }

  const qrUrl = `/admin/api/products/${productId}/qr-code`;

  return (
    <Box>
      <img src={qrUrl} alt="Product QR code" width={180} height={180} />
      <Box marginTop="default">
        <Button as="a" href={qrUrl} download variant="primary">
          Download QR code
        </Button>
      </Box>
      <Text fontSize="sm" color="grey60" marginTop="default">
        Scanning this code opens the product's public page. Print and attach it to the
        physical item.
      </Text>
    </Box>
  );
};

export default ProductQrCode;

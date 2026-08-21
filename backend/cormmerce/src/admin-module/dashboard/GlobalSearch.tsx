import React, { useState } from 'react';
import { ApiClient } from 'adminjs';
import {
  Box,
  Button,
  H2,
  Icon,
  Input,
  Loader,
  MessageBox,
  Text,
} from '@adminjs/design-system';

const api = new ApiClient();

interface SearchHit {
  id: string;
  images?: string[];
  heroImage?: string;
  logo?: string;
  [key: string]: unknown;
}

interface SearchResponse {
  query: string;
  total: number;
  results: Record<string, SearchHit[]>;
}

// Display order and labels for each model that searchData() queries.
const RESOURCES: { key: string; label: string }[] = [
  { key: 'Product', label: 'Products' },
  { key: 'SignatureCollection', label: 'KMR Paint Collections' },
  { key: 'Category', label: 'Categories' },
  { key: 'Brand', label: 'Brands' },
  { key: 'QuoteRequest', label: 'Quote Requests' },
  { key: 'QuoteRequestItem', label: 'Quote Line Items' },
  { key: 'PromoBanner', label: 'Promo Banner' },
];

function getThumbnail(resource: string, hit: SearchHit): string | null {
  switch (resource) {
    case 'Product':
      if (Array.isArray(hit.images) && hit.images.length > 0 && typeof hit.images[0] === 'string') {
        return hit.images[0];
      }
      return null;
    case 'SignatureCollection':
      if (Array.isArray(hit.images) && hit.images.length > 0 && typeof hit.images[0] === 'string') {
        return hit.images[0];
      }
      if (typeof hit.heroImage === 'string' && hit.heroImage.trim()) {
        return hit.heroImage.trim();
      }
      return null;
    case 'Brand':
      if (typeof hit.logo === 'string' && hit.logo.trim()) {
        return hit.logo.trim();
      }
      return null;
    default:
      return null;
  }
}

function getIconName(resource: string): string {
  switch (resource) {
    case 'Product':
      return 'Package';
    case 'SignatureCollection':
      return 'PaintBucket';
    case 'Category':
      return 'Folder';
    case 'Brand':
      return 'Tag';
    case 'QuoteRequest':
      return 'FileText';
    case 'QuoteRequestItem':
      return 'ShoppingCart';
    case 'PromoBanner':
      return 'Megaphone';
    default:
      return 'Layers';
  }
}

// Human-readable second line for each hit, model-specific.
function describe(resource: string, hit: SearchHit): string {
  switch (resource) {
    case 'Product':
      return [
        hit.slug,
        hit.priceDescription ? `GH₵${hit.priceDescription}` : null,
        hit.isFeatured ? 'Featured' : null,
        hit.isActive === false ? 'Inactive' : null,
      ]
        .filter(Boolean)
        .join(' · ');
    case 'SignatureCollection':
      return [
        hit.slug,
        hit.type ? `Type: ${hit.type}` : null,
        hit.isActive === false ? 'Inactive' : null,
      ]
        .filter(Boolean)
        .join(' · ');
    case 'Category':
      return [hit.slug, hit.showInNav ? 'In nav' : 'Hidden from nav']
        .filter(Boolean)
        .join(' · ');
    case 'Brand':
      return [hit.websiteUrl, hit.isActive === false ? 'Inactive' : null].filter(Boolean).join(' · ') || 'Brand';
    case 'QuoteRequest':
      return [hit.customerCompany, hit.customerPhone, hit.customerLocation, hit.status]
        .filter(Boolean)
        .join(' · ');
    case 'QuoteRequestItem':
      return `Qty: ${hit.quantity}`;
    case 'PromoBanner':
      return [hit.link, hit.isActive === false ? 'Inactive' : null].filter(Boolean).join(' · ') || 'Promo';
    default:
      return '';
  }
}

function title(resource: string, hit: SearchHit): string {
  switch (resource) {
    case 'Product':
    case 'SignatureCollection':
    case 'Category':
    case 'Brand':
      return String(hit.name ?? hit.id);
    case 'QuoteRequest':
      return String(hit.customerName ?? hit.id);
    case 'QuoteRequestItem':
      return String(hit.productName ?? hit.id);
    case 'PromoBanner':
      return String(hit.message || '(no message)');
    default:
      return String(hit.id);
  }
}

const GlobalSearch: React.FC = () => {
  const [input, setInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function runSearch(q: string) {
    const term = q.trim();
    setSubmitted(true);
    if (!term) {
      setResponse(null);
      setError(null);
      return;
    }
    setSearching(true);
    setError(null);
    api
      .getPage<SearchResponse>({ pageName: 'globalSearch', params: { q: term } })
      .then((res) => setResponse(res.data))
      .catch(() => {
        setResponse(null);
        setError('Search failed — please retry.');
      })
      .finally(() => setSearching(false));
  }

  return (
    <Box p="xl">
      <Box mb="lg">
        <H2 fontWeight="bold" mb="xs">
          Global Search
        </H2>
        <Text color="grey60">
          Search products, KMR paint collections, brands, categories, and quote requests with live photo previews.
        </Text>
      </Box>

      <Box flex alignItems="center" mb="lg" style={{ gap: '8px', maxWidth: '640px' }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runSearch(input);
          }}
          placeholder="Search by name, slug, color, customer, phone, location…"
          style={{ flex: 1 }}
        />
        <Button variant="primary" onClick={() => runSearch(input)} disabled={searching}>
          {searching ? 'Searching…' : 'Search'}
        </Button>
      </Box>

      {error && (
        <Box mb="lg">
          <MessageBox message={error} variant="danger" />
        </Box>
      )}

      {searching && (
        <Box p="xxl" flex justifyContent="center">
          <Loader />
        </Box>
      )}

      {!searching && submitted && !error && response && response.total === 0 && (
        <MessageBox
          message={`No matches for "${response.query}". Try a different search word.`}
          variant="info"
        />
      )}

      {!searching && !error && response && response.total > 0 && (
        <>
          <Text color="grey60" mb="lg">
            {response.total} result(s) for &ldquo;{response.query}&rdquo;
          </Text>
          {RESOURCES.map(({ key, label }) => {
            const hits = response.results[key] ?? [];
            if (hits.length === 0) return null;
            return (
              <Box key={key} mb="xl">
                <H2 mb="sm" fontSize="md" fontWeight="bold">
                  {label} ({hits.length})
                </H2>
                {hits.map((hit) => {
                  const thumbnail = getThumbnail(key, hit);
                  return (
                    <Box
                      key={hit.id}
                      flex
                      alignItems="center"
                      justifyContent="space-between"
                      py="sm"
                      mb="sm"
                      px="md"
                      borderLeft="4px solid"
                      borderColor="primary60"
                      backgroundColor="white"
                      style={{
                        gap: '16px',
                        borderRadius: '0 6px 6px 0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      <Box flex alignItems="center" style={{ gap: '14px', flex: 1, minWidth: 0 }}>
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={title(key, hit)}
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              border: '1px solid #E2E8F0',
                              flexShrink: 0,
                              backgroundColor: '#F8FAFC',
                            }}
                          />
                        ) : (
                          <Box
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '6px',
                              backgroundColor: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color: '#64748B',
                            }}
                          >
                            <Icon icon={getIconName(key)} />
                          </Box>
                        )}
                        <Box style={{ minWidth: 0, flex: 1 }}>
                          <Text
                            fontWeight="bold"
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: '14px',
                            }}
                          >
                            {title(key, hit)}
                          </Text>
                          <Text
                            color="grey60"
                            fontSize="sm"
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: '2px',
                            }}
                          >
                            {describe(key, hit) || '—'}
                          </Text>
                        </Box>
                      </Box>

                      <Box flex style={{ gap: '8px', flexShrink: 0 }}>
                        <Button
                          as="a"
                          href={`/admin/resources/${key}/records/${hit.id}/show`}
                          variant="outline"
                          size="sm"
                        >
                          View
                        </Button>
                        <Button
                          as="a"
                          href={`/admin/resources/${key}/records/${hit.id}/edit`}
                          size="sm"
                        >
                          <Icon icon="Edit" mr="default" />
                          Edit
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </>
      )}

      {!searching && !error && !submitted && (
        <Text color="grey80">Type a keyword above and press Enter (or click Search).</Text>
      )}
    </Box>
  );
};

export default GlobalSearch;

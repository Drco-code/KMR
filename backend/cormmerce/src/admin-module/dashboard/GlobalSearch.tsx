import React, { useState } from 'react';
import { ApiClient } from 'adminjs';
import {
  Box,
  Button,
  H2,
  Icon,
  Input,
  Label,
  Loader,
  MessageBox,
  Text,
} from '@adminjs/design-system';

const api = new ApiClient();

interface SearchHit {
  id: string;
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
  { key: 'Category', label: 'Categories' },
  { key: 'Brand', label: 'Brands' },
  { key: 'QuoteRequest', label: 'Quote Requests' },
  { key: 'QuoteRequestItem', label: 'Quote Line Items' },
  { key: 'PromoBanner', label: 'Promo Banner' },
];

// Human-readable second line for each hit, model-specific.
function describe(resource: string, hit: SearchHit): string {
  switch (resource) {
    case 'Product':
      return [hit.slug, hit.isFeatured ? 'Featured' : null, hit.isActive === false ? 'Inactive' : null]
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
          Search every model at once — products, categories, brands, quote requests and more.
          Results link straight to the matching record.
        </Text>
      </Box>

      <Box flex alignItems="center" mb="lg" style={{ gap: '8px', maxWidth: '640px' }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runSearch(input);
          }}
          placeholder="Search by name, slug, customer, phone, location…"
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
          message={`No matches for "${response.query}". Try a different word.`}
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
                <H2 mb="sm">
                  {label} ({hits.length})
                </H2>
                {hits.map((hit) => (
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
                    style={{ gap: '16px' }}
                  >
                    <Box>
                      <Text fontWeight="bold">{title(key, hit)}</Text>
                      <Text color="grey60" fontSize="sm">
                        {describe(key, hit) || '—'}
                      </Text>
                    </Box>
                    <Box flex style={{ gap: '8px' }}>
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
                ))}
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

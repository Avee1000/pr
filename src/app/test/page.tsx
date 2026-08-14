'use client';

import { useState, useEffect } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { fetchUserLocation } from '@/lib/geo/geo';

// --- API / Fetcher Functions ---
async function fetchPosts(page: number) {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=4`
  );
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

async function createPost(newPost: { title: string; body: string }) {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPost),
  });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
}

// --- Inner Component (Pagination + Mutation) ---
function PostsManager() {
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  // 1. Pagination Query
  const { data: posts, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => fetchPosts(page),
    placeholderData: keepPreviousData,
  });

  // 2. Mutation
  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setTitle('');
      alert('Post created successfully!');
    },
  });

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate({ title, body: 'Sample content' });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>TanStack Query Next.js Demo</h1>

      {/* Mutation Form */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Add New Post</h2>
        <form onSubmit={handleAddPost} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={mutation.isPending}
            style={{ flex: 1, padding: '8px' }}
          />
          <button type="submit" disabled={mutation.isPending} style={{ padding: '8px 16px' }}>
            {mutation.isPending ? 'Adding...' : 'Add Post'}
          </button>
        </form>
        {mutation.isError && (
          <p style={{ color: 'red' }}>Error: {(mutation.error as Error).message}</p>
        )}
      </section>

      {/* Paginated List */}
      <section style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Posts (Page {page})</h2>
          {isFetching && <small style={{ color: '#666' }}>Refreshing...</small>}
        </div>

        {isLoading && <p>Loading posts...</p>}
        {isError && <p style={{ color: 'red' }}>Error: {(error as Error).message}</p>}

        <ul style={{ paddingLeft: '20px' }}>
          {posts?.map((post: { id: number; title: string }) => (
            <li key={post.id} style={{ marginBottom: '8px', textTransform: 'capitalize' }}>
              <strong>#{post.id}:</strong> {post.title}
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={page === 1}
            style={{ padding: '8px 16px' }}
          >
            Previous
          </button>
          <button
            onClick={() => setPage((old) => old + 1)}
            disabled={posts?.length === 0}
            style={{ padding: '8px 16px' }}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}

// --- Main Page Component (Wraps Provider locally to avoid missing context errors) ---
export default function Page() {
  const [queryClient] = useState(() => new QueryClient());
  const [userLocation, setUserLocation] = useState(null);

  // 2. Safely call the async Server Action inside useEffect
  useEffect(() => {
    async function getUser() {
      const data = await fetchUserLocation();
      console.log('User Location:', data);
      setUserLocation(data);
    }
    getUser();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <PostsManager />
    </QueryClientProvider>
  );
}


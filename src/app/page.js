'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const postsPerPage = 5;

  const supabase = createClient();

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('Posts')
      .select('*, Users(name)', { count: 'exact' });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Pagination
    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage - 1;
    query = query.range(start, end).order('id', { ascending: false });

    const { data, count, error } = await query;
    
    if (error) {
      console.error(error);
    } else {
      setPosts(data || []);
      setTotalPages(Math.ceil((count || 0) / postsPerPage));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [page, search]);

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h1>Latest Insights</h1>
        <div>
          <a href="/create-post" className="btn btn-primary">Create Post</a>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search posts by title..." 
          className="input-field"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr' }}>
          {posts.map(post => (
            <div key={post.id} className="card">
              {post.image_url && (
                <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
              )}
              <h2><a href={`/posts/${post.id}`}>{post.title}</a></h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                By {post.Users?.name || 'Unknown Author'}
              </p>
              <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <strong>AI Summary:</strong>
                <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{post.summary}</p>
              </div>
              <div className="mt-4">
                <a href={`/posts/${post.id}`} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>Read Full Post</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8" style={{ gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button 
            className="btn btn-secondary"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

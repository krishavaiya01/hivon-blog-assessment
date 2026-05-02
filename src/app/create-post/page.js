'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        const { data } = await supabase.from('Users').select('role').eq('id', user.id).single();
        if (data && (data.role === 'Author' || data.role === 'Admin')) {
          setAuthChecking(false);
        } else {
          alert('You must be an Author or Admin to create posts.');
          router.push('/');
        }
      }
    }
    checkAuth();
  }, [router, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        },
        body: JSON.stringify({ title, body, image_url: imageUrl })
      });

      if (res.ok) {
        const { post } = await res.json();
        router.push(`/posts/${post.id}`);
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) return <p>Checking authorization...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Create New Post</h1>
      
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Title</label>
          <input 
            type="text" 
            required
            className="input-field" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Featured Image URL (optional)</label>
          <input 
            type="url" 
            className="input-field" 
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)} 
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Body Content</label>
          <textarea 
            required
            rows={10}
            className="input-field" 
            value={body} 
            onChange={e => setBody(e.target.value)} 
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Generating AI Summary & Publishing...' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
}

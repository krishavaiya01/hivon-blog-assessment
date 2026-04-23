'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

// src/pages/NewsletterSPA.jsx
import React, { useState, useRef } from 'react';
import AIPromptBox from '../components/AIPromptBox';
import SectionEditor from '../components/SectionEditor';
import { db } from '../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

export default function NewsletterSPA() {
  const [combinedContent, setCombinedContent] = useState('');
  const [imageKeywords, setImageKeywords] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const handleAIResponse = (parsed) => {
    if (!parsed || typeof parsed !== 'object') {
      console.error('Invalid AI response:', parsed);
      return;
    }
    const topUpdates = parsed.topUpdates || '';
    const shoutout = parsed.shoutout || '';
    setCombinedContent(`${topUpdates}<br/><br/>${shoutout}`);
    setImageKeywords(parsed.imageKeywords || []);
  };

  const uploadHtmlToStorage = async (html, filename) => {
    const storage = getStorage();
    const storageRef = ref(storage, `newsletters/${filename}`);
    await uploadString(storageRef, html, 'raw');
    return getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const html = editorRef.current?.innerHTML || combinedContent;

      const contentUrl = await uploadHtmlToStorage(html, `newsletter-${Date.now()}.html`);

      const docRef = await addDoc(collection(db, 'newsletters'), {
        title,
        contentUrl,
        imageKeywords,
        createdAt: Timestamp.now()
      });

      navigate(`/newsletter/${docRef.id}`);
    } catch (err) {
      console.error('Firebase save error:', err);
      alert('❌ Failed to save newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🧠 Smart Newsletter Builder</h1>

      <AIPromptBox onResponse={handleAIResponse} />

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full p-2 my-4 border rounded"
      />

      <label className="font-semibold">Newsletter</label>
      <SectionEditor
        title="Newsletter"
        content={combinedContent}
        onUpdate={setCombinedContent}
        imageKeywords={imageKeywords}
        forwardedRef={editorRef}
      />

      {imageKeywords.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Suggested Images: {imageKeywords.join(', ')}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {loading ? 'Saving...' : 'Save Newsletter'}
      </button>
    </div>
  );
}
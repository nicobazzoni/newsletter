// src/pages/NewsletterSPA.jsx
import React, { useState, useRef } from 'react';
import AIPromptBox from '../components/AIPromptBox';
import SectionEditor from '../components/SectionEditor';
import { db } from '../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useNavigate, Link } from 'react-router-dom';

export default function NewsletterSPA() {
  const [combinedContent, setCombinedContent] = useState('');
  const [imageKeywords, setImageKeywords] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('classic'); // default theme
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const themes = {
    classic: "bg-white text-black",
    dark: "bg-gray-900 text-white",
    bluewave: "bg-gradient-to-b from-blue-600 to-blue-400 text-white",
    sunrise: "bg-gradient-to-b from-orange-500 to-yellow-300 text-black"
  };

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

      // ✅ Actually store and get the document ID
      const docRef = await addDoc(collection(db, 'newsletters'), {
        title,
        contentUrl,
        imageKeywords,
        theme, // Save only theme name
        createdAt: Timestamp.now(),
      });

      navigate(`/newsletter/${docRef.id}`); // ✅ correct detail URL
    } catch (err) {
      console.error('Firebase save error:', err);
      alert('❌ Failed to save newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mt-4 justify-between flex border-black border-2 items-center bg-blue-300 p-3 mb-2 shadow">
        <h1 className="text-2xl font-bold mb-4">🧠 Tech Op Times Creator</h1>
        <Link to="/newsletters" className="text-blue-600 border bg-white rounded-full p-2 mx-2 mb-2">
          View All Newsletters
        </Link>
      </div>

     

      <AIPromptBox onResponse={handleAIResponse} />

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full p-2 my-4 border rounded"
      />

      <label className="font-semibold">Theme</label>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="border p-2 rounded mb-4"
      >
        <option value="classic">Classic</option>
        <option value="dark">Dark</option>
        <option value="bluewave">Blue Wave</option>
        <option value="sunrise">Sunrise</option>
      </select>

      {/* Live Preview */}
      <div className={`p-4 rounded ${themes[theme]}`}>
        <SectionEditor
          title="Newsletter"
          content={combinedContent}
          onUpdate={setCombinedContent}
          imageKeywords={imageKeywords}
          forwardedRef={editorRef}
          textColorClass={theme === 'dark' || theme === 'bluewave' ? 'text-white' : 'text-black'}
        />
      </div>

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
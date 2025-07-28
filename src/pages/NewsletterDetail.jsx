import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import tech from '../assets/tech.png'

export default function NewsletterDetail() {
  const { id } = useParams();
  const [newsletter, setNewsletter] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const fetchNewsletter = async () => {
      const ref = doc(db, 'newsletters', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setNewsletter(data);

        // Fetch HTML from Firebase Storage
        if (data.contentUrl) {
          const res = await fetch(data.contentUrl);
          const html = await res.text();
          setHtmlContent(html);
        }
      }
    };
    fetchNewsletter();
  }, [id]);

  if (!newsletter) return <p className="p-4">Loading newsletter...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="text-center border-b pb-4">
        <img src={tech} alt="Tech Op Times" className="w-full max-h-40" />
      </div>

      <h1 className="text-2xl text-center underline font-bold">{newsletter.title}</h1>
      <div style={{ overflow: 'auto' }}>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>

      <footer className="mt-8 text-sm text-gray-500 border-t pt-4 flex justify-between">
        <span>&copy; {new Date().getFullYear()} Tech Op Times</span>
        <div className="space-x-4">
          <a href="https://www.fox.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">fox.com</a>
          <a href="https://www.foxnews.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">foxnews.com</a>
        </div>
      </footer>

      <style>{`
        img { max-width: 100%; height: auto; }
      `}</style>
    </div>
  );
}
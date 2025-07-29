import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

export default function NewsletterList() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'newsletters'));
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNewsletters(list);
      } catch (err) {
        console.error('Error fetching newsletters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  if (loading) return <p>Loading newsletters...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">📰 All Newsletters</h2>
      <ul className="space-y-2">
        {newsletters.map((n) => (
          <li key={n.id} className="border-b pb-2">
            <Link to={`/newsletter/${n.id}`} className="text-blue-600 hover:underline">
              {n.title || 'Untitled Newsletter'}
            </Link>
            <div className="text-sm text-gray-500">
              {n.createdAt?.toDate().toLocaleString() || 'No date'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
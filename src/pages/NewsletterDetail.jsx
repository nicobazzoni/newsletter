import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import tech from '../assets/TECHOPS.png';
import html2pdf from 'html2pdf.js';

export default function NewsletterDetail() {
  const { id } = useParams();
  const [newsletter, setNewsletter] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');

  const themes = {
    classic: "bg-white text-black",
    dark: "bg-gray-900 text-white",
    bluewave: "bg-gradient-to-b from-blue-600 to-blue-400 text-white",
    sunrise: "bg-gradient-to-b from-orange-500 to-yellow-300 text-black"
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('newsletter-content');
    html2pdf().from(element).save('newsletter.pdf');
  };

  useEffect(() => {
    const fetchNewsletter = async () => {
      const ref = doc(db, 'newsletters', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setNewsletter(data);

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
    <div className={`mx-auto p-6 ${themes[newsletter.theme] || ''}`}>
      <div id="newsletter-content">
        <div className="text-center border-b pb-4">
          <img src={tech} alt="Tech Op Times" className="w-full max-h-40" />
        </div>

        <h1 className="text-2xl text-center underline font-bold">{newsletter.title}</h1>
        
        {/* Center content and images */}
        <div 
          className="prose max-w-none mx-auto" 
          style={{ textAlign: 'center' }} 
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />

        {/* Style for centering images */}
        <style>
          {`
            #newsletter-content img {
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
          `}
        </style>
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={handleDownloadPDF}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Download PDF
        </button>

        <button
          onClick={async () => {
            if (navigator.share) {
              await navigator.share({
                title: newsletter.title || 'Newsletter',
                text: 'Check out this newsletter from Tech Op Times',
                url: window.location.href,
              });
            } else {
              alert('Sharing not supported on this browser.');
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Share
        </button>
        <Link to="/" className="bg-white border px-4 py-2 rounded">Home</Link>
      </div>

      <footer className="mt-8 text-sm text-gray-500 border-t pt-4 flex justify-between">
        <span>&copy; {new Date().getFullYear()} Tech Op Times</span>
        <div className="space-x-4">
          <a href="https://www.fox.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">fox.com</a>
          <a href="https://www.foxnews.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">foxnews.com</a>
        </div>
      </footer>
    </div>
  );
}
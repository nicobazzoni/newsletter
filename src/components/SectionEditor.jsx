import React, { useState, useEffect, useRef } from 'react';
import ImageSuggestion from './ImageSuggestion';

export default function SectionEditor({ content, onUpdate, imageKeywords = [], textColorClass = 'text-black', forwardedRef = null }) {
  const [localContent, setLocalContent] = useState(content);
  const savedSelection = useRef(null);
  const internalRef = useRef(null);
  const editorRef = forwardedRef || internalRef;

  useEffect(() => {
    setLocalContent(content);
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const insertImageAtCursor = (url) => {
    document.execCommand('insertImage', false, url); // ✅ Use execCommand for undo support
  };

  return (
    <div className="p-4 rounded shadow">
      <div className="mb-2 space-x-2">
        <button onClick={() => document.execCommand('undo')} className="px-2 py-1 border rounded">Undo</button>
        <button onClick={() => document.execCommand('redo')} className="px-2 py-1 border rounded">Redo</button>
        <button onClick={() => document.execCommand('bold')} className="px-2 py-1 border rounded">Bold</button>
        <button onClick={() => document.execCommand('italic')} className="px-2 py-1 border rounded">Italic</button>
        <button onClick={() => document.execCommand('underline')} className="px-2 py-1 border rounded">Underline</button>

        <button
          onClick={() => {
            const url = prompt("Enter the link URL:");
            if (!url) return;

            let displayText = prompt("Enter the text to display for the link:");
            if (!displayText) displayText = url;

            document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" style="color:#2563eb; text-decoration:underline; font-weight:500;">${displayText}</a>`);
          }}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          Link
        </button>

        <button
          onClick={() => {
            const selection = window.getSelection();
            if (!selection.rangeCount || selection.isCollapsed) {
              alert("Please select text to quote.");
              return;
            }
            const html = selection.toString();
            document.execCommand('insertHTML', false, `<blockquote style="font-size:1.25rem; font-style:italic; border-left:4px solid #2563eb; padding-left:1rem; margin:1rem 0; color:#374151;">${html}</blockquote>`);
          }}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          Quote
        </button>

        <label className="px-2 py-1 border rounded cursor-pointer">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) insertImageAtCursor(event.target.result);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />
        </label>

        <button onClick={() => document.execCommand('foreColor', false, '#e63946')} className="px-2 py-1 border rounded text-red-600">Red</button>
        <button onClick={() => document.execCommand('fontName', false, 'Courier New')} className="px-2 py-1 border rounded">Mono</button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className={`w-full border p-2 rounded min-h-[150px] bg-transparent ${textColorClass}`}
        dangerouslySetInnerHTML={{ __html: localContent }}
        onInput={(e) => {
          // Only update state on blur to preserve undo history
        }}
        onBlur={(e) => {
          const newContent = e.currentTarget.innerHTML;
          setLocalContent(newContent);
          onUpdate(newContent);
        }}
        onMouseUp={() => {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            savedSelection.current = sel.getRangeAt(0);
          }
        }}
        onKeyUp={() => {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            savedSelection.current = sel.getRangeAt(0);
          }
        }}
      />

      {imageKeywords.length > 0 && (
        <div className="mt-4">
          <ImageSuggestion
            keywords={imageKeywords}
            onSelect={(url) => insertImageAtCursor(url)}
          />
        </div>
      )}
    </div>
  );
}
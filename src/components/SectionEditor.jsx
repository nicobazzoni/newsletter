import React, { useState, useEffect, useRef } from 'react';
import ImageSuggestion from './ImageSuggestion';

export default function SectionEditor({ content, onUpdate, imageKeywords = [],textColorClass = 'text-black', forwardedRef = null }) {
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
    const editor = editorRef.current;
    if (!editor) return;

    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.style.maxWidth = '24rem';
    img.style.height = 'auto';
    img.className = 'mt-2 rounded';

    editor.focus();
    const range = savedSelection.current || document.createRange();
    if (!editor.contains(range.startContainer)) {
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    if (!range.collapsed) range.deleteContents();
    range.insertNode(img);
    range.collapse(false);

    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setLocalContent(editor.innerHTML);
    onUpdate(editor.innerHTML);
  };

  return (
  <div className="p-4 rounded shadow">
    <div className="mb-2 space-x-2">
      <button onClick={() => document.execCommand('bold')} className="px-2 py-1 border rounded">Bold</button>
      <button onClick={() => document.execCommand('italic')} className="px-2 py-1 border rounded">Italic</button>
      <button onClick={() => document.execCommand('underline')} className="px-2 py-1 border rounded">Underline</button>

      <button
        onClick={() => {
          const url = prompt("Enter the link URL:");
          if (!url) return;

          let displayText = prompt("Enter the text to display for the link:");
          if (!displayText) displayText = url;

          const selection = window.getSelection();
          const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

          if (range && !selection.isCollapsed) {
            document.execCommand("createLink", false, url);
          } else {
            const link = document.createElement("a");
            link.href = url;
            link.textContent = displayText;
            link.target = "_blank";
            link.style.color = "#2563eb"; 
            link.style.textDecoration = "underline";
            link.style.fontWeight = "500";

            if (range) {
              range.insertNode(link);
              range.collapse(false);
            }
          }
        }}
        className="px-2 py-1 border rounded hover:bg-gray-100"
      >
        Link
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
import React, { useState, useEffect, useRef } from 'react';
import ImageSuggestion from './ImageSuggestion';

export default function SectionEditor({ content, onUpdate, imageKeywords = [], textColorClass = 'text-black', forwardedRef = null }) {
  const [localContent, setLocalContent] = useState(content);
  const savedSelection = useRef(null);
  const internalRef = useRef(null);
  const editorRef = forwardedRef || internalRef;

  // Only update innerHTML if content prop truly changes
  useEffect(() => {
    if (content !== localContent) {
      setLocalContent(content);
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0);
    }
  };

  const insertImageAtCursor = (url) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    saveSelection(); // Ensure we have the latest caret

    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.style.maxWidth = '24rem';
    img.style.height = 'auto';
    img.className = 'mt-2 rounded';

    const range = savedSelection.current || document.createRange();
    if (!editor.contains(range.startContainer)) {
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    range.insertNode(img);
    range.collapse(false);

    setLocalContent(editor.innerHTML);
    onUpdate(editor.innerHTML);
  };

  return (
    <div className="p-4 rounded shadow">
      <div className="mb-2 space-y-2 space-x-2">
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
        <button
  onClick={() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);

    const tile = document.createElement("div");
tile.className = "tile-block bg-white text-black border rounded p-4 shadow hover:shadow-lg transition";
    tile.innerHTML = selection.toString();

    range.deleteContents();
    range.insertNode(tile);
  }}
  className="px-2 py-1 border rounded text-black"
>
  Tile
</button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning={true}
        className={`prose prose-lg max-w-2xl text0black mx-auto border p-4 rounded bg-transparent ${textColorClass}`}
        style={{ minHeight: localContent.trim() ? 'auto' : '150px' }}
        dangerouslySetInnerHTML={{ __html: localContent }}
        onInput={(e) => {
          const newContent = e.currentTarget.innerHTML;
          setLocalContent(newContent);
          onUpdate(newContent);
        }}
        onFocus={saveSelection}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
      />

<style jsx>{`
  .prose img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
`}</style>

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
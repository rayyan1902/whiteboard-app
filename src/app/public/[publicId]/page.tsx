"use client";

import "tldraw/tldraw.css";
import { useEffect, useState } from "react";
import { Tldraw, TLStoreSnapshot } from "tldraw";
import { useParams } from "next/navigation";

export default function PublicWhiteboardPage() {
  const { publicId } = useParams();
  const [snapshot, setSnapshot] = useState<TLStoreSnapshot | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWhiteboard = async () => {
      try {
        const res = await fetch(`/api/public/${publicId}`);
        if (!res.ok) {
          setError(true);
          return;
        }

        const data = await res.json();
        const parsedContent = JSON.parse(data.content);
        setSnapshot(parsedContent);
        setTitle(data.title || "Untitled");
        setStatus("Published");
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };

    fetchWhiteboard();
  }, [publicId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/public/${publicId}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (error)
    return (
      <div className="p-10 text-center text-xl font-semibold text-red-500">
        Whiteboard not found.
      </div>
    );
  if (!snapshot)
    return <div className="p-10 text-center text-xl">Loading...</div>;

  return (
    <div className="min-h-screen w-full bg-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold capitalize">{title}</h1>
            <p className="text-gray-500 text-sm">{status}</p>
          </div>
          <button
            onClick={handleCopyLink}
            className="bg-green-500 text-white font-semibold py-2 px-4 rounded-3xl hover:opacity-50 transition-all duration-300 text-sm"
          >
            {copied ? "Link Copied!" : "Share"}
          </button>
        </div>

        <div className="border rounded-xl overflow-hidden shadow-md">
          <div className="w-full h-[75vh] bg-gray-100">
            <Tldraw
              snapshot={snapshot}
              autoFocus={false}
              onMount={(editor) => {
                editor.updateInstanceState({ isReadonly: true });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

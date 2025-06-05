"use client";

import "tldraw/tldraw.css";
import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
// import debounce from 'lodash.debounce'
import { debounce, Tldraw, TLStoreSnapshot } from "tldraw";
import type { Editor } from "tldraw";
import { Whiteboard } from "@prisma/client";

interface Pin {
  id: string;
  x: number;
  y: number;
  text: string;
  authorName: string;
  createdAt: string;
}

export default function WhiteboardPage() {
  const { user } = useUser();
  const params = useParams();

  const [content, setContent] = useState<TLStoreSnapshot | undefined>(
    undefined
  );
  const [whiteboard, setWhiteboard] = useState<Whiteboard>();
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const router = useRouter();
  const whiteboardId = params.id;
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [commentMode, setCommentMode] = useState(false);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [autosave, setAutosave] = useState(false);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [screenLoader, setScreenLoader] = useState(false);
  const boardId = params.id as string;
  const [copied, setCopied] = useState(false);


  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    setScreenLoader(false);
    fetch(`/api/whiteboards/${whiteboard?.id || whiteboardId}`)
      .then(async (res) => {
        const text = await res.text();
        if (!text) return null; // Empty response
        return JSON.parse(text);
      })
      .then((data) => {
        if (!data) {
          setStatus("ready");
          return;
        }

        if (data.content) {
          try {
            setContent(JSON.parse(data.content));
          } catch (err) {
            console.error("Invalid JSON in content", err);
          }
        }

        setWhiteboard(data);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Error loading whiteboard:", err);
        setStatus("ready");
      });
  }, [whiteboardId, whiteboard?.id]);

 
  const saveChanges = useMemo(() => {
    return debounce(async (json: string) => {
      try {
        setAutosave(true);
        if (!whiteboard) {
          setScreenLoader(true);
          const res = await fetch(`/api/whiteboards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: whiteboardId,
              content: json,
              title: `${whiteboardId} Whiteboard`,
              status: "draft",
              authorId: user?.id,
              authorName: user?.fullName,
            }),
          });
          const created = await res.json();
          setWhiteboard(created);
          setAutosave(false);
          router.push(`/whiteboard/${created?.id}`);
        } else {
          await fetch(`/api/whiteboards/${whiteboard.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: json,
              title: whiteboard.title,
              status: whiteboard.status,
            }),
          });
          setAutosave(false);
        }
      } catch (err) {
        console.error("Save failed:", err);
        setAutosave(false);
      }
    }, 500);
  }, [whiteboard, user, whiteboardId, router]);
  

  useEffect(() => {
    if (!editorInstance) return;

    const unsubscribe = editorInstance.store.listen(
      () => {
        const json = JSON.stringify(editorInstance.store.getSnapshot());
        saveChanges(json);
      },
      { source: "user", scope: "document" }
    );

    return () => unsubscribe();
  }, [editorInstance, saveChanges]);

  useEffect(() => {
    fetch(`/api/pins/${whiteboard?.id || boardId}`)
      .then((res) => res.json())
      .then((data) => setPins(data));
  }, [boardId, whiteboard?.id]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSelectedPosition({ x, y });
  };

  const handleSaveComment = async () => {
    setLoadingComment(true);
    const res = await fetch(`/api/pins/${whiteboard?.id}`, {
      method: "POST",
      body: JSON.stringify({
        x: selectedPosition?.x,
        y: selectedPosition?.y,
        text: commentText,
        authorName: user?.fullName,
      }),
    });
    const newPin = await res.json();
    setPins([...pins, newPin]);
    setCommentText("");
    setSelectedPosition(null);
    setLoadingComment(false);
  };

  const handlePublishCanvas = async () => {
    if (!editorInstance || !whiteboard) return;

    try {
      setLoadingPublish(true);
      const snapshot = editorInstance.store.getSnapshot();
      const contentJson = JSON.stringify(snapshot);

      const res = await fetch(`/api/whiteboards/${whiteboard.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentJson,
          title: whiteboard.title,
          status: "published",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setWhiteboard(updated);
        setLoadingPublish(false);
      } else {
        console.error("Failed to publish canvas");
        setLoadingPublish(false);
      }
    } catch (err) {
      console.error("Error publishing canvas:", err);
      setLoadingPublish(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "c") {
        setCommentMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopyLink = (publicId: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/public/${publicId}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (status === "loading")
    return (
      <div className="container mx-auto h-full flex flex-col justify-center items-center text-center">
        <span className="h-full flex flex-col justify-center">
          <p className="text-3xl font-semibold animate-pulse absolute top-1/2">
            Loading...
          </p>
        </span>
      </div>
    );

  return (
    <>
      {screenLoader ? (
        <>
          <div className="container mx-auto h-full flex flex-col justify-center items-center text-center">
            <span className="h-full flex flex-col justify-center">
              <p className="text-3xl font-semibold animate-pulse absolute top-1/2">
                Loading...
              </p>
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="h-screen w-screen mb-18">
            <div className="w-full container mx-auto my-4">
              <span className="flex justify-between items-center">
                <p
                  className={`w-full opacity-50 ${
                    autosave ? "animate-pulse" : ""
                  }`}
                >
                  {autosave ? "Auto-Saving...." : "Auto-Saved"}
                </p>

                <span className="w-full flex justify-end gap-4">
                  <button
                    className={`bg-black ${
                      loadingPublish ? "animate-pulse" : ""
                    } cursor-pointer text-white font-semibold px-4 py-2 rounded-3xl`}
                    onClick={handlePublishCanvas}
                  >
                    {loadingPublish ? "Loading..." : "Publish"}
                  </button>

                  <button
                    onClick={() => {
                     handleCopyLink(whiteboard?.publicId || "")
                      handlePublishCanvas();
                    }}
                    className="bg-blue-600 font-semibold cursor-pointer text-white px-4 py-2 rounded-3xl"
                  >
            {copied ? "Link Copied!" : "Share"}
            </button>
                </span>
              </span>
            </div>

            <div className="h-[80%] container mx-auto">
              <Tldraw
                autoFocus
                snapshot={content}
                onMount={(editor) => setEditorInstance(editor)}
              />
            </div>

            <div className="container mx-auto mt-10">
              <p className="font-bold">Instructions:</p>
              <li className="opacity-70">
                Press &quot;C&quot; on the keyboard and then click on the canvas to view
                or add new comments.
              </li>
              <li className="opacity-70">
                Your progress is being saved automatically in the real time.
              </li>
              <li className="opacity-70">
                Click on the publish button after your canvas is ready.
              </li>
              <li className="opacity-70">
                Click on the share button and share the copied link with others.
              </li>
            </div>

            {commentMode && (
              <div
                className="absolute top-0 left-0 w-full h-full"
                onClick={handleCanvasClick}
              >
                {pins.map((pin) => {
                  const isHovered = hoveredPinId === pin.id;
                  return (
                    <div
                      key={pin.id}
                      onMouseEnter={() => setHoveredPinId(pin.id)}
                      onMouseLeave={() => setHoveredPinId(null)}
                      className={`${
                        isHovered
                          ? "p-4 min-w-[300px] space-y-4 cursor-pointer"
                          : "p-2 cursor-pointer"
                      } absolute border  rounded-xl   bg-white border-gray-300 `}
                      style={{ top: pin.y, left: pin.x }}
                      title={`${pin.text}\n— ${pin.authorName}`}
                    >
                      <p className="font-semibold opacity-50">Comment</p>
                      <span
                        className={`${
                          isHovered ? "block" : "hidden"
                        } cursor-pointer space-y-4 transition-all duration-300`}
                      >
                        <p className="capitalize bg-gray-100 rounded-xl p-4">
                          {pin?.text || ""}
                        </p>

                        <span className="text-sm flex justify-between">
                          <p>{pin?.authorName || ""}</p>
                          <p>
                            {pin?.createdAt
                              ? new Date(pin.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : ""}
                          </p>
                        </span>
                      </span>
                    </div>
                  );
                })}
                ;
                {selectedPosition && (
                  <div
                    className="absolute space-y-4 bg-white p-2 rounded shadow-md z-50"
                    style={{
                      top: selectedPosition.y,
                      left: selectedPosition.x,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <textarea
                      className="w-full p-3 border rounded-xl border-gray-300"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment"
                    />

                    <span className="w-full flex justify-between gap-4">
                      <button
                        className={`bg-black ${
                          loadingComment ? "animate-pulse" : ""
                        } cursor-pointer text-white px-4 py-2 rounded-3xl`}
                        onClick={handleSaveComment}
                      >
                        {loadingComment ? "Loading..." : "Save"}
                      </button>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

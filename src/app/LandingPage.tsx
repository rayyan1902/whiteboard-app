"use client";

import { Whiteboard } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface WhiteboardProps {
  whiteboards: Whiteboard[];
}

const LandingPage: React.FC<WhiteboardProps> = ({ whiteboards }) => {
  const route = useRouter();
  const [modal, setModal] = useState(false);
  const [whiteboardName, setWhiteboardName] = useState("");
  const [deleting, setDeleting] = useState("");
  const [copied, setCopied] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");

  const handleNewWhiteboard = () => {
    route.push(`/whiteboard/${whiteboardName}`);
    setWhiteboardName("");
  };

  const handleDeleteWhiteboard = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/whiteboards/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete whiteboard");
      }

      route.refresh();

      setDeleting("");
    } catch (err) {
      console.error(err);
      setDeleting("");
      alert("An error occurred while deleting the whiteboard.");
    }
  };

  const handleCopyLink = (publicId: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/public/${publicId}`
    );
    setCopied(publicId);
    setTimeout(() => setCopied(""), 1500);
  };

  const filteredWhiteboards = whiteboards.filter((board) => {
    if (filter === "all") return true;
    return board.status === filter;
  });

  return (
    <div>
      <div className="w-full relative flex justify-center my-20">
        <button
          onClick={() => setModal(true)}
          className="btn border rounded-3xl cursor-pointer py-2 px-4 text-3xl bg-black text-white font-bold hover:opacity-50 transition-all duration-300"
        >
          + Create New Whiteboard
        </button>
      </div>

      <div
        className={`${
          modal ? "block" : "hidden"
        } absolute h-full w-full z-30 inset-0 bg-black/20 flex flex-col items-center justify-center`}
      >
        <div className="bg-white min-w-[400px] space-y-10 rounded-xl shadow-sm shadow-black/10 py-4 px-8">
          <span className="flex flex-col gap-1">
            <label className="font-semibold">Whiteboard Name</label>
            <input
              value={whiteboardName}
              onChange={(e) => setWhiteboardName(e.target.value)}
              placeholder="Untitled Design"
              className="border rounded border-gray-300 px-4 py-4"
              type="text"
            />
          </span>

          <span className="w-full flex justify-end gap-4">
            <button
              onClick={() => {
                setModal(false);
                setWhiteboardName("");
              }}
              className={` bg-red-500 hover:opacity-50 transition-all duration-300 cursor-pointer text-white font-semibold px-4 py-1 rounded-3xl`}
            >
              Close
            </button>
            <button
              onClick={handleNewWhiteboard}
              disabled={whiteboardName === ""}
              className={`${
                whiteboardName !== "" ? "" : "opacity-50"
              } bg-blue-500  hover:opacity-50 transition-all duration-300 cursor-pointer text-white font-semibold px-4 py-1 rounded-3xl`}
            >
              Next
            </button>
          </span>
        </div>
      </div>

      {whiteboards?.length > 0 ? (
        <>
          <div className="w-full flex justify-between">
            <h3 className="text-2xl font-semibold">
              Your Existing Whiteboards
            </h3>
            <div className="mb-6 flex justify-end">
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as "all" | "draft" | "published")
                }
                className="border px-4 py-2 rounded-lg"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <ul className="">
            {filteredWhiteboards.map((board) => (
              <li
                className="w-full border text-md border-gray-300 bg-gray-50 hover:bg-gray-200 transition-all duration-300 px-4 py-2 rounded-full grid grid-cols-5 gap-10 my-4 capitalize"
                key={board.id}
              >
                <p className="py-2 px-4 font-semibold">{board.title || "Untitled"}</p>
                <p className="py-2 px-4 ">Status: {board.status || "draft"}</p>
                {board.status === "draft" ? (
                  <button
                    disabled={board.status === "draft"}
                    className=" text-white font-semibold opacity-50 cursor-not-allowed py-2 px-4 hover:opacity-50 transition-all duration-300  rounded-3xl text-sm items-center text-center bg-green-500"
                  >
                    Share
                  </button>
                ) : (
                  <button
                    disabled={board.status === "draft"}
                    className="cursor-pointer text-white font-semibold py-2 px-4 hover:opacity-50 transition-all duration-300  rounded-3xl text-sm items-center text-center bg-green-500"
                    onClick={() => handleCopyLink(board.publicId)}
                  >
                    {copied === board?.publicId ? "Link Copied!" : "Share"}
                  </button>
                )}

                <Link
                  className="cursor-pointer text-white font-semibold py-2 px-4 hover:opacity-50 transition-all duration-300  rounded-3xl text-sm items-center flex justify-center text-center bg-blue-500"
                  href={`/whiteboard/${board.id}`}
                >
                  <button>Open</button>
                </Link>
                <button
                  onClick={() => handleDeleteWhiteboard(board.id)}
                  className={`cursor-pointer    ${
                    deleting === board.id ? "animate-pulse" : ""
                  } hover:opacity-50 transition-all duration-300  text-white font-semibold py-2 px-4 rounded-3xl text-sm items-center text-center bg-red-500`}
                >
                  {deleting === board.id ? "Deleting" : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <h3 className="text-2xl font-semibold capitalize">
          No Existing Whiteboards found, click on the create button and start
          your journey!
        </h3>
      )}
    </div>
  );
};

export default LandingPage;

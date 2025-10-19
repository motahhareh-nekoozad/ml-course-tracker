import React from "react";
import VideoItem from "./VideoItem";

function VideoList({ videos, userIds }) {
  const colors = { user2: "yellow", user1: "purple" };

  return (
    <div className="mt-4 space-y-2">
      {videos.map((v) =>
        userIds.map((uid) => (
          <VideoItem key={`${v.title}_${uid}`} video={v} userId={uid} color={colors[uid]} />
        ))
      )}
    </div>
  );
}

export default VideoList;

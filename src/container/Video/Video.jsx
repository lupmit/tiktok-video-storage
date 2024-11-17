import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Artplayer from "artplayer";
import Hls from "hls.js";
import "./index.css";

const Video = () => {
  const artRef = useRef();
  const playerRef = useRef();
  const { videoID } = useParams();

  useEffect(() => {
    if (artRef.current) {
      artRef.current.destroy(false);
      artRef.current = undefined;
    }
    artRef.current = new Artplayer({
      container: playerRef.current,
      url: `https://stream.lupmit.workers.dev/${videoID}`,
      type: "m3u8",
      setting: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      hotkey: true,
      pip: true,
      autoSize: true,
      customType: {
        m3u8: (video, url, art) => {
          if (Hls.isSupported()) {
            if (art.hls) art.hls.destroy();
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            art.hls = hls;
            art.on("destroy", () => hls.destroy());
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else {
            art.notice.show = "Unsupported playback format: m3u8";
          }
        },
      },
    });

    return () => {
      if (artRef.current && artRef.current.destroy) {
        artRef.current.destroy(false);
      }
    };
  }, [videoID]);

  return (
    <div className="video-wrapper">
      <div className="video-player" ref={playerRef}></div>
    </div>
  );
};

export default Video;

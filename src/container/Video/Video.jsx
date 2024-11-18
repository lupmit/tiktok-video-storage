import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Artplayer from "artplayer";
import Hls from "hls.js";
import "./index.css";

const Video = () => {
  const artRef = useRef();
  const playerRef = useRef();
  const { videoID } = useParams();

  const videoRef = useRef(null);

  useEffect(() => {
    const videoUrl = `https://stream.lupmit.workers.dev/${videoID}`;
    // Kiểm tra xem trình duyệt có hỗ trợ HLS hay không
    if (Hls.isSupported()) {
      const hls = new Hls();

      // Khi video tải được, bắt đầu phát
      hls.loadSource(videoUrl);

      // Liên kết hls với video element
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("Manifest parsed!");
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("HLS network error");
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("HLS media error");
              break;
            case Hls.ErrorTypes.OTHER_ERROR:
              console.error("HLS other error");
              break;
            default:
              console.error("Unknown error");
              break;
          }
        }
      });

      // Clean up khi component bị unmount
      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = videoUrl;
    }
  }, [videoID]);

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
      <video
        ref={videoRef}
        controls
        style={{ width: "100%", height: "auto" }}
        onError={(e) => console.error("Video playback error", e)}
      />
    </div>
  );
};

export default Video;

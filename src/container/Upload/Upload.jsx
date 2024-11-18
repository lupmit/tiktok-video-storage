import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import axios from "axios";
import { Buffer } from "buffer";
import { useNavigate } from "react-router-dom";
import Loading from "../../component/Loading/Loading";
import FileIcon from "../../assets/file-icon.svg?react";
import FileUploading from "../../assets/file-uploading.svg?react";
import FileUploaded from "../../assets/file-uploaded.svg?react";
import "./index.css";

const Upload = () => {
  const ffmpegRef = useRef(createFFmpeg({ log: true }));
  const [error, setError] = useState(false);
  const [currentUpload, setCurrentUpload] = useState();
  const navigate = useNavigate();
  const historyData = JSON.parse(localStorage.getItem("history")) || [];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.6/dist";
      let ffmpeg = ffmpegRef.current;
      ffmpeg.setLogger(({ message }) => {
        console.log(message);
      });

      ffmpeg.setProgress(({ ratio }) => {
        setCurrentUpload((prev) => {
          return {
            ...prev,
            progress: (ratio * 100) / 2,
          };
        });
      });

      if (ffmpegRef.current.isLoaded()) return;

      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        workerURL: `${baseURL}/ffmpeg-core.worker.js`,
      });

      setLoading(false);
    };
    load();

    return () => {
      if (ffmpegRef.current.isLoaded()) {
        ffmpegRef.current.exit();
      }
    };
  }, []);

  useEffect(() => {
    if (currentUpload && currentUpload.progress === 100) {
      setCurrentUpload(undefined);
      historyData.unshift(currentUpload);
      localStorage.setItem("history", JSON.stringify(historyData));
    }
  }, [currentUpload, historyData]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      setError(true);
      return;
    }
    const file = acceptedFiles[0];
    if (!file.type.startsWith("video/")) {
      setError(true);
      return;
    }

    setCurrentUpload({
      name: file.name,
      progress: 0,
      stream: null,
    });

    await transcode(file);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    disabled: Boolean(currentUpload),
  });

  const uploadFiles = async (files) => {
    const formData = new FormData();
    const base = Buffer.from([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
      0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84,
      120, 218, 99, 252, 207, 192, 80, 15, 0, 4, 133, 1, 128, 132, 169, 140, 33,
      0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255,
    ]);

    files.forEach((file, index) => {
      let fileData = file.data.slice(188, file.data.length);
      fileData = Buffer.from(Buffer.concat([base, fileData]));

      formData.append(`file${index}`, new Blob([fileData]), `${file.name}.png`);
    });

    try {
      const response = await axios.post(
        "https://upload.lupmit.workers.dev/",
        formData
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const uploadSingleFile = async (file) => {
    const formData = new FormData();

    const base = Buffer.from([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
      0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84,
      120, 218, 99, 252, 207, 192, 80, 15, 0, 4, 133, 1, 128, 132, 169, 140, 33,
      0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255, 255, 255, 255, 255, 255,
    ]);
    const fileData = Buffer.from(Buffer.concat([base, file]));
    formData.append("file", new Blob([fileData]), "file.png");

    try {
      const response = await axios.post(
        "https://upload.lupmit.workers.dev/",
        formData
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const splitFileSlice = (slice, maxLength) => {
    let result = [];
    let currentGroup = [];
    let currentSum = 0;

    slice.forEach((item) => {
      if (currentSum + item.data.length <= maxLength) {
        currentGroup.push(item);
        currentSum += item.data.length;
      } else {
        result.push(currentGroup);
        currentGroup = [item];
        currentSum = item.data.length;
      }
    });

    if (currentGroup.length > 0) {
      result.push(currentGroup);
    }

    return result;
  };

  const transcode = async (file) => {
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));
    await ffmpeg.run(
      "-i",
      "input.mp4",
      "-codec:",
      "copy",
      "-start_number",
      "0",
      "-hls_time",
      "10",
      "-hls_list_size",
      "0",
      "-f",
      "hls",
      "output.m3u8"
    );
    const m3u8Data = await ffmpeg.FS("readFile", "output.m3u8");
    const m3u8Unit = new Uint8Array(m3u8Data);
    let m3u8Text = await new Blob([m3u8Unit.buffer]).text();

    const tsFiles = [];
    let index = 0;
    while (true) {
      try {
        const tsData = await ffmpeg.FS("readFile", `output${index}.ts`);
        tsFiles.push({ data: tsData, name: `output${index}.ts` });
        index++;
      } catch (e) {
        break;
      }
    }

    setCurrentUpload((prev) => {
      return {
        ...prev,
        progress: 70,
      };
    });

    const groupFiles = splitFileSlice(tsFiles, 95000000);

    const promises = groupFiles.map((group) => {
      return uploadFiles(group);
    });

    const uploadRes = await Promise.all(promises);
    const uploadResArray = uploadRes.flat();

    const map = {};
    uploadResArray.forEach((file) => {
      const key = file.data.image_info.name.slice(0, -4);
      map[key] = file.data.url;
    });

    Object.keys(map).forEach((key) => {
      const url = map[key];
      m3u8Text = m3u8Text.replace(new RegExp(key, "g"), url);
    });

    setCurrentUpload((prev) => {
      return {
        ...prev,
        progress: 80,
      };
    });

    const newM3u8Buffer = Buffer.from(m3u8Text, "utf8");
    const streamLink = await uploadSingleFile(newM3u8Buffer);

    setCurrentUpload((prev) => {
      return {
        ...prev,
        progress: 100,
        stream: streamLink[0].data.url,
      };
    });
  };

  const handleClickFile = (file) => {
    navigate(`/video/${file.stream.split("/").pop()}`);
  };

  return (
    <div className="wrapper">
      {loading && <Loading />}
      <div className="container">
        <div className="title text-16">Upload video</div>
        <div
          className={`upload-space ${error && "error"} ${
            Boolean(currentUpload) && "disabled"
          }`}
          {...getRootProps()}
          onMouseEnter={() => setError(false)}
        >
          <input {...getInputProps()} />
          <div className="upload-space-wrapper">
            <div className="icon">
              <FileIcon />
            </div>
            <div className="text-14">Kéo thả file của bạn ở đây</div>
          </div>
        </div>
        <div className={`note text-12 ${error && "error"}`}>
          Upload only 1 video file.
        </div>
        <div className="history">
          {currentUpload && (
            <div className="history-item">
              <div className="file-information">
                <div className="icon">
                  <FileUploading />
                </div>
                <div className="text-14">{currentUpload.name}</div>
              </div>
              <div className="status text-12">
                Uploading... {currentUpload.progress}%
              </div>
              <progress
                className="progress"
                value={currentUpload.progress}
                max="100"
              />
            </div>
          )}

          {historyData?.map((item) => (
            <div className="history-item" key={item.stream}>
              <div
                className="file-information uploaded"
                onClick={() => handleClickFile(item)}
              >
                <div className="icon">
                  <FileUploaded />
                </div>
                <div className="text-14 file-name">{item.name}</div>
              </div>
              <div className="status text-12">
                <span> Stream link:</span>
                <a href="#" target="blank">
                  {item.stream}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Upload;

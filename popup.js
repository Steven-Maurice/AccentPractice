let mediaRecorder;
let audioChunks = [];
let segments = [];

const startSound = new Audio("start-sound.mp3");
const stopSound = new Audio("stop-sound.mp3");

// Load segments from local storage
document.addEventListener("DOMContentLoaded", () => {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["segments"], function (result) {
      if (result.segments) {
        segments = result.segments;
        renderSegments();
      }
    });
  } else {
    console.error("chrome.storage.local is not available");
  }
});

function handleSetSegment() {
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "setSegment",
      startTime,
      endTime,
    });
    addSegment(startTime, endTime);
  });
}

function handleRecord() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        audioChunks = [];
        startSound.play();
        document.getElementById("recording-indicator").style.display = "block";

        mediaRecorder.addEventListener("dataavailable", handleDataAvailable);
        mediaRecorder.addEventListener("start", handleStartRecording);
        mediaRecorder.addEventListener("stop", handleStopRecording);
      })
      .catch(function (error) {
        console.error("Error accessing microphone: ", error);
      });
  } else {
    console.error("getUserMedia not supported on your browser!");
  }
}

function handleStopRecord() {
  if (mediaRecorder) {
    mediaRecorder.stop();
    stopSound.play();
    document.getElementById("recording-indicator").style.display = "none";
  }
}

function handlePlayRecording() {
  if (audioChunks.length > 0) {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = document.getElementById("audio-playback");
    audio.src = audioUrl;
    audio.play();
  } else {
    console.log("No audio recorded yet");
  }
}

function handleDataAvailable(event) {
  audioChunks.push(event.data);
}

function handleStartRecording() {
  console.log("Recording started");
}

function handleStopRecording() {
  console.log("Recording stopped");
}

function addSegment(startTime, endTime) {
  const segment = { startTime, endTime };
  segments.push(segment);
  //   saveSegments();
  renderSegments();
}

function renderSegments() {
  const segmentsList = document.getElementById("segments-list");
  segmentsList.innerHTML = "";
  segments.forEach((segment, index) => {
    const segmentElement = document.createElement("div");
    segmentElement.className = "segment";
    segmentElement.innerHTML = `
      Segment ${index + 1}: ${segment.startTime}s - ${segment.endTime}s
      <button class="play-button" data-index="${index}">Play</button>
      <button class="delete-button" data-index="${index}">Delete</button>
    `;
    segmentsList.appendChild(segmentElement);
  });

  document.querySelectorAll(".play-button").forEach((button) => {
    button.addEventListener("click", function () {
      const index = this.getAttribute("data-index");
      playSegment(index);
    });
  });

  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", function () {
      const index = this.getAttribute("data-index");
      deleteSegment(index);
    });
  });
}

function playSegment(index) {
  const segment = segments[index];
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "setSegment",
      startTime: segment.startTime,
      endTime: segment.endTime,
    });
  });
}

function deleteSegment(index) {
  segments.splice(index, 1);
  //   saveSegments();
  renderSegments();
}

function downloadSegments() {
  const blob = new Blob([JSON.stringify(segments)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "segments.json";
  a.click();
}

function uploadSegments(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    segments = JSON.parse(event.target.result);
    // saveSegments();
    renderSegments();
  };
  reader.readAsText(file);
}

function saveSegments() {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ segments: segments });
  } else {
    console.error("chrome.storage.local is not available");
  }
}

document
  .getElementById("set-segment")
  .addEventListener("click", handleSetSegment);
document.getElementById("record").addEventListener("click", handleRecord);
document
  .getElementById("stop-record")
  .addEventListener("click", handleStopRecord);
document
  .getElementById("play-recording")
  .addEventListener("click", handlePlayRecording);
document.getElementById("add-segment").addEventListener("click", function () {
  addSegment(0, 0);
});
document
  .getElementById("download-segments")
  .addEventListener("click", downloadSegments);
document
  .getElementById("upload-segments")
  .addEventListener("change", uploadSegments);

document
  .getElementById("upload-segments")
  .addEventListener("click", function () {
    this.value = null;
  });

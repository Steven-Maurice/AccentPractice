let mediaRecorder;
let audioChunks = [];

function handleSetSegment() {
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "setSegment",
      startTime,
      endTime,
    });
  });
}

function handleRecord() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        console.log("Microphone access granted");
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        audioChunks = [];

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
    console.log("MediaRecorder stopped");
  }
}

function handlePlayRecording() {
  if (audioChunks.length > 0) {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = document.getElementById("audio-playback");
    audio.src = audioUrl;
    audio.play();
    console.log("Playing recorded audio");
  } else {
    console.log("No audio recorded yet");
  }
}

function handleDataAvailable(event) {
  console.log("Data available: ", event.data);
  audioChunks.push(event.data);
}

function handleStartRecording() {
  console.log("Recording started");
}

function handleStopRecording() {
  console.log("Recording stopped");
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

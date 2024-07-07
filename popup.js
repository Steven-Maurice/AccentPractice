document.getElementById("set-segment").addEventListener("click", () => {
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "setSegment",
      startTime,
      endTime,
    });
  });
});

let mediaRecorder;
let audioChunks = [];

document.getElementById("record").addEventListener("click", () => {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });
  });
});

document.getElementById("stop-record").addEventListener("click", () => {
  mediaRecorder.stop();
});

document.getElementById("play-recording").addEventListener("click", () => {
  const audioBlob = new Blob(audioChunks);
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
});

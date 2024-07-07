chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setSegment") {
    const video = document.querySelector("video");
    const { startTime, endTime } = request;
    video.currentTime = startTime;

    const playSegment = () => {
      if (video.currentTime >= endTime) {
        video.pause();
        video.removeEventListener("timeupdate", playSegment);
      }
    };

    video.addEventListener("timeupdate", playSegment);
    video.play();
  }
});

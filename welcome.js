document
  .getElementById("request-permission")
  .addEventListener("click", function () {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        console.log("Microphone access granted");
        alert("Microphone access granted. You can now use the extension.");
        window.close();
      })
      .catch(function (error) {
        console.error("Error accessing microphone: ", error);
        alert(
          "Microphone access denied. The extension may not function properly."
        );
      });
  });

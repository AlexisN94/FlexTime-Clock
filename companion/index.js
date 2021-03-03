import { settingsStorage } from "settings";
import * as messaging from "messaging";

settingsStorage.addEventListener("change", (evt) => {
  sendValue(evt.key, evt.newValue);
  sendValue("done", true);
});

function sendValue(key, val) {
    sendSettingsData({
      key: key,
      value: JSON.parse(val)
    });
}

function sendSettingsData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.log("No peerSocket connection");
  }
}

messaging.peerSocket.onopen = function() {
   console.log("Socket open");
   sendValue("startTime", settingsStorage.getItem("startTime"));
   sendValue("endTime", settingsStorage.getItem("endTime"));
   sendValue("hideClock", settingsStorage.getItem("hideClock"));
   sendValue("hideTimeLeft", settingsStorage.getItem("hideTimeLeft"));
   sendValue("toggleOff", settingsStorage.getItem("toggleOff"));
   sendValue("hidePercentage", settingsStorage.getItem("hidePercentage"));
   sendValue("hideDate", settingsStorage.getItem("hideDate"));
   sendValue("done", true);
}
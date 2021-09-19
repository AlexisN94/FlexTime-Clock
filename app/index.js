import clock from "clock";
import document from "document";
import { display } from "display";
import { zeroPad } from "../common/utils";
import * as messaging from "messaging";
import * as fs from "fs";
import { me } from "appbit";

let dayPointer = document.getElementById("dayPointer");
let nightPointer = document.getElementById("nightPointer");
let dayArc = document.getElementById("dayArc");
let nightArc = document.getElementById("nightArc");
let percentage = document.getElementById("ellapsedPercentage");
let digitalClock = document.getElementById("digitalClock");
let screen = document.getElementById("screen");
let remainingTime = document.getElementById("remainingTime");
let dayStart = document.getElementById("dayStart");
let dayEnd = document.getElementById("dayEnd");
let date = document.getElementById("date");

let dayStartHour;
let dayStartMins;

let dayEndHour;
let dayEndMins;

let dayEndTimeInMinsSinceMidnight;
let dayStartTimeInMinsSinceMidnight;

let totalDayMins;
let totalNightMins;

let minsInADay = 24 * 60;

let toggleOff = false;
let crossesMidnight;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];


function init(_dayStartHour, _dayStartMins, _dayEndHour, _dayEndMins) {
  dayStartHour = parseInt(_dayStartHour);
  dayStartMins = parseInt(_dayStartMins);

  dayEndHour = parseInt(_dayEndHour);
  dayEndMins = parseInt(_dayEndMins);

  dayEndTimeInMinsSinceMidnight = dayEndHour * 60 + dayEndMins;

  dayStartTimeInMinsSinceMidnight = dayStartHour * 60 + dayStartMins;

  if (dayEndTimeInMinsSinceMidnight > dayStartTimeInMinsSinceMidnight) {
    crossesMidnight = false;
  } else {
    crossesMidnight = true;
  }

  if (crossesMidnight) {
    totalDayMins = (minsInADay - dayStartTimeInMinsSinceMidnight) + dayEndTimeInMinsSinceMidnight;
    totalNightMins = dayStartTimeInMinsSinceMidnight - dayEndTimeInMinsSinceMidnight;
  } else {
    totalNightMins = (minsInADay - dayEndTimeInMinsSinceMidnight) + dayStartTimeInMinsSinceMidnight;
    totalDayMins = dayEndTimeInMinsSinceMidnight - dayStartTimeInMinsSinceMidnight;
  }

  updateUI();
}

let ellapsedMinsSinceMidnight;
let ellapsedMinsSinceDayStart;
let ellapsedMinsSinceDayEnd;
let toggle = 1;

function hoursToAngle(hours, minutes) {
  let angle;
  ellapsedMinsSinceMidnight = 60 * hours + minutes;

  if (isDayTime()) {
      if (crossesMidnight) {
          if (ellapsedMinsSinceMidnight > dayEndTimeInMinsSinceMidnight) {
            ellapsedMinsSinceDayStart = ellapsedMinsSinceMidnight - dayStartTimeInMinsSinceMidnight;
          } else {
            ellapsedMinsSinceDayStart = (minsInADay - dayStartTimeInMinsSinceMidnight) + ellapsedMinsSinceMidnight;
          }
      } else {
          ellapsedMinsSinceDayStart = ellapsedMinsSinceMidnight - dayStartTimeInMinsSinceMidnight;
      }
      angle = 360 / totalDayMins * ellapsedMinsSinceDayStart;
  } else {
      if (crossesMidnight) {
          ellapsedMinsSinceDayEnd = ellapsedMinsSinceMidnight - dayEndTimeInMinsSinceMidnight;
      } else {
          if (ellapsedMinsSinceMidnight > dayEndTimeInMinsSinceMidnight) {
            ellapsedMinsSinceDayEnd = ellapsedMinsSinceMidnight - dayEndTimeInMinsSinceMidnight;
          } else {
            ellapsedMinsSinceDayEnd = minsInADay - dayEndTimeInMinsSinceMidnight + ellapsedMinsSinceMidnight;
          }
      }
      angle = 360 / totalNightMins * ellapsedMinsSinceDayEnd;
  }

  return angle;
}

function getRemainingTime(minsLeft) {
  let hours = Math.floor(minsLeft / 60);
  let minutes = minsLeft % 60;

  if (hours < 0) {
    hours = 24 + hours;
  }

  if (minutes < 0) {
    minutes = 60 + minutes;
  }

  let paddedHours = hours < 10 ? "0" + hours : hours;
  let paddedMins = minutes < 10 ? "0" + minutes : minutes;

  return `${paddedHours}h${paddedMins}m`;
}

function hideDay() {
  dayArc.style.display = "none";
  dayPointer.style.display = "none";
}

function showDay() {
  percentage.class = "dayPercentage";
  dayArc.style.display = "inline";
  dayPointer.style.display = "inline";
}

function showNight() {
  percentage.class = "nightPercentage";
  nightArc.style.display = "inline";
  nightPointer.style.display = "inline";
}

function hideNight() {
  nightArc.style.display = "none";
  nightPointer.style.display = "none";
}

function isDayTime() {
  let today = new Date();
  let currTimeInMins = 60 * today.getHours() + today.getMinutes();

  if (crossesMidnight) {
    if (currTimeInMins > dayEndTimeInMinsSinceMidnight && currTimeInMins < dayStartTimeInMinsSinceMidnight) {
      return false;
    }
    return true;
  } else {
    if (currTimeInMins < dayEndTimeInMinsSinceMidnight && currTimeInMins > dayStartTimeInMinsSinceMidnight) {
      return true;
    }
    return false;
  }
}

function updateUI() {
  let today = new Date();
  let hours = today.getHours() % 24;
  let mins = today.getMinutes();

  let paddedMins = mins < 10 ? "0" + mins : mins;
  let paddedHours = hours < 10 ? "0" + hours : hours;
  digitalClock.text = paddedHours + ":" + paddedMins;

  let pointerAngle = hoursToAngle(hours, mins);
  let percentageValue;

  let month = MONTH_NAMES[today.getMonth()];

  date.text = today.getDate() + " " + month.substring(0, 3);

  if (isDayTime()) {
    dayPointer.groupTransform.rotate.angle = pointerAngle;
    percentageValue = Math.floor(100 * pointerAngle / 360);
    percentage.text = percentageValue + "%";
    remainingTime.text = getRemainingTime(totalDayMins - ellapsedMinsSinceDayStart);
    hideNight();
    showDay();

    dayStart.text = `${zeroPad(dayStartHour)}:${zeroPad(dayStartMins)}`;
    dayEnd.text = `${zeroPad(dayEndHour)}:${zeroPad(dayEndMins)}`;
  } else {
    nightPointer.groupTransform.rotate.angle = pointerAngle;
    percentageValue = Math.floor(100 * pointerAngle / 360);
    percentage.text = percentageValue + "%";
    remainingTime.text = getRemainingTime(totalNightMins - ellapsedMinsSinceDayEnd);
    hideDay();
    showNight();

    dayEnd.text = `${zeroPad(dayStartHour)}:${zeroPad(dayStartMins)}`;
    dayStart.text = `${zeroPad(dayEndHour)}:${zeroPad(dayEndMins)}`;
  }
}

function toggleDisplayStartEndTimes() {
  if (!toggleOff) {
    if (toggle == 0) {
      settings.toggle = toggle;
      dayStart.style.display = "none";
      dayEnd.style.display = "none";
      toggle = 1;
    } else {
      settings.toggle = toggle;
      dayStart.style.display = "inline";
      dayEnd.style.display = "inline";
      toggle = 0;
    }
  }
}

// Not working - Fitbit won't grant permission to access AOD...  ¯\_(ツ)_/¯
if (display.aodAvailable && me.permissions.granted("access_aod")) {
  display.aodAllowed = true;
}

init(12, 0, 0, 0);
clock.granularity = "minutes";
clock.addEventListener("tick", updateUI);
screen.addEventListener("click", toggleDisplayStartEndTimes);

function applySettings(settings) {
  if (!settings) {
    return;
  }

  if (settings.startTime) {
    let h = settings.startTime.split("h")[0];
    let m = settings.startTime.split("h")[1];
    if (h && m) {
      init(h, m, dayEndHour, dayEndMins);
    }
  }

  if (settings.endTime) {
    let h = settings.endTime.split("h")[0];
    let m = settings.endTime.split("h")[1];
    if (h && m) {
      init(dayStartHour, dayStartMins, h, m);
    }
  }

  if (settings.hideClock) {
    date.y = 24;
    digitalClock.style.display = "none";
  } else {
    date.y = 54;
    digitalClock.style.display = "inline";
  }

  if (settings.hideTimeLeft) {
    remainingTime.style.display = "none";
  } else {
    remainingTime.style.display = "inline";
  }

  toggleOff = settings.toggleOff;

  toggle = settings.toggle;

  if (toggle == 0) {
    dayStart.style.display = "none";
    dayEnd.style.display = "none";
    toggle = 1;
  } else {
    dayStart.style.display = "inline";
    dayEnd.style.display = "inline";
    toggle = 0;
  }

  if (settings.hidePercentage) {
    percentage.style.display = "none";
  } else {
    percentage.style.display = "inline";
  }

  if (settings.hideDate) {
    date.style.display = "none";
  } else {
    date.style.display = "inline";
  }
}

const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

let settings, onsettingschange;

// Load settings from filesystem
function loadSettings() {
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    return {};
  }
}

function initialize() {
  settings = loadSettings();
  applySettings(settings);
}

initialize();

// Received message containing settings data
messaging.peerSocket.addEventListener("message", function (evt) {
  if (evt && evt.data && evt.data.key) {
    let key = evt.data.key;
    settings[evt.data.key] = evt.data.value.name ? evt.data.value.name : evt.data.value;
  }

  if (evt.data.key == "done" && evt.data.value) {
    onsettingschange(settings);
  }
})

// Save settings to the filesystem on unload
me.addEventListener("unload", fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE));



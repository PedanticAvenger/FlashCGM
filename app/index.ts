//Working on all code using VS Code, @ts-X codes below are for that.
//@ts-ignore
import clock from "clock";
//@ts-ignore
import document from "document";
//@ts-ignore
import userActivity from "user-activity";
//@ts-ignore
import { HeartRateSensor } from "heart-rate";
//@ts-ignore
import { locale } from "user-settings";
//@ts-ignore
import { preferences } from "user-settings";
//@ts-ignore
import * as messaging from "messaging";
//@ts-ignore
import * as fs from "fs";
import * as util from "../common/utils";

//Define screen change stuff
let MainScreen = document.getElementById("MainScreen");
let GraphScreen= document.getElementById("GraphScreen");
let button1 = document.getElementById("button1");
let button2 = document.getElementById("button2");

// Update the clock every minute
clock.granularity = "seconds";
const clockPref = preferences.clockDisplay;
let lastValueTimestamp = Date.now();

try {
  let stats = fs.statSync("theme.txt");
  let json_themeread = fs.readFileSync("theme.txt", "json");
} catch (err) {
  let json_theme = {"backg": "#f8fcf8", "foreg": "#707070"};
  fs.writeFileSync("theme.txt", json_theme, "json");
  let json_themeread = fs.readFileSync("theme.txt", "json");
}

let backgdcol = json_themeread.backg || "#f8fcf8";
let foregdcol = json_themeread.foreg || "#707070";

// Get Goals to reach
const distanceGoal = userActivity.goals.distance;
const caloriesGoal = userActivity.goals["calories"];
const stepsGoal = userActivity.goals.steps;
const elevationGoal = userActivity.goals.elevationGain;
const activeGoal = userActivity.goals.activeMinutes;

// Get a handle on the <text> element
let myClock = document.getElementById("myLabel");
let myDate = document.getElementById("myDate");
//Inserted for main screen CGM Data
let myCurrentBG = document.getElementById("myCurrentBG");
let myBGUnits = document.getElementById("myBGUnits");
let myBGUpdateArc = document.getElementById("myBGUpdateArc");
let myBGUpdateArcBackground = document.getElementById("myBGUpdateArcBackground");
let myMissedBGPollCounter = document.getElementById("myMissedBGPollCounter");
let myBGTrendBackground = document.getElementById("myBGTrendBackground");
let myBGTrendPointer = document.getElementById("myBGTrendPointer");
let bgCount = 24;
let graph = document.getElementById("graph");
let axis = document.getElementById("axis");
let prefBgUnits = "mg";
//Normal Flashring handles below.
let dailysteps = document.getElementById("mySteps");
let dailystairs = document.getElementById("myStairs");
let dailycals = document.getElementById("myCals");
let dailymins = document.getElementById("myMins");
let currentheart = document.getElementById("myHR");
let heartRing = document.getElementById("hrtArc");
let stepRing = document.getElementById("stepsArc");
let calRing = document.getElementById("calsArc");
let heart = document.getElementById("myHR");
let otherData = document.getElementById("otherData");
let upperLine = document.getElementById("upperLine");
let bottomLine = document.getElementById("bottomLine");

function applyTheme(background, foreground) {
  //Add Theme settings for Main screen BG color, and anything else we add as customizable.
  myClock.style.fill = background;
  dailysteps.style.fill = background;
  dailystairs.style.fill = background;
  dailycals.style.fill = background;
  dailymins.style.fill = background;
  heart.style.fill = background;
  myDate.style.fill = foreground;
  upperLine.style.fill = foreground;
  bottomLine.style.fill = foreground;
}

function mmol( bg ) {
  let mmolBG = Math.round( (0.0555 * bg) * 10 ) / 10;
  return mmolBG;
}

//functions for screen switching
function showMainScreen() {
  console.log("Show main screen");
  MainScreen.style.display = "inline";
  GraphScreen.style.display = "none";
}

function showGraphScreen() {
  console.log("Show graph screen");
  MainScreen.style.display = "none";
  GraphScreen.style.display = "inline";
}

button1.onclick = function() {
  showGraphScreen();
}

button2.onclick = function () {
  showMainScreen();
}

function updateStats() {
  const metricSteps = "steps";  // distance, calories, elevationGain, activeMinutes
  const amountSteps = userActivity.today.adjusted[metricSteps] || 0;
  const metricCals = "calories";  // distance, calories, elevationGain, activeMinutes
  const amountCals = userActivity.today.adjusted[metricCals] || 0;
  const metricActive = "activeMinutes";
  const amountActive = userActivity.today.adjusted[metricActive] || 0;
  const metricElevation = "elevationGain";
  const amountElevation = userActivity.today.adjusted[metricElevation] || 0
  dailystairs.text = amountElevation;
  dailymins.text = amountActive;
  let stepString = util.thsdDot(amountSteps);
  let calString = util.thsdDot(amountCals);
  dailysteps.text = stepString;
  let stepAngle = Math.floor(360*(amountSteps/stepsGoal));
  if ( stepAngle > 360 ) {
    stepAngle = 360;
    stepRing.fill="#58e078";
  }
  stepRing.sweepAngle = stepAngle;
  dailycals.text = calString;
  let calAngle = Math.floor(360*(amountCals/caloriesGoal));
  if ( calAngle > 360 ) {
    calAngle = 360;
    calRing.fill="#58e078";
  }
  calRing.sweepAngle = calAngle;
}

var hrm = new HeartRateSensor();

hrm.onreading = function () {
  currentheart.text = ( hrm.heartRate > 0 ) ? hrm.heartRate : "--";
  lastValueTimestamp = Date.now();
  let heartAngle = Math.floor(360*((hrm.heartRate-30)/170)); //heartrate lower than 30 should not occur and 200 schould be enough anyway
  if ( heartAngle > 360 ) {
    heartAngle = 360;
  } else if ( heartAngle < 0 ) {
    heartAngle = 0;
  }
  heartRing.sweepAngle = heartAngle;
}
hrm.start();

// Update the <text> element with the current time
function updateClock() {
  let lang = locale.language;
  let today = new Date();
  let day = util.zeroPad(today.getDate());
  let wday = today.getDay();
  let month = util.zeroPad(today.getMonth()+1);
  let year = today.getFullYear();
  let hours = util.zeroPad(util.formatHour(today.getHours(), clockPref));
  let mins = util.zeroPad(today.getMinutes());
  let prefix = lang.substring(0,2);
  if ( typeof util.weekday[prefix] === 'undefined' ) {
    prefix = 'en';
  }
  let divide = "/";
  if ( prefix == 'de' ) {
    divide = ".";
  } else if ( prefix == "nl" || prefix == "ko") {
    divide = "-"
  }
  let datestring = day + divide + month + divide + year;
  if ( lang == "en-US" ) {
    datestring = month + divide + day + divide + year;
  } else if ( prefix == "zh" || prefix == "ja" || prefix == "ko") {
    datestring = year + divide + month + divide + day;
  }
  myClock.text = `${hours}:${mins}`;
  myDate.text = `${util.weekday[prefix][wday]}, ${datestring}`;

  updateStats();
  if ( (Date.now() - lastValueTimestamp)/1000 > 5 ) {
    currentheart.text = "--";
    heartRing.sweepAngle = 0;
  }
}


//Define a function to set the right display on the trend arc, this is just brain dump, not clean code yet.
function updateBGTrend(Trend) {
  console.log('In Trend update - ' + Trend);
  if (Trend === "DoubleUp") {
    console.log('Matched 1');
    myBGTrendBackground.style.fill = "#FF0000";
    myBGTrendPointer.startAngle = 0;
  } else if (Trend === "SingleUp") {
    console.log('Matched 2');
    myBGTrendBackground.style.fill = "#FFFF00";
    myBGTrendPointer.startAngle = 0;
  } else if (Trend === "FortyFiveUp") {
    console.log('Matched 3');
    myBGTrendBackground.style.fill = "#008000";
    myBGTrendPointer.startAngle = 41;
  } else if (Trend === "Flat") {
    console.log('Matched 4');
    myBGTrendBackground.style.fill = "#008600";
    myBGTrendPointer.startAngle = 86;
  } else if (Trend === "FortyFiveDown") {
    console.log('Matched 5');
    myBGTrendBackground.style.fill = "#008000";
    myBGTrendPointer.startAngle = 131;
  } else if (Trend === "SingleDown") {
    console.log('Matched 6');
    myBGTrendBackground.style.fill = "#FFFF00";
    myBGTrendPointer.startAngle = 172;
  } else if (Trend === "DoubleDown") {
    console.log('Matched 7');
    myBGTrendBackground.style.fill = "#FF0000";
    myBGTrendPointer.startAngle = 172;
  }

}

function updateBGPollingStatus() {
  /* Ok, we should be passed the timestamp of the last polled datapoint.
  There may be issues if we are grabbing data from nightscout rather than the paired phone but
  it should really be at most a minute out in a scenario like parent has watch and following child
  with their phone updating nightscout.
  */
  //This angle updates in 72 degree increments per minute to fill ring in 5 min.
  myBGUpdateArc.sweepAngle = 72;

  //myBGUpdateArc.fill should be green for the first minute, yellow for the second, red for the third or more (leave it a solid red ring after 3 min and indicate numerically in the middle of the ring how many poll windows have been missed.)
  myBGUpdateArc.fill = "#7CFC00";
  //myBGUpdateArcBackground.fill should be grey for the first minute, green for the second, yellow for the third then just red or set sweep angle to 0
  myBGUpdateArcBackground.fill = "#333344";
  //I wonder if we should just calculate this based on 5 minute increments from last good poll or of we can find this as a value readable in the XDrip or Nightscout API endpoints?
  myMissedBGPollCounter = 0;
}
// Update the clock every tick event
clock.ontick = () => updateClock();

// Don't start with a blank screen
applyTheme(backgdcol, foregdcol);
updateClock();

messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
}

messaging.peerSocket.close = () => {
  console.log("App Socket Closed");
}


function updateAxisUnits(units) {
  // This needs to be integrated into an autoscaling graph function(s)  static is no good
  let labels = axis.getElementsByClassName('graph-data-range');
  if (units === "mg") {
    labels[0].text = "200";
    labels[1].text = "175";
    labels[2].text = "150";
    labels[3].text = "125";
    labels[4].text = "100";
    labels[5].text = "75";
    labels[6].text = "50";
  } else if (units === "mmol") {
    labels[0].text = "11.1";
    labels[1].text = "9.7";
    labels[2].text = "8.3";
    labels[3].text = "6.9";
    labels[4].text = "5.6";
    labels[5].text = "4.2";
    labels[6].text = "2.7";
  }
}

function updategraph(displayData){
  /*
    Before recode this only built the graph points.
    Target for re-write is to rebuild the graph, set the current BG on main face, along with trend and set the variable for the last-poll timestamp.  Updating that will be handled in the clock update code as it runs constantly anyway.

  */
  //debug logging console.log('updategraph')
  //debug logging console.log('graphPoint - ' + JSON.stringify(displayData.graphdata))
  //debug logging console.log('Trend - ' + JSON.stringify(displayData.trend))

  let graphPoints = graph.getElementsByClassName('graph-point');

  let points = JSON.parse(displayData.bgdata.graphData);
  let trend = JSON.parse(displayData.bgdata.currentTrend);
  let lastPollTime = JSON.parse(displayData.bgdata.lastPollTime);

  if(prefBgUnits === "mg") {
    myCurrentBG.text = displayData[23];
    updateAxisUnits("mg");
  } else if (prefBgUnits === "mmol") {
    myCurrentBG.text = mmol(displayData[23]);
    updateAxisUnits("mmol")
  }
  updateBGTrend(trend);

  for (let index = 0; index <= 23; index++) {
    let pointsIndex = 23 - index;
    graphPoints[index].cy = (250- points[pointsIndex]) + 10;
  }

}

function updateSettings(settings) {
  let obj = JSON.parse(settings);
  let prefBgUnits = obj.settings.bgDataUnits;
//  let prefHighTarget = obj.settings.bgTargetTop;
//  let prefLowTarget = obj.settings.bgTargetBottom;
  let prefHighLevel = obj.settings.bgHighLevel;
  let prefLowLevel = obj.settings.bgLowLevel;

  myBGUnits.text = prefBgUnits;
}
// Listen for the onmessage event
/*
Alright, need to update message handling to send back current steps and heartrate.
Wondering if HR and Steps should be triggered by updateClock() or by activity in updateBGStats().
*/
messaging.peerSocket.onmessage = function(evt) {
  console.log("device got: " + evt.data);

  if (evt.hasOwnProperty('settings')) {
    updateSettings(evt.data)
  } else if (evt.hasOwnProperty('bgdata')) {
    updategraph(evt.data);
  } else if (evt.hasOwnProperty('theme')) {
//This theme stuff needs a re-do, don't forget!
    applyTheme(evt.data.background, evt.data.foreground);
    let json_theme = {"backg": evt.data.background, "foreg": evt.data.foreground};
    fs.writeFileSync("theme.txt", json_theme, "json");
  }
}

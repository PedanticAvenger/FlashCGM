# XDrip-Flashring
Repository of work to alter Fitbit Ionic Flashring Watch Face to support Blood Glucose data display from XDrip+ and directly from nightscout sites.

Design Goals:
   1) Perform as much processing on phone companion app as possible to maintain watch battery life.
   2) Provide at-a-glance info about current BG, trend, and polling status.
   3) Tap BG Value to view chart of last 24 readings graphically.  Tap to return.
   4) Settings are pulled from xDrip+ or Nightscout to avoid having to set them up in watchface and consistency.  This includes units, High/Low limits, Target High/Low limits.
   5) Document in-code as much as possible to support ongoing development/support of this watch face for users.

Current Watch Face Status:
Screens currently look as follows. Tap the upper right box of main display to get to graph, anywhere on graph to get back to main.
Currently deciding if I will submit this as-is to fitbit or add high/low vibe alerts first. everything works everywhere except grabbing target BG high/low values from xDrip+ as they are not included in the status.json endpoint yet.  Once they are this will just work.

Ionic Main: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/resources/FlashCGM-Ionic-Main.png">
Ionic Graph: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/resources/FlashCGM-Ionic-Graph.png">
Ionic Alert: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/resources/FlashCGM-Ionic-Alert.png">
Versa Main: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/resources/FlashCGM-Versa-Main.png">
Versa Graph: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/resources/FlashCGM-Versa-Graph.png">
Versa Alert: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/resources/FlashCGM-Versa-Alert.png">
Versa Lite Main: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/resources/FlashCGM-VLite-Main.png">
Versa Lite Graph: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/resources/FlashCGM-VLite-Graph.png">
Versa Lite Alert: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/resources/FlashCGM-VLite-Alert.png">

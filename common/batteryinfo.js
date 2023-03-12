/*
MIT License

Copyright (c) 2017 Fitbit, Inc, Sammy Barkowski
API Fetching base code and Vibe/Alert code Copyright (c) 2018 rytiggy
CGM component integration code Copyright (c) 2018 PedanticAvenger
CGM Graphing component code Copyright (c) 2018 NiVZ

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

import { battery, charger } from "power";

export default class batteryStats {
  get() {
    let level = Math.floor(battery.chargeLevel);
    let chargestatus = charger.connected;
    let fill = '#3ea843';
    if (level <= 30 && level >= 15) {
      fill = 'orange';
    } else if (level <= 15) {
      fill = 'red';
    }
    return {
      "chargestatus": chargestatus,
      "level": level,
      "fill": fill,

    }
  }
};
<p align="center">
  <!--<img src="https://i.imgur.com/rjXwOIg.gif">-->
  <img src="https://i.imgur.com/GURZIgR.jpg">
</p>

# OOTP World Editor

An Electron-based dekstop app allowing users to edit and create world_default.xml files for [Out of the Park Baseball](https://www.ootpdevelopments.com/out-of-the-park-baseball-home).  If you don't have OOTP, then this will be of little use to you.

# Installation notes

To run this from source, you will need to install [node.js](https://nodejs.org/en/download/) and [yarn](https://yarnpkg.com/getting-started/install), and then...

```
git clone https://github.com/eriqjaffe/OOTP-World-Editor && cd OOTP-World-Editor
yarn
yarn start
```
Or you can grab a pre-compiled binary from the "releases" section.  Binaries are available for Windows, macOS and Linux.

Because I'm not a registered developer with Apple, macOS may block the app for security reasons (not a bad thing for it to do, ultimately).  If this happens, just CTRL-click on the app and choose "Open" from the menu - that will bring up a slightly different version of the security message with an option to open the app.  You *should* only have to do that once and macOS should store an exception for the app going forward.

Similarly, Windows might pop up a "Windows protected your PC" message when you try to run the installer.  If that happens, just click "More info" and "Run anyway".

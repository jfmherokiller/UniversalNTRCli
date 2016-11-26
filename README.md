# UniversalNTRCli
This is a Node NTR Client with a frontend using [Cu3PO42's Node NTR Library](https://github.com/Cu3PO42/NTRClientJS).  It's a basic frontend, but useful when not using Windows.

Systems that have packages:
* [Mac OS X](https://github.com/zaksabeast/UniversalNTRCli/releases)
* [Linux (32/64 bit)](https://github.com/zaksabeast/UniversalNTRCli/releases)

Windows users who want the package will need to refer to the [Building](#Building) instructions.

This is in Beta, so expect bugs.

See the Add-Ons section below for information on custom plugins, and the Example Plugin section for usage of the example included.

## Screenshots
[![Main Screen](screenshots/screenshot-2.png?raw=true)](#Usage)
[![Usage](screenshots/screenshot-3.png?raw=true)](#Example-Plugin)
[![Example Plugin](screenshots/screenshot-1.png?raw=true)](#UniversalNTRCli)
## Notes
The Linux Executables won't be tested by me, since all my home linux computers are headless.

The larger file sizes are due to this being built with electron, which needs to package itself for this to work.

## Usage
1. Download the compiled version of this debugger for your Operating System and Architecture on the [Releases](https://github.com/zaksabeast/UniversalNTRCli/releases) page
2. Type your 3ds IP where it asks, and click "Connect"
3. Afterwards, select the PID you wish to inspect
4. From there you can read specific places in the ram, write to the ram, dump large areas, and send a "Hello" to your 3ds
5. Click "Disconnect" when done.

## Building
Make sure to have node and npm installed.

Clone this repository:

```
git clone https://github.com/zaksabeast/UniversalNTRCli.git
```

Change to the repository's directory:

```
cd UniversalNTRCli
```

Install the dependencies:

```
npm install
```

Then run one of the following build scripts:
```
npm run-script build-mac
npm run-script build-linux
npm run-script build-linux-32
npm run-script build-win
npm run-script build-win-32
```

## Running From Source
After grabbing the repository and changing to its directory, run the start script:
```
npm run-script start
```

## Add-Ons
At the moment, there isn't a way to make a plugin that can be used/installed on-the-go.  I added an example "plugin" (which is really more of a mini-extended feature that can be enabled) with the idea that if someone wanted to contribute extra features, whether it's for specific games or general usage, they could see certain ways this could be implemented.

Check out [scripts/plugins/pokemon.js](scripts/plugins/pokemon.js) to see how it works, as well as the "pluginAct" function in [scripts/clientHandler.js](scripts/clientHandler.js) for how the program activates the plugin.

Send a Pull Request if you have something you'd like to add!

## Example-Plugin
As mentioned before, this is more of a mini-extended feature at the moment.  When pushed, the "Current Example" button will add a side menu with two buttons to the main program.

The first button, labeled "Get Pk6", will ask you to choose a save location for a Gen 6 Pokemon file.  After a save location has been chosen, the plugin will search your 3ds PID list to find a Gen 6 Pokemon Game (oras/xy), and will grab the Pokemon in Box 1, Slot 1 of your game, display its Species and IVs, then save it at the location you selected as an unencrypted Pk6.

The second button, labeled "Send Pk6", will ask you to select an unencrypted Pk6 file for it to send to the game.  It will then search your 3ds PID list for a Gen 6 Pokemon Game, and will store the Pk6 in Box 1, Slot 1.

The Pk6 file can be used and created with PKHeX, but please make sure you are sending an unencrypted Pk6 (Gen 6 Pokemon) and not a Pk7 (Gen 7 Pokemon).

## Credits
* Cell9 - NTR
* Cu3PO42 - Node NTR Client Library
* Imthe666st - UI Inspiration
* Yoshiog1 - Ek6<->Pk6 Functions for Example Plugin
* Peterolson - Javascript BigInt Library
* http://codepen.io/benague/pen/bLBCd - CSS3 Buttons
* Zaksabeast - The Frontend for this Debugger

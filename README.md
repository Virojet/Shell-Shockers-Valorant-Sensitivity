<div align="center">

# Shell Shockers — Valorant Sensitivity

**Play [Shell Shockers](https://shellshock.io) with your Valorant sensitivity. Type it in or read it from Valorant, and the same mouse move turns you just as far as it does in Valorant: from the hip, aiming down sights and scoped.**

<br>

[![Install Valorant Sensitivity](https://img.shields.io/badge/Install_Valorant_Sensitivity-one_click-2ea44f?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://raw.githubusercontent.com/Virojet/Shell-Shockers-Valorant-Sensitivity/main/Shell-Shockers-Valorant-Sensitivity.user.js)

[![Version](https://img.shields.io/badge/version-1.0.0-0E7697?style=flat-square)](./Shell-Shockers-Valorant-Sensitivity.user.js)
[![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)](./LICENSE)

</div>

---

## Install

1. **Get Tampermonkey** for your browser: [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) · [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) · [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/) · [Opera GX & others](https://www.tampermonkey.net/) (or use [Violentmonkey](https://violentmonkey.github.io/))
2. **[Click here to install Valorant Sensitivity](https://raw.githubusercontent.com/Virojet/Shell-Shockers-Valorant-Sensitivity/main/Shell-Shockers-Valorant-Sensitivity.user.js)**, then press **Install** on the page that opens
3. **Reload [shellshock.io](https://shellshock.io)**

> [!TIP]
> **No Valorant Sensitivity in Settings?** Chrome, Edge, Brave and Opera need one extra switch: open your browser's **Extensions** page → **Tampermonkey** → **Details** → turn on **Allow User Scripts**. Then reload the game. [Step by step for each browser](https://github.com/Virojet/Shell-Shockers-Better-Hud-Mod#allow-user-scripts)

## Set it up

Open **Settings** ▸ the **keyboard tab**. **Valorant Sensitivity** is under Mouse Speed.

1. **Type your Valorant sensitivity**, like `0.4`, or press **From Valorant** to [read it from Valorant](#from-valorant). Mouse Speed follows as you type, and the number next to the field is the Mouse Speed it sets (hover over it for every decimal).
2. **Scoped** and **ADS** are Valorant's **Scoped Sensitivity Multiplier** (its snipers) and **ADS Sensitivity Multiplier** (its rifles and SMGs). Leave them at 1 if you never changed them in Valorant. **From Valorant** fills them in too.
3. Press **Confirm**.

Keep your mouse at the same DPI as in Valorant, and that's it.

Like the game's settings around it, a change is kept when you press **Confirm**. **Cancel** or the **X** leaves things as they were. **Reset to Defaults** puts the game's settings back to how they started, Mouse Speed 50 (Valorant 2.05) included, and the multipliers back to 1.

## From Valorant

Valorant keeps its settings in a folder on your computer, `%LOCALAPPDATA%\VALORANT\Saved\Config`, with one set for each account you've played on. Windows hides that folder, so:

1. Press **From Valorant**. It copies the folder's address and opens a folder picker.
2. Click the address bar at the top of the picker, paste the address (**Ctrl+V**) and press **Enter**.
3. Press **Upload** (or **Select Folder**), and **Upload** again if your browser asks.

Or drag that folder, or a `RiotUserSettings.ini` file from it, onto the Settings window.

The line under the settings says what it got. Hover over it to see your sensitivity and multipliers as Valorant saved them, and when. With several accounts, it takes the one you played last, which Valorant notes, or else the one whose settings changed last.

Your files stay on your computer. Your browser calls it an upload, but the files are only read in the page, and nothing is sent anywhere. The script reads two files, `RiotUserSettings.ini` and `RiotLocalMachine.ini`, and never changes them.

## How exact is it?

### From the hip

Valorant turns your view by 0.07° × your sensitivity for each count your mouse sends. Shell Shockers turns it by Mouse Speed² × 0.000001 radians, sideways and up and down alike (measured in the game). So:

**Mouse Speed = √(1221.73 × your Valorant sensitivity)**

| Valorant | 0.2 | 0.25 | 0.3 | 0.35 | 0.4 | 0.5 | 0.6 | 0.8 | 1 |
|---|---|---|---|---|---|---|---|---|---|
| **Mouse Speed** | 15.63 | 17.48 | 19.14 | 20.68 | 22.11 | 24.72 | 27.07 | 31.26 | 34.95 |

Both games count your mouse's movement the same way, so this works at any DPI: at 800 DPI, Valorant 0.4 turns you all the way around every 40.8 cm, in both games.

The Mouse Speed slider only shows whole numbers, but the game keeps and saves the exact number the script sets. Dragging the slider afterwards rounds it to a whole number again, and the Valorant field then shows what that number is worth. Mouse Speed goes from 1 to 100, which is Valorant 0.0008 to 8.185.

### Aiming and scoped

In Valorant, zooming in slows your turning by as much as the zoom narrows your view across the screen (converters call this 100% monitor distance), times your Scoped or ADS multiplier. So a flick to anything you can see takes the same mouse move, zoomed in or not.

Shell Shockers multiplies your turning by the gun's zoom instead, which at 16:9 turns you 5 to 21% faster than Valorant would. The script gives the game Valorant's number in its place, worked out for each gun from the view the game draws and the shape of your window. The Crackshot and Free Ranger use your Scoped multiplier, and the other guns use ADS.

At 16:9, with both multipliers at 1:

| Gun | Shell Shockers alone | With this script | Multiplier |
|---|---|---|---|
| Crackshot | × 0.400 | × 0.381 | Scoped |
| Free Ranger | × 0.500 | × 0.469 | Scoped |
| Tri-Hard | × 0.700 | × 0.634 | ADS |
| EggK-47, RPEGG | × 0.900 | × 0.781 | ADS |
| Scrambler, Whipper | × 1.000 | × 0.848 | ADS |
| Cluck 9mm | × 1.100 | × 0.912 | ADS |

With your multipliers, the script's numbers are multiplied by them: ADS 0.8 makes the EggK-47 × 0.625.

### Raw input

Valorant reads your mouse raw. In Shell Shockers, **Fix Mouse Glitch** does the same, so the script ticks it when you set a sensitivity. With it on, Windows' pointer speed and **Enhance pointer precision** don't change your sensitivity. If you untick it, it stays unticked until you set a sensitivity again the next time you open Settings.

> [!NOTE]
> The numbers are measured in Chrome, and Edge, Opera and Brave read the mouse the same way. In another browser, keep Windows' pointer speed on the middle notch (6 of 11) and **Enhance pointer precision** off, in case it can't read the mouse raw.

From the hip, Shell Shockers shows about as much as Valorant does: 104° across at 16:9, against Valorant's 103°. So what's on your screen moves past at about the same speed too.

## Turning it off

Switch the script off in Tampermonkey and reload the game. Aiming goes back to the game's own slowdown. Mouse Speed stays where the script set it, because it's the game's own setting: drag its slider or press **Reset to Defaults** to change it.

> [!NOTE]
> Shell Shockers Valorant Sensitivity isn't endorsed or sponsored by Riot Games. Valorant is a trademark of Riot Games, Inc. The script uses nothing of Riot's: it reads your own Valorant settings files, on your computer, when you ask it to.

## License

[MIT](./LICENSE)

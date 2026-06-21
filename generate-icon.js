const { Jimp, rgbaToInt } = require('jimp');
const path = require('path');

const SIZE = 1024;
const BG   = rgbaToInt(2,  14, 26,  255);
const GOLD = rgbaToInt(201,168,76, 255);
const NAVY = rgbaToInt(27, 58, 107, 255);
const WHITE= rgbaToInt(255,255,255,255);

async function makeIcon() {
  const img = new Jimp({ width: SIZE, height: SIZE, color: BG });
  // eslint-disable-next-line no-unused-vars

  // Rounded background circle
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = 420;

  // Draw navy circle
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r * r) {
        img.setPixelColor(NAVY, x, y);
      }
    }
  }

  // Draw gold ring
  const rOuter = r, rInner = r - 28;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx, dy = y - cy;
      const dist2 = dx * dx + dy * dy;
      if (dist2 <= rOuter * rOuter && dist2 >= rInner * rInner) {
        img.setPixelColor(GOLD, x, y);
      }
    }
  }

  // Draw bus body (white rectangle)
  const busX = 200, busY = 370, busW = 624, busH = 260;
  for (let y = busY; y < busY + busH; y++) {
    for (let x = busX; x < busX + busW; x++) {
      img.setPixelColor(WHITE, x, y);
    }
  }

  // Bus roof (gold)
  const roofY = busY - 80, roofH = 82;
  for (let y = roofY; y < roofY + roofH; y++) {
    for (let x = busX + 30; x < busX + busW - 30; x++) {
      img.setPixelColor(GOLD, x, y);
    }
  }

  // Bus windows (navy) - 4 windows
  const winY = busY + 40, winH = 90, winW = 100, winGap = 40;
  const startX = busX + 60;
  for (let i = 0; i < 4; i++) {
    const wx = startX + i * (winW + winGap);
    for (let y = winY; y < winY + winH; y++) {
      for (let x = wx; x < wx + winW; x++) {
        img.setPixelColor(NAVY, x, y);
      }
    }
  }

  // Wheels (gold circles)
  const wheelY = busY + busH + 10;
  const wheelR = 55;
  const wheels = [busX + 160, busX + busW - 160];
  for (const wx of wheels) {
    for (let y = wheelY - wheelR; y <= wheelY + wheelR; y++) {
      for (let x = wx - wheelR; x <= wx + wheelR; x++) {
        const dx = x - wx, dy = y - wheelY;
        if (dx * dx + dy * dy <= wheelR * wheelR) {
          img.setPixelColor(GOLD, x, y);
        }
      }
    }
    // Hub (white)
    const hubR = 22;
    for (let y = wheelY - hubR; y <= wheelY + hubR; y++) {
      for (let x = wx - hubR; x <= wx + hubR; x++) {
        const dx = x - wx, dy = y - wheelY;
        if (dx * dx + dy * dy <= hubR * hubR) {
          img.setPixelColor(WHITE, x, y);
        }
      }
    }
  }

  // Road line (gold) beneath bus
  const roadY = busY + busH + 120;
  for (let y = roadY; y < roadY + 12; y++) {
    for (let x = busX - 20; x < busX + busW + 20; x++) {
      img.setPixelColor(GOLD, x, y);
    }
  }

  await img.write(path.join(__dirname, 'assets', 'icon.png'));
  console.log('icon.png generated');

  // Splash icon (same but smaller centered)
  const scaled = img.clone().resize({ w: 200, h: 200 });
  await scaled.write(path.join(__dirname, 'assets', 'splash-icon.png'));
  console.log('splash-icon.png generated');

  // Android foreground (same icon, transparent bg version)
  const fg = img.clone();
  await fg.write(path.join(__dirname, 'assets', 'android-icon-foreground.png'));
  console.log('android-icon-foreground.png generated');
}

makeIcon().catch(console.error);

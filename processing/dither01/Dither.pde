int imageIndex(PImage img, int x, int y) {
  return x + y * img.width;
}

color getColorAtIndex(PImage img, int x, int y) {
  int idx = imageIndex(img, x, y);
  return img.pixels[idx];
}

void setColorAtIndex(PImage img, int x, int y, color clr) {
  int idx = imageIndex(img, x, y);
  img.pixels[idx] = clr;
}

// Finds the closest step for a given value
// The step 0 is always included, so the number of steps
// is actually steps + 1
float closestStep(float max, float steps, float value) {
  return round(steps * value / 255) * floor(255 / steps);
}

void makeDithered(PImage img, int steps) {
  img.loadPixels();

  for (int y = 0; y < img.height; y++) {
    for (int x = 0; x < img.width; x++) {
      color clr = getColorAtIndex(img, x, y);
      float oldR = red(clr);
      float oldG = green(clr);
      float oldB = blue(clr);
      float newR = closestStep(255, steps, oldR);
      float newG = closestStep(255, steps, oldG);
      float newB = closestStep(255, steps, oldB);

      color newClr = color(newR, newG, newB);
      setColorAtIndex(img, x, y, newClr);

      float errR = oldR - newR;
      float errG = oldG - newG;
      float errB = oldB - newB;

      distributeError(img, x, y, errR, errG, errB);
    }
  }

  img.updatePixels();
}

void distributeError(PImage img, int x, int y, float errR, float errG, float errB) {
  addError(img, 7 / 16.0, x + 1, y, errR, errG, errB);
  addError(img, 3 / 16.0, x - 1, y + 1, errR, errG, errB);
  addError(img, 5 / 16.0, x, y + 1, errR, errG, errB);
  addError(img, 1 / 16.0, x + 1, y + 1, errR, errG, errB);
}

void addError(PImage img, float factor, int x, int y, float errR, float errG, float errB) {
  if (x < 0 || x >= img.width || y < 0 || y >= img.height) return;
  color clr = getColorAtIndex(img, x, y);
  float r = red(clr);
  float g = green(clr);
  float b = blue(clr);
  clr = color(r + errR * factor, g + errG * factor, b + errB * factor);

  setColorAtIndex(img, x, y, clr);
}

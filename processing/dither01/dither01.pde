// https://petapixel.com/2022/05/05/a-review-of-the-nintendo-game-boy-camera-24-years-later/

import processing.video.*;

Capture video;
int captureIndex = 0;
boolean preview;
PShader shader_delay, shader_gb, shader_px, shader_vhsc, shader_tv, shader_hc, shader_flm;
PGraphics buffer0, buffer1, buffer2, buffer3, buffer4;
int textureSampleMode = 3;
boolean useBorders = false;
boolean useTv = false;

void setup() {
  size(1280, 960, P2D);
  ((PGraphicsOpenGL)g).textureSampling(textureSampleMode); 
  noSmooth();
 
  shader_delay = loadShader("delay.glsl");
  shader_gb = loadShader("gameboy.glsl");
  shader_px = loadShader("pixelvision.glsl");
  shader_vhsc = loadShader("vhsc.glsl");
  shader_tv = loadShader("tv.glsl");
  shader_hc = loadShader("hypercard.glsl");
  shader_flm = loadShader("film.glsl");
  
  setupSpecs();

  video = new Capture(this, camW, camH, Capture.list()[captureIndex], camFps);
  video.start(); 
}

void draw() {
  background(0);
  float time = (float) millis() / 1000.0;
  
  // 0. Original video image
  buffer0.beginDraw();
  buffer0.image(video, 0, 0, buffer0.width, buffer0.height);
  buffer0.filter(shader_delay);
  buffer0.endDraw();
  
  // 1. Delay effect
  buffer1.beginDraw();
  buffer1.image(buffer0, 0, 0);
  buffer1.endDraw();
  
  // 2. Palette effect
  buffer2.beginDraw();
  buffer2.image(buffer0, 0, 0);
  switch(format) {
    case "gameboy":
      buffer0.filter(shader_gb);
      break;
    case "pixelvision":
      buffer0.filter(shader_px);
      break;
    case "vhs-c":
      buffer0.filter(shader_vhsc);
      break;
    case "hypercard":
      buffer0.filter(shader_hc);
      break;
    case "film":
      shader_flm.set("time", time);
      buffer0.filter(shader_flm);
      break;
  }
  buffer2.endDraw();
  
  // 3. Crop to camera image size
  buffer3.beginDraw();
  buffer3.image(buffer0, cropOffsetW, cropOffsetH);
  buffer3.endDraw();
    
  // 4. Expand to final dimensions55
  buffer4.beginDraw();
  buffer4.background(0);
  if (useBorders) {
    buffer4.image(buffer3, marginW, marginH);
  } else {
    buffer4.image(buffer3, 0, 0, buffer4.width, buffer4.height);
  }
  buffer4.endDraw();
  
  if (preview) {
    image(video, 0, 0, width, height);
  } else {
    image(buffer4, 0, 0, width, height);
  }
  
  if (useTv) {
    shader_tv.set("time", time);
    filter(shader_tv);
  }
    
  surface.setTitle("" + frameRate);
}

void captureEvent(Capture c) {
  c.read();
}

String format = "gameboy";

int camW, camH, camFps, baseW, baseH, cropW, cropH, finalW, finalH;
int cropOffsetW, cropOffsetH, marginW, marginH;

float delaySpeed;
float lumaThreshold = 0.2;
float alphaMin = 0.1;
float alphaMax = 1.0;

void setupSpecs() {
  setupSpecs("gameboy");
}

void setupSpecs(String _format) {
  format = _format;
  preview = false;
  switch(format) {
    case "gameboy":
      camW = 640;
      camH = 480;
      camFps = 30;
      baseW = 128; // 150
      baseH = 112;
      cropW = baseW; // 128
      cropH = baseH;
      finalW = 160;
      finalH = 144;
      delaySpeed = 0.1;
      break;
    case "pixelvision":
      camW = 640;
      camH = 480;
      camFps = 15;
      baseW = 120;
      baseH = 90;
      cropW = baseW;
      cropH = baseH;
      finalW = 160;
      finalH = 120;
      delaySpeed = 0.2;
      break;
    case "vhs-c":
      camW = 640;
      camH = 480;
      camFps = 30;
      baseW = 352;
      baseH = 240;
      cropW = baseW;
      cropH = baseH;
      finalW = baseW;
      finalH = baseH;
      delaySpeed = 0.2;
      break;
    case "hypercard":
      camW = 640;
      camH = 480;
      camFps = 15;
      baseW = 512;
      baseH = 342;
      cropW = baseW;
      cropH = baseH;
      finalW = baseW;
      finalH = baseH;
      delaySpeed = 0.2;
      break;
    case "film":
      camW = 1920;
      camH = 1080;
      camFps = 24;
      baseW = 1440;
      baseH = camH;
      cropW = baseW;
      cropH = baseH;
      finalW = cropW;
      finalH = cropH;
      delaySpeed = 0.3;
      break;
  }
  
  init();
}

void init() {
  cropOffsetW = -1 * ((baseW-cropW)/2);
  cropOffsetH = -1 * ((baseH-cropH)/2);
  marginW = (finalW - cropW)/2;
  marginH = (finalH - cropH)/2;

  buffer0 = createGraphics(baseW, baseH, P2D);
  ((PGraphicsOpenGL)buffer0).textureSampling(textureSampleMode); 
  buffer0.noSmooth();

  buffer1 = createGraphics(baseW, baseH, P2D);
  ((PGraphicsOpenGL)buffer1).textureSampling(textureSampleMode); 
  buffer1.noSmooth();
  buffer1.beginDraw();
  buffer1.background(127);
  buffer1.endDraw();
  
  buffer2 = createGraphics(baseW, baseH, P2D);
  ((PGraphicsOpenGL)buffer2).textureSampling(textureSampleMode); 
  buffer2.noSmooth();
  
  buffer3 = createGraphics(cropW, cropH, P2D);
  ((PGraphicsOpenGL)buffer3).textureSampling(textureSampleMode); 
  buffer3.noSmooth();

  buffer4 = createGraphics(finalW, finalH, P2D);
  ((PGraphicsOpenGL)buffer4).textureSampling(textureSampleMode); 
  buffer4.noSmooth();

  shader_delay.set("iResolution", float(buffer0.width), float(buffer0.height));
  shader_delay.set("tex0", buffer0);
  shader_delay.set("tex1", buffer1);
  shader_delay.set("delaySpeed", delaySpeed);
  shader_delay.set("lumaThreshold", lumaThreshold);
  shader_delay.set("alphaMin", alphaMin);
  shader_delay.set("alphaMax", alphaMax);

  shader_gb.set("iResolution", float(buffer0.width), float(buffer0.height));
  shader_gb.set("tex0", buffer0);
  
  shader_px.set("iResolution", float(buffer0.width), float(buffer0.height));
  shader_px.set("tex0", buffer0);

  shader_vhsc.set("iResolution", float(buffer0.width), float(buffer0.height));
  shader_vhsc.set("tex0", buffer0);

  shader_hc.set("iResolution", float(buffer0.width), float(buffer0.height));
  shader_hc.set("tex0", buffer0);

  shader_flm.set("iResolution", float(buffer0.width), float(buffer0.height));
  shader_flm.set("tex0", buffer0);
  
  shader_tv.set("iResolution", float(width), float(height));
  shader_tv.set("tex0", buffer4);
}

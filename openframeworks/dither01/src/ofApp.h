#pragma once

#include "ofMain.h"

struct Specs {
    string format;
    int camW, camH, camFps;
    int baseW, baseH;
    int cropW, cropH;
    int finalW, finalH;
    int cropOffsetW, cropOffsetH;
    int marginW, marginH;
    float delaySpeed;
    float lumaThreshold = 0.2f;
    float alphaMin = 0.1f;
    float alphaMax = 1.0f;
};

class ofApp : public ofBaseApp {
public:
    void setup();
    void update();
    void draw();
    void keyPressed(int key);

    void setupSpecs(string format);
    void initBuffers();
    void makeDithered(ofPixels & pixels, int steps);
    void distributeError(ofPixels & pixels, int x, int y, float errR, float errG, float errB);
    void addError(ofPixels & pixels, float factor, int x, int y, float errR, float errG, float errB);
    float closestStep(float max, float steps, float value);

    ofVideoGrabber video;
    ofFbo buffer0, buffer1, buffer2, buffer3, buffer4;
    ofShader shader_delay, shader_gb, shader_px, shader_vhsc, shader_tv, shader_hc, shader_flm;
    
    Specs currentSpecs;
    ofImage frame;
    bool doDither = true;
    bool preview = false;
    bool useBorders = false;
    bool useTv = false;
    int textureSampleMode = 3; // nearest filtering in OF is GL_NEAREST
};

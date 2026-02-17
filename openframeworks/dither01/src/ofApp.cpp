#include "ofApp.h"

void ofApp::setup() {
    ofSetWindowShape(1280, 960);
    ofSetFrameRate(60);
    ofSetVerticalSync(true);
    ofDisableArbTex(); // Use standard texture coordinates (0-1)

    // Load Shaders (we'll create these later)
    string vPath = "shaders/v150/pass.vert";
    shader_delay.load(vPath, "shaders/v150/delay.frag");
    shader_gb.load(vPath, "shaders/v150/gameboy.frag");
    shader_px.load(vPath, "shaders/v150/pixelvision.frag");
    shader_vhsc.load(vPath, "shaders/v150/vhsc.frag");
    shader_tv.load(vPath, "shaders/v150/tv.frag");
    shader_hc.load(vPath, "shaders/v150/hypercard.frag");
    shader_flm.load(vPath, "shaders/v150/film.frag");

    setupSpecs("gameboy");
    
    video.setDesiredFrameRate(currentSpecs.camFps);
    video.setup(currentSpecs.camW, currentSpecs.camH);

    frame.allocate(currentSpecs.camW, currentSpecs.camH, OF_IMAGE_COLOR);
}

void ofApp::setupSpecs(string format) {
    currentSpecs.format = format;
    preview = false;
    
    if (format == "gameboy") {
        currentSpecs.camW = 640; currentSpecs.camH = 480; currentSpecs.camFps = 30;
        currentSpecs.baseW = 128; currentSpecs.baseH = 112;
        currentSpecs.cropW = 128; currentSpecs.cropH = 112;
        currentSpecs.finalW = 160; currentSpecs.finalH = 144;
        currentSpecs.delaySpeed = 0.1f;
    } else if (format == "pixelvision") {
        currentSpecs.camW = 640; currentSpecs.camH = 480; currentSpecs.camFps = 15;
        currentSpecs.baseW = 120; currentSpecs.baseH = 90;
        currentSpecs.cropW = 120; currentSpecs.cropH = 90;
        currentSpecs.finalW = 160; currentSpecs.finalH = 120;
        currentSpecs.delaySpeed = 0.2f;
    } else if (format == "vhs-c") {
        currentSpecs.camW = 640; currentSpecs.camH = 480; currentSpecs.camFps = 30;
        currentSpecs.baseW = 352; currentSpecs.baseH = 240;
        currentSpecs.cropW = 352; currentSpecs.cropH = 240;
        currentSpecs.finalW = 352; currentSpecs.finalH = 240;
        currentSpecs.delaySpeed = 0.2f;
    } else if (format == "hypercard") {
        currentSpecs.camW = 640; currentSpecs.camH = 480; currentSpecs.camFps = 15;
        currentSpecs.baseW = 512; currentSpecs.baseH = 342;
        currentSpecs.cropW = 512; currentSpecs.cropH = 342;
        currentSpecs.finalW = 512; currentSpecs.finalH = 342;
        currentSpecs.delaySpeed = 0.2f;
    } else if (format == "film") {
        currentSpecs.camW = 1920; currentSpecs.camH = 1080; currentSpecs.camFps = 24;
        currentSpecs.baseW = 1440; currentSpecs.baseH = currentSpecs.camH;
        currentSpecs.cropW = 1440; currentSpecs.cropH = currentSpecs.camH;
        currentSpecs.finalW = 1440; currentSpecs.finalH = currentSpecs.camH;
        currentSpecs.delaySpeed = 0.3f;
    }
    
    initBuffers();
}

void ofApp::initBuffers() {
    currentSpecs.cropOffsetW = -1 * ((currentSpecs.baseW - currentSpecs.cropW) / 2);
    currentSpecs.cropOffsetH = -1 * ((currentSpecs.baseH - currentSpecs.cropH) / 2);
    currentSpecs.marginW = (currentSpecs.finalW - currentSpecs.cropW) / 2;
    currentSpecs.marginH = (currentSpecs.finalH - currentSpecs.cropH) / 2;

    auto allocateFbo = [](ofFbo & fbo, int w, int h) {
        ofFbo::Settings s;
        s.width = w;
        s.height = h;
        s.textureTarget = GL_TEXTURE_2D;
        s.minFilter = GL_NEAREST;
        s.maxFilter = GL_NEAREST;
        fbo.allocate(s);
    };

    allocateFbo(buffer0, currentSpecs.baseW, currentSpecs.baseH);
    allocateFbo(buffer1, currentSpecs.baseW, currentSpecs.baseH);
    allocateFbo(buffer2, currentSpecs.baseW, currentSpecs.baseH);
    allocateFbo(buffer3, currentSpecs.cropW, currentSpecs.cropH);
    allocateFbo(buffer4, currentSpecs.finalW, currentSpecs.finalH);

    buffer1.begin();
    ofClear(127, 255);
    buffer1.end();
}

void ofApp::update() {
    video.update();
    if (video.isFrameNew()) {
        if (doDither) {
            frame.setFromPixels(video.getPixels());
            frame.resize(currentSpecs.baseW, currentSpecs.baseH);
            makeDithered(frame.getPixels(), 1);
            frame.update();
        }
    }
}

void ofApp::draw() {
    float time = ofGetElapsedTimef();

    // 0. Original video image with delay shader
    buffer0.begin();
    ofClear(0, 255);
    shader_delay.begin();
    shader_delay.setUniform2f("iResolution", (float)buffer0.getWidth(), (float)buffer0.getHeight());
    shader_delay.setUniformTexture("tex0", doDither ? frame.getTexture() : video.getTexture(), 0);
    shader_delay.setUniformTexture("tex1", buffer1.getTexture(), 1);
    shader_delay.setUniform1f("delaySpeed", currentSpecs.delaySpeed);
    shader_delay.setUniform1f("lumaThreshold", currentSpecs.lumaThreshold);
    shader_delay.setUniform1f("alphaMin", currentSpecs.alphaMin);
    shader_delay.setUniform1f("alphaMax", currentSpecs.alphaMax);
    if (doDither) {
        frame.draw(0, 0, buffer0.getWidth(), buffer0.getHeight());
    } else {
        video.draw(0, 0, buffer0.getWidth(), buffer0.getHeight());
    }
    shader_delay.end();
    buffer0.end();

    // 1. Update delay buffer
    buffer1.begin();
    buffer0.draw(0, 0);
    buffer1.end();

    // 2. Palette effect (applying shader to buffer0 into buffer2)
    buffer2.begin();
    ofClear(0, 255);
    ofShader * currentEffectShader = nullptr;
    if (currentSpecs.format == "gameboy") currentEffectShader = &shader_gb;
    else if (currentSpecs.format == "pixelvision") currentEffectShader = &shader_px;
    else if (currentSpecs.format == "vhs-c") currentEffectShader = &shader_vhsc;
    else if (currentSpecs.format == "hypercard") currentEffectShader = &shader_hc;
    else if (currentSpecs.format == "film") currentEffectShader = &shader_flm;

    if (currentEffectShader) {
        currentEffectShader->begin();
        currentEffectShader->setUniform2f("iResolution", (float)buffer2.getWidth(), (float)buffer2.getHeight());
        currentEffectShader->setUniformTexture("tex0", buffer0.getTexture(), 0);
        if (currentSpecs.format == "film") {
            currentEffectShader->setUniform1f("time", time);
        }
        buffer0.draw(0, 0);
        currentEffectShader->end();
    } else {
        buffer0.draw(0, 0);
    }
    buffer2.end();

    // 3. Crop
    buffer3.begin();
    ofClear(0, 255);
    buffer2.draw(currentSpecs.cropOffsetW, currentSpecs.cropOffsetH);
    buffer3.end();

    // 4. Final expansion
    buffer4.begin();
    ofClear(0, 255);
    if (useBorders) {
        buffer3.draw(currentSpecs.marginW, currentSpecs.marginH);
    } else {
        buffer3.draw(0, 0, buffer4.getWidth(), buffer4.getHeight());
    }
    buffer4.end();

    // Final output to screen
    if (preview) {
        video.draw(0, 0, ofGetWidth(), ofGetHeight());
    } else {
        if (useTv) {
            shader_tv.begin();
            shader_tv.setUniform2f("iResolution", (float)ofGetWidth(), (float)ofGetHeight());
            shader_tv.setUniformTexture("tex0", buffer4.getTexture(), 0);
            shader_tv.setUniform1f("time", time);
            buffer4.draw(0, 0, ofGetWidth(), ofGetHeight());
            shader_tv.end();
        } else {
            buffer4.draw(0, 0, ofGetWidth(), ofGetHeight());
        }
    }

    ofSetWindowTitle(ofToString(ofGetFrameRate()));
}

void ofApp::keyPressed(int key) {
    if (key == '1') setupSpecs("gameboy");
    else if (key == '2') setupSpecs("pixelvision");
    else if (key == '3') setupSpecs("vhs-c");
    else if (key == '4') setupSpecs("hypercard");
    else if (key == '5') setupSpecs("film");
    else if (key == 'p') preview = !preview;
    else if (key == 'b') useBorders = !useBorders;
    else if (key == 't') useTv = !useTv;
    else if (key == 'd') doDither = !doDither;
}

// Dither functions ported from Dither.pde
float ofApp::closestStep(float max, float steps, float value) {
    return round(steps * value / 255.0f) * floor(255.0f / steps);
}

void ofApp::makeDithered(ofPixels & pixels, int steps) {
    for (int y = 0; y < pixels.getHeight(); y++) {
        for (int x = 0; x < pixels.getWidth(); x++) {
            ofColor clr = pixels.getColor(x, y);
            float oldR = clr.r;
            float oldG = clr.g;
            float oldB = clr.b;
            float newR = closestStep(255, steps, oldR);
            float newG = closestStep(255, steps, oldG);
            float newB = closestStep(255, steps, oldB);

            pixels.setColor(x, y, ofColor(newR, newG, newB));

            float errR = oldR - newR;
            float errG = oldG - newG;
            float errB = oldB - newB;

            distributeError(pixels, x, y, errR, errG, errB);
        }
    }
}

void ofApp::distributeError(ofPixels & pixels, int x, int y, float errR, float errG, float errB) {
    addError(pixels, 7 / 16.0f, x + 1, y, errR, errG, errB);
    addError(pixels, 3 / 16.0f, x - 1, y + 1, errR, errG, errB);
    addError(pixels, 5 / 16.0f, x, y + 1, errR, errG, errB);
    addError(pixels, 1 / 16.0f, x + 1, y + 1, errR, errG, errB);
}

void ofApp::addError(ofPixels & pixels, float factor, int x, int y, float errR, float errG, float errB) {
    if (x < 0 || x >= pixels.getWidth() || y < 0 || y >= pixels.getHeight()) return;
    ofColor clr = pixels.getColor(x, y);
    float r = clr.r;
    float g = clr.g;
    float b = clr.b;
    pixels.setColor(x, y, ofColor(
        ofClamp(r + errR * factor, 0, 255),
        ofClamp(g + errG * factor, 0, 255),
        ofClamp(b + errB * factor, 0, 255)
    ));
}

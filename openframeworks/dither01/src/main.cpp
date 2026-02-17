#include "ofMain.h"
#include "ofApp.h"

int main() {
    ofGLWindowSettings settings;
    settings.setSize(1280, 960);
    settings.windowMode = OF_WINDOW;
    settings.setGLVersion(3, 2); // OpenGL 3.2+ for GLSL 150
    ofCreateWindow(settings);
    ofRunApp(new ofApp());
}

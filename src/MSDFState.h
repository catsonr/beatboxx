#ifndef MSDFSTATE_H
#define MSDFSTATE_H

#include <msdfgen.h>
#include <msdfgen-ext.h>

#include "utilities.h"

using namespace msdfgen;

struct MSDFState
{
    bool init()
    {
        printf("[MSDFState::init] init!!\n");

            if (FreetypeHandle *ft = initializeFreetype()) {
        if (FontHandle *font = loadFont(ft, util::get_fullPath("assets/fonts/DotGothic16/DotGothic16-Regular.ttf").c_str())) {
            Shape shape;
            if (loadGlyph(shape, font, 'A', FONT_SCALING_EM_NORMALIZED)) {
                shape.normalize();
                //                      max. angle
                edgeColoringSimple(shape, 3.0);
                //          output width, height
                Bitmap<float, 3> msdf(32, 32);
                //                            scale, translation (in em's)
                SDFTransformation t(Projection(32.0, Vector2(0.125, 0.125)), Range(0.125));
                generateMSDF(msdf, shape, t);
                printf("[MSDFState::init] saving test 'A' bitmap...\n");
                savePng(msdf, util::get_fullPath("MSDFStateExampleImage.png").c_str());
            }
            destroyFont(font);
        }
        deinitializeFreetype(ft);
    }
            
    return true;
    }
}; // MSDFState

#endif // MSDFSTATE_H
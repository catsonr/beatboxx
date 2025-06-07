#ifndef MSDFSTATE_H
#define MSDFSTATE_H

#include <msdf-atlas-gen/msdf-atlas-gen.h>

#include "utilities.h"
#include "ShaderProgram.h"

struct MSDFState
{
    // gl stuff
    std::vector<float> quad = {
    //  pos.x,  pos.y,  pos.z,    u,   v
   -1.0f,   -1.0f,   0.0f,    0.0f,  1.0f,   // bottom-left (u=0,v=1 in top-left coords)
    1.0f,   -1.0f,   0.0f,    1.0f,  1.0f,   // bottom-right (u=1,v=1)
    1.0f,    1.0f,   0.0f,    1.0f,  0.0f,   // top-right (u=1,v=0)

   -1.0f,   -1.0f,   0.0f,    0.0f,  1.0f,   // bottom-left
    1.0f,    1.0f,   0.0f,    1.0f,  0.0f,   // top-right
   -1.0f,    1.0f,   0.0f,    0.0f,  0.0f    // top-left (u=0,v=0)
    };
    int stride = 5; // 3 floats for pos + 2 floats for UV
    ShaderProgram msdfprogram; 
    GLuint msdftexture;

    glm::mat4 mModel { glm::mat4(1.0f) };
    
    GLuint char_vao, char_vbo;

    // msdf-atlas-gen stuff 
    float atlas_pixelRange = 2.0f;
    int atlas_width, atlas_height;
    const msdf_atlas::byte *atlas_pixels;
    std::vector<msdf_atlas::GlyphGeometry> atlas_glyphs;
    
    msdf_atlas::GlyphGeometry* get_glyphFromChar(const char c)
    {
        for(auto& glyph : atlas_glyphs)
        {
            if( glyph.getCodepoint() == c) return &glyph;
        }
        
        printf("could not find character '%c' in atlas!\n", c);
        return nullptr;
    }

    bool init(const char *path_fromRoot)
    {
        if (!generateAtlas(path_fromRoot))
        {
            printf("[MSDFState::init] failed to generate atlas from '%s'!\n", path_fromRoot);
            return false;
        }
        
        msdf_atlas::GlyphGeometry* glyph = get_glyphFromChar('$');
        double al, ab, ar, at; // atlas left, bottom, right, top
        double pl, pb, pr, pt; // plane left, bottom, right, top
        glyph->getQuadAtlasBounds(al, ab, ar, at);
        glyph->getQuadPlaneBounds(pl, pb, pr, pt);
        
        printf("glyph '%c':\n", (char)glyph->getCodepoint());
        printf("atlas bounds: l=%f, b=%f, r=%f, t=%f\n", al, ab, ar, at);
        printf("plane bounds: l=%f, b=%f, r=%f, t=%f\n", pl, pb, pr, pt);

        float u0 = al / float(atlas_width);
        float v0 = ab / float(atlas_height);
        float u1 = ar / float(atlas_width);
        float v1 = at / float(atlas_height);

        // these x0 & y0 is flipped with x1 & y1, otherwise the text is mirrored vertically and horizontally
        float x1 = pl, y1 = pb;
        float x0 = pr, y0 = pt;

        std::vector<float> char_verts = {
             x0,    y0,   0.0f, u0, v1,
             x1,    y0,   0.0f, u1, v1,
             x1,    y1,   0.0f, u1, v0,

             x0,    y0,   0.0f, u0, v1,
             x1,    y1,   0.0f, u1, v0,
             x0,    y1,   0.0f, u0, v0,
        };
        
        if( !msdfprogram.init("assets/shaders/msdf.vert", "assets/shaders/msdf.frag", char_verts, 3, 2) ) {
            printf("[MSDFState::init] failed to create shader program!\n");
            return false;
        }

        // create texture from atlas
        glGenTextures(1, &msdftexture);
        glBindTexture(GL_TEXTURE_2D, msdftexture);

        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, atlas_width, atlas_height, 0, GL_RGB, GL_UNSIGNED_BYTE, atlas_pixels);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        
        mModel = glm::translate(mModel, glm::vec3(0, 0, 1));
        msdfprogram.set_uniform("u_mModel", mModel);
        // msdfprogram.set_uniform("u_mVP", identity); // set by GLState::init

        msdfprogram.set_uniform("u_atlas", 0);
        glm::vec4 text_color = glm::vec4(1.0);
        msdfprogram.set_uniform("u_color", text_color);
        glm::vec4 text_bg_color = glm::vec4(0.0);
        msdfprogram.set_uniform("u_color_bg", text_bg_color);
        
        return true;
    }
    
    void draw()
    {
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, msdftexture);
        
        msdfprogram.draw();
    }

    // mostly from https://github.com/Chlumsky/msdf-atlas-gen
    bool generateAtlas(const char *path_fromRoot)
    {
        bool success = false;
        // Initialize instance of FreeType library
        if (msdfgen::FreetypeHandle *ft = msdfgen::initializeFreetype())
        {
            // Load font file
            if (msdfgen::FontHandle *font = msdfgen::loadFont(ft, util::get_fullPath(path_fromRoot).c_str()))
            {
                // Storage for glyph geometry and their coordinates in the atlas
                std::vector<msdf_atlas::GlyphGeometry> glyphs;
                // FontGeometry is a helper class that loads a set of glyphs from a single font.
                // It can also be used to get additional font metrics, kerning information, etc.
                msdf_atlas::FontGeometry fontGeometry(&glyphs);
                // Load a set of character glyphs:
                // The second argument can be ignored unless you mix different font sizes in one atlas.
                // In the last argument, you can specify a charset other than ASCII.
                // To load specific glyph indices, use loadGlyphs instead.
                double fontScale = 1.0f;
                fontGeometry.loadCharset(font, fontScale, msdf_atlas::Charset::ASCII);
                // Apply MSDF edge coloring. See edge-coloring.h for other coloring strategies.
                const double maxCornerAngle = 3.0;
                for (msdf_atlas::GlyphGeometry &glyph : glyphs)
                    glyph.edgeColoring(&msdfgen::edgeColoringInkTrap, maxCornerAngle, 0);
                // TightAtlasPacker class computes the layout of the atlas.
                msdf_atlas::TightAtlasPacker packer;
                // Set atlas parameters:
                // setDimensions or setDimensionsConstraint to find the best value
                packer.setDimensionsConstraint(msdf_atlas::DimensionsConstraint::SQUARE);
                // setScale for a fixed size or setMinimumScale to use the largest that fits
                packer.setMinimumScale(48.0);
                // setPixelRange or setUnitRange
                packer.setPixelRange(atlas_pixelRange);
                packer.setMiterLimit(1.0); // no idea what this is, but it's on the github
                // Compute atlas layout - pack glyphs
                packer.pack(glyphs.data(), glyphs.size());
                // Get final atlas dimensions
                int width = 0, height = 0;
                packer.getDimensions(width, height);
                // The ImmediateAtlasGenerator class facilitates the generation of the atlas bitmap.
                msdf_atlas::ImmediateAtlasGenerator<
                    float,                      // pixel type of buffer for individual glyphs depends on generator function
                    3,                          // number of atlas color channels
                    msdf_atlas::msdfGenerator,              // function to generate bitmaps for individual glyphs
                    msdf_atlas::BitmapAtlasStorage<msdf_atlas::byte, 3> // class that stores the atlas bitmap
                    // For example, a custom atlas storage class that stores it in VRAM can be used.
                >
                generator(width, height);
                // GeneratorAttributes can be modified to change the generator's default settings.
                msdf_atlas::GeneratorAttributes attributes;
                generator.setAttributes(attributes);
                generator.setThreadCount(4);
                // Generate atlas bitmap
                generator.generate(glyphs.data(), glyphs.size());
                // The atlas bitmap can now be retrieved via atlasStorage as a BitmapConstRef.
                // The glyphs array (or fontGeometry) contains positioning data for typesetting text.
                //success = my_project::submitAtlasBitmapAndLayout(generator.atlasStorage(), glyphs);
                success = true;
                const msdf_atlas::BitmapAtlasStorage<msdf_atlas::byte, 3>& atlas = generator.atlasStorage();
                msdfgen::BitmapConstRef<msdf_atlas::byte, 3> bitmap = atlas;
                printf("[MSDFState::generateAtlas] generated atlas of size %dx%d!\n", bitmap.width, bitmap.height);
                msdfgen::savePng(bitmap, util::get_fullPath("msdf-atlas.png").c_str());
                
                // width and height (in pixels) of atlas
                atlas_width = bitmap.width;
                atlas_height = bitmap.height;
                // raw pixel data of atlas
                atlas_pixels = bitmap.pixels;
                // save glyphs to MSDFState member for future access
                atlas_glyphs = std::move(glyphs);

                // Cleanup
                msdfgen::destroyFont(font);
            }
            msdfgen::deinitializeFreetype(ft);
        }
        return success;
    }
}; // MSDFState

#endif // MSDFSTATE_H
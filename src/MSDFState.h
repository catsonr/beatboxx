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
    
    /* PUBLIC METHODS */
    msdf_atlas::GlyphGeometry* get_glyphFromChar(const char c)
    {
        for(auto& glyph : atlas_glyphs)
        {
            if( glyph.getCodepoint() == c) return &glyph;
        }
        
        printf("[MSDFState::get_glyphFromChar] could not find character '%c' in atlas!\n", c);
        return nullptr;
    }
    
    std::vector<float> glyph_vao(const char c)
    {
        msdf_atlas::GlyphGeometry* glyph = get_glyphFromChar(c);
        double al, ab, ar, at; // atlas left, bottom, right, top
        double pl, pb, pr, pt; // plane left, bottom, right, top
        glyph->getQuadAtlasBounds(al, ab, ar, at);
        glyph->getQuadPlaneBounds(pl, pb, pr, pt);

        // u coords are reversed from the expected u0=left, u1=right so opengl renders with correct orientation
        float u0 = (float)ar / atlas_width;
        float u1 = (float)al / atlas_width;

        float v0 = (float)ab / atlas_height;
        float v1 = (float)at / atlas_height;
        
        float width = pr - pl;
        float height = pt - pb;

        float x0 = pl - (width / 2.0);
        float x1 = x0 + width;

        float y0 = pb - (height / 2.0);
        float y1 = y0 + height;

        return {
             x0, y0, 0.0f, u0, v0,
             x1, y0, 0.0f, u1, v0,
             x1, y1, 0.0f, u1, v1,

             x0, y0, 0.0f, u0, v0,
             x1, y1, 0.0f, u1, v1,
             x0, y1, 0.0f, u0, v1,
        };
        
    }

    bool init(const char *path_fromRoot)
    {
        if (!generateAtlas(path_fromRoot))
        {
            printf("[MSDFState::init] failed to generate atlas from '%s'!\n", path_fromRoot);
            return false;
        }
        
        std::vector<float> glyph_verts = glyph_vao('$');
        
        if( !msdfprogram.init("assets/shaders/msdf.vert", "assets/shaders/msdf.frag", glyph_verts, 3, 2) ) {
            printf("[MSDFState::init] failed to create shader program!\n");
            return false;
        }

        // create texture from atlas
        glGenTextures(1, &msdftexture);
        glBindTexture(GL_TEXTURE_2D, msdftexture);
        
        glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, atlas_width, atlas_height, 0, GL_RGB, GL_UNSIGNED_BYTE, atlas_pixels);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        
        mModel = glm::translate(mModel, glm::vec3(0, 0, 1));
        msdfprogram.set_uniform("u_mModel", mModel);
        // msdfprogram.set_uniform("u_mVP", identity); // set by GLState::init

        msdfprogram.set_uniform("u_atlas", 0);
        glm::vec4 text_color = glm::vec4(0.2, 8.0, 0.5, 1.0);
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
                const msdf_atlas::BitmapAtlasStorage<msdf_atlas::byte, 3>& atlas = generator.atlasStorage();
                msdfgen::BitmapConstRef<msdf_atlas::byte, 3> bitmap = atlas;
                
                if(!bitmap.pixels) {
                    printf("[MSDFState::generateAtlas] failed to generate atlas for font '%s'!\n", path_fromRoot);
                    return false;
                }

                printf("[MSDFState::generateAtlas] generated atlas of size %dx%d for font '%s'\n", bitmap.width, bitmap.height, path_fromRoot);
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
        return true;
    }
}; // MSDFState

#endif // MSDFSTATE_H
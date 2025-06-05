#ifndef MSDFSTATE_H
#define MSDFSTATE_H

#include <msdf-atlas-gen/msdf-atlas-gen.h>

#include "utilities.h"
#include "ShaderProgram.h"

struct MSDFState
{
    std::vector<float> quad = {
        // Triangle #1
        -1.0f, -1.0f, 0.0f, 0.0f, 0.0f, // bottom-left, UV (0,0)
        1.0f, -1.0f, 0.0f, 1.0f, 0.0f,  // bottom-right, UV (1,0)
        1.0f, 1.0f, 0.0f, 1.0f, 1.0f,   // top-right, UV (1,1)
        // Triangle #2
        -1.0f, -1.0f, 0.0f, 0.0f, 0.0f, // bottom-left, UV (0,0)
        1.0f, 1.0f, 0.0f, 1.0f, 1.0f,   // top-right, UV (1,1)
        -1.0f, 1.0f, 0.0f, 0.0f, 1.0f   // top-left, UV (0,1)
    };
    int stride = 5; // 3 floats for pos + 2 floats for UV
    ShaderProgram msdfprogram; 

    int atlas_width, atlas_height;
    const msdf_atlas::byte *atlas_pixels;

    GLuint msdftexture;

    bool init(const char *path_fromRoot)
    {
        if (!generateAtlas(path_fromRoot))
        {
            printf("[MSDFState::init] failed to generate atlas from '%s'!\n", path_fromRoot);
            return false;
        }
        
        if( !msdfprogram.init("assets/shaders/msdf.vert", "assets/shaders/msdf.frag", quad, 3, 2) ) {
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
        
        glm::mat4 identity = glm::mat4(1.0f);
        msdfprogram.set_uniform("u_mModel", identity);
        msdfprogram.set_uniform("u_mVP", identity);

        msdfprogram.set_uniform("u_atlas", 0);
        glm::vec4 text_color = glm::vec4(1.0);
        msdfprogram.set_uniform("u_color", text_color);
        msdfprogram.set_uniform("u_pxRange", 2.0f);
        
        return true;
    }
    
    void draw()
    {
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, msdftexture);
        
        msdfprogram.draw();
    }

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
                fontGeometry.loadCharset(font, 1.0, msdf_atlas::Charset::ASCII);
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
                packer.setPixelRange(2.0);
                packer.setMiterLimit(1.0);
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
                msdfgen::savePng(bitmap, util::get_fullPath("msdftest.png").c_str());
                
                atlas_width = bitmap.width;
                atlas_height = bitmap.height;
                atlas_pixels = bitmap.pixels;

                // Cleanup
                msdfgen::destroyFont(font);
            }
            msdfgen::deinitializeFreetype(ft);
        }
        return success;
    }
}; // MSDFState

#endif // MSDFSTATE_H
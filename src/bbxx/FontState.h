#ifndef FONTSTATE_H
#define FONTSTATE_H

#include <map>
#include <memory>

#include <ft2build.h>
#include FT_FREETYPE_H

#include "utilities.h"

#include "Texture.h"

struct FontState
{
    std::string default_font { util::get_fullPath("assets/fonts/splatoon3/DFP_GBZY9.ttf") };
    
    FT_Library library; // freetype state machine (?)
    FT_Face face; // a given typeface with a given style (e.g., Times New Roman Italic)
    
    bool loaded { false };
    
    std::map<FT_ULong, std::unique_ptr<Texture>> glyphs;

    bool init()
    {
        FT_Error error = FT_Init_FreeType(&library);
        if( error != FT_Err_Ok ) {
            printf("[FontState::init] failed to initialize freetype!\n");
            return false;
        }
        
        error = FT_New_Face(
            library,
            default_font.c_str(),
            0,
            &face
        );
        if( error != FT_Err_Ok ) {
            if( error == FT_Err_Unknown_File_Format ) {
                printf("[FontState::init] failed to create new face '%s'! (unknown file format!!!)\n", default_font.c_str());
            } else {
                printf("[FontState::init] failed to create new face '%s' for unknown reason!\n", default_font.c_str());
            }

            return false;
        }
        //printf("[FontState::init] '%s' successfully loaded with %ld glyphs\n", default_font.c_str(), face->num_glyphs);
        
        error = FT_Select_Charmap(face, FT_ENCODING_UNICODE);
        if( error != FT_Err_Ok ) {
            printf("[FontState::init] failed to set charmap to unicode!\n");
            return false;
        }

        error = FT_Set_Char_Size(
            face,    /* handle to face object         */
            0,       /* char_width in 1/64 of points  */
            16 * 64 * 1, /* char_height in 1/64 of points */
            300,     /* horizontal device resolution  */
            300);    /* vertical device resolution    */
        if( error != FT_Err_Ok ) {
            printf("[FontState::init] failed to set char size!\n");
            return false;
        }
        
        if( !texture_glyphs() ) {
            printf("[FontState::init] failed to texture glyphs!\n");
            return false;
        }
        
        loaded = true;
        
        return true;
    }
    
    /*
       renders a single glyph of unicode code point 'charcode' 
       the resulting glyph is stored in a bitmap at face->glyph->bitmap
    */
    bool render_glyph(FT_ULong charcode)
    {
        FT_UInt glyph_index = FT_Get_Char_Index(face, charcode);
        if( glyph_index == 0 ) {
            printf("[FontState::render_glyph] could not find glyph's char index! (ignoring ...)\n");
            // TODO: handle missing glyph
        }
        
        FT_Error error = FT_Load_Glyph(face, glyph_index, FT_LOAD_DEFAULT);
        if( error != FT_Err_Ok ) {
            printf("[FontState::render_glyph] failed to load glyph of charcode %ld!\n", charcode);
            return false;
        }
        
        // if the glyph isn't already a bitmap, convert it to one (this will more than likely happen)
        if( face->glyph->format != FT_GLYPH_FORMAT_BITMAP ) {
            error = FT_Render_Glyph(face->glyph, FT_RENDER_MODE_NORMAL);
            if( error != FT_Err_Ok ) {
                printf("[FontState::render_glyph] failed to render glyph of charcode %ld!\n", charcode);
                return false;
            }
        }

        return true;
    }
    
    /*
        renders all ASCII characters and saves them to textures in 'glyphs'
    */
    bool texture_glyphs()
    {
        float pen_x = 0.0f;
        const float baseline = 0.0f;

        for( uint16_t codepoint = 32; codepoint < 128; codepoint++)
        {
            render_glyph(codepoint);

            std::unique_ptr<Texture> texture = std::make_unique<Texture>();
            if( !texture->init_from_font(face->glyph->bitmap) ) {
                printf("[FontState::texture glyphs] failed to initialize texture!\n");
                return false;
            }

            float x = pen_x + face->glyph->bitmap_left;
            float y = baseline - face->glyph->bitmap_top;
            float scale = 1.0/100.0f;
            float size = 20;
            texture->model = glm::scale(texture->model, glm::vec3(scale, scale, 1.0));
            texture->model = glm::translate(texture->model, glm::vec3(x, y, 0.0f));
            texture->model = glm::scale(texture->model, glm::vec3(size, size, 1.0));
            
            pen_x += (face->glyph->advance.x >> 6);
            
            glyphs.emplace(codepoint, std::move(texture));
        }

        return true;
    }
    
    ~FontState()
    {
        if( !loaded ) return;

        FT_Done_Face(face);
        FT_Done_FreeType(library);
    }
}; // FontState

#endif // FONTSTATE_H
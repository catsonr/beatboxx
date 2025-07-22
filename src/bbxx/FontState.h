#ifndef FONTSTATE_H
#define FONTSTATE_H

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
    
    Texture tempsingleglyphtexture;

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
        //error = FT_Set_Pixel_Sizes(
        //    face,
        //    0, // width (zero means use the same as the other value)
        //    16*4 // height (in pixels)
        //);
        if( error != FT_Err_Ok ) {
            printf("[FontState::init] failed to set char size!\n");
            return false;
        }
        
        FT_ULong charcode = (int)'B';
        FT_UInt glyph_index = FT_Get_Char_Index(face, charcode);
        if( glyph_index == 0 ) {
            printf("[FontState::init] could not find glyph's char index! (ignoring ...)\n");
            // TODO: handle missing glyph
        }
        
        error = FT_Load_Glyph(face, glyph_index, FT_LOAD_DEFAULT);
        if( error != FT_Err_Ok ) {
            printf("[FontState::init] failed to load glyph of charcode %ld!\n", charcode);
            return false;
        }
        
        // if the glyph isn't already a bitmap, convert it to one (this will more than likely happen)
        if( face->glyph->format != FT_GLYPH_FORMAT_BITMAP ) {
            error = FT_Render_Glyph(face->glyph, FT_RENDER_MODE_NORMAL);
            if( error != FT_Err_Ok ) {
                printf("[FontState::init] failed to render glyph of charcode %ld!\n", charcode);
                return false;
            }
        }
        
        if( !tempsingleglyphtexture.init_from_font(face->glyph->bitmap)) {
            printf("[FontState::init] failed to init temp texture!\n");
            return false;
        }
        
        loaded = true;
        
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
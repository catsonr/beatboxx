#ifndef INPUTSTATE_H
#define INPUTSTATE_H

#include <cstring>

#include <SDL3/SDL.h>

struct InputState
{
    /* the current key state */
    bool keys[SDL_SCANCODE_COUNT] = { false };
    /*
        the keyboard keys that were down last frame
        (used to determine if keys have just been pressed or released)
    */
    bool keys_previous[SDL_SCANCODE_COUNT] { false }; 
    /* the current mouse buttons state */
    SDL_MouseButtonFlags mouse_buttons[6 + 1] { false }; // 0=nothing, 1=left, 2=middle, 3=right, 4=X1, 5=X2
    /*
        the mouse buttons that were down last frame
        (used to determine if mouse buttons buttons have just been pressed or released)
    */
    SDL_MouseButtonFlags mouse_buttons_previous[6 + 1] { false };
    unsigned mouse_x, mouse_y; // mouse position
   
    void iterate()
    {
        std::memcpy(keys_previous, keys, sizeof keys); 
        std::memcpy(mouse_buttons_previous, mouse_buttons, sizeof mouse_buttons);
    }

    /* given an event, sets the input state to that value if a valid input */
    void handle_event(const SDL_Event *event)
    {
        switch(event->type)
        {
            case SDL_EVENT_MOUSE_MOTION:
                mouse_x = event->motion.x;
                mouse_y = event->motion.y;
                break;

            case SDL_EVENT_KEY_DOWN:
                if( !event->key.repeat )
                    keys[event->key.scancode] = true;
                break;

            case SDL_EVENT_KEY_UP:
                keys[event->key.scancode] = false;
                break;

            case SDL_EVENT_MOUSE_BUTTON_DOWN:
                if( event->button.button <= 5)
                    mouse_buttons[event->button.button] = true;
                break;

            case SDL_EVENT_MOUSE_BUTTON_UP:
                if( event->button.button < 5)
                    mouse_buttons[event->button.button] = false;
                break;
        }
    }
    
    /* returns true if the given key is down */
    bool key_down(SDL_Scancode sc) const
    {
        return keys[sc];
    }
    
    /* returns true if the given key was pressed this frame */
    bool key_pressed(SDL_Scancode sc) const
    {
        return keys[sc] && !keys_previous[sc];
    }
    
    /* returns true if the given key was released this frame */
    bool key_released(SDL_Scancode sc) const
    {
        return keys_previous[sc] && !keys[sc];
    }

    /* returns true if the given mouse button is down */
    bool mouse_down(SDL_MouseButtonFlags button) const
    {
        return mouse_buttons[button];
    }
    
    /* returns true if the given mouse pressed this frame */
    bool mouse_pressed(SDL_MouseButtonFlags button) const
    {
        return mouse_buttons[button] && !mouse_buttons_previous[button];
    }

    /* returns true if the given key was released this frame */
    bool mouse_released(SDL_MouseButtonFlags button) const
    {
        return mouse_buttons_previous[button] && !mouse_buttons[button];
    }
}; // InputState

#endif // INPUTSTATE_H
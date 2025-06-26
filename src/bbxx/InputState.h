#ifndef INPUTSTATE_H
#define INPUTSTATE_H

#include <cstring>

#include <SDL3/SDL.h>

struct InputState
{
    /* the current key state */
    bool keys[SDL_SCANCODE_COUNT] = { false };
    /*
        the key state of the previous frame
        (used to determine if keys have just been pressed or released)
    */
    bool keys_previous[SDL_SCANCODE_COUNT] = { false }; 
    SDL_MouseButtonFlags mouse_buttons[6] = { false }; // 0=nothing, 1=left, 2=middle, 3=right, 4=X1, 5=X2
    int mouse_x, mouse_y; // mouse position
    
    void iterate()
    {
        std::memcpy(keys_previous, keys, sizeof keys); 
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
                if( event->button.button < 5)
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
    
    /* returns true if the given mouse button is down */
    bool mouse_button_down(int button) const
    {
        //printf("[InputState::mouse_button_down] mouse buttons down:\n\t1 SDL_BUTTON_LEFT = %i\n\t2 SDL_BUTTON_MIDDLE = %i\n\t3 SDL_BUTTON_RIGHT = %i\n\t4 SDL_BUTTON_X1 = %i\n\t5 SDL_BUTTONX2 = %i\n", mouse_buttons[SDL_BUTTON_LEFT], mouse_buttons[SDL_BUTTON_MIDDLE], mouse_buttons[SDL_BUTTON_RIGHT], mouse_buttons[SDL_BUTTON_X1], mouse_buttons[SDL_BUTTON_X2] );

        return mouse_buttons[button];
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
}; // InputState

#endif // INPUTSTATE_H
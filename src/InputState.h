#ifndef INPUTSTATE_H
#define INPUTSTATE_H

#include <SDL3/SDL.h>

struct InputState
{
    bool keys[SDL_SCANCODE_COUNT] = { false }; // all keys SDL supports
    bool mouse_buttons[5] = { false }; // left, middle, right, X1, X2
    int mouse_x, mouse_y; // mouse position

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
    
    bool key_down(SDL_Scancode sc) const
    {
        return keys[sc];
    }
    bool mouse_button_down(int button) const
    {
        return mouse_buttons[button];
    }
}; // InputState

#endif // INPUTSTATE_H
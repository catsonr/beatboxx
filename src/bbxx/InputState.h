#ifndef INPUTSTATE_H
#define INPUTSTATE_H

#include <SDL3/SDL.h>

struct InputState
{
    bool keys[SDL_SCANCODE_COUNT] = { false }; // all keys SDL supports
    SDL_MouseButtonFlags mouse_buttons[6] = { false }; // 0=nothing, 1=left, 2=middle, 3=right, 4=X1, 5=X2
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
        //printf("[InputState::mouse_button_down] mouse buttons down:\n\t1 SDL_BUTTON_LEFT = %i\n\t2 SDL_BUTTON_MIDDLE = %i\n\t3 SDL_BUTTON_RIGHT = %i\n\t4 SDL_BUTTON_X1 = %i\n\t5 SDL_BUTTONX2 = %i\n", mouse_buttons[SDL_BUTTON_LEFT], mouse_buttons[SDL_BUTTON_MIDDLE], mouse_buttons[SDL_BUTTON_RIGHT], mouse_buttons[SDL_BUTTON_X1], mouse_buttons[SDL_BUTTON_X2] );

        return mouse_buttons[button];
    }
}; // InputState

#endif // INPUTSTATE_H
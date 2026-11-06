// ==========================================================================
//  QBIT -- Display task (state machine)
// ==========================================================================
#ifndef DISPLAY_TASK_H
#define DISPLAY_TASK_H

#include <Arduino.h>

// FreeRTOS task: runs the display state machine.
// Priority 2, stack 8192 bytes.
void displayTask(void *param);

// Force display into GIF_PLAYBACK (shows robot face / animation)
void displayPlayAnimation(const String &filename);

// Switch directly to robot face/animation
void displayShowRobotFace();

#endif // DISPLAY_TASK_H

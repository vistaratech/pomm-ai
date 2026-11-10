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

// Show real-time clock screen on OLED (with live ticking for durationMs, 0 = indefinite)
void displayShowClock(uint32_t durationMs = 20000);

// Show static photo or camera frame on OLED (durationMs = 0 to stay until tap or new cmd)
void displayShowPhoto(const uint8_t *frameData, uint32_t durationMs = 0);

#endif // DISPLAY_TASK_H

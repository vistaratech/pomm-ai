// ==========================================================================
//  QBIT -- Display task (state machine)
// ==========================================================================
#ifndef DISPLAY_TASK_H
#define DISPLAY_TASK_H

#include <Arduino.h>
#include "app_state.h"

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

// Start countdown timer on OLED (seconds > 0)
void displayStartTimer(uint32_t seconds);

// Cancel running timer
void displayCancelTimer();

// Show navigation screen on OLED with road animation & maneuver
void displayShowNavigation(const String &icon, const String &distance, const String &street);

// Natural text navigation (from Google Maps notification title + text)
void displayShowNavigationNatural(const String &title, const String &text);

// Stop navigation screen and return to robot face
void displayStopNavigation();

// Show relay popup on OLED
void displayShowRelayPopup(const char* l1, const char* l2);

// Check if navigation is active
bool displayIsNavigating();

// Get current display state
DisplayState getDisplayState();

#endif // DISPLAY_TASK_H

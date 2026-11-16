// ==========================================================================
//  PommAI / Bike Buddy -- Turn-by-Turn Navigation Screen with Road Animation
// ==========================================================================
#ifndef NAV_SCREEN_H
#define NAV_SCREEN_H

#include <Arduino.h>
#include <U8g2lib.h>

enum NavIcon {
    NAV_ICON_STRAIGHT,
    NAV_ICON_TURN_RIGHT,
    NAV_ICON_TURN_LEFT,
    NAV_ICON_SLIGHT_RIGHT,
    NAV_ICON_SLIGHT_LEFT,
    NAV_ICON_SHARP_RIGHT,
    NAV_ICON_SHARP_LEFT,
    NAV_ICON_UTURN,
    NAV_ICON_ROUNDABOUT,
    NAV_ICON_ARRIVED,
    NAV_ICON_UNKNOWN
};

struct NavState {
    bool     active;
    NavIcon  icon;
    String   distanceStr;
    int32_t  distanceMeters;
    String   streetStr;
    uint32_t lastUpdateMs;
    uint8_t  animOffset;
    uint32_t lastAnimMs;
};

// Initialize navigation state
void navScreenInit();

// Update navigation with maneuver, distance string and street name
void navScreenUpdate(const String &iconStr, const String &distStr, const String &streetStr);

// Natural language parser (e.g. Google Maps notification title and text)
void navScreenParseNatural(const String &title, const String &text);

// Stop navigation and mark inactive
void navScreenStop();

// Check if navigation is currently active
bool navScreenIsActive();

// Get timestamp of last received navigation packet
uint32_t navScreenGetLastUpdateMs();

// Render navigation screen on U8G2 display buffer
void navScreenDraw(U8G2 &u8g2, unsigned long now);

// Convert string maneuver to NavIcon enum
NavIcon navScreenParseIcon(const String &str);

#endif // NAV_SCREEN_H

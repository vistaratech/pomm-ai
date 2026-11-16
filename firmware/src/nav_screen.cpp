// ==========================================================================
//  PommAI / Bike Buddy -- Turn-by-Turn Navigation Screen with Road Animation
// ==========================================================================

#include "nav_screen.h"
#include "app_state.h"
#include <ctype.h>

static NavState _nav = {
    .active = false,
    .icon = NAV_ICON_STRAIGHT,
    .distanceStr = "0m",
    .distanceMeters = 0,
    .streetStr = "Navigating",
    .lastUpdateMs = 0,
    .animOffset = 0,
    .lastAnimMs = 0
};

// 8x8 Mini Bike Icon for header (1 byte per row)
static const uint8_t PROGMEM BIKE_ICON[] = {
    0b00100100, //   *  *
    0b01111110, //  ******
    0b00011000, //    **
    0b01011010, //  * ** *
    0b10111101, // * **** *
    0b10011001, // *  **  *
    0b01100110, //  **  **
    0b00000000
};

void navScreenInit() {
    _nav.active = false;
    _nav.icon = NAV_ICON_STRAIGHT;
    _nav.distanceStr = "0m";
    _nav.distanceMeters = 0;
    _nav.streetStr = "Bike Buddy";
    _nav.lastUpdateMs = 0;
    _nav.animOffset = 0;
    _nav.lastAnimMs = 0;
}

NavIcon navScreenParseIcon(const String &str) {
    String s = str;
    s.toUpperCase();
    s.trim();

    if (s.indexOf("SLIGHT_RIGHT") >= 0 || s.indexOf("BEAR_RIGHT") >= 0) return NAV_ICON_SLIGHT_RIGHT;
    if (s.indexOf("SLIGHT_LEFT") >= 0 || s.indexOf("BEAR_LEFT") >= 0)   return NAV_ICON_SLIGHT_LEFT;
    if (s.indexOf("SHARP_RIGHT") >= 0)                                   return NAV_ICON_SHARP_RIGHT;
    if (s.indexOf("SHARP_LEFT") >= 0)                                    return NAV_ICON_SHARP_LEFT;
    if (s.indexOf("RIGHT") >= 0)                                         return NAV_ICON_TURN_RIGHT;
    if (s.indexOf("LEFT") >= 0)                                          return NAV_ICON_TURN_LEFT;
    if (s.indexOf("UTURN") >= 0 || s.indexOf("U_TURN") >= 0)             return NAV_ICON_UTURN;
    if (s.indexOf("ROUNDABOUT") >= 0 || s.indexOf("ROTARY") >= 0)       return NAV_ICON_ROUNDABOUT;
    if (s.indexOf("ARRIV") >= 0 || s.indexOf("DEST") >= 0)               return NAV_ICON_ARRIVED;
    if (s.indexOf("STRAIGHT") >= 0 || s.indexOf("CONTINUE") >= 0)        return NAV_ICON_STRAIGHT;

    return NAV_ICON_STRAIGHT;
}

static int32_t parseDistanceMeters(const String &dist) {
    String s = dist;
    s.toLowerCase();
    s.trim();
    if (s.length() == 0) return 0;

    float val = s.toFloat();
    if (s.indexOf("km") >= 0) {
        return (int32_t)(val * 1000.0f);
    } else if (s.indexOf("mi") >= 0) {
        return (int32_t)(val * 1609.34f);
    } else if (s.indexOf("ft") >= 0) {
        return (int32_t)(val * 0.3048f);
    } else {
        return (int32_t)val;
    }
}

void navScreenUpdate(const String &iconStr, const String &distStr, const String &streetStr) {
    _nav.icon = navScreenParseIcon(iconStr);
    _nav.distanceStr = distStr;
    _nav.distanceStr.trim();
    if (_nav.distanceStr.length() == 0) _nav.distanceStr = "--";
    _nav.distanceMeters = parseDistanceMeters(_nav.distanceStr);
    
    _nav.streetStr = streetStr;
    _nav.streetStr.trim();
    if (_nav.streetStr.length() == 0) _nav.streetStr = "Continue Route";

    _nav.lastUpdateMs = millis();
    _nav.active = true;
}

void navScreenParseNatural(const String &title, const String &text) {
    // E.g., title = "Turn right on Anna Salai", text = "in 250 m"
    // Or title = "In 250 m", text = "Turn right on Anna Salai"
    String combined = title + " " + text;
    combined.trim();

    NavIcon icon = navScreenParseIcon(combined);

    // Extract distance: search for pattern like "250 m", "1.5 km", "500ft"
    String dist = "";
    int len = combined.length();
    for (int i = 0; i < len; i++) {
        if (isdigit(combined[i])) {
            int start = i;
            while (i < len && (isdigit(combined[i]) || combined[i] == '.' || combined[i] == ' ')) i++;
            int numEnd = i;
            String unit = "";
            while (i < len && isalpha(combined[i])) {
                unit += combined[i];
                i++;
            }
            unit.toLowerCase();
            if (unit == "m" || unit == "km" || unit == "ft" || unit == "mi") {
                dist = combined.substring(start, numEnd) + unit;
                dist.replace(" ", "");
                break;
            }
        }
    }
    if (dist.length() == 0) dist = "500m";

    // Extract street name
    String street = "";
    String lower = combined;
    lower.toLowerCase();
    int ontoIdx = lower.indexOf("onto ");
    if (ontoIdx >= 0) {
        street = combined.substring(ontoIdx + 5);
    } else {
        int onIdx = lower.indexOf("on ");
        if (onIdx >= 0) {
            street = combined.substring(onIdx + 3);
        } else if (title.length() > 0 && title.indexOf("Turn") < 0) {
            street = title;
        } else {
            street = text;
        }
    }
    street.trim();
    if (street.length() == 0) street = "Active Route";

    navScreenUpdate(String((int)icon), dist, street);
}

void navScreenStop() {
    _nav.active = false;
}

bool navScreenIsActive() {
    return _nav.active;
}

uint32_t navScreenGetLastUpdateMs() {
    return _nav.lastUpdateMs;
}

// --------------------------------------------------------------------------
//  Helper: Draw turn arrows in vector graphics on OLED
// --------------------------------------------------------------------------
static void drawArrowOverlay(U8G2 &u8g2, NavIcon icon, uint8_t cx, uint8_t cy) {
    switch (icon) {
        case NAV_ICON_TURN_RIGHT:
        case NAV_ICON_SHARP_RIGHT: {
            // Right turn arrow
            // Vertical stem
            u8g2.drawVLine(cx - 6, cy - 2, 12);
            u8g2.drawVLine(cx - 5, cy - 2, 12);
            u8g2.drawVLine(cx - 4, cy - 2, 12);
            // Horizontal stem
            u8g2.drawHLine(cx - 5, cy - 2, 10);
            u8g2.drawHLine(cx - 5, cy - 1, 10);
            u8g2.drawHLine(cx - 5, cy,     10);
            // Arrowhead pointing right
            u8g2.drawTriangle(cx + 12, cy - 1,  cx + 4, cy - 8,  cx + 4, cy + 6);
            break;
        }

        case NAV_ICON_TURN_LEFT:
        case NAV_ICON_SHARP_LEFT: {
            // Left turn arrow
            // Vertical stem
            u8g2.drawVLine(cx + 6, cy - 2, 12);
            u8g2.drawVLine(cx + 5, cy - 2, 12);
            u8g2.drawVLine(cx + 4, cy - 2, 12);
            // Horizontal stem
            u8g2.drawHLine(cx - 5, cy - 2, 10);
            u8g2.drawHLine(cx - 5, cy - 1, 10);
            u8g2.drawHLine(cx - 5, cy,     10);
            // Arrowhead pointing left
            u8g2.drawTriangle(cx - 12, cy - 1,  cx - 4, cy - 8,  cx - 4, cy + 6);
            break;
        }

        case NAV_ICON_SLIGHT_RIGHT: {
            // Slanted right arrow
            u8g2.drawLine(cx - 6, cy + 8, cx + 4, cy - 2);
            u8g2.drawLine(cx - 5, cy + 8, cx + 5, cy - 2);
            u8g2.drawLine(cx - 4, cy + 8, cx + 6, cy - 2);
            u8g2.drawTriangle(cx + 10, cy - 8, cx + 2, cy - 6, cx + 8, cy);
            break;
        }

        case NAV_ICON_SLIGHT_LEFT: {
            // Slanted left arrow
            u8g2.drawLine(cx + 6, cy + 8, cx - 4, cy - 2);
            u8g2.drawLine(cx + 5, cy + 8, cx - 5, cy - 2);
            u8g2.drawLine(cx + 4, cy + 8, cx - 6, cy - 2);
            u8g2.drawTriangle(cx - 10, cy - 8, cx - 2, cy - 6, cx - 8, cy);
            break;
        }

        case NAV_ICON_UTURN: {
            // Hairpin U-turn loop
            u8g2.drawCircle(cx, cy - 3, 6, U8G2_DRAW_UPPER_RIGHT | U8G2_DRAW_UPPER_LEFT);
            u8g2.drawVLine(cx + 6, cy - 3, 12);
            u8g2.drawVLine(cx + 5, cy - 3, 12);
            u8g2.drawVLine(cx - 6, cy - 3, 6);
            u8g2.drawVLine(cx - 5, cy - 3, 6);
            // Arrowhead pointing down on left leg
            u8g2.drawTriangle(cx - 6, cy + 8, cx - 11, cy + 2, cx - 1, cy + 2);
            break;
        }

        case NAV_ICON_ROUNDABOUT: {
            // Roundabout traffic circle
            u8g2.drawCircle(cx, cy, 7);
            u8g2.drawCircle(cx, cy, 6);
            // Exit arrow top-right
            u8g2.drawTriangle(cx + 10, cy - 8, cx + 4, cy - 9, cx + 9, cy - 3);
            break;
        }

        case NAV_ICON_ARRIVED: {
            // Destination reached / flag
            u8g2.drawVLine(cx - 6, cy - 8, 18);
            u8g2.drawBox(cx - 5, cy - 8, 12, 8);
            u8g2.drawCircle(cx + 1, cy + 9, 3);
            break;
        }

        case NAV_ICON_STRAIGHT:
        default: {
            // Straight up arrow
            u8g2.drawVLine(cx - 1, cy - 2, 12);
            u8g2.drawVLine(cx,     cy - 2, 12);
            u8g2.drawVLine(cx + 1, cy - 2, 12);
            u8g2.drawTriangle(cx, cy - 10, cx - 7, cy - 2, cx + 7, cy - 2);
            break;
        }
    }
}

// --------------------------------------------------------------------------
//  Main Render Function
// --------------------------------------------------------------------------
void navScreenDraw(U8G2 &u8g2, unsigned long now) {
    // 1. Advance road dash animation (~25 FPS)
    if (now - _nav.lastAnimMs >= 40) {
        _nav.animOffset = (_nav.animOffset + 1) % 16;
        _nav.lastAnimMs = now;
    }

    u8g2.clearBuffer();

    // ----------------------------------------------------------------------
    //  HEADER BAR (Y: 0 to 12)
    // ----------------------------------------------------------------------
    // Draw mini bike icon
    u8g2.drawBitmap(2, 2, 1, 8, BIKE_ICON);

    // Street text display with smooth ticker scrolling if too long
    u8g2.setFont(u8g2_font_5x7_tr);
    int16_t streetWidth = u8g2.getStrWidth(_nav.streetStr.c_str());
    const int16_t maxHeaderW = 108;

    if (streetWidth <= maxHeaderW) {
        // Centered in available space
        int16_t sx = 14 + (maxHeaderW - streetWidth) / 2;
        u8g2.drawStr(sx, 9, _nav.streetStr.c_str());
    } else {
        // Smooth ticker scroll back & forth
        int16_t scrollSpan = streetWidth - maxHeaderW + 16;
        int32_t step = (int32_t)((now / 50) % (scrollSpan * 2));
        int16_t offset = (step < scrollSpan) ? step : (scrollSpan * 2 - step);
        u8g2.drawStr(14 - offset, 9, _nav.streetStr.c_str());
    }

    // Divider line between header and main screen
    u8g2.drawHLine(0, 12, 128);

    // ----------------------------------------------------------------------
    //  VERTICAL DIVIDER (X = 57, Y = 13 to 63)
    // ----------------------------------------------------------------------
    u8g2.drawVLine(57, 13, 51);

    // ----------------------------------------------------------------------
    //  LEFT PANEL: 3D PERSPECTIVE ANIMATED ROAD (X: 0 to 56, Y: 14 to 63)
    // ----------------------------------------------------------------------
    // Calculate road curve target depending on current maneuver
    int16_t topCenterX = 28;
    int16_t bottomCenterX = 28;

    if (_nav.icon == NAV_ICON_TURN_RIGHT || _nav.icon == NAV_ICON_SHARP_RIGHT) {
        topCenterX = 22;
        bottomCenterX = 44;
    } else if (_nav.icon == NAV_ICON_SLIGHT_RIGHT) {
        topCenterX = 25;
        bottomCenterX = 36;
    } else if (_nav.icon == NAV_ICON_TURN_LEFT || _nav.icon == NAV_ICON_SHARP_LEFT) {
        topCenterX = 34;
        bottomCenterX = 12;
    } else if (_nav.icon == NAV_ICON_SLIGHT_LEFT) {
        topCenterX = 31;
        bottomCenterX = 20;
    }

    // Horizon at Y = 16, Bottom at Y = 63
    const uint8_t horizonY = 16;
    const uint8_t bottomY  = 63;
    const uint8_t topHalfW = 6;
    const uint8_t btmHalfW = 22;

    // Draw left and right road boundary lines
    u8g2.drawLine(topCenterX - topHalfW, horizonY, bottomCenterX - btmHalfW, bottomY);
    u8g2.drawLine(topCenterX + topHalfW, horizonY, bottomCenterX + btmHalfW, bottomY);

    // Subtle road curb hatching (rumble strip dots)
    u8g2.drawPixel(topCenterX - topHalfW - 1, horizonY + 8);
    u8g2.drawPixel(topCenterX - topHalfW - 2, horizonY + 18);
    u8g2.drawPixel(bottomCenterX - btmHalfW - 2, bottomY - 6);
    u8g2.drawPixel(topCenterX + topHalfW + 1, horizonY + 8);
    u8g2.drawPixel(topCenterX + topHalfW + 2, horizonY + 18);
    u8g2.drawPixel(bottomCenterX + btmHalfW + 2, bottomY - 6);

    // Draw scrolling perspective dashes down the center line
    for (uint8_t d = 0; d < 4; d++) {
        // Perspective progress t from 0.0 to 1.0
        float t = ((d * 4 + _nav.animOffset) % 16) / 16.0f;
        // Non-linear depth mapping (z^1.6 gives genuine 3D acceleration feel)
        float z = t * t; 
        uint8_t dy = horizonY + (uint8_t)(z * (bottomY - horizonY));
        int16_t dx = topCenterX + (int16_t)(t * (bottomCenterX - topCenterX));

        uint8_t dashLen = 2 + (uint8_t)(t * 6.0f);
        if (dy + dashLen <= bottomY) {
            u8g2.drawVLine(dx, dy, dashLen);
            if (t > 0.6f) {
                u8g2.drawVLine(dx + 1, dy, dashLen); // thicker near viewer
            }
        }
    }

    // Draw Bold Maneuver Arrow overlay over road
    drawArrowOverlay(u8g2, _nav.icon, 28, 38);

    // ----------------------------------------------------------------------
    //  RIGHT PANEL: DISTANCE & ACTION (X: 59 to 127, Y: 14 to 63)
    // ----------------------------------------------------------------------
    // Distance display (e.g. "250m", "1.5km")
    // Parse numeric part and unit
    String numPart = "";
    String unitPart = "";
    for (unsigned int i = 0; i < _nav.distanceStr.length(); i++) {
        char c = _nav.distanceStr[i];
        if (isdigit(c) || c == '.') {
            numPart += c;
        } else if (isalpha(c)) {
            unitPart += c;
        }
    }
    if (unitPart.length() == 0) unitPart = "m";

    // Draw Distance Number in crisp 7x14 Bold
    u8g2.setFont(u8g2_font_7x14B_tr);
    uint8_t nw = u8g2.getStrWidth(numPart.c_str());
    uint8_t startX = 62;
    u8g2.drawStr(startX, 30, numPart.c_str());

    // Draw Unit right next to number
    u8g2.setFont(u8g2_font_6x13_tr);
    u8g2.drawStr(startX + nw + 3, 30, unitPart.c_str());

    // Maneuver Action Text
    const char *actionText = "CONTINUE";
    switch (_nav.icon) {
        case NAV_ICON_TURN_RIGHT:   actionText = "TURN RIGHT"; break;
        case NAV_ICON_TURN_LEFT:    actionText = "TURN LEFT";  break;
        case NAV_ICON_SLIGHT_RIGHT: actionText = "SLIGHT R";   break;
        case NAV_ICON_SLIGHT_LEFT:  actionText = "SLIGHT L";   break;
        case NAV_ICON_SHARP_RIGHT:  actionText = "SHARP R";    break;
        case NAV_ICON_SHARP_LEFT:   actionText = "SHARP L";    break;
        case NAV_ICON_UTURN:        actionText = "U-TURN";     break;
        case NAV_ICON_ROUNDABOUT:   actionText = "ROUNDABOUT"; break;
        case NAV_ICON_ARRIVED:      actionText = "ARRIVED!";   break;
        case NAV_ICON_STRAIGHT:
        default:                    actionText = "STRAIGHT";   break;
    }

    u8g2.setFont(u8g2_font_6x13_tr);
    u8g2.drawStr(62, 45, actionText);

    // ----------------------------------------------------------------------
    //  PROXIMITY GAUGE / URGENT "NOW!" ALERT (Y: 52 to 62)
    // ----------------------------------------------------------------------
    bool isUrgent = (_nav.distanceMeters > 0 && _nav.distanceMeters <= 35) ||
                    (_nav.distanceStr.indexOf("0m") >= 0) ||
                    (_nav.distanceStr.equalsIgnoreCase("now"));

    if (isUrgent) {
        // Flash "TURN NOW!" with inverted background every 300ms
        bool flashOn = ((now / 250) % 2) == 0;
        if (flashOn) {
            u8g2.drawBox(60, 50, 66, 13);
            u8g2.setDrawColor(0); // Inverted black text
            u8g2.setFont(u8g2_font_6x13_tr);
            u8g2.drawStr(64, 61, "TURN NOW!");
            u8g2.setDrawColor(1); // Restore normal
        } else {
            u8g2.drawFrame(60, 50, 66, 13);
            u8g2.setFont(u8g2_font_6x13_tr);
            u8g2.drawStr(64, 61, "TURN NOW!");
        }
    } else {
        // Visual distance proximity bar (relative to 500 meters)
        u8g2.drawFrame(62, 53, 62, 7);
        int32_t m = _nav.distanceMeters;
        if (m > 500) m = 500;
        if (m < 0) m = 0;
        // The closer you get to 0, the bar can show countdown or fill
        uint8_t barW = (uint8_t)(((500 - m) * 58) / 500);
        if (barW > 58) barW = 58;
        if (barW > 0) {
            u8g2.drawBox(64, 55, barW, 3);
        }
    }
}

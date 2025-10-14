export const RADIUS_MULTIPLIER = 0.00015
export const SPEED_MULTIPLIER = 100

// rotation / inertia
export const DRAG_SPEED_FACTOR = 0.002
export const INERTIA_DAMPING = 0.95

// moon
export const MOON_DISTANCE_MULTIPLIER = 0.00001
export const MOON_DISTANCE = 384400 * MOON_DISTANCE_MULTIPLIER
export const MOON_RADIUS = 1737.4 * RADIUS_MULTIPLIER
// spin around its own axis (sidereal rotation ~27.3 days)
export const REAL_MOON_ROTATION_SPEED = (2 * Math.PI) / 2_359_200
export const MOON_ROTATION_SPEED = -REAL_MOON_ROTATION_SPEED * SPEED_MULTIPLIER
export const MOON_ROTATION_ACCEL = 0.005
// orbit around the Earth (same period ~27.3 days)
export const REAL_MOON_ORBIT_PERIOD = 2_359_200 // seconds
export const MOON_ORBIT_SPEED = ((2 * Math.PI) / REAL_MOON_ORBIT_PERIOD) * SPEED_MULTIPLIER // radians/sec

// earth
export const EARTH_RADIUS = 6378 * RADIUS_MULTIPLIER
export const REAL_EARTH_ROTATION_SPEED = (2 * Math.PI) / 86_400
export const EARTH_ROTATION_SPEED = -REAL_EARTH_ROTATION_SPEED * SPEED_MULTIPLIER
export const EARTH_ROTATION_ACCEL = 0.005

// clouds
export const CLOUDS_RADIUS = EARTH_RADIUS * 1.0001
export const CLOUDS_ROTATION_SPEED = -0.00001 * SPEED_MULTIPLIER // relative to Earth
export const CLOUDS_ROTATION_ACCEL = 0.005

// cursor
export const CURSOR_HIDE_DELAY = 2000 // ms

// zoom limits
export const ZOOM_MIN = 3 // closest
export const ZOOM_MAX = 20 // farthest
export const ZOOM_SPEED = 0.01 // scroll sensitivity

// pitch limits (for vertical camera rotation, if implemented)
export const PITCH_MIN = -Math.PI / 6 // look slightly down
export const PITCH_MAX = Math.PI / 6 // look slightly up

// starfield
export const STAR_COUNT = 1000
export const STAR_MIN_DISTANCE = 5000 // min distance from world center
export const STAR_SPREAD = 10000 // max distance from center
export const STAR_MIN_SIZE = 20
export const STAR_MAX_SIZE = 50

// camera
export const CAMERA_FOV = 40
export const CAMERA_NEAR = 0.1
export const CAMERA_FAR = STAR_MIN_DISTANCE + STAR_SPREAD + ZOOM_MAX

// rotation / inertia
export const DRAG_SPEED_FACTOR = 0.002
export const INERTIA_DAMPING = 0.95

// moon auto-rotation
export const AUTO_ROTATION_SPEED = -0.001 // negative = counterclockwise
export const AUTO_ROTATION_ACCEL = 0.005

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

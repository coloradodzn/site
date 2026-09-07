/**
 * Minimal Framer runtime stub so shared Framer modules can load outside Framer.
 * Only what TacticalGlobe3D / MilitaryMap needs at import + runtime.
 */

export function addPropertyControls() {}

export const ControlType = {
  Object: 'object',
  Boolean: 'boolean',
  Number: 'number',
  Color: 'color',
  Array: 'array',
  Enum: 'enum',
  String: 'string',
  Link: 'link',
};

export const RenderTarget = {
  canvas: 'canvas',
  preview: 'preview',
  current() {
    return RenderTarget.preview;
  },
};

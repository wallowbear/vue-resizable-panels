import { ResizeEvent } from '../../types';

export function getResizeEventCoordinates(event: ResizeEvent): { x: number; y: number } {
  if ('clientX' in event && 'clientY' in event) {
    return { x: event.clientX, y: event.clientY };
  }
  
  if ('touches' in event && (event as unknown as TouchEvent).touches.length > 0) {
    const touch = (event as unknown as TouchEvent).touches[0];
    return { x: touch.clientX, y: touch.clientY };
  }
  
  return { x: 0, y: 0 };
} 
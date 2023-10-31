import kc, {type OverlayFigure} from "klinecharts";

export function getTagFigures(coord: kc.Coordinate, position: 'bottom' | 'top', text: string, color: string): OverlayFigure[]{
  const plusFlag = position === 'bottom' ? 1 : -1;
  const startX = coord.x
  const horzEndX = startX + 200
  const startY = coord.y + 3 * plusFlag
  const lineEndY = startY + 50 * plusFlag
  const arrowEndY = lineEndY + 5 * plusFlag
  const styles = color ? {color: color}: {}
  const textStyles = color ? {backgroundColor: color, borderColor: color} : {}
  return [
    {
      type: 'line',
      attrs: { coordinates: [{ x: startX, y: startY }, { x: startX, y: lineEndY }] },
      ignoreEvent: true
    },
    {
      type: 'line',
      attrs: { coordinates: [{ x: startX, y: coord.y }, { x: horzEndX, y: coord.y }] },
      ignoreEvent: true,
      styles: {...styles}
    },
    {
      type: 'polygon',
      attrs: { coordinates: [{ x: startX, y: lineEndY }, { x: startX - 4, y: arrowEndY }, { x: startX + 4, y: arrowEndY }] },
      ignoreEvent: true,
      styles
    },
    {
      type: 'rectText',
      attrs: { x: startX, y: arrowEndY, text: text ?? '', align: 'center', baseline: 'bottom' },
      ignoreEvent: true,
      styles: textStyles
    }
  ]
}
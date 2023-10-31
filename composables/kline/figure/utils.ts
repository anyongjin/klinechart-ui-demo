import {type RectAttrs, type RectTextStyle, type TextAttrs} from "klinecharts";

export function getRectStartX(attrs: TextAttrs, styles: Partial<RectTextStyle>, textWidth?: number){
  const { size = 12, paddingLeft = 0, paddingTop = 0, paddingRight = 0, paddingBottom = 0 } = styles
  const { x, y, text, align = 'left', baseline = 'top' } = attrs
  textWidth = textWidth ?? size * text.length
  let startX: number
  switch (align) {
    case 'left':
    case 'start': {
      startX = x
      break
    }
    case 'right':
    case 'end': {
      startX = x - paddingRight - textWidth - paddingLeft
      break
    }
    default: {
      startX = x - textWidth / 2 - paddingLeft
      break
    }
  }
  return startX
}

export function getTextRect (attrs: TextAttrs, styles: Partial<RectTextStyle>, textWidth?: number,
                             lineNum?: number, lineHeight?: number): RectAttrs {
  const { size = 12, paddingLeft = 0, paddingTop = 0, paddingRight = 0, paddingBottom = 0 } = styles
  const { x, y, text, align = 'left', baseline = 'top' } = attrs
  const length = text.length
  textWidth = textWidth ?? size * length
  lineNum = lineNum ?? 1
  lineHeight = lineHeight ?? 1.5
  const textHeight = size * lineNum * lineHeight - (lineHeight - 1) * size
  const startX = getRectStartX(attrs, styles, textWidth)
  let startY: number
  switch (baseline) {
    case 'top':
    case 'hanging': {
      startY = y
      break
    }
    case 'bottom':
    case 'ideographic':
    case 'alphabetic': {
      startY = y - textHeight - paddingTop - paddingBottom
      break
    }
    default: {
      startY = y - textHeight / 2 - paddingTop
      break
    }
  }
  return { x: startX, y: startY, width: paddingLeft + textWidth + paddingRight, height: paddingTop + textHeight + paddingBottom }
}
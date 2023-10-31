/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 此文件从rectText修改而来。
 * rectText不支持多行文本，此组件改动为支持多行文本框
 */

import {type Coordinate, type RectTextStyle, type FigureTemplate, type TextAttrs} from 'klinecharts'
import kc from 'klinecharts'

const drawRect = kc.utils.drawRect
const drawText = kc.utils.drawText
const calcTextWidth = kc.utils.calcTextWidth

import { getTextRect, getRectStartX } from './utils'

export function drawRectText (ctx: CanvasRenderingContext2D, attrs: TextAttrs, styles: Partial<RectTextStyle>): void {
  const { text } = attrs
  const {
    size = 12,
    family,
    weight,
    paddingLeft = 0,
    paddingTop = 0
  } = styles
  const lines = text.split('\n')

  const lineWidths = lines.map(lineText => calcTextWidth(lineText, size, weight, family))
  const heightRatio = 1.5
  const lineHeight = size * heightRatio
  const maxWidth = Math.max(...lineWidths)
  const rect = getTextRect(attrs, styles, maxWidth, lines.length, heightRatio)
  drawRect(ctx, rect, { ...styles, color: styles.backgroundColor })
  let curY = rect.y + paddingTop
  lines.forEach((lineText, index) => {
    const startX = getRectStartX(attrs, styles, lineWidths[index]) + paddingLeft
    drawText(ctx, { ...attrs, align: 'left', baseline: 'top', x: startX, y: curY, text: lineText }, styles)
    curY += lineHeight
  })
}

function checkCoordinateOnText(coordinate: Coordinate, attrs: TextAttrs, styles: Partial<RectTextStyle>): boolean{
  const {
    size = 12,
    family,
    weight,
    paddingLeft = 0,
    paddingTop = 0
  } = styles
  const lines = attrs.text.split('\n')
  const lineWidths = lines.map(lineText => calcTextWidth(lineText, size, weight, family))
  const heightRatio = 1.5
  const maxWidth = Math.max(...lineWidths)
  const { x, y, width, height } = getTextRect(attrs, styles, maxWidth, lines.length, heightRatio)
  return (
    coordinate.x >= x &&
    coordinate.x <= x + width &&
    coordinate.y >= y &&
    coordinate.y <= y + height
  )
}

const textBox: FigureTemplate<TextAttrs, Partial<RectTextStyle>> = {
  name: 'textBox',
  checkEventOn: (coordinate: Coordinate, attrs: TextAttrs, styles: Partial<RectTextStyle>) => {
    return checkCoordinateOnText(coordinate, attrs, styles)
  },
  draw: (ctx: CanvasRenderingContext2D, attrs: TextAttrs, styles: Partial<RectTextStyle>) => {
    drawRectText(ctx, attrs, styles)
  }
}

export default textBox

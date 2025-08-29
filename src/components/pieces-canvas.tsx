import * as React from "react";
import {
  Canvas,
  RoundedRect,
  Group,
  Skia,
  SkRRect,
  SkPaint,
} from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import { decode } from "~/utils/pieces";

interface Props {
  pieces: string;
  pieceCount: number;
  columns?: number;
  gap?: number;
  onColor: string;
  offColor: string;
  padding?: number;
}

export default function PiecesCanvas({
  pieces,
  pieceCount,
  columns = 32,
  gap = 1,
  onColor,
  offColor,
  padding = 16,
}: Props) {
  const { width } = useWindowDimensions();

  const { canvasWidth, canvasHeight, rects } = React.useMemo(() => {
    const availableWidth = width - padding;
    const totalGapWidth = (columns - 1) * gap;
    const finalCellSize = Math.floor(
      (availableWidth - totalGapWidth) / columns
    );

    const rows = Math.ceil(pieceCount / columns);
    const finalCanvasWidth = columns * finalCellSize + (columns - 1) * gap;
    const finalCanvasHeight = rows * finalCellSize + (rows - 1) * gap;

    const bytes = decode(pieces, pieceCount);
    const downloadedPaint = Skia.Paint();
    downloadedPaint.setColor(Skia.Color(onColor));

    const missingPaint = Skia.Paint();
    missingPaint.setColor(Skia.Color(offColor));

    const rectData: Array<{ rect: SkRRect; paint: SkPaint }> = [];

    let pieceIndex = 0;
    for (let row = 0; row < rows && pieceIndex < pieceCount; row++) {
      for (let col = 0; col < columns && pieceIndex < pieceCount; col++) {
        const byteIndex = Math.floor(pieceIndex / 8);
        const bitIndex = 7 - (pieceIndex % 8);
        const isDownloaded = (bytes[byteIndex] >> bitIndex) & 1;

        const x = col * (finalCellSize + gap);
        const y = row * (finalCellSize + gap);

        rectData.push({
          rect: Skia.RRectXY(
            Skia.XYWHRect(x, y, finalCellSize, finalCellSize),
            2,
            2
          ),
          paint: isDownloaded ? downloadedPaint : missingPaint,
        });

        pieceIndex++;
      }
    }

    return {
      canvasWidth: finalCanvasWidth,
      canvasHeight: finalCanvasHeight,
      rects: rectData,
    };
  }, [pieces, pieceCount, columns, gap, width, onColor, offColor, padding]);

  return (
    <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
      <Group>
        {rects.map((item, index) => (
          <RoundedRect key={index} rect={item.rect} paint={item.paint} />
        ))}
      </Group>
    </Canvas>
  );
}

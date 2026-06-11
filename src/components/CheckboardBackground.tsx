import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

interface CheckerboardBackgroundProps {
  lightColor?: string;
  darkColor?: string;
  squareSize?: number;
  children?: React.ReactNode;
}

export function CheckerboardBackground({
  lightColor = '#A2D070',
  darkColor = '#79A744',
  squareSize = 40,
  children,
}: CheckerboardBackgroundProps) {
  const { width, height } = useWindowDimensions();

  const cols = Math.ceil(width / squareSize);
  const rows = Math.ceil(height / squareSize);
  const totalSquares = cols * rows;

  const squares = [];
  for (let i = 0; i < totalSquares; i++) {
    const colIndex = i % cols;
    const rowIndex = Math.floor(i / cols);
    const isDark = (rowIndex + colIndex) % 2 === 1;

    squares.push(
      <View
        key={i}
        style={{
          width: squareSize,
          height: squareSize,
          backgroundColor: isDark ? darkColor : lightColor,
        }}
      />
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.gridContainer, { width, height }]}>
        {squares}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

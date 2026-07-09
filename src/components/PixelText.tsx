import React from 'react';
import { Text, View, StyleSheet, TextStyle, StyleProp, Platform } from 'react-native';

interface PixelTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  fillColor?: string;
  strokeColor?: string;
}

const StrokeText = ({ children, style, color, strokeColor, offsetX = 0, offsetY = 0 }: any) => {
  const strokeSize = 2;
  const positions = [
    [-strokeSize, -strokeSize],
    [0, -strokeSize],
    [strokeSize, -strokeSize],
    [-strokeSize, 0],
    [strokeSize, 0],
    [-strokeSize, strokeSize],
    [0, strokeSize],
    [strokeSize, strokeSize],
  ];

  return (
    <View style={[StyleSheet.absoluteFill, { transform: [{ translateX: offsetX }, { translateY: offsetY }] }]} pointerEvents="none">
      {positions.map((pos, i) => (
        <Text
          key={i}
          numberOfLines={1}
          adjustsFontSizeToFit={Platform.OS !== 'web'}
          style={[
            styles.baseText,
            style,
            {
              position: 'absolute',
              width: '100%',
              color: strokeColor,
              transform: [{ translateX: pos[0] }, { translateY: pos[1] }],
            },
          ]}
        >
          {children}
        </Text>
      ))}
      <Text 
        numberOfLines={1}
        adjustsFontSizeToFit={Platform.OS !== 'web'}
        style={[
          styles.baseText, 
          style, 
          { 
            position: 'absolute', 
            width: '100%',
            color: color 
          }
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

export const PixelText: React.FC<PixelTextProps> = ({ 
  children, 
  style, 
  fillColor = '#FFFFFF', 
  strokeColor = '#000000' 
}) => {
  const hasStroke = strokeColor && strokeColor !== 'transparent';

  if (!hasStroke) {
    // Optimization: If no stroke is needed, return a standard Text component
    return (
      <Text 
        numberOfLines={1}
        adjustsFontSizeToFit={Platform.OS !== 'web'}
        style={[styles.baseText, style, { color: fillColor, flexShrink: 0 }]}
      >
        {children}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hidden layout text to properly size the container and provide wrapping constraints */}
      <Text 
        numberOfLines={1}
        adjustsFontSizeToFit={Platform.OS !== 'web'}
        style={[styles.baseText, style, { color: 'transparent' }]}
      >
        {children}
      </Text>
      
      {/* 3D shadow layer (shifted +2, +2 as per retro design) */}
      <StrokeText 
        style={style} 
        color={strokeColor} 
        strokeColor={strokeColor} 
        offsetX={2} 
        offsetY={2} 
      >
        {children}
      </StrokeText>
      
      {/* Top layer (normal position) */}
      <StrokeText 
        style={style} 
        color={fillColor} 
        strokeColor={strokeColor} 
        offsetX={0} 
        offsetY={0} 
      >
        {children}
      </StrokeText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    flexShrink: 0, // Prevent flexbox rows from squishing the text container
  },
  baseText: {
    fontFamily: 'PressStart2P_400Regular',
  },
});

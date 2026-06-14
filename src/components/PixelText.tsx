import React from 'react';
import { Text, View, StyleSheet, TextStyle, StyleProp } from 'react-native';

interface PixelTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  fillColor?: string;
  strokeColor?: string;
}

export const PixelText: React.FC<PixelTextProps> = ({ 
  children, 
  style, 
  fillColor = '#FFFFFF', 
  strokeColor = '#000000' 
}) => {
  return (
    <View style={styles.container}>
      {/* Stroke layers */}
      <Text style={[styles.baseText, style, styles.strokeTopLeft, { color: strokeColor }]}>{children}</Text>
      <Text style={[styles.baseText, style, styles.strokeTop, { color: strokeColor }]}>{children}</Text>
      <Text style={[styles.baseText, style, styles.strokeTopRight, { color: strokeColor }]}>{children}</Text>
      <Text style={[styles.baseText, style, styles.strokeLeft, { color: strokeColor }]}>{children}</Text>
      <Text style={[styles.baseText, style, styles.strokeRight, { color: strokeColor }]}>{children}</Text>
      <Text style={[styles.baseText, style, styles.strokeBottomLeft, { color: strokeColor }]}>{children}</Text>
      <Text style={[styles.baseText, style, styles.strokeBottom, { color: strokeColor }]}>{children}</Text>
      <Text style={[styles.baseText, style, styles.strokeBottomRight, { color: strokeColor }]}>{children}</Text>
      
      {/* Bottom layer (3D shadow shifted 2px down and 2px right) */}
      <Text style={[styles.baseText, style, styles.shadowText, { color: strokeColor }]}>{children}</Text>
      
      {/* Top layer (fill) */}
      <Text style={[styles.baseText, style, { color: fillColor }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseText: {
    fontFamily: 'PressStart2P_400Regular',
  },
  shadowText: {
    position: 'absolute',
    top: 2,
    left: 2,
  },
  // Stroke styles (approx 2px thick)
  strokeTopLeft: { position: 'absolute', top: -2, left: -2 },
  strokeTop: { position: 'absolute', top: -2, left: 0 },
  strokeTopRight: { position: 'absolute', top: -2, left: 2 },
  strokeLeft: { position: 'absolute', top: 0, left: -2 },
  strokeRight: { position: 'absolute', top: 0, left: 2 },
  strokeBottomLeft: { position: 'absolute', top: 2, left: -2 },
  strokeBottom: { position: 'absolute', top: 2, left: 0 },
  strokeBottomRight: { position: 'absolute', top: 2, left: 2 },
});

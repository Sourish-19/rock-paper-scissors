import React, { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { PixelText } from './PixelText';

interface RetroButtonProps {
  onPress?: () => void;
  title: string;
  backgroundColor?: string;
  shadowColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export function RetroButton({
  onPress,
  title,
  backgroundColor = '#FFDE4D', // default yellow
  shadowColor = '#000000', // default black 3D shadow
  style,
  textStyle,
  disabled = false,
}: RetroButtonProps) {
  const pushAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(pushAnim, {
      toValue: 6, // shift down by 6px (the shadow height)
      useNativeDriver: true,
      speed: 100,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(pushAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 100,
      bounciness: 0,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.buttonContainer, style]}
    >
      {/* Shadow background layer */}
      <View style={[styles.buttonShadow, { backgroundColor: shadowColor }]} />

      {/* Button face layer */}
      <Animated.View
        style={[
          styles.buttonFace,
          {
            backgroundColor: disabled ? '#CCCCCC' : backgroundColor,
            transform: [{ translateY: pushAnim }],
          },
        ]}
      >
        {/* Subtle highlight for depth */}
        <View style={styles.highlight} />
        
        <PixelText 
          fillColor="#FFFFFF" 
          strokeColor="#000000" 
          style={[styles.buttonText, textStyle]}
        >
          {title}
        </PixelText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    height: 64,
    position: 'relative',
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  buttonShadow: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    bottom: -6,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#000000',
  },
  buttonFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 4,
    left: 8,
    width: 20,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

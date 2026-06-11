import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';

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
      toValue: 4, // shift down by 4px (the shadow height)
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
        <Text style={[styles.buttonText, textStyle, disabled && styles.disabledText]}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    height: 60,
    position: 'relative',
    alignSelf: 'stretch',
    marginBottom: 4,
  },
  buttonShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 8,
  },
  buttonFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },
  disabledText: {
    color: '#666666',
  },
});

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';

const ToggleSwitch = ({ toggle, setToggle }) => {
  const translateX = useRef(new Animated.Value(toggle === 1 ? 30 : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: toggle === 1 ? 30 : 0, // Adjusted value
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [toggle]);

  const handleToggle = () => {
    setToggle(prevToggle => (prevToggle === 1 ? 0 : 1));
  };

  return (
    <TouchableWithoutFeedback onPress={handleToggle}>
    <View style={styles.container}>
      <View style={[styles.toggleContainer, { backgroundColor: toggle === 1 ? '#FFF' : '#DDD' }]}>
        <Animated.View style={[styles.swipeCircle, { backgroundColor: toggle === 1 ? '#4CAF50' : '#E53935', transform: [{ translateX }] }]} />
      </View>
    </View>
  </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 18, // Bigger text
    fontWeight: 'bold',
    marginRight: 12, // Space between text and toggle
    textTransform: 'uppercase', // Make it more readable
  },
  onlineText: {
    color: '#00FF00', // Bright Neon Green
    textShadowColor: '#003300', // Dark Green Shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  offlineText: {
    color: '#FF4444', // Bright Red
    textShadowColor: '#660000', // Dark Red Shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  toggleContainer: {
    width: 60,
    height: 25,
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 5,
    position: 'relative',
  },
  swipeCircle: {
    width: 20,
    height: 20,
    borderRadius: 15,
    position: 'absolute',
    left: 5, // Initial position
  },
});

export default ToggleSwitch;

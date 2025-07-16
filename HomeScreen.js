import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, StatusBar, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import * as ScreenOrientation from 'expo-screen-orientation';


export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const intervalRef = useRef(null);
  const [detectedObject, setDetectedObject] = useState('');
  const [isPaused, setIsPaused] = useState(false); 
  const [orientation, setOrientation] = useState('PORTRAIT');

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (permission && cameraRef && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (!isCapturing) {
          handleCapture();
        }
      }, 3000);
      return () => clearInterval(intervalRef.current);
    } else if (isPaused) {
      clearInterval(intervalRef.current);
    }
  }, [permission, cameraRef, isCapturing, isPaused]);

  useEffect(() => {
    const updateOrientation = async () => {
      const orientation = await ScreenOrientation.getOrientationAsync();
      if (orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT) {
        setOrientation('LANDSCAPE');
      } else {
        setOrientation('PORTRAIT');
      }
    };
  
    const subscription = ScreenOrientation.addOrientationChangeListener(updateOrientation);
    updateOrientation(); // Initial check
  
    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);  

  const handleCapture = async () => {
    setIsCapturing(true);
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({ quality: 0.5 });
        recognizeObject(photo.uri);
      } catch (error) {
        console.error(error);
        Speech.speak('Error capturing image');

      }
    }
    setIsCapturing(false);
  };

  const recognizeObject = async (imageUri) => {
    const apiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDnWv-ni_9jUZzloDZc261FjOgMnLhu0Ys'; // Replace with your API key
    const body = {
      requests: [
        {
          image: {
            content: await imageToBase64(imageUri),
          },
          features: [
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      const objectAnnotations = result.responses[0].localizedObjectAnnotations;
      
      if (objectAnnotations && objectAnnotations.length > 0) {
        const { name, boundingPoly } = objectAnnotations[0]; 
        const position = determineObjectPosition(boundingPoly);
        setDetectedObject(`${name} ${position}`);
        Speech.speak(`Detected a ${name} ${position}`);
      } else {
        setDetectedObject('No objects detected');
        Speech.speak('No objects detected');
      }
    } catch (error) {
      console.error(error);
      Speech.speak('Error');
    }
  };

  const determineObjectPosition = (boundingPoly) => {
    let xPositions = boundingPoly.normalizedVertices.map(vertex => vertex.x);
    let avgXPosition = xPositions.reduce((sum, x) => sum + x, 0) / xPositions.length;
  
    if (orientation === 'LANDSCAPE') {
      if (avgXPosition < 0.33) {
        return 'on the left';
      } else if (avgXPosition > 0.66) {
        return 'on the right';
      } else {
        return 'straight ahead';
      }
    } else { // PORTRAIT
      if (avgXPosition < 0.33) {
        return 'on the left';
      } else if (avgXPosition > 0.66) {
        return 'on the right';
      } else {
        return 'straight ahead';
      }
    }
  };
  
  
  const imageToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <View style={styles.camera}>
      { !isPaused && (
        <>
          <CameraView style={styles.camera} ref={ref => setCameraRef(ref)} />
        </>
      )}
      <Text style={styles.detectedText}>{detectedObject}</Text>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <Text style={styles.buttonText}>Capture</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.pauseResumeButton, { backgroundColor: isPaused ? '#ff5722' : '#4caf50' }]}
        onPress={handlePauseResume}
      >
        <Text style={styles.pauseResumeButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
      </TouchableOpacity>
    </View>
  );
  
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  captureButton: {
    backgroundColor: '#ff5722',
    borderRadius: 50,
    padding: 15,
    marginBottom: 30,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  detectedText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    bottom: 110,  
    left: 0,
    right: 0,
  },
  pauseResumeButton: {
    backgroundColor: '#4caf50', 
    borderRadius: 50,
    padding: 15,
    margin: 10,
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight -40 : 20,
    right: 20,
    zIndex: 10,
  },
  pauseResumeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

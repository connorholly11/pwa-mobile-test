import React from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  StatusBar,
  SafeAreaView,
  Text,
  Platform
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Determine frame dimensions based on platform
const FRAME_WIDTH = isWeb ? 375 : width; // iPhone standard width
const FRAME_HEIGHT = isWeb ? 812 : height; // iPhone X/11 height
const FRAME_RATIO = FRAME_HEIGHT / FRAME_WIDTH;

const NOTCH_WIDTH = 210;
const NOTCH_HEIGHT = 30;
const HOME_INDICATOR_WIDTH = 140;
const HOME_INDICATOR_HEIGHT = 5;

interface iPhoneFrameProps {
  children: React.ReactNode;
}

export default function iPhoneFrame({ children }: iPhoneFrameProps) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  
  return (
    <View style={styles.container}>
      <View style={styles.frameContainer}>
        <View style={styles.frame}>
          {/* Status Bar */}
          <View style={styles.statusBar}>
            <View style={styles.statusBarContent}>
              <Text style={styles.statusBarTime}>{time}</Text>
              <View style={styles.notch}>
                <View style={styles.notchContent} />
              </View>
              <View style={styles.statusBarIcons}>
                <Text style={styles.statusBarIcon}>📶</Text>
                <Text style={styles.statusBarIcon}>📡</Text>
                <Text style={styles.statusBarIcon}>🔋</Text>
              </View>
            </View>
          </View>
          
          {/* App Content */}
          <View style={styles.appContent}>
            {children}
          </View>
          
          {/* Home Indicator */}
          <View style={styles.homeIndicatorContainer}>
            <View style={styles.homeIndicator} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // background color around the phone
    padding: isWeb ? 20 : 0,
  },
  frameContainer: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    overflow: 'hidden',
    borderRadius: isWeb ? 40 : 0,
    borderWidth: isWeb ? 12 : 0,
    borderColor: '#333',
    backgroundColor: 'black',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  frame: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  statusBar: {
    height: 44,
    width: '100%',
    backgroundColor: '#000',
    zIndex: 2,
  },
  statusBarContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  statusBarTime: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    width: 70,
  },
  notch: {
    position: 'absolute',
    top: 0,
    width: NOTCH_WIDTH,
    height: NOTCH_HEIGHT,
    backgroundColor: '#000',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  notchContent: {
    width: 70,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  statusBarIcons: {
    flexDirection: 'row',
    width: 70,
    justifyContent: 'flex-end',
  },
  statusBarIcon: {
    marginLeft: 5,
    fontSize: 12,
  },
  appContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  homeIndicatorContainer: {
    height: 34,
    width: '100%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIndicator: {
    width: HOME_INDICATOR_WIDTH,
    height: HOME_INDICATOR_HEIGHT,
    backgroundColor: '#000',
    borderRadius: 2.5,
  },
}); 
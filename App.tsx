import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import TabNavigator from './app/components/TabNavigator';
import TodoScreen from './app/components/Todo';
import AIMentorHome from './app/components/AIMentorHome';
import IPhoneFrame from './app/components/iPhoneFrame';

export default function App() {
  // Content inside the iPhone frame
  const AppContent = () => (
    <View style={styles.container}>
      <TabNavigator>
        <TabNavigator.Tab title="Home" icon="🏠">
          <AIMentorHome />
        </TabNavigator.Tab>
        
        <TabNavigator.Tab title="Todo" icon="✅">
          <TodoScreen />
        </TabNavigator.Tab>
        
        <TabNavigator.Tab title="Settings" icon="⚙️">
          <View style={styles.settingsContent}>
            <View style={styles.settingHeader} />
            
            <View style={styles.settingGroup}>
              <View style={styles.settingItem}>
                <View style={styles.settingIconPlaceholder} />
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingLabel} />
                  <View style={styles.settingValue} />
                </View>
                <View style={styles.chevron} />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingIconPlaceholder} />
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingLabel} />
                  <View style={styles.settingValue} />
                </View>
                <View style={styles.chevron} />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingIconPlaceholder} />
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingLabel} />
                  <View style={styles.settingValue} />
                </View>
                <View style={styles.toggle} />
              </View>
            </View>
            
            <View style={styles.settingGroup}>
              <View style={styles.settingItem}>
                <View style={styles.settingIconPlaceholder} />
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingLabel} />
                </View>
                <View style={styles.chevron} />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingIconPlaceholder} />
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingLabel} />
                </View>
                <View style={styles.chevron} />
              </View>
            </View>
          </View>
        </TabNavigator.Tab>
      </TabNavigator>
    </View>
  );

  // If we're on web, wrap with the iPhone frame, otherwise show just the content
  return Platform.OS === 'web' ? (
    <IPhoneFrame>
      <AppContent />
    </IPhoneFrame>
  ) : (
    <AppContent />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  homeContent: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F2F2F7',
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  redBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF3B30',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redBubbleInner: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
    marginBottom: 6,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    height: 40,
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardBody: {
    padding: 16,
  },
  cardLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
    marginBottom: 8,
    width: '70%',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#34C759',
    borderRadius: 8,
    marginRight: 10,
  },
  mainContent: {
    flex: 1,
  },
  contentRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  contentBox: {
    flex: 1,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsContent: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  settingHeader: {
    height: 40,
    backgroundColor: '#F2F2F7',
  },
  settingGroup: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingIconPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E5EA',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    height: 8,
    width: '40%',
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 4,
  },
  settingValue: {
    height: 6,
    width: '20%',
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
  },
  chevron: {
    width: 8,
    height: 12,
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
  },
  toggle: {
    width: 40,
    height: 24,
    backgroundColor: '#34C759',
    borderRadius: 12,
  },
});

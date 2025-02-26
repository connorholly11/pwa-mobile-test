import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Dimensions,
  Platform
} from 'react-native';

interface TabProps {
  title: string;
  children: React.ReactNode;
  icon: string; // This would normally be an icon component
}

const Tab: React.FC<TabProps> = ({ title, children, icon }) => (
  <View style={styles.tabContent}>
    <Text style={styles.tabContentTitle}>{title}</Text>
    {children}
  </View>
);

interface TabNavigatorProps {
  children: React.ReactElement<TabProps>[];
}

export default function TabNavigator({ children }: TabNavigatorProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {React.Children.map(children, (child, index) => (
          index === activeTab ? child : null
        ))}
      </View>
      
      <View style={styles.tabBar}>
        {React.Children.map(children, (child, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              activeTab === index && styles.activeTab
            ]}
            onPress={() => setActiveTab(index)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabIcon,
              activeTab === index && styles.activeTabIcon
            ]}>
              {child.props.icon}
            </Text>
            <Text 
              style={[
                styles.tabLabel,
                activeTab === index && styles.activeTabLabel
              ]}
            >
              {child.props.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

TabNavigator.Tab = Tab;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 80,
    borderTopWidth: 0.5,
    borderTopColor: '#d8d8d8',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingBottom: Platform.OS === 'ios' ? 30 : 0, // Account for home indicator
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
    color: '#8E8E93',
  },
  activeTabIcon: {
    color: '#007AFF', // iOS blue
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabLabel: {
    color: '#007AFF', // iOS blue
  },
  tabContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 16,
  },
  tabContentTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
}); 
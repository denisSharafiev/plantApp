import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface TabBarIconProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
  color?: string;
  size?: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ 
  name, 
  focused, 
  color, 
  size = 20 
}) => {
  return (
    <View style={focused ? styles.activeIconContainer : styles.iconContainer}>
      <Ionicons 
        name={name} 
        size={size} 
        color={focused ? '#32CD32' : '#8E8E93'} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    padding: 2,
    borderRadius: 12,
  },
  activeIconContainer: {
    padding: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
});

export default TabBarIcon;
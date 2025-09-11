// import React, { useEffect } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
// import { useAtom, useSetAtom } from 'jotai';
// import { plantsAtom, loadPlantsAtom } from '../../atoms/plantsAtom';

// export default function NotesScreen() {
//   const [plants] = useAtom(plantsAtom);
//   const loadPlants = useSetAtom(loadPlantsAtom);

//   useEffect(() => {
//     loadPlants();
//   }, []);

//   const renderPlantItem = ({ item }: { item: any }) => (
//     <View style={styles.plantCard}>
//       <Text style={styles.plantName}>{item.name}</Text>
//       <Text style={styles.plantType}>Тип: {item.type}</Text>
//       <Text style={styles.wateringSchedule}>Полив: {item.wateringSchedule}</Text>
//       {item.notes && <Text style={styles.notes}>Заметки: {item.notes}</Text>}
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Мои растения</Text>
      
//       {plants.length === 0 ? (
//         <View style={styles.emptyState}>
//           <Text style={styles.emptyText}>У вас пока нет растений</Text>
//           <Text style={styles.emptySubtext}>Добавьте первое растение на вкладке</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={plants}
//           renderItem={renderPlantItem}
//           keyExtractor={item => item.id}
//           contentContainerStyle={styles.list}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F2F2F7',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   list: {
//     paddingBottom: 20,
//   },
//   plantCard: {
//     backgroundColor: 'white',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   plantName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#333',
//   },
//   plantType: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 4,
//   },
//   wateringSchedule: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 4,
//   },
//   notes: {
//     fontSize: 14,
//     color: '#666',
//     fontStyle: 'italic',
//     marginTop: 8,
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//   },
// });

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function NotesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Заметки</Text>
      <Text style={styles.text}>Этот раздел в разработке</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Alert,
  Animated,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoScreen() {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Learn React Native', completed: false },
    { id: '2', text: 'Build iPhone-like UI', completed: true },
    { id: '3', text: 'Test on Web Browser', completed: false },
  ]);
  const [fadeAnim] = useState(new Animated.Value(1));

  const addTodo = () => {
    if (text.trim() === '') {
      // Show platform-specific alert
      if (Platform.OS === 'ios' || Platform.OS === 'web') {
        Alert.alert('Error', 'Please enter a task');
      } else {
        // Alternative for non-iOS platforms
        console.warn('Please enter a task');
      }
      return;
    }
    
    const newTodo = { 
      id: Date.now().toString(), 
      text: text.trim(),
      completed: false 
    };
    
    setTodos([newTodo, ...todos]);
    setText('');
    
    // Animation example
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    // iOS-style confirmation
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => setTodos(todos.filter((todo) => todo.id !== id)),
          style: 'destructive',
        },
      ]
    );
  };

  const renderItemSeparator = () => <View style={styles.separator} />;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a task..."
          value={text}
          onChangeText={setText}
          clearButtonMode="while-editing"
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={addTodo}
          activeOpacity={0.6}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.todoItem}
              onPress={() => toggleTodo(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.todoCheckbox}>
                {item.completed && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text
                style={[
                  styles.todoText,
                  item.completed && styles.completed,
                ]}
              >
                {item.text}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTodo(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={renderItemSeparator}
          style={styles.list}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS background color
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF', // iOS blue
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  list: {
    backgroundColor: '#fff',
  },
  todoItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    alignItems: 'center',
  },
  todoCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  todoText: {
    flex: 1,
    fontSize: 17,
    color: '#000',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 16,
  },
}); 
import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  Animated,
  Vibration,
} from 'react-native'
import * as Haptics from 'expo-haptics'

type Todo = {
  id: string
  text: string
  done: boolean
  isEditing?: boolean
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [editingText, setEditingText] = useState('')

  const scaleAnims = useRef(new Map<string, Animated.Value>()).current

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        done: false,
      }
      setTodos([...todos, newTodoItem])
      scaleAnims.set(newTodoItem.id, new Animated.Value(1))
      setNewTodo('')
    }
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
    scaleAnims.delete(id)
  }

  const toggleDone = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    )
  }

  const startEditing = (todo: Todo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setEditingText(todo.text)

    // Animation de scale
    Animated.sequence([
      Animated.spring(scaleAnims.get(todo.id)!, {
        toValue: 1.05,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims.get(todo.id)!, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start()

    setTodos(
      todos.map((t) => (t.id === todo.id ? { ...t, isEditing: true } : t)),
    )
  }

  const saveEdit = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, text: editingText.trim(), isEditing: false }
          : todo,
      ),
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTodo}
          onChangeText={setNewTodo}
          placeholder="Ajouter une tâche"
        />
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.buttonPressed,
            !newTodo.trim() && styles.buttonDisabled,
          ]}
          onPress={addTodo}
          disabled={!newTodo.trim()}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              styles.todoItem,
              { transform: [{ scale: scaleAnims.get(item.id) || 1 }] },
            ]}
          >
            <Pressable
              style={styles.checkbox}
              onPress={() => toggleDone(item.id)}
            >
              <Text style={styles.checkboxText}>{item.done ? '✓' : ''}</Text>
            </Pressable>

            {item.isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editingText}
                onChangeText={setEditingText}
                autoFocus
                onBlur={() => saveEdit(item.id)}
                onSubmitEditing={() => saveEdit(item.id)}
              />
            ) : (
              <Pressable
                style={styles.todoTextContainer}
                onLongPress={() => startEditing(item)}
              >
                <Text
                  style={[styles.todoText, item.done && styles.todoTextDone]}
                >
                  {item.text}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => deleteTodo(item.id)}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </Pressable>
          </Animated.View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    color: '#007AFF',
    fontSize: 16,
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  todoTextDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  deleteButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 24,
    fontWeight: 'bold',
  },
})

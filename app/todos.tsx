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
  ScrollView,
} from 'react-native'
import * as Haptics from 'expo-haptics'

type Category = {
  id: string
  name: string
  color: string
}

const CATEGORIES: Category[] = [
  { id: 'all', name: 'Tous', color: '#007AFF' },
  { id: 'personal', name: 'Personnel', color: '#FF9B9B' },
  { id: 'work', name: 'Travail', color: '#94B3FD' },
  { id: 'shopping', name: 'Courses', color: '#B5F1CC' },
]

type Todo = {
  id: string
  text: string
  done: boolean
  isEditing?: boolean
  category: string
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [editingText, setEditingText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [newTodoCategory, setNewTodoCategory] = useState('personal')
  const [searchQuery, setSearchQuery] = useState('')

  const scaleAnims = useRef(new Map<string, Animated.Value>()).current

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        done: false,
        category: newTodoCategory,
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

  const filteredTodos = todos.filter((todo) => {
    const matchesCategory =
      selectedCategory === 'all' || todo.category === selectedCategory
    const matchesSearch = todo.text
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const CategoryPill = ({ category }: { category: Category }) => (
    <Pressable
      style={[
        styles.categoryPill,
        { backgroundColor: category.color },
        selectedCategory === category.id && styles.categoryPillSelected,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Text style={styles.categoryPillText}>{category.name}</Text>
    </Pressable>
  )

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {CATEGORIES.map((category) => (
          <CategoryPill key={category.id} category={category} />
        ))}
      </ScrollView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher une tâche..."
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.newTodoContainer}>
          <TextInput
            style={styles.input}
            value={newTodo}
            onChangeText={setNewTodo}
            placeholder="Ajouter une tâche"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categorySelector}
          >
            {CATEGORIES.filter((c) => c.id !== 'all').map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryDot,
                  { backgroundColor: category.color },
                  newTodoCategory === category.id && styles.categoryDotSelected,
                ]}
                onPress={() => setNewTodoCategory(category.id)}
              />
            ))}
          </ScrollView>
        </View>
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
        data={filteredTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              styles.todoItem,
              { transform: [{ scale: scaleAnims.get(item.id) || 1 }] },
            ]}
          >
            <View
              style={[
                styles.categoryIndicator,
                {
                  backgroundColor: CATEGORIES.find(
                    (c) => c.id === item.category,
                  )?.color,
                },
              ]}
            />
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
    paddingHorizontal: 20,
    height: 100,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    width: 45,
    height: 45,
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
  categoriesContainer: {
    flexGrow: 0,
    paddingVertical: 10,
    paddingHorizontal: 20,
    height: 50,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    opacity: 0.8,
  },
  categoryPillSelected: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  categoryPillText: {
    color: '#fff',
    fontWeight: '600',
  },
  newTodoContainer: {
    flex: 1,
  },
  categorySelector: {
    height: 30,
    marginTop: 8,
  },
  categoryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    opacity: 0.6,
  },
  categoryDotSelected: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  categoryIndicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    height: 45,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
})

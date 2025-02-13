import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  Modal,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type Category = {
  id: string
  name: string
  color: string
}

type Note = {
  id: string
  title: string
  content: string
  category: string
  color: string
  createdAt: number
}

const CATEGORIES: Category[] = [
  { id: '1', name: 'Personnel', color: '#FF9B9B' },
  { id: '2', name: 'Travail', color: '#94B3FD' },
  { id: '3', name: 'Idées', color: '#B5F1CC' },
  { id: '4', name: 'Tâches', color: '#E5CB9F' },
]

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')

  const filteredAndSortedNotes = notes
    .filter(note => {
      const matchesCategory = selectedCategory === null || note.category === selectedCategory
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.createdAt - a.createdAt
      }
      return a.title.localeCompare(b.title)
    })

  // À implémenter :
  // 1. Chargement des notes depuis AsyncStorage
  // 2. Composant pour les catégories
  // 3. Composant pour chaque note
  // 4. Modal pour créer/éditer une note
  // 5. Animations et gestures

  return (
    <View style={styles.container}>
      {/* Votre implémentation ici */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Vos styles ici
})
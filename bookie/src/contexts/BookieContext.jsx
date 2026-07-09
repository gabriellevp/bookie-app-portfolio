import { createContext, useContext, useMemo, useState } from 'react'
import { mockBooks, mockCommunityUsers, mockCurrentUser, mockAuthors } from '../data/mockData'

const BookieContext = createContext(null)

export function BookieProvider({ children }) {
  const [books, setBooks] = useState(mockBooks)
  const [communityUsers, setCommunityUsers] = useState(mockCommunityUsers)
  const [currentUser] = useState(mockCurrentUser)
  const [authors] = useState(mockAuthors)
  const [currentUserShelf] = useState(mockBooks.filter(b => b.status !== 'Não adicionado'))

  const updateBook = (bookId, updates) => {
    setBooks((prev) =>
      prev.map((book) => (book.id === bookId ? { ...book, ...updates } : book)),
    )
  }

  const toggleFollow = (userId) => {
    setCommunityUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, following: !user.following } : user,
      ),
    )
  }

  const addNote = (bookId, note) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId
          ? { ...book, userNotes: [...(book.userNotes || []), { id: Date.now(), ...note }] }
          : book,
      ),
    )
  }

  const updateNote = (bookId, noteId, updates) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId
          ? {
              ...book,
              userNotes: (book.userNotes || []).map((note) =>
                note.id === noteId ? { ...note, ...updates } : note,
              ),
            }
          : book,
      ),
    )
  }

  const deleteNote = (bookId, noteId) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId
          ? { ...book, userNotes: (book.userNotes || []).filter((note) => note.id !== noteId) }
          : book,
      ),
    )
  }

  const value = useMemo(
    () => ({
      books,
      setBooks,
      updateBook,
      communityUsers,
      toggleFollow,
      currentUser,
      authors,
      currentUserShelf,
      addNote,
      updateNote,
      deleteNote,
    }),
    [books, communityUsers, currentUser, authors, currentUserShelf],
  )

  return <BookieContext.Provider value={value}>{children}</BookieContext.Provider>
}

export function useBookie() {
  const context = useContext(BookieContext)

  if (!context) {
    throw new Error('useBookie must be used within a BookieProvider')
  }

  return context
}

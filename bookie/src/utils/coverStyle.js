export function coverStyle(book) {
  if (book.coverImage) {
    return {
      backgroundImage: `url(${book.coverImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { background: book.coverColor }
}

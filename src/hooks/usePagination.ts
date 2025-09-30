import { useState, useEffect, useMemo } from 'react'

interface UsePaginationProps<T> {
  data: T[]
  itemsPerPage?: number
  initialPage?: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  currentItems: T[]
  setCurrentPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
  totalItems: number
}

export const usePagination = <T,>({
  data,
  itemsPerPage = 10,
  initialPage = 1
}: UsePaginationProps<T>): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Calcular el número total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage)
  }, [data.length, itemsPerPage])

  // Resetear a la primera página si los datos cambian
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Calcular los elementos de la página actual
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

  // Funciones de navegación
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(totalPages)
  }

  // Estados de navegación
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  // Índices para mostrar información
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, data.length)

  return {
    currentPage,
    totalPages,
    currentItems,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    totalItems: data.length
  }
}

// Hook para paginación async (para datos que vienen del servidor)
interface UseAsyncPaginationProps {
  totalItems: number
  itemsPerPage?: number
  initialPage?: number
}

interface UseAsyncPaginationReturn {
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
  offset: number
  limit: number
}

export const useAsyncPagination = ({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1
}: UseAsyncPaginationProps): UseAsyncPaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Funciones de navegación
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(totalPages)
  }

  // Estados de navegación
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  // Cálculos para la API
  const offset = (currentPage - 1) * itemsPerPage
  const limit = itemsPerPage

  // Índices para mostrar información
  const startIndex = offset + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems)

  return {
    currentPage,
    totalPages,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    offset,
    limit
  }
}
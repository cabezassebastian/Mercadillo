import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPages?: number // Número de páginas a mostrar alrededor de la actual
  className?: string
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPages = 5,
  className = ''
}) => {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const half = Math.floor(showPages / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + showPages - 1)

    // Ajustar el inicio si no hay suficientes páginas al final
    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const visiblePages = getVisiblePages()
  const showStartEllipsis = visiblePages[0] > 2
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1

  const ButtonBase = ({ 
    children, 
    onClick, 
    disabled = false, 
    active = false,
    className: buttonClassName = ''
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    active?: boolean
    className?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 py-2 text-sm font-medium
        border border-gray-300 dark:border-gray-600
        transition-all duration-200 ease-in-out
        ${active 
          ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500' 
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:border-gray-400 dark:hover:border-gray-500'
        }
        ${buttonClassName}
      `}
    >
      {children}
    </button>
  )

  return (
    <nav 
      className={`flex items-center justify-center space-x-1 ${className}`}
      aria-label="Paginación"
    >
      {/* Botón Anterior */}
      <ButtonBase
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-l-lg"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="sr-only">Página anterior</span>
      </ButtonBase>

      {/* Primera página */}
      {showStartEllipsis && (
        <>
          <ButtonBase onClick={() => onPageChange(1)}>1</ButtonBase>
          <div className="flex items-center justify-center min-w-[2.5rem] h-10">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
        </>
      )}

      {/* Páginas visibles */}
      {visiblePages.map((page) => (
        <ButtonBase
          key={page}
          onClick={() => onPageChange(page)}
          active={page === currentPage}
        >
          {page}
        </ButtonBase>
      ))}

      {/* Última página */}
      {showEndEllipsis && (
        <>
          <div className="flex items-center justify-center min-w-[2.5rem] h-10">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
          <ButtonBase onClick={() => onPageChange(totalPages)}>{totalPages}</ButtonBase>
        </>
      )}

      {/* Botón Siguiente */}
      <ButtonBase
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-r-lg"
      >
        <ChevronRight className="w-4 h-4" />
        <span className="sr-only">Página siguiente</span>
      </ButtonBase>
    </nav>
  )
}

export default Pagination
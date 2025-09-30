import React, { useState } from 'react'
import StarRating from '@/components/common/StarRating'

const TestStarsPage: React.FC = () => {
  const [rating1, setRating1] = useState(0)
  const [rating2] = useState(3.5)
  const [rating3, setRating3] = useState(0)

  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gris-oscuro dark:text-gray-100 mb-8">
          Prueba de Componente StarRating
        </h1>

        <div className="space-y-8">
          {/* Test 1: Interactive Stars */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gris-oscuro dark:text-gray-100 mb-4">
              Estrellas Interactivas (Tamaño Grande)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Haz hover y clic en las estrellas para probar la interactividad
            </p>
            <StarRating
              rating={rating1}
              onRatingChange={setRating1}
              size="lg"
              showText={true}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Rating actual: {rating1}
            </p>
          </div>

          {/* Test 2: Readonly Stars */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gris-oscuro dark:text-gray-100 mb-4">
              Estrellas Solo Lectura (3.5 estrellas)
            </h2>
            <StarRating
              rating={rating2}
              readonly={true}
              size="md"
              showText={true}
            />
          </div>

          {/* Test 3: Small Interactive Stars */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gris-oscuro dark:text-gray-100 mb-4">
              Estrellas Pequeñas Interactivas
            </h2>
            <StarRating
              rating={rating3}
              onRatingChange={setRating3}
              size="sm"
              showText={true}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Rating actual: {rating3}
            </p>
          </div>

          {/* Test 4: Multiple Sizes */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gris-oscuro dark:text-gray-100 mb-4">
              Diferentes Tamaños (Solo Lectura)
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Pequeño (4 estrellas):</p>
                <StarRating rating={4} readonly size="sm" showText={true} />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Mediano (4.5 estrellas):</p>
                <StarRating rating={4.5} readonly size="md" showText={true} />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Grande (5 estrellas):</p>
                <StarRating rating={5} readonly size="lg" showText={true} />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={() => {
                setRating1(0)
                setRating3(0)
              }}
              className="btn-primary px-6 py-2"
            >
              Resetear Calificaciones Interactivas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestStarsPage
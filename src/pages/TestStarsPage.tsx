import React, { useState } from 'react'
import StarRating from '@/components/common/StarRating'
import ReviewForm from '@/components/Reviews/ReviewForm'
import ReviewList from '@/components/Reviews/ReviewList'

const TestStarsPage: React.FC = () => {
  const [rating1, setRating1] = useState(0)
  const [rating2] = useState(3.5)
  const [rating3, setRating3] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showReviewList, setShowReviewList] = useState(false)
  
  // ID de producto ficticio para las pruebas
  const testProductId = 'test-product-123'

  return (
    <div className="min-h-screen bg-hueso dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gris-oscuro dark:text-gray-100 mb-8">
          Prueba Completa del Sistema de Reseñas
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

          {/* Test 5: Review Form Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gris-oscuro dark:text-gray-100 mb-4">
              Prueba del Formulario de Reseñas
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Prueba la funcionalidad completa del formulario de reseñas
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  console.log('Toggle Review Form:', !showReviewForm)
                  setShowReviewForm(!showReviewForm)
                }}
                className="
                  px-6 py-3 bg-blue-600 hover:bg-blue-700 
                  text-white font-bold rounded-lg shadow-lg
                  transition-all duration-200 border-2 border-blue-800
                  transform hover:scale-105
                "
              >
                {showReviewForm ? '🔻 Ocultar' : '📝 Mostrar'} Formulario de Reseña
              </button>
              
              {showReviewForm && (
                <div className="mt-4">
                  <ReviewForm
                    productId={testProductId}
                    skipPurchaseValidation={true}
                    onReviewCreated={() => {
                      console.log('Reseña creada exitosamente!')
                      setShowReviewForm(false)
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Test 6: Review List Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gris-oscuro dark:text-gray-100 mb-4">
              Prueba de Lista de Reseñas
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Visualiza cómo se muestran las reseñas de un producto
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  console.log('Toggle Review List:', !showReviewList)
                  setShowReviewList(!showReviewList)
                }}
                className="
                  px-6 py-3 bg-green-600 hover:bg-green-700 
                  text-white font-bold rounded-lg shadow-lg
                  transition-all duration-200 border-2 border-green-800
                  transform hover:scale-105
                "
              >
                {showReviewList ? '🔻 Ocultar' : '📋 Mostrar'} Lista de Reseñas
              </button>
              
              {showReviewList && (
                <div className="mt-4">
                  <ReviewList productId={testProductId} />
                </div>
              )}
            </div>
          </div>

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={() => {
                setRating1(0)
                setRating3(0)
                setShowReviewForm(false)
                setShowReviewList(false)
              }}
              className="btn-primary px-6 py-3 font-semibold"
            >
              Resetear Todas las Pruebas
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Instrucciones de Prueba
            </h3>
            <ul className="space-y-2 text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span><strong>Estrellas Interactivas:</strong> Haz hover y clic para probar la selección de calificaciones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span><strong>Formulario de Reseñas:</strong> Prueba crear una reseña completa con estrellas y comentario</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span><strong>Lista de Reseñas:</strong> Visualiza cómo se muestran las reseñas existentes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span><strong>Modo Oscuro:</strong> Cambia entre modo claro y oscuro para probar la visibilidad</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestStarsPage
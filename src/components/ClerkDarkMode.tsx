import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const ClerkDarkMode = () => {
  const { theme } = useTheme()

  useEffect(() => {
    const forceClerkDarkMode = () => {
      if (theme === 'dark') {
        // Buscar todos los elementos de Clerk y forzar el modo oscuro
        const clerkElements = document.querySelectorAll('[class*="cl-"], [data-clerk]')
        
        clerkElements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement
          
          // Agregar clase dark si no la tiene
          if (!htmlElement.classList.contains('dark')) {
            htmlElement.classList.add('dark')
          }
          
          // Forzar estilos oscuros directamente
          if (htmlElement.style) {
            // Solo aplicar si no es un botón primario o enlace
            const isButton = htmlElement.classList.contains('cl-formButtonPrimary') || 
                            htmlElement.classList.contains('cl-profileSectionPrimaryButton')
            const isLink = htmlElement.classList.contains('cl-footerActionLink')
            
            if (!isButton && !isLink) {
              htmlElement.style.backgroundColor = '#1f2937'
              htmlElement.style.color = '#f3f4f6'
              htmlElement.style.borderColor = '#374151'
            }
          }
        })

        // Forzar el fondo del documento si está dentro de un modal de Clerk
        const clerkModals = document.querySelectorAll('[data-clerk-modal], .cl-modal')
        clerkModals.forEach((modal: Element) => {
          const htmlModal = modal as HTMLElement
          if (htmlModal.style) {
            htmlModal.style.backgroundColor = '#1f2937'
          }
        })
      }
    }

    // Ejecutar inmediatamente
    forceClerkDarkMode()

    // Configurar un observer para detectar cambios en el DOM
    const observer = new MutationObserver(() => {
      if (theme === 'dark') {
        setTimeout(forceClerkDarkMode, 100)
      }
    })

    // Observar cambios en todo el documento
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    // Ejecutar periódicamente para asegurar que se mantenga
    const interval = setInterval(() => {
      if (theme === 'dark') {
        forceClerkDarkMode()
      }
    }, 1000)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [theme])

  return null
}

export default ClerkDarkMode

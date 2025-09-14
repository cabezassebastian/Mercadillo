import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const ClerkDarkMode = () => {
  const { theme } = useTheme()

  useEffect(() => {
    const forceClerkDarkMode = () => {
      if (theme === 'dark') {
        // Buscar todos los elementos de Clerk y forzar el modo oscuro más agresivamente
        const clerkElements = document.querySelectorAll('[class*="cl-"], [data-clerk], [role="dialog"]')
        
        clerkElements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement
          
          // Agregar clase dark si no la tiene
          if (!htmlElement.classList.contains('dark')) {
            htmlElement.classList.add('dark')
          }
          
          // Forzar estilos oscuros directamente
          if (htmlElement.style) {
            // Verificar si es un elemento que debe mantener sus colores específicos
            const isButton = htmlElement.classList.contains('cl-formButtonPrimary') || 
                            htmlElement.classList.contains('cl-profileSectionPrimaryButton') ||
                            htmlElement.hasAttribute('data-clerk-primary')
            const isLink = htmlElement.classList.contains('cl-footerActionLink') ||
                          htmlElement.hasAttribute('data-clerk-link')
            const isImage = htmlElement.tagName === 'IMG' || htmlElement.tagName === 'SVG'
            
            if (!isButton && !isLink && !isImage) {
              htmlElement.style.setProperty('background-color', '#1f2937', 'important')
              htmlElement.style.setProperty('color', '#f3f4f6', 'important')
              htmlElement.style.setProperty('border-color', '#374151', 'important')
              
              // Para elementos específicos del sidebar
              if (htmlElement.classList.contains('cl-navbar') || 
                  htmlElement.classList.contains('cl-userProfile-navbar')) {
                htmlElement.style.setProperty('background-color', '#111827', 'important')
              }
            }
          }
        })

        // Forzar elementos específicos conocidos por ser problemáticos
        const problematicSelectors = [
          '.cl-card',
          '.cl-signIn-start',
          '.cl-signUp-start',
          '.cl-rootBox',
          '.cl-footer',
          '.cl-signIn-footer',
          '.cl-signUp-footer',
          '.cl-userProfile-content',
          '.cl-userButtonPopoverCard',
          '[class*="cl-internal-"]'
        ]

        problematicSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector)
          elements.forEach((element: Element) => {
            const htmlElement = element as HTMLElement
            if (htmlElement.style) {
              htmlElement.style.setProperty('background-color', '#1f2937', 'important')
              htmlElement.style.setProperty('color', '#f3f4f6', 'important')
              htmlElement.style.setProperty('border-color', '#374151', 'important')
            }
          })
        })

        // Forzar el navbar específicamente
        const navbars = document.querySelectorAll('.cl-navbar, .cl-userProfile-navbar')
        navbars.forEach((navbar: Element) => {
          const htmlNavbar = navbar as HTMLElement
          if (htmlNavbar.style) {
            htmlNavbar.style.setProperty('background-color', '#111827', 'important')
            htmlNavbar.style.setProperty('border-right', '1px solid #374151', 'important')
          }
        })

        // Forzar dividers
        const dividers = document.querySelectorAll('.cl-dividerLine, .cl-dividerRow')
        dividers.forEach((divider: Element) => {
          const htmlDivider = divider as HTMLElement
          if (htmlDivider.style) {
            htmlDivider.style.setProperty('background-color', '#4b5563', 'important')
            htmlDivider.style.setProperty('border', 'none', 'important')
          }
        })

        // Forzar todos los modales y sus contenidos
        const modals = document.querySelectorAll('[data-clerk-modal], .cl-modal, [role="dialog"], .cl-modalContent, .cl-componentModal')
        modals.forEach((modal: Element) => {
          const htmlModal = modal as HTMLElement
          if (htmlModal.style) {
            htmlModal.style.setProperty('background-color', '#1f2937', 'important')
            htmlModal.style.setProperty('border', '1px solid #374151', 'important')
          }
          
          // También forzar todos los hijos del modal
          const children = modal.querySelectorAll('*')
          children.forEach((child: Element) => {
            const htmlChild = child as HTMLElement
            const isButton = htmlChild.classList.contains('cl-formButtonPrimary') ||
                           htmlChild.hasAttribute('data-clerk-primary')
            const isLink = htmlChild.classList.contains('cl-footerActionLink') ||
                         htmlChild.hasAttribute('data-clerk-link')
            const isImage = htmlChild.tagName === 'IMG' || htmlChild.tagName === 'SVG'
            const isInput = htmlChild.tagName === 'INPUT' || htmlChild.classList.contains('cl-formFieldInput')
            
            if (!isButton && !isLink && !isImage && htmlChild.style) {
              htmlChild.style.setProperty('background-color', '#1f2937', 'important')
              htmlChild.style.setProperty('color', '#f3f4f6', 'important')
              htmlChild.style.setProperty('border-color', '#374151', 'important')
            }
            
            // Inputs específicos
            if (isInput && htmlChild.style) {
              htmlChild.style.setProperty('background-color', '#374151', 'important')
              htmlChild.style.setProperty('color', '#f9fafb', 'important')
              htmlChild.style.setProperty('border-color', '#4b5563', 'important')
            }
          })
        })

        // Forzar específicamente elementos de sign-in y sign-up
        const authElements = document.querySelectorAll('.cl-signIn, .cl-signUp, .cl-signIn-start, .cl-signUp-start')
        authElements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement
          if (htmlElement.style) {
            htmlElement.style.setProperty('background-color', '#1f2937', 'important')
            htmlElement.style.setProperty('border', '1px solid #374151', 'important')
          }
        })

        // Forzar el backdrop del modal
        const backdrops = document.querySelectorAll('.cl-modalBackdrop, [data-clerk-modal-backdrop]')
        backdrops.forEach((backdrop: Element) => {
          const htmlBackdrop = backdrop as HTMLElement
          if (htmlBackdrop.style) {
            htmlBackdrop.style.setProperty('background-color', 'rgba(0, 0, 0, 0.8)', 'important')
          }
        })

        // Forzar botones primarios para mantener el color correcto
        const primaryButtons = document.querySelectorAll('.cl-formButtonPrimary, button[type="submit"], button[data-localization-key*="continue"], button[data-localization-key*="signIn"], button[data-localization-key*="signUp"]')
        primaryButtons.forEach((button: Element) => {
          const htmlButton = button as HTMLElement
          if (htmlButton.style) {
            htmlButton.style.setProperty('background-color', '#FFD700', 'important')
            htmlButton.style.setProperty('background', '#FFD700', 'important')
            htmlButton.style.setProperty('color', '#333333', 'important')
            htmlButton.style.setProperty('border', 'none', 'important')
            htmlButton.style.setProperty('font-weight', '600', 'important')
          }
          
          // Agregar event listeners para hover
          htmlButton.addEventListener('mouseenter', () => {
            htmlButton.style.setProperty('background-color', '#b8860b', 'important')
            htmlButton.style.setProperty('background', '#b8860b', 'important')
          })
          
          htmlButton.addEventListener('mouseleave', () => {
            htmlButton.style.setProperty('background-color', '#FFD700', 'important')
            htmlButton.style.setProperty('background', '#FFD700', 'important')
          })
        })

        // Buscar específicamente botones que contengan "Continue"
        const allButtons = document.querySelectorAll('button')
        allButtons.forEach((button: Element) => {
          const htmlButton = button as HTMLElement
          if (htmlButton.textContent?.includes('Continue') || 
              htmlButton.textContent?.includes('Continuar') ||
              htmlButton.getAttribute('aria-label')?.includes('Continue') ||
              htmlButton.classList.contains('cl-formButtonPrimary') ||
              (htmlButton as HTMLButtonElement).type === 'submit') {
            
            htmlButton.style.setProperty('background', '#FFD700', 'important')
            htmlButton.style.setProperty('background-color', '#FFD700', 'important')
            htmlButton.style.setProperty('color', '#333333', 'important')
            htmlButton.style.setProperty('border', 'none', 'important')
            htmlButton.style.setProperty('box-shadow', 'none', 'important')
            htmlButton.style.setProperty('outline', 'none', 'important')
            htmlButton.style.setProperty('position', 'relative', 'important')
            htmlButton.style.setProperty('overflow', 'hidden', 'important')
            htmlButton.style.setProperty('transition', 'all 0.2s ease', 'important')
            
            // Remover cualquier pseudo-elemento problemático
            const style = document.createElement('style')
            style.textContent = `
              .dark .cl-formButtonPrimary::before,
              .dark .cl-formButtonPrimary::after {
                display: none !important;
              }
            `
            document.head.appendChild(style)
            
            // Limpiar event listeners anteriores
            const newButton = htmlButton.cloneNode(true) as HTMLElement
            htmlButton.parentNode?.replaceChild(newButton, htmlButton)
            
            // Agregar event listeners limpios
            newButton.addEventListener('mouseenter', (e) => {
              e.preventDefault()
              e.stopPropagation()
              newButton.style.setProperty('background', '#b8860b', 'important')
              newButton.style.setProperty('background-color', '#b8860b', 'important')
              newButton.style.setProperty('color', '#333333', 'important')
              newButton.style.setProperty('transform', 'translateY(-1px)', 'important')
              newButton.style.setProperty('box-shadow', '0 4px 12px rgba(255, 215, 0, 0.3)', 'important')
            }, { passive: false })
            
            newButton.addEventListener('mouseleave', (e) => {
              e.preventDefault()
              e.stopPropagation()
              newButton.style.setProperty('background', '#FFD700', 'important')
              newButton.style.setProperty('background-color', '#FFD700', 'important')
              newButton.style.setProperty('color', '#333333', 'important')
              newButton.style.setProperty('transform', 'translateY(0)', 'important')
              newButton.style.setProperty('box-shadow', 'none', 'important')
            }, { passive: false })
            
            newButton.addEventListener('mousedown', (e) => {
              e.preventDefault()
              e.stopPropagation()
              newButton.style.setProperty('background', '#d4af37', 'important')
              newButton.style.setProperty('background-color', '#d4af37', 'important')
              newButton.style.setProperty('transform', 'translateY(0)', 'important')
            }, { passive: false })
            
            newButton.addEventListener('mouseup', (e) => {
              e.preventDefault()
              e.stopPropagation()
              newButton.style.setProperty('background', '#b8860b', 'important')
              newButton.style.setProperty('background-color', '#b8860b', 'important')
            }, { passive: false })
          }
        })

        // Forzar absolutamente todos los elementos del modal a ser oscuros
        const modalSelectors = [
          '[data-clerk-modal]',
          '[data-clerk-modal] *',
          '.cl-modal',
          '.cl-modal *',
          '.cl-componentModal',
          '.cl-componentModal *',
          '[role="dialog"]',
          '[role="dialog"] *',
          '.cl-card',
          '.cl-card *',
          '.cl-signIn',
          '.cl-signIn *',
          '.cl-signUp',
          '.cl-signUp *'
        ]

        modalSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector)
          elements.forEach((element: Element) => {
            const htmlElement = element as HTMLElement
            const isButton = htmlElement.tagName === 'BUTTON' && 
                            (htmlElement.classList.contains('cl-formButtonPrimary') ||
                             htmlElement.textContent?.includes('Continue') ||
                             htmlElement.textContent?.includes('Continuar') ||
                             (htmlElement as HTMLButtonElement).type === 'submit')
            const isInput = htmlElement.tagName === 'INPUT'
            const isLink = htmlElement.tagName === 'A' || htmlElement.classList.contains('cl-footerActionLink')
            const isImage = htmlElement.tagName === 'IMG' || htmlElement.tagName === 'SVG'
            const isSocialButton = htmlElement.classList.contains('cl-socialButtonsBlockButton')
            
            if (htmlElement.style) {
              if (isButton && !isSocialButton) {
                // Ya manejado arriba
              } else if (isInput) {
                htmlElement.style.setProperty('background', '#374151', 'important')
                htmlElement.style.setProperty('background-color', '#374151', 'important')
                htmlElement.style.setProperty('color', '#f9fafb', 'important')
                htmlElement.style.setProperty('border', '1px solid #4b5563', 'important')
              } else if (isSocialButton) {
                htmlElement.style.setProperty('background', '#374151', 'important')
                htmlElement.style.setProperty('background-color', '#374151', 'important')
                htmlElement.style.setProperty('color', '#d1d5db', 'important')
                htmlElement.style.setProperty('border', '1px solid #4b5563', 'important')
              } else if (isLink) {
                htmlElement.style.setProperty('color', '#fbbf24', 'important')
                htmlElement.style.setProperty('background', 'transparent', 'important')
                htmlElement.style.setProperty('background-color', 'transparent', 'important')
              } else if (!isImage) {
                htmlElement.style.setProperty('background', '#1f2937', 'important')
                htmlElement.style.setProperty('background-color', '#1f2937', 'important')
                htmlElement.style.setProperty('color', '#f3f4f6', 'important')
                htmlElement.style.setProperty('border-color', '#374151', 'important')
              }
            }
          })
        })

        // Forzar el backdrop final
        const modalBackdrops = document.querySelectorAll('.cl-modalBackdrop, [data-clerk-modal-backdrop]')
        modalBackdrops.forEach((backdrop: Element) => {
          const htmlBackdrop = backdrop as HTMLElement
          if (htmlBackdrop.style) {
            htmlBackdrop.style.setProperty('background', 'rgba(0, 0, 0, 0.95)', 'important')
            htmlBackdrop.style.setProperty('background-color', 'rgba(0, 0, 0, 0.95)', 'important')
          }
        })
      }
    }

    // Ejecutar inmediatamente
    forceClerkDarkMode()

    // Configurar un observer para detectar cambios en el DOM con mayor frecuencia
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || 
            (mutation.type === 'attributes' && 
             (mutation.attributeName === 'class' || mutation.attributeName === 'style'))) {
          shouldUpdate = true
        }
      })
      
      if (shouldUpdate && theme === 'dark') {
        setTimeout(forceClerkDarkMode, 10) // Ejecutar más rápido
      }
    })

    // Observar cambios en todo el documento
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    // Ejecutar periódicamente para asegurar que se mantenga (más frecuente)
    const interval = setInterval(() => {
      if (theme === 'dark') {
        forceClerkDarkMode()
      }
    }, 500) // Cada 500ms en lugar de 1000ms

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [theme])

  return null
}

export default ClerkDarkMode

import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const ClerkDarkMode = () => {
  const { theme } = useTheme()

  useEffect(() => {
    const forceClerkDarkMode = () => {
      // FORZAR ELEMENTOS DEL LAYOUT PRINCIPAL (fuera de Clerk)
      // Buscar contenedores principales de las páginas de auth
      const pageContainers = document.querySelectorAll('.min-h-screen, [class*="bg-hueso"]')
      pageContainers.forEach((container: Element) => {
        const htmlContainer = container as HTMLElement
        if (htmlContainer.style) {
          htmlContainer.style.setProperty('background-color', '#111827', 'important')
          htmlContainer.style.setProperty('background', '#111827', 'important')
        }
      })

      // Forzar divs con bg-white que están fuera de Clerk
      const whiteBgDivs = document.querySelectorAll('div[class*="bg-white"]')
      whiteBgDivs.forEach((div: Element) => {
        const htmlDiv = div as HTMLElement
        // Solo si contiene elementos de Clerk o está en una página de auth
        if (htmlDiv.querySelector('[data-clerk-component]') || 
            htmlDiv.closest('[data-clerk-component]') ||
            window.location.pathname.includes('sign-in') ||
            window.location.pathname.includes('sign-up')) {
          if (htmlDiv.style) {
            htmlDiv.style.setProperty('background-color', '#1f2937', 'important')
            htmlDiv.style.setProperty('background', '#1f2937', 'important')
            htmlDiv.style.setProperty('border-color', '#374151', 'important')
          }
        }
      })

      // Forzar textos específicos en páginas de auth
      const authTexts = document.querySelectorAll('h1, p, label, span')
      authTexts.forEach((text: Element) => {
        const htmlText = text as HTMLElement
        if ((window.location.pathname.includes('sign-in') || 
             window.location.pathname.includes('sign-up')) &&
            htmlText.style) {
          
          // Verificar si tiene clases de texto claro
          const hasLightText = htmlText.classList.contains('text-gris-oscuro') ||
                              htmlText.classList.contains('text-gris-claro') ||
                              htmlText.classList.contains('text-gray-900')
          
          if (hasLightText) {
            htmlText.style.setProperty('color', '#f3f4f6', 'important')
          }
        }
      })

      // Forzar elementos con clases específicas problemáticas
      const problemClasses = [
        '.bg-white',
        '.rounded-2xl', 
        '.shadow-xl',
        '.border-gray-200'
      ]
      
      problemClasses.forEach(className => {
        const elements = document.querySelectorAll(className)
        elements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement
          // Solo si está relacionado con auth
          if (htmlElement.querySelector('[data-clerk-component]') || 
              htmlElement.closest('[data-clerk-component]') ||
              window.location.pathname.includes('sign-in') ||
              window.location.pathname.includes('sign-up')) {
            if (htmlElement.style) {
              htmlElement.style.setProperty('background-color', '#1f2937', 'important')
              htmlElement.style.setProperty('background', '#1f2937', 'important')
              htmlElement.style.setProperty('border-color', '#374151', 'important')
              htmlElement.style.setProperty('box-shadow', '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 'important')
            }
          }
        })
      })

      // Enhanced aggressive dark mode enforcement for Clerk components v2.0
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

      // Forzar TODOS los divs dentro de modales/formularios de Clerk
      const clerkContainers = document.querySelectorAll('[class*="cl-"], [data-clerk], [role="dialog"], .cl-signIn, .cl-signUp')
      clerkContainers.forEach((container: Element) => {
        // Buscar TODOS los divs dentro de cada contenedor
        const allDivs = container.querySelectorAll('div')
        allDivs.forEach((div: Element) => {
          const htmlDiv = div as HTMLElement
          if (htmlDiv.style) {
            // Verificar si es un botón primario (mantener dorado)
            const isPrimaryButton = htmlDiv.classList.contains('cl-formButtonPrimary') ||
                                   htmlDiv.querySelector('button[type="submit"]') ||
                                   htmlDiv.textContent?.includes('Continue') ||
                                   htmlDiv.textContent?.includes('Continuar')
            
            if (!isPrimaryButton) {
              htmlDiv.style.setProperty('background-color', '#1f2937', 'important')
              htmlDiv.style.setProperty('background', '#1f2937', 'important')
              htmlDiv.style.setProperty('color', '#f3f4f6', 'important')
              htmlDiv.style.setProperty('border-color', '#374151', 'important')
            }
          }
        })

        // También forzar otros elementos contenedores
        const allElements = container.querySelectorAll('section, article, header, footer, main, aside, nav')
        allElements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement
          if (htmlElement.style) {
            htmlElement.style.setProperty('background-color', '#1f2937', 'important')
            htmlElement.style.setProperty('background', '#1f2937', 'important')
            htmlElement.style.setProperty('color', '#f3f4f6', 'important')
          }
        })
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
        '[class*="cl-internal-"]',
        '.cl-signIn',
        '.cl-signUp',
        '.cl-signIn *',
        '.cl-signUp *',
        '.cl-main',
        '.cl-header',
        '.cl-formContainer',
        '.cl-form',
        '.cl-socialButtonsContainer',
        '.cl-divider',
        '.cl-alternativeMethodsBlockButton'
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
          
          if (isInput && htmlChild.style) {
            htmlChild.style.setProperty('background-color', '#374151', 'important')
            htmlChild.style.setProperty('color', '#f3f4f6', 'important')
            htmlChild.style.setProperty('border', '1px solid #4b5563', 'important')
          }
        })
      })

      // FORZAR ULTRA-AGRESIVO: Todos los elementos dentro de sign-in/sign-up
      const signInUpModals = document.querySelectorAll('.cl-signIn, .cl-signUp, [role="dialog"]')
      signInUpModals.forEach((modal: Element) => {
        // Forzar el modal principal
        const htmlModal = modal as HTMLElement
        if (htmlModal.style) {
          htmlModal.style.setProperty('background-color', '#1f2937', 'important')
          htmlModal.style.setProperty('background', '#1f2937', 'important')
        }

        // Forzar ABSOLUTAMENTE TODOS los elementos hijos
        const allChildren = modal.querySelectorAll('*')
        allChildren.forEach((child: Element) => {
          const htmlChild = child as HTMLElement
          
          // Identificar tipos de elementos
          const isInput = htmlChild.tagName === 'INPUT'
          const isButton = htmlChild.tagName === 'BUTTON'
          const isLink = htmlChild.tagName === 'A'
          const isImage = htmlChild.tagName === 'IMG' || htmlChild.tagName === 'SVG'
          const isPrimaryButton = isButton && (
            htmlChild.classList.contains('cl-formButtonPrimary') ||
            htmlChild.textContent?.includes('Continue') ||
            htmlChild.textContent?.includes('Continuar')
          )
          const isSocialButton = htmlChild.classList.contains('cl-socialButtonsBlockButton')

          if (htmlChild.style) {
            if (isPrimaryButton) {
              // Mantener botón primario dorado
              htmlChild.style.setProperty('background-color', '#FFD700', 'important')
              htmlChild.style.setProperty('background', '#FFD700', 'important')
              htmlChild.style.setProperty('color', '#333333', 'important')
            } else if (isInput) {
              // Inputs oscuros
              htmlChild.style.setProperty('background-color', '#374151', 'important')
              htmlChild.style.setProperty('background', '#374151', 'important')
              htmlChild.style.setProperty('color', '#f3f4f6', 'important')
              htmlChild.style.setProperty('border', '1px solid #4b5563', 'important')
            } else if (isSocialButton) {
              // Botones sociales oscuros
              htmlChild.style.setProperty('background-color', '#374151', 'important')
              htmlChild.style.setProperty('background', '#374151', 'important')
              htmlChild.style.setProperty('color', '#d1d5db', 'important')
              htmlChild.style.setProperty('border', '1px solid #4b5563', 'important')
            } else if (isLink) {
              // Links dorados
              htmlChild.style.setProperty('color', '#fbbf24', 'important')
              htmlChild.style.setProperty('background-color', 'transparent', 'important')
              htmlChild.style.setProperty('background', 'transparent', 'important')
            } else if (!isImage && !isButton) {
              // TODOS los demás elementos (divs, spans, etc.) oscuros
              htmlChild.style.setProperty('background-color', '#1f2937', 'important')
              htmlChild.style.setProperty('background', '#1f2937', 'important')
              htmlChild.style.setProperty('color', '#f3f4f6', 'important')
              htmlChild.style.setProperty('border-color', '#374151', 'important')
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

    const clearClerkDarkMode = () => {
      // Limpiar elementos del layout principal
      const pageContainers = document.querySelectorAll('.min-h-screen, [class*="bg-hueso"]')
      pageContainers.forEach((container: Element) => {
        const htmlContainer = container as HTMLElement
        if (htmlContainer.style) {
          htmlContainer.style.removeProperty('background-color')
          htmlContainer.style.removeProperty('background')
        }
      })

      // Limpiar divs con bg-white
      const whiteBgDivs = document.querySelectorAll('div[class*="bg-white"]')
      whiteBgDivs.forEach((div: Element) => {
        const htmlDiv = div as HTMLElement
        if (htmlDiv.style) {
          htmlDiv.style.removeProperty('background-color')
          htmlDiv.style.removeProperty('background')
          htmlDiv.style.removeProperty('border-color')
          htmlDiv.style.removeProperty('box-shadow')
        }
      })

      // Limpiar textos específicos
      const authTexts = document.querySelectorAll('h1, p, label, span')
      authTexts.forEach((text: Element) => {
        const htmlText = text as HTMLElement
        if (htmlText.style) {
          htmlText.style.removeProperty('color')
        }
      })

      // Limpiar elementos con clases problemáticas
      const problemClasses = [
        '.bg-white',
        '.rounded-2xl', 
        '.shadow-xl',
        '.border-gray-200'
      ]
      
      problemClasses.forEach(className => {
        const elements = document.querySelectorAll(className)
        elements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement
          if (htmlElement.style) {
            htmlElement.style.removeProperty('background-color')
            htmlElement.style.removeProperty('background')
            htmlElement.style.removeProperty('border-color')
            htmlElement.style.removeProperty('box-shadow')
          }
        })
      })

      // Limpiar estilos forzados y restaurar a modo claro
      const clerkElements = document.querySelectorAll('[class*="cl-"], [data-clerk], [role="dialog"]')
      
      clerkElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement
        
        // Remover clase dark
        htmlElement.classList.remove('dark')
        
        // Limpiar estilos inline forzados
        if (htmlElement.style) {
          htmlElement.style.removeProperty('background-color')
          htmlElement.style.removeProperty('color')
          htmlElement.style.removeProperty('border-color')
          htmlElement.style.removeProperty('border-right')
          htmlElement.style.removeProperty('border')
          htmlElement.style.removeProperty('background')
        }
      })

      // Limpiar elementos específicos
      const allSelectors = [
        '.cl-card',
        '.cl-signIn-start',
        '.cl-signUp-start', 
        '.cl-rootBox',
        '.cl-footer',
        '.cl-signIn-footer',
        '.cl-signUp-footer',
        '.cl-userProfile-content',
        '.cl-userButtonPopoverCard',
        '[class*="cl-internal-"]',
        '.cl-navbar',
        '.cl-userProfile-navbar',
        '.cl-dividerLine',
        '.cl-dividerRow',
        '[data-clerk-modal]',
        '.cl-modal',
        '.cl-modalContent',
        '.cl-componentModal',
        '.cl-modalBackdrop',
        '[data-clerk-modal-backdrop]',
        '.cl-signIn',
        '.cl-signUp',
        '.cl-main',
        '.cl-header',
        '.cl-formContainer',
        '.cl-form',
        '.cl-socialButtonsContainer',
        '.cl-divider',
        '.cl-alternativeMethodsBlockButton'
      ]

      allSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement
          if (htmlElement.style) {
            htmlElement.style.removeProperty('background-color')
            htmlElement.style.removeProperty('color')
            htmlElement.style.removeProperty('border-color')
            htmlElement.style.removeProperty('border-right')
            htmlElement.style.removeProperty('border')
            htmlElement.style.removeProperty('background')
          }
          
          // También limpiar todos los hijos
          const children = element.querySelectorAll('*')
          children.forEach((child: Element) => {
            const htmlChild = child as HTMLElement
            if (htmlChild.style) {
              htmlChild.style.removeProperty('background-color')
              htmlChild.style.removeProperty('color')
              htmlChild.style.removeProperty('border-color')
              htmlChild.style.removeProperty('border')
              htmlChild.style.removeProperty('background')
            }
          })
        })
      })
    }

    const applyTheme = () => {
      if (theme === 'dark') {
        forceClerkDarkMode()
      } else {
        clearClerkDarkMode()
      }
    }

    // Ejecutar inmediatamente
    applyTheme()

    // Configurar un observer para detectar cambios en el DOM
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || 
            (mutation.type === 'attributes' && 
             (mutation.attributeName === 'class' || mutation.attributeName === 'style'))) {
          shouldUpdate = true
        }
      })
      
      if (shouldUpdate) {
        setTimeout(applyTheme, 10)
      }
    })

    // Observar cambios en todo el documento
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    // Ejecutar periódicamente para asegurar consistencia
    const interval = setInterval(applyTheme, 500)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [theme])

  return null
}

export default ClerkDarkMode

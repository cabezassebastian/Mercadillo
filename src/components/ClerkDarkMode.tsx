import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const ClerkDarkMode = () => {
  const { theme } = useTheme()

  useEffect(() => {
    const forceClerkDarkMode = () => {
      // Aplicar dark mode a contenedores principales en páginas de auth
      const pageContainers = document.querySelectorAll('.min-h-screen, [class*="bg-hueso"]')
      pageContainers.forEach((container: Element) => {
        const htmlContainer = container as HTMLElement
        htmlContainer.style.setProperty('background-color', '#111827', 'important')
      })

      // Forzar dark mode a elementos de Clerk
      const clerkElements = document.querySelectorAll('[class*="cl-"], [data-clerk], [role="dialog"]')
      clerkElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement
        htmlElement.classList.add('dark')
        
        const isButton = htmlElement.classList.contains('cl-formButtonPrimary')
        const isLink = htmlElement.classList.contains('cl-footerActionLink')
        const isImage = htmlElement.tagName === 'IMG' || htmlElement.tagName === 'SVG'
        
        if (!isButton && !isLink && !isImage) {
          htmlElement.style.setProperty('background-color', '#1f2937', 'important')
          htmlElement.style.setProperty('color', '#f3f4f6', 'important')
          htmlElement.style.setProperty('border-color', '#374151', 'important')
        }
      })

      // Aplicar dark mode específicamente al UserButton y su menú desplegable
      const userButtonElements = document.querySelectorAll('.cl-userButtonPopoverCard, .cl-card, .cl-popoverBox, .cl-userPreview, .cl-userButtonPopoverRootBox')
      userButtonElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement
        htmlElement.style.setProperty('background-color', '#1f2937', 'important')
        htmlElement.style.setProperty('color', '#f3f4f6', 'important')
        htmlElement.style.setProperty('border-color', '#374151', 'important')
      })

      // Inyectar CSS personalizado para forzar el modo oscuro en el UserButton
      let darkModeStyle = document.getElementById('clerk-dark-mode-styles')
      if (!darkModeStyle) {
        darkModeStyle = document.createElement('style')
        darkModeStyle.id = 'clerk-dark-mode-styles'
        document.head.appendChild(darkModeStyle)
      }
      
      darkModeStyle.textContent = `
        /* Aplicar modo oscuro específicamente al UserButton y su menú */
        .cl-userButtonPopoverCard,
        .cl-card,
        .cl-popoverBox,
        .cl-userPreview,
        .cl-userButtonPopoverRootBox,
        .cl-popoverArrow {
          background-color: #1f2937 !important;
          border: 1px solid #374151 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2) !important;
        }
        
        /* Elementos de texto del menú */
        .cl-userButtonPopoverCard .cl-userPreview,
        .cl-userButtonPopoverCard .cl-menuItem,
        .cl-userButtonPopoverCard .cl-menuItemTextPrimary,
        .cl-userButtonPopoverCard .cl-menuItemTextSecondary {
          color: #f3f4f6 !important;
          background-color: transparent !important;
        }
        
        /* Hover effects más naturales */
        .cl-menuItem:hover {
          background-color: #374151 !important;
          border-radius: 6px !important;
        }
        
        /* Flecha del popover */
        .cl-popoverArrow::before,
        .cl-popoverArrow::after {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        
        /* Asegurar que el contenedor principal tenga buen aspecto */
        .cl-userButtonPopoverRootBox {
          border-radius: 8px !important;
          overflow: hidden !important;
        }
        
        /* Corregir sombra del avatar del usuario */
        .cl-userButtonAvatarBox,
        .cl-avatarBox {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2) !important;
          border: 1px solid #374151 !important;
        }
        
        /* Separadores del menú */
        .cl-menuItemDivider {
          background-color: #374151 !important;
        }
        
        /* Eliminar bordes blancos y líneas */
        .cl-userButtonPopoverCard::after,
        .cl-userButtonPopoverCard::before,
        .cl-menuItem::after,
        .cl-menuItem::before,
        .cl-userButtonPopoverFooter,
        .cl-userButtonPopoverActions {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          border-bottom: none !important;
          border-top: none !important;
        }
        
        /* Eliminar líneas blancas específicamente */
        .cl-userButtonPopoverCard *::after,
        .cl-userButtonPopoverCard *::before {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        
        /* Footer y elementos finales del popover */
        .cl-userButtonPopoverCard > *:last-child,
        .cl-menuItem:last-child {
          border-bottom: none !important;
          border-bottom-color: transparent !important;
        }
        
        /* Forzar transparencia en elementos que puedan crear líneas */
        .cl-userButtonPopoverCard hr,
        .cl-userButtonPopoverCard .cl-divider,
        .cl-userButtonPopoverCard [role="separator"] {
          background-color: #374151 !important;
          border-color: #374151 !important;
          opacity: 0.3 !important;
        }
      `

      // Función más específica para el UserButton
      const fixUserButtonElements = () => {
        // Solo aplicar a elementos específicos del UserButton popover
        const userButtonPopover = document.querySelector('.cl-userButtonPopoverCard')
        if (userButtonPopover) {
          const popoverElements = userButtonPopover.querySelectorAll('*')
          popoverElements.forEach((element: Element) => {
            const htmlElement = element as HTMLElement
            const computedStyle = window.getComputedStyle(htmlElement)
            
            // Solo corregir fondos blancos en el popover del UserButton
            if (computedStyle.backgroundColor === 'rgb(255, 255, 255)' || 
                computedStyle.backgroundColor === 'white') {
              htmlElement.style.setProperty('background-color', 'transparent', 'important')
            }
            
            // Eliminar bordes blancos específicamente
            if (computedStyle.borderBottomColor === 'rgb(255, 255, 255)' ||
                computedStyle.borderTopColor === 'rgb(255, 255, 255)' ||
                computedStyle.borderBottomColor === 'white' ||
                computedStyle.borderTopColor === 'white') {
              htmlElement.style.setProperty('border-bottom-color', '#374151', 'important')
              htmlElement.style.setProperty('border-top-color', '#374151', 'important')
            }
          })
          
          // Buscar específicamente elementos hr o separadores
          const separators = userButtonPopover.querySelectorAll('hr, [role="separator"], .cl-divider')
          separators.forEach((separator: Element) => {
            const htmlSeparator = separator as HTMLElement
            htmlSeparator.style.setProperty('background-color', '#374151', 'important')
            htmlSeparator.style.setProperty('border-color', '#374151', 'important')
            htmlSeparator.style.setProperty('opacity', '0.3', 'important')
          })
        }
      }

      // Ejecutar solo cuando sea necesario
      fixUserButtonElements()
      setTimeout(fixUserButtonElements, 200)

      // Forzar estilos específicos para botones Continue en dark mode
      const primaryButtons = document.querySelectorAll('.cl-formButtonPrimary, button[type="submit"]')
      primaryButtons.forEach((button: Element) => {
        const htmlButton = button as HTMLElement
        if (htmlButton.textContent?.includes('Continue') || htmlButton.classList.contains('cl-formButtonPrimary')) {
          htmlButton.style.setProperty('background-color', '#1f2937', 'important')
          htmlButton.style.setProperty('color', '#f3f4f6', 'important')
          htmlButton.style.setProperty('border', '1px solid #374151', 'important')
          htmlButton.style.setProperty('text-decoration', 'none', 'important')
        }
      })
    }

    const clearClerkDarkMode = () => {
      // Limpiar estilos de modo oscuro
      const pageContainers = document.querySelectorAll('.min-h-screen, [class*="bg-hueso"]')
      pageContainers.forEach((container: Element) => {
        const htmlContainer = container as HTMLElement
        htmlContainer.style.removeProperty('background-color')
      })

      // Limpiar elementos de Clerk
      const clerkElements = document.querySelectorAll('[class*="cl-"], [data-clerk], [role="dialog"]')
      clerkElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement
        htmlElement.classList.remove('dark')
        
        const isPrimaryButton = htmlElement.classList.contains('cl-formButtonPrimary') ||
                               htmlElement.textContent?.includes('Continue')
        
        if (!isPrimaryButton) {
          htmlElement.style.removeProperty('background-color')
          htmlElement.style.removeProperty('color')
          htmlElement.style.removeProperty('border-color')
        }
      })

      // Limpiar estilos específicos del UserButton
      const userButtonElements = document.querySelectorAll('.cl-userButtonPopoverCard, .cl-card, .cl-popoverBox, .cl-userPreview, .cl-userButtonPopoverRootBox, .cl-popoverArrow, .cl-userButtonAvatarBox, .cl-avatarBox, .cl-menuItem, .cl-menuItemDivider')
      userButtonElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement
        htmlElement.style.removeProperty('background-color')
        htmlElement.style.removeProperty('color')
        htmlElement.style.removeProperty('border-color')
        htmlElement.style.removeProperty('border-radius')
        htmlElement.style.removeProperty('border')
        htmlElement.style.removeProperty('box-shadow')
        htmlElement.style.removeProperty('overflow')
      })

      // Remover CSS personalizado inyectado
      const darkModeStyle = document.getElementById('clerk-dark-mode-styles')
      if (darkModeStyle) {
        darkModeStyle.remove()
      }

      // Restaurar botón Continue a modo claro
      const primaryButtons = document.querySelectorAll('.cl-formButtonPrimary, button[type="submit"]')
      primaryButtons.forEach((button: Element) => {
        const htmlButton = button as HTMLElement
        const isPrimaryButton = htmlButton.textContent?.includes('Continue') ||
                               htmlButton.classList.contains('cl-formButtonPrimary')
        
        if (isPrimaryButton) {
          htmlButton.style.setProperty('background-color', '#FFD700', 'important')
          htmlButton.style.setProperty('color', '#333333', 'important')
          htmlButton.style.setProperty('border', 'none', 'important')
          htmlButton.style.setProperty('text-decoration', 'none', 'important')
        }
      })
    }

    const applyTheme = () => {
      if (theme === 'dark') {
        forceClerkDarkMode()
      } else {
        clearClerkDarkMode()
      }
    }

    applyTheme()

    const observer = new MutationObserver(() => {
      setTimeout(applyTheme, 10)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    const interval = setInterval(applyTheme, 300)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [theme])

  return null
}

export default ClerkDarkMode

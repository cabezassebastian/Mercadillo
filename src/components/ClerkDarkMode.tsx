import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const ClerkDarkMode = () => {
  const { theme } = useTheme()

  useEffect(() => {
    // Suprimir errores de red específicos de Clerk que no afectan funcionalidad
    const originalConsoleError = console.error
    console.error = (...args) => {
      // Filtrar errores específicos de commerce/statements de Clerk
      const errorMessage = args.join(' ')
      if (
        errorMessage.includes('commerce/statements') ||
        (errorMessage.includes('403') && errorMessage.includes('clerk')) ||
        (errorMessage.includes('Failed to load resource') && errorMessage.includes('clerk'))
      ) {
        // Silenciar estos errores específicos
        return
      }
      // Mostrar otros errores normalmente
      originalConsoleError.apply(console, args)
    }

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
        .cl-userButtonPopoverCard {
          background-color: #1f2937 !important;
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2) !important;
          overflow: hidden !important;
        }
        
        .cl-card,
        .cl-popoverBox,
        .cl-userButtonPopoverRootBox {
          background-color: #1f2937 !important;
          border: none !important;
          border-radius: 8px !important;
        }
        
        /* Eliminar borde del área de información del usuario */
        .cl-userPreview {
          background-color: #1f2937 !important;
          border: none !important;
          border-bottom: none !important;
        }
        
        /* Elementos de texto del menú */
        .cl-userButtonPopoverCard .cl-userPreview,
        .cl-userButtonPopoverCard .cl-menuItem,
        .cl-userButtonPopoverCard .cl-menuItemTextPrimary,
        .cl-userButtonPopoverCard .cl-menuItemTextSecondary {
          color: #f3f4f6 !important;
          background-color: transparent !important;
        }
        
        /* Botones del menú sin bordes extraños */
        .cl-menuItem {
          background-color: transparent !important;
          border: none !important;
          border-radius: 6px !important;
        }
        
        /* Hover effects más naturales */
        .cl-menuItem:hover {
          background-color: #374151 !important;
          border-radius: 6px !important;
        }
        
        /* Hacer que el Sign out tenga esquinas sutiles como Manage account */
        .cl-menuItem:last-child {
          background-color: transparent !important;
          border: none !important;
          border-radius: 6px !important;
          position: relative !important;
        }
        
        /* Eliminar el contenedor principal que causa esquinas pronunciadas */
        .cl-userButtonPopoverCard {
          background-color: #1f2937 !important;
          border: none !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2) !important;
          overflow: visible !important;
        }
        
        /* Eliminar todos los pseudo-elementos que causen esquinas blancas */
        .cl-userButtonPopoverCard::before,
        .cl-userButtonPopoverCard::after,
        .cl-userPreview::before,
        .cl-userPreview::after,
        .cl-menuItem::before,
        .cl-menuItem::after {
          display: none !important;
          content: none !important;
        }
        
        /* Corregir sombra del avatar del usuario sin bordes extraños */
        .cl-userButtonAvatarBox,
        .cl-avatarBox {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2) !important;
          border: none !important;
        }
        
        /* Separadores del menú */
        .cl-menuItemDivider {
          background-color: #374151 !important;
          border: none !important;
        }
        
        /* Estilos para la página de gestión de cuenta (Manage account) */
        /* Forzar TODOS los elementos del UserProfile a ser oscuros */
        .cl-userProfile,
        .cl-userProfile *,
        .cl-profilePage,
        .cl-profilePage *,
        .cl-profileSection,
        .cl-profileSectionContent {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
        }
        
        /* Contenedor principal de la página de cuenta */
        .cl-userProfile .cl-card,
        .cl-profilePage .cl-card {
          background-color: #1f2937 !important;
          border: none !important;
        }
        
        /* FORZAR el sidebar/barra lateral izquierda a ser oscura */
        .cl-userProfile > div,
        .cl-userProfile > div > div,
        .cl-userProfile .cl-navbar,
        .cl-userProfile .cl-profileSectionPrimaryButton,
        .cl-navbarMobileMenuRow,
        .cl-navbarMobileMenuButton {
          background-color: #1f2937 !important;
          background: #1f2937 !important;
          color: #f3f4f6 !important;
        }
        
        /* Eliminar cualquier fondo blanco en el modal/container principal */
        [data-clerk-modal],
        [data-clerk-modal] *,
        .cl-modalContent,
        .cl-modalContent *,
        .cl-rootBox,
        .cl-rootBox * {
          background-color: #1f2937 !important;
          background: #1f2937 !important;
        }
        
        /* Títulos y subtítulos de la página de cuenta */
        .cl-profileSectionTitle,
        .cl-profileSectionSubtitle,
        .cl-userProfile h1,
        .cl-userProfile h2,
        .cl-userProfile h3 {
          color: #f3f4f6 !important;
        }
        
        /* Área de contenido principal */
        .cl-profileSectionContent,
        .cl-userProfile .cl-profileSection {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
        }
        
        /* Navbar de la página de cuenta */
        .cl-navbar,
        .cl-userProfile .cl-navbar {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        
        /* Botones de navegación */
        .cl-navbarButton {
          color: #f3f4f6 !important;
          background-color: transparent !important;
        }
        
        .cl-navbarButton:hover {
          background-color: #374151 !important;
        }
        
        /* Campos de entrada y formularios */
        .cl-userProfile .cl-formFieldInput {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: #f3f4f6 !important;
        }
        
        /* Etiquetas de formulario */
        .cl-userProfile .cl-formFieldLabel {
          color: #f3f4f6 !important;
        }
      `

      // Función específica para corregir elementos problemáticos
      const fixUserButtonElements = () => {
        const userButtonPopover = document.querySelector('.cl-userButtonPopoverCard')
        if (userButtonPopover) {
          const htmlPopover = userButtonPopover as HTMLElement
          // Solo aplicar estilos básicos de contenedor con esquinas sutiles
          htmlPopover.style.setProperty('background-color', '#1f2937', 'important')
          htmlPopover.style.setProperty('border', 'none', 'important')
          htmlPopover.style.setProperty('border-radius', '6px', 'important')
          htmlPopover.style.setProperty('overflow', 'visible', 'important')
          
          // Eliminar bordes del área de usuario
          const userPreview = userButtonPopover.querySelector('.cl-userPreview')
          if (userPreview) {
            const htmlPreview = userPreview as HTMLElement
            htmlPreview.style.setProperty('border', 'none', 'important')
            htmlPreview.style.setProperty('border-bottom', 'none', 'important')
          }
          
          // Hacer que todos los elementos del menú tengan el mismo border-radius sutil
          const menuItems = userButtonPopover.querySelectorAll('.cl-menuItem')
          menuItems.forEach((item: Element) => {
            const htmlItem = item as HTMLElement
            htmlItem.style.setProperty('border-radius', '6px', 'important')
          })
        }
      }
      
      // Función específica para la página de gestión de cuenta
      const fixUserProfilePage = () => {
        // Aplicar fondo oscuro a TODOS los elementos relacionados con UserProfile
        const allClerkElements = document.querySelectorAll('[class*="cl-userProfile"], [class*="cl-profilePage"], [class*="cl-modal"], [data-clerk-modal], .cl-rootBox')
        allClerkElements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement
          htmlElement.style.setProperty('background-color', '#1f2937', 'important')
          htmlElement.style.setProperty('background', '#1f2937', 'important')
          htmlElement.style.setProperty('color', '#f3f4f6', 'important')
          
          // También aplicar a todos los hijos
          const children = htmlElement.querySelectorAll('*')
          children.forEach((child: Element) => {
            const htmlChild = child as HTMLElement
            htmlChild.style.setProperty('background-color', '#1f2937', 'important')
            htmlChild.style.setProperty('background', '#1f2937', 'important')
            htmlChild.style.setProperty('color', '#f3f4f6', 'important')
          })
        })
        
        // Buscar cualquier elemento con fondo blanco y forzarlo a oscuro
        const allElements = document.querySelectorAll('*')
        allElements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement
          const computedStyle = window.getComputedStyle(htmlElement)
          
          if (computedStyle.backgroundColor === 'rgb(255, 255, 255)' || 
              computedStyle.backgroundColor === 'white' ||
              computedStyle.backgroundColor === '#ffffff' ||
              computedStyle.backgroundColor === '#fff') {
            // Solo aplicar si el elemento está dentro del modal de Clerk
            const isInClerkModal = htmlElement.closest('[class*="cl-"], [data-clerk-modal]')
            if (isInClerkModal) {
              htmlElement.style.setProperty('background-color', '#1f2937', 'important')
              htmlElement.style.setProperty('background', '#1f2937', 'important')
            }
          }
        })
      }

      // Función AGRESIVA específica para las esquinas blancas del UserButton
      const fixUserButtonCorners = () => {
        // Buscar específicamente los elementos del UserButton
        const userButtonElements = document.querySelectorAll('.cl-userButtonPopoverCard, .cl-userButtonPopoverCard *, .cl-menuItem, .cl-menuItem *, .cl-userPreview, .cl-userPreview *')
        userButtonElements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement
          htmlElement.style.setProperty('background-color', '#1f2937', 'important')
          htmlElement.style.setProperty('background', '#1f2937', 'important')
          htmlElement.style.setProperty('border', 'none', 'important')
          htmlElement.style.setProperty('border-radius', '6px', 'important')
        })
        
        // Buscar CUALQUIER elemento con fondo blanco dentro del dropdown del UserButton
        const allElements = document.querySelectorAll('*')
        allElements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement
          const computedStyle = window.getComputedStyle(htmlElement)
          
          if (computedStyle.backgroundColor === 'rgb(255, 255, 255)' || 
              computedStyle.backgroundColor === 'white' ||
              computedStyle.backgroundColor === '#ffffff' ||
              computedStyle.backgroundColor === '#fff') {
            // Solo aplicar si el elemento está dentro del UserButton
            const isInUserButton = htmlElement.closest('.cl-userButtonPopoverCard, .cl-userButtonPopoverRootBox, .cl-popoverBox')
            if (isInUserButton) {
              htmlElement.style.setProperty('background-color', '#1f2937', 'important')
              htmlElement.style.setProperty('background', '#1f2937', 'important')
              htmlElement.style.setProperty('border', 'none', 'important')
              htmlElement.style.setProperty('border-radius', '6px', 'important')
            }
          }
        })
      }

      // Ejecutar las correcciones múltiples veces para elementos dinámicos
      fixUserButtonElements()
      fixUserProfilePage()
      fixUserButtonCorners()
      setTimeout(fixUserButtonElements, 100)
      setTimeout(fixUserProfilePage, 100)
      setTimeout(fixUserButtonCorners, 100)
      setTimeout(fixUserProfilePage, 300)
      setTimeout(fixUserButtonCorners, 300)
      setTimeout(fixUserProfilePage, 500)
      setTimeout(fixUserButtonCorners, 500)
      setTimeout(fixUserProfilePage, 1000)
      setTimeout(fixUserButtonCorners, 1000)

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
      // Restaurar console.error original al desmontar
      console.error = originalConsoleError
    }
  }, [theme])

  return null
}

export default ClerkDarkMode

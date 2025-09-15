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
      const userButtonElements = document.querySelectorAll('[class*="cl-userButton"], [class*="cl-popover"], [class*="cl-userPreview"], [class*="cl-card"], [class*="cl-menuItem"], [class*="cl-menuList"], [class*="cl-dropdown"], [class*="cl-avatarBox"], [class*="cl-popoverBox"], [data-testid*="user-button"], [role="button"][class*="cl-"], [role="menuitem"], [role="menu"]')
      userButtonElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement
        htmlElement.style.setProperty('background-color', '#1f2937', 'important')
        htmlElement.style.setProperty('color', '#f3f4f6', 'important')
        htmlElement.style.setProperty('border-color', '#374151', 'important')
      })

      // Forzar esquinas redondeadas oscuras específicamente
      const cornerElements = document.querySelectorAll('[class*="cl-popover"], [class*="cl-card"], [class*="cl-dropdown"], [class*="cl-popoverBox"]')
      cornerElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement
        htmlElement.style.setProperty('background-color', '#1f2937', 'important')
        htmlElement.style.setProperty('border-radius', '8px', 'important')
        htmlElement.style.setProperty('border', '1px solid #374151', 'important')
        htmlElement.style.setProperty('box-shadow', '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)', 'important')
      })

      // Aplicar dark mode a cualquier elemento que contenga el menú del usuario
      const menuContainers = document.querySelectorAll('div[style*="position: absolute"], div[style*="z-index"], [data-portal="true"]')
      menuContainers.forEach((element: Element) => {
        const htmlElement = element as HTMLElement
        // Solo aplicar si parece ser un menú de Clerk
        const hasClerkClasses = htmlElement.querySelector('[class*="cl-"]')
        if (hasClerkClasses) {
          htmlElement.style.setProperty('background-color', '#1f2937', 'important')
          htmlElement.style.setProperty('border-radius', '8px', 'important')
        }
      })

      // Inyectar CSS personalizado para forzar el modo oscuro en el UserButton
      let darkModeStyle = document.getElementById('clerk-dark-mode-styles')
      if (!darkModeStyle) {
        darkModeStyle = document.createElement('style')
        darkModeStyle.id = 'clerk-dark-mode-styles'
        document.head.appendChild(darkModeStyle)
      }
      
      darkModeStyle.textContent = `
        /* Forzar modo oscuro en todos los elementos de Clerk */
        [class*="cl-popover"], 
        [class*="cl-card"], 
        [class*="cl-dropdown"],
        [class*="cl-popoverBox"],
        [class*="cl-userPreview"],
        [class*="cl-menuList"],
        [class*="cl-menuItem"] {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
          border-color: #374151 !important;
          border-radius: 8px !important;
        }
        
        /* Esquinas específicas del menú desplegable */
        [class*="cl-popover"]::before,
        [class*="cl-popover"]::after,
        [class*="cl-card"]::before,
        [class*="cl-card"]::after {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        
        /* UserButton hover effects */
        [class*="cl-menuItem"]:hover {
          background-color: #374151 !important;
        }
      `

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
      const userButtonElements = document.querySelectorAll('[class*="cl-userButton"], [class*="cl-popover"], [class*="cl-userPreview"], [class*="cl-card"], [class*="cl-menuItem"], [class*="cl-menuList"], [class*="cl-dropdown"], [class*="cl-avatarBox"], [class*="cl-popoverBox"], [data-testid*="user-button"], [role="button"][class*="cl-"], [role="menuitem"], [role="menu"]')
      userButtonElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement
        htmlElement.style.removeProperty('background-color')
        htmlElement.style.removeProperty('color')
        htmlElement.style.removeProperty('border-color')
        htmlElement.style.removeProperty('border-radius')
        htmlElement.style.removeProperty('border')
        htmlElement.style.removeProperty('box-shadow')
      })

      // Limpiar contenedores de menú
      const menuContainers = document.querySelectorAll('div[style*="position: absolute"], div[style*="z-index"], [data-portal="true"]')
      menuContainers.forEach((element: Element) => {
        const htmlElement = element as HTMLElement
        const hasClerkClasses = htmlElement.querySelector('[class*="cl-"]')
        if (hasClerkClasses) {
          htmlElement.style.removeProperty('background-color')
          htmlElement.style.removeProperty('border-radius')
        }
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

    const interval = setInterval(applyTheme, 500)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [theme])

  return null
}

export default ClerkDarkMode

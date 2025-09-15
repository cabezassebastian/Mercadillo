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

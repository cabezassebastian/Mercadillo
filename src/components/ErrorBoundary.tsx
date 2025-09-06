import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de fallback
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-hueso text-gris-oscuro p-4 text-center">
          <h1 className="text-4xl font-bold mb-4">⚠️ Algo salio mal.</h1>
          <p className="text-lg mb-4">Ha ocurrido un error inesperado en la aplicacion.</p>
          <p className="text-md text-gray-600">Por favor, recarga la pagina o intentalo de nuevo mas tarde.</p>
          {import.meta.env.DEV && (
            <p className="text-sm text-red-500 mt-4">Revisa la consola para mas detalles del error.</p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

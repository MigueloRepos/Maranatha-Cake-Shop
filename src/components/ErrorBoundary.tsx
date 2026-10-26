import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-card text-foreground rounded-xl border border-border m-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Ha ocurrido un detalle inesperado
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Estamos trabajando para que todo esté perfecto. Por favor, pulsa el botón para recargar la experiencia.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-6 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

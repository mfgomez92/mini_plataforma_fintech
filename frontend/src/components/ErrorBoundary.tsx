import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, Button } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-belo-dark-base flex items-center justify-center p-4">
          <Card className="max-w-md w-full border border-belo-dark-border text-center !p-8 relative">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-belo-semantic-error"></div>
            <h2 className="text-2xl font-bold text-belo-light-text mb-2">Algo salió mal</h2>
            <p className="text-belo-light-muted mb-6 text-sm">
              La aplicación experimentó un error inesperado. Por favor, intenta restablecer la página.
            </p>
            {this.state.error && (
              <pre className="text-left text-xs bg-black/30 p-4 rounded-xl text-belo-semantic-error mb-6 overflow-x-auto max-h-40 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReset} className="w-full bg-belo-semantic-error hover:bg-red-700 text-white font-medium">
              Restablecer Aplicación
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

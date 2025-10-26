export {}; // ensure this file is a module

declare global {
  interface Window {
    openai?: {
      app?: {
        registerComponent?: (definition: {
          id: string;
          displayName?: string;
          render: (context: { element: HTMLElement; mode: "inline" | "fullscreen"; state?: unknown }) => () => void;
        }) => void;
        openFullscreen?: (options: { id: string; initialState?: unknown }) => Promise<void>;
        storage?: {
          getItem?: (key: string) => Promise<any>;
          setItem?: (key: string, value: any) => Promise<void>;
        };
      };
      actions?: {
        callTool?: (options: { name: string; arguments: Record<string, unknown> }) => Promise<any>;
      };
    };
  }
}

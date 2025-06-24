let counter = 0;

export function useUniqueId(idFromProps?: string | null): string {
  if (idFromProps) {
    return idFromProps;
  }
  
  counter++;
  return `vue-resizable-panels:${counter}`;
}
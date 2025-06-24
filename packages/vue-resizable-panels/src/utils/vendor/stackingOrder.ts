export function compare(elementA: Element, elementB: Element): number {
  // 简化版本的堆叠顺序比较
  // 完整版本需要考虑z-index, position等复杂情况
  // 这里提供基本的DOM树比较
  
  if (elementA === elementB) {
    return 0;
  }
  
  if (elementA.contains(elementB)) {
    return -1;
  }
  
  if (elementB.contains(elementA)) {
    return 1;
  }
  
  // 比较文档位置
  const position = elementA.compareDocumentPosition(elementB);
  
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return -1;
  }
  
  if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return 1;
  }
  
  return 0;
} 
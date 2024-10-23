export function getTextNodes(node: Node): Node[] {
  const textNodes: Node[] = [];

  if (node.nodeType === 3) {
    textNodes.push(node);
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i];
      if (childNode.nodeName === 'A' || childNode.nodeName === 'CODE') {
        continue;
      }
      textNodes.push(...getTextNodes(node.childNodes[i]));
    }
  }
  return textNodes;
}

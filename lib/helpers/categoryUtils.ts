import { CategoryNode } from "./apiType";

export const getChildCategory = (nodes: CategoryNode[]): CategoryNode | undefined => {
  if (!nodes || nodes.length === 0) return undefined;
  return nodes.reduce((deepest, current) =>
    current.uri.split("/").length > deepest.uri.split("/").length ? current : deepest
  , nodes[0]);
};

import { CategoryNode } from "./apiType";

export const getChildCategory = (nodes: CategoryNode[]): CategoryNode => {
  return nodes.reduce((deepest, current) =>
    current.uri.split("/").length > deepest.uri.split("/").length ? current : deepest
  , nodes[0]);
};

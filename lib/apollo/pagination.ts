import { FieldPolicy } from "@apollo/client";

/**
 * Nexus-style pagination policy.
 * Unlike relay-style, this uses offset/limit pagination.
 */
export function nexusStylePagination(
  keyArgs: FieldPolicy["keyArgs"] = false
): FieldPolicy {
  const cursorArgs = ["first", "after", "last", "before"];
  if (Array.isArray(keyArgs)) {
    return {
      keyArgs: [...keyArgs, ...cursorArgs],
    };
  }
  return {
    keyArgs,
  };
}

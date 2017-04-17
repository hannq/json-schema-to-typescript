import { whiteBright } from 'cli-color'
import { uniqBy } from 'lodash'
import { AST, T_ANY } from './types/AST'
import { log } from "./utils";

export function optimize(ast: AST, processed = new Map<AST, AST>()): AST {

  log(whiteBright.bgCyan('optimizer'), ast)

  if (processed.has(ast)) {
    return processed.get(ast)!
  }

  processed.set(ast, ast)

  switch (ast.type) {
    case 'INTERFACE':
      return Object.assign(ast, {
        params: ast.params.map(_ =>
          Object.assign(_, { ast: optimize(_.ast, processed) })
        )
      })
    case 'INTERSECTION':
    case 'UNION':

      // [A, B, C, Any] -> Any
      if (ast.params.some(_ => _ === T_ANY)) {
        log(whiteBright.bgCyan('optimizer'), ast, '<- T_ANY')
        return T_ANY
      }

      // [A, B, B] -> [A, B]
      ast.params = uniqBy(ast.params, _ =>
        `${_.type}------${(_ as any).params}`
      )

      return Object.assign(ast, {
        params: ast.params.map(_ => optimize(_, processed))
      })
    default:
      return ast
  }
}

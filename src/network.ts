import { Module } from './graph'
import { MODULES } from './examples'

export module Network {
  export function checkModuleRepo(module_id: string): Module {
    // TODO: make a network request
    return MODULES[module_id]
  }
}

import fs from 'fs-extra'
import path from 'path'

import type { WxProj } from '@catalyze/types'

export const getWxProj = async (): Promise<WxProj> => {
  const cwd = process.cwd()
  const proj: WxProj = Object.create({
    root: null
  })

  if (await fs.exists(path.resolve(cwd, 'project.config.json'))) {
    const config = await fs.readJson(path.resolve(cwd, 'project.config.json'))
    const root = config.miniprogramRoot
    
    if (
      root.miniprogramRoot !== undefined &&
      root.miniprogramRoot !== null
    ) {
      proj.root = root.miniprogramRoot
    }
  } 

  if (
    proj.root === undefined ||
    proj.root === null
  ) {
    if (await fs.exists(path.resolve(cwd, 'app.json'))) {
      const app = await fs.readJson(path.resolve(cwd, 'app.json'))
      if (app.pages !== undefined && app.pages !== null) {
        proj.root = cwd
      }
    }
  }

  return proj
}
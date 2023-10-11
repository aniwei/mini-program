import axios from 'axios'
import pkg from '../../package.json'

export const upgrade = () => {
  axios.get('https://registry.npmjs.org/@catalyzed/cli').then(result => {
    console.log(`本地版本：`, pkg.version)
    console.log(`远程版本：`, result.data['dist-tags'].latest)
  })
}
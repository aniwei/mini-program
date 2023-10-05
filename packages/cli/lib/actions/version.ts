import pkg from '../../package.json'

export const version = async () => {
  console.log(pkg.version)
}
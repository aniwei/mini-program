import postcss from 'postcss'

export const isKeyframes = (node: postcss.AtRule) => {
  return node.type === 'atrule' && /^(-\w+-)?keyframes$/.test(node.name)
}

export const isURI = (url: string) => {
  return (
    /^\/\//.test(url) ||
    /^data:\/\//.test(url) ||
    /^https?:\/\//.test(url)
  )
}
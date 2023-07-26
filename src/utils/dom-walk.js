import noop from './noop'

async function walk (children, callback = noop) {
  for (const child of children) {
    if (!await callback(child)) continue
    await walk(child.children, callback)
  }
}

export default walk

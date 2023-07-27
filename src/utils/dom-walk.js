async function walk (children, callback) {
  for (const child of children) {
    if (!await callback(child)) continue
    await walk(child.children, callback)
  }
}

export default walk

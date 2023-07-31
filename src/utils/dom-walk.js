async function walk (element, callback) {
  if (!await callback(element)) return

  for (const child of element.children) {
    await walk(child, callback)
  }
}

export default walk

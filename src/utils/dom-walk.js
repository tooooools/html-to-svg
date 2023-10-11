async function walk (element, callback, { sort = () => 1 } = {}) {
  if (!await callback(element)) return

  for (const child of Array.from(element.children).sort(sort)) {
    await walk(child, callback, { sort })
  }
}

export default walk

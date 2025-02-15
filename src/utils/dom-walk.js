async function walk (element, callback, { sort = () => 1 } = {}, depth = 0, index = 0) {
  await callback(element, depth, index)

  const children = Array.from(element.children).sort(sort)
  for (let index = 0; index < children.length; index++) {
    await walk(children[index], callback, { sort }, depth + 1, index)
  }
}

export default walk

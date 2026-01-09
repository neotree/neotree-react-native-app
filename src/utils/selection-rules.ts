export type RuleItem = {
  itemId?: string
  id?: string
  key?: string
  value?: string
  label?: string
  exclusiveGroup?: string
  forbidWith?: string[]
}

export type SelectionConflict = {
  selected: RuleItem
  conflicts: RuleItem[]
  reason: "exclusive_group" | "forbid_with"
  group?: string
}

const normalize = (value?: string | number | null) => `${value || ""}`.trim()

const getIdentifiers = (item: RuleItem) => {
  const identifiers = [
    normalize(item.itemId),
    normalize(item.id),
    normalize(item.key),
    normalize(item.value),
  ].filter(Boolean)
  return Array.from(new Set(identifiers))
}

const itemMatchesIdentifier = (item: RuleItem, identifier: string) => {
  const identifiers = getIdentifiers(item)
  return identifiers.includes(normalize(identifier))
}

const getSelectedItems = (items: RuleItem[], selectedValues: Array<string | number>) => {
  const selectedIds = selectedValues.map((value) => normalize(value)).filter(Boolean)
  return items.filter((item) => getIdentifiers(item).some((id) => selectedIds.includes(id)))
}

export function getSelectionConflicts(params: {
  items: RuleItem[]
  selectedValues: Array<string | number>
}): SelectionConflict[] {
  const { items, selectedValues } = params
  const conflicts: SelectionConflict[] = []
  const selectedItems = getSelectedItems(items, selectedValues)

  const groups = new Map<string, RuleItem[]>()
  selectedItems.forEach((item) => {
    const group = normalize(item.exclusiveGroup)
    if (!group) return
    const list = groups.get(group) || []
    list.push(item)
    groups.set(group, list)
  })

  groups.forEach((groupItems, group) => {
    if (groupItems.length < 2) return
    groupItems.forEach((item) => {
      conflicts.push({
        selected: item,
        conflicts: groupItems.filter((other) => other !== item),
        reason: "exclusive_group",
        group,
      })
    })
  })

  selectedItems.forEach((item) => {
    const forbidWith = (item.forbidWith || [])
      .map((id) => normalize(id))
      .filter(Boolean)
    if (!forbidWith.length) return

    const conflictingItems = selectedItems.filter((other) => {
      if (other === item) return false
      return forbidWith.some((id) => itemMatchesIdentifier(other, id))
    })

    if (conflictingItems.length) {
      conflicts.push({
        selected: item,
        conflicts: conflictingItems,
        reason: "forbid_with",
      })
    }
  })

  return conflicts
}

const getItemLabel = (item: RuleItem) => {
  return (
    normalize(item.label) ||
    normalize(item.value) ||
    normalize(item.key) ||
    normalize(item.id) ||
    normalize(item.itemId) ||
    "This option"
  )
}

export function getSelectionConflictMessage(conflicts: SelectionConflict[]) {
  if (!conflicts.length) return ""
  const conflict = conflicts[0]
  const selectedLabel = getItemLabel(conflict.selected)
  const conflictLabels = conflict.conflicts.map(getItemLabel).join(", ")
  if (conflict.reason === "exclusive_group") {
    return `"${selectedLabel}" cannot be selected with ${conflictLabels}.`
  }
  return `"${selectedLabel}" conflicts with ${conflictLabels}.`
}

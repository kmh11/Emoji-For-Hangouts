function findCompleteNodes(element, current) {
	if (!current) { current = [] }
	if (element.nodeValue && element.nodeValue.match(/:(\S*?):/)) {
		current.push(element)
	}
	for (var c = 0; c < element.childNodes.length; c++) {
		current = findCompleteNodes(element.childNodes[c], current)
	}
	return current
}

function findProgressNodes(element, current) {
	if (!current) { current = [] }
	if (element.nodeValue && element.nodeValue.match(/:(\S*)/)) {
		current.push(element)
	}
	for (var c = 0; c < element.childNodes.length; c++) {
		current = findProgressNodes(element.childNodes[c], current)
	}
	return current
}

$(document).keydown(function(event) {
	var keycode = event.which
	var valid =
		(keycode > 47 && keycode < 58) || (keycode == 32 || keycode == 13) ||
		(keycode > 64 && keycode < 91) || (keycode > 95 && keycode < 112) ||
		(keycode > 185 && keycode < 193) || (keycode > 218 && keycode < 223)
	if ($(event.target).hasClass("editable")) {
		if (event.which == 9) {
			event.preventDefault()
		} else if (valid) {
			var nodes = findCompleteNodes(event.target)
			for (var n = 0; n < nodes.length; n++) {
				var node = nodes[n]
				var text = node.nodeValue
				var regex = /:(\S*?):/g
				var emoji
				while((emoji = regex.exec(text)) != null) {
					regex.lastIndex = emoji.index+1
					for (var e = 1; e < emoji.length; e++) {
						emoji.code = emoji[e]
						if (emoji_codes[emoji.code] && window.getSelection().anchorOffset == emoji.index+emoji.code.length+2) {
							frequencies[emoji.code] += 1
							chrome.storage.local.set({"frequencies": frequencies})
							node.nodeValue = text.slice(0,emoji.index)+emoji_codes[emoji.code]+text.slice(emoji.index+emoji.code.length+2)
							var range = document.createRange()
							var selection = window.getSelection()
							range.setStart(node, emoji.index+1)
							range.collapse(true)
							selection.removeAllRanges()
							selection.addRange(range)
							event.target.focus()
						}
					}
				}
			}
		}
	}
})

var previous = -1
var possible = []
var index = 0
var frequencies = {}
for (code in emoji_codes) {
	frequencies[code] = 0
}
chrome.storage.local.get("frequencies", function(items) {
	for (var code in items["frequencies"]) {
		frequencies[code] = items["frequencies"][code]
	}
})

$(document).keyup(function(event) {
	if ($(event.target).hasClass("editable")) {
		if (event.which == 9) {
			var nodes = findProgressNodes(event.target)
			for (var n = 0; n < nodes.length; n++) {
				var node = nodes[n]
				var text = node.nodeValue
				var regex = /:(\S*)/g
				var emoji
				while((emoji = regex.exec(text)) != null) {
					regex.lastIndex = emoji.index+1
					for (var e = 1; e < emoji.length; e++) {
						if (window.getSelection().anchorOffset == emoji.index+emoji[e].length+1) {
							emoji.code = emoji[e]
							if (previous == 9) {
								if (possible.length > 0) {
									var code = possible[index]
									index = (index+1)%possible.length
									node.nodeValue = text.slice(0,emoji.index)+":"+code+":"+text.slice(emoji.index+emoji.code.length+1)
									var range = document.createRange()
									var selection = window.getSelection()
									range.setStart(node, emoji.index+code.length+2)
									range.collapse(true)
									selection.removeAllRanges()
									selection.addRange(range)
									event.target.focus()
								}
							} else {
								possible = []
								index = 0
								for (emoji_code in emoji_codes) {
									if (emoji_code.indexOf(emoji.code) == 0) {
										possible.push(emoji_code)
									}
								}
								possible.sort((a, b) => {
									if (frequencies[b] != frequencies[a]) {
										return frequencies[b]-frequencies[a]
									} else {
										return a.localeCompare(b)
									}
								})
								if (possible.length > 0) {
									var code = possible[index]
									index = (index+1)%possible.length
									node.nodeValue = text.slice(0,emoji.index)+":"+code+":"+text.slice(emoji.index+emoji.code.length+1)
									var range = document.createRange()
									var selection = window.getSelection()
									range.setStart(node, emoji.index+code.length+2)
									range.collapse(true)
									selection.removeAllRanges()
									selection.addRange(range)
									event.target.focus()
								}
							}
						}
					}
				}
			}
		}
	}
	previous = event.which
})

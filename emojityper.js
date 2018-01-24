function findCompleteNode(element) {
	if (element.nodeValue && element.nodeValue.match(/:(\S*?):/)) {
		return element
	} else {
		for (var c = 0; c < element.childNodes.length; c++) {
			var newElement = findCompleteNode(element.childNodes[c])
			if (newElement) {
				return newElement
			}
		}
	}
}

function findProgressNode(element) {
	if (element.nodeValue && element.nodeValue.match(/:(\S*?)/)) {
		return element
	} else {
		for (var c = 0; c < element.childNodes.length; c++) {
			var newElement = findProgressNode(element.childNodes[c])
			if (newElement) {
				return newElement
			}
		}
	}
}

$(document).keydown(function(event) {
	if ($(event.target).hasClass("editable")) {
		if (event.which == 9) {
			event.preventDefault()
		} else {
			var node = findCompleteNode(event.target)
			if (node) {
				var text = node.nodeValue
				var emoji = text.match(/:(\S*?):/)
				if (emoji) {
					emoji.code = emoji[1]
					if (emoji_codes[emoji.code] && window.getSelection().anchorOffset == emoji.index+emoji.code.length+2) {
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
})

var previous = -1
var possible = []
var index = 0

$(document).keyup(function(event) {
	if ($(event.target).hasClass("editable")) {
		if (event.which == 9) {
			var node = findProgressNode(event.target)
			if (node) {
				var text = node.nodeValue
				var emoji = text.match(/:(\S*)/)
				if (emoji && window.getSelection().anchorOffset == emoji.index+emoji[1].length+1) {
					emoji.code = emoji[1]
					if (previous == 9) {
						if (possible.length > 0) {
							var code = possible[index]
							index = (index+1)%possible.length
							node.nodeValue = text.slice(0,emoji.index)+":"+code+":"+text.slice(emoji.index+emoji.code.length+(text.match(/:(\S*):/) ? 2 : 1))
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
						if (possible.length > 0) {
							var code = possible[index]
							index = (index+1)%possible.length
							node.nodeValue = text.slice(0,emoji.index)+":"+code+":"+text.slice(emoji.index+emoji.code.length+(text.match(/:(\S*):/) ? 2 : 1))
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
	previous = event.which
})

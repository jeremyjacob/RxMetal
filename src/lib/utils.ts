export function walk(node: Node, callback: (node: Node) => void) {
	var children = node.childNodes;
	for (var i = 0; i < children.length; i++) {
		walk(children[i], callback);
	}
	callback(node);
}

class Node {
    constructor(pos, goal, parent = null) {
        this.tx = pos.tx;
        this.ty = pos.ty;
        this.parent = parent;
        this.g = this.parent ? this.parent.g + 1 : 0;
        this.h = Node.calcHeuristic(pos, goal);
        this.f = this.g + this.h;
    }

    static calcHeuristic(pos, goal) {
        const movementCost = 1;
        let dx = Math.abs(goal.tx - pos.tx);
        let dy = Math.abs(goal.ty - pos.ty);
        return movementCost * (dx + dy);
    }
}

export default class Astar {
    constructor(grid) {
        this.grid = grid;
        this.OPEN = [];
        this.CLOSED = [];
        this.nodes = [];
        this.initNodes();
    }

    initNodes() {
        for (let y = 0; y < this.grid.length; y++) {
            this.nodes[y] = [];
            for (let x = 0; x < this.grid[y].length; x++) {
                this.nodes[y][x] = {
                    x: x,
                    y: y,
                    dist: Infinity,
                    visited: false,
                    parent: null
                };
            }
        }
    }

    findPath(start, goal) {
        // Initialization
        this.START = new Node(start, goal);
        this.GOAL = new Node(goal, goal);
        this.OPEN = [this.START];
        this.CLOSED = [];

        while (this.OPEN.length > 0) {
            let n = this.getLowestFromOpen();
            this.OPEN = this.OPEN.filter(node => node !== n);
            this.CLOSED.push(n);

            if (n.tx === this.GOAL.tx && n.ty === this.GOAL.ty) {
                this.GOAL = n;
                break;
            }

            let children = this.getNeighbors(n);
            children.forEach(child => {
                if (!this.CLOSED.includes(child)) {
                    child.g = n.g + 1;
                    child.h = Node.calcHeuristic(child, this.GOAL);
                    child.f = child.g + child.h;

                    if (!this.OPEN.some(openNode => openNode.tx === child.tx && openNode.ty === child.ty && child.g > openNode.g)) {
                        this.OPEN.push(child);
                    }
                }
            });
        }

        return this.reconstructPath();
    }

    getLowestFromOpen() {
        return this.OPEN.reduce((lowest, node) => lowest.f <= node.f ? lowest : node);
    }

    getNeighbors(node) {
        let neighbors = [];
        const directions = [
            { tx: -1, ty: 0 },
            { tx: 1, ty: 0 },
            { tx: 0, ty: -1 },
            { tx: 0, ty: 1 }
        ];

        directions.forEach(dir => {
            let newPos = { tx: node.tx + dir.tx, ty: node.ty + dir.ty };
            if (newPos.tx >= 0 && newPos.tx < this.grid[0].length && newPos.ty >= 0 && newPos.ty < this.grid.length && this.grid[newPos.ty][newPos.tx] === -1) {
                neighbors.push(new Node(newPos, this.GOAL, node));
            }
        });

        return neighbors;
    }

    reconstructPath() {
        let path = [];
        let current = this.GOAL;
        while (current) {
            path.unshift({ x: current.tx, y: current.ty });
            current = current.parent;
        }
        return path;
    }
}

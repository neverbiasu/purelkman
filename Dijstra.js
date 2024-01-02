class Dijkstra {
    constructor(grid) {
        this.grid = grid;
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
        let openSet = [];
        this.nodes[start.y][start.x].dist = 0;
        openSet.push(this.nodes[start.y][start.x]);

        while (openSet.length > 0) {
            // Sort by distance
            openSet.sort((a, b) => a.dist - b.dist);
            let current = openSet.shift();

            if (current.x === goal.x && current.y === goal.y) {
                return this.reconstructPath(current);
            }

            current.visited = true;
            let neighbors = this.getNeighbors(current);

            neighbors.forEach(neighbor => {
                if (!neighbor.visited) {
                    let newDist = current.dist + 1;
                    if (newDist < neighbor.dist) {
                        neighbor.dist = newDist;
                        neighbor.parent = current;
                        openSet.push(neighbor);
                    }
                }
            });
        }

        return []; // No path found
    }

    getNeighbors(node) {
        let neighbors = [];
        let directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];

        directions.forEach(dir => {
            let x = node.x + dir.x;
            let y = node.y + dir.y;
            if (this.isInBounds(x, y) && !this.isWall(x, y)) {
                neighbors.push(this.nodes[y][x]);
            }
        });

        return neighbors;
    }

    isInBounds(x, y) {
        return y >= 0 && y < this.grid.length && x >= 0 && x < this.grid[y].length;
    }

    isWall(x, y) {
        return this.grid[y][x] !== 0; // Assuming 0 is walkable, and non-zero values are walls
    }

    reconstructPath(node) {
        let path = [];
        while (node.parent) {
            path.unshift({ x: node.x, y: node.y });
            node = node.parent;
        }
        return path;
    }
}

export default Dijkstra;
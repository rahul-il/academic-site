
import { PRESET_MAPS } from "./maps.js";
import { kPrimes } from "./encode.js";


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// interactiveCanvas.js
export class InteractiveCanvas {
    constructor(containerId, { mode = 'draw', coloringMode = 'random', presetMap = 'uk'} = {}) {
        this.container = document.getElementById(containerId);

        this.mode = mode;
        this.coloringMode = coloringMode;
        this.showGraph = false;
        

        //Initialize properties
        this.polygonThreshold = 1;
        this.clickCount = 0;
        this.points = [];
        this.tempPoint = null;
        this.lines = []
        this.intersections = [];
        this.hoverPoint = null;
        this.nearbyIntersections = [];
        this.polygons = [];
        this.polygonCenters = [];
        this.enclosedRegions = [];
        this.neighboringPolygons = [];
        this.snapThreshold = 300; // Distance threshold for snapping (squared)
        this.useIntersectionDisplayThreshold = false;
        this.intersectionDisplayThreshold = 2000; // Distance threshold for displaying intersections (squared)
        this.historyStack = [];
        this.clickedPolygons = [];

        

        // Define some prettier color options
        const colorOptions = {
            pastel: ['#7F58AF', '#64C5EB', '#E84D8A', '#FEB326'],
            vibrant: ['#FF6347', '#FF4500', '#FFD700', '#32CD32', '#1E90FF'],
            muted: ['#8B0000', '#FF8C00', '#FFD700', '#006400', '#4682B4'],
            cool: ['#00CED1', '#4682B4', '#5F9EA0', '#2E8B57', '#3CB371']
        };

        // Choose a color scheme
        this.colors = colorOptions.pastel; // You can change this to colorOptions.vibrant, colorOptions.muted, or colorOptions.cool
        this.permuteColors(); // do this for ZK



        this.createCanvas();
        this.setupCanvas();

        if (mode === 'color' || mode === 'zk' || mode === 'zk-postit'){
            this.loadPresetMap(presetMap);
        }

        
    }

    generateEncodings(){
        for (let polygon of this.polygons){
            const realColor = polygon.properties.color;
            const permutedColor = this.permutedColors[this.colors.indexOf(realColor)];
            const permutedColorIndex = this.colors.indexOf(permutedColor);

            const indexToK = [2,3,4];
            const  k = indexToK[permutedColorIndex]
            polygon.properties.encoding = kPrimes(k)
        }
    }

    permuteColors() {
        this.permutedColors = shuffleArray(this.colors.slice(0, 3));
    }

    restartZK () {
        this.clickedPolygons = [];
        this.clickCount = 0;
        this.permuteColors();
        this.generateEncodings();
        this.redrawCanvas();
        this.dispatchRevealEvent();
    }

    createCanvas() {
        // Create and set up the canvas
        this.container.innerHTML = `
            <div class="row">
                <canvas id="canvas" width="300" height="400" style="border: 1px solid black"></canvas>
            </div>
            <p id="error-message"></p>`

        if (this.mode === 'draw'){
            this.container.innerHTML += `
            <div class="row">
                <button id="clearCanvas">Clear</button>
                <button id="undo">Undo</button>
            </div>
            `;
        }
            
    }

    setupCanvas() {
        // Add all your existing setup code here, adjusted to use this.container
        this.canvas = this.container.querySelector('#canvas');
        this.ctx = this.canvas.getContext('2d');
        this.errorMessageElement = this.container.querySelector('#error-message');

        //Event listeners
        this.canvas.addEventListener('click', (event) => {
            if (this.mode === 'draw') {
                this.handleDrawModeClick(event);
            } else if (this.mode === 'color') {
                this.handleColorModeClick(event);
            } else if (this.mode === 'zk' || this.mode === 'zk-postit'){
                this.handleZkModeClick(event);
            }
        });

        this.canvas.addEventListener('mousemove', (event) => {
            if (this.mode === 'draw') {
                this.handleDrawModeMouseMove(event);
            }
        });

        if (this.mode === 'draw'){
            // Add event listeners for other controls
            this.container.querySelector('#clearCanvas').addEventListener('click', () => {
                this.clear();
                this.redrawCanvas();
            });

            this.container.querySelector('#undo').addEventListener('click', () => {
                this.handleUndo();
            });
        }
        

        if (this.mode === 'zk' ||this.mode === 'zk-postit' ){
            this.container.addEventListener('restartZk', (event) => {
                this.restartZK();
            });

            this.container.addEventListener('setZkMode', (event) => {
                const { mode } = event.detail;
                this.mode = mode;
                this.restartZK();
            });

        }

        this.container.addEventListener('loadMap', (event) => {
            const { map } = event.detail;

            this.loadPresetMap(map);
        });


    }

    handleUndo(){
        if (this.historyStack.length > 0) {
            const previousState = this.historyStack.pop();
            this.lines = previousState.lines;
            this.intersections = previousState.intersections;
            this.nearbyIntersections = previousState.nearbyIntersections;
            this.polygons = previousState.polygons;
            this.polygonCenters = previousState.polygonCenters;
            this.enclosedRegions = previousState.enclosedRegions;
            this.neighboringPolygons = previousState.neighboringPolygons;
        }

        this.clickCount = 0;
        this.points = [];
        this.tempPoint = null;
        this.hoverPoint = null;
        this.redrawCanvas();
    }

    handleDrawModeClick(event){
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.points.push({ x, y });
        this.clickCount++;

        if (this.clickCount === 2) {
            const startSnapResult = this.getSnappedPoint(this.points[0]);
            const endSnapResult = this.getSnappedPoint(this.points[1]);

            let startPoint = startSnapResult.point || this.points[0];
            let endPoint = endSnapResult.point || this.points[1];

            // Round startPoint and endPoint to the nearest integer
            startPoint = { x: Math.round(startPoint.x), y: Math.round(startPoint.y) };
            endPoint = { x: Math.round(endPoint.x), y: Math.round(endPoint.y) };

            const newLine = { start: startPoint, end: endPoint };

            if (this.isValidLine(newLine)) {
                this.saveState(); // Save state before modification

                // Split the line at startPoint if snapped to a line
                if (startSnapResult.line) {
                    this.splitLine(startSnapResult.line, [startPoint]);
                }

                // Split the line at endPoint if snapped to a line
                if (endSnapResult.line) {
                    this.splitLine(endSnapResult.line, [endPoint]);
                }

                if (this.isValidLine(newLine)) {
                    this.lines.push(newLine);
                }

                this.drawLine(newLine.start, newLine.end);
                this.findIntersections(newLine); // Find intersections immediately after adding the new line
                // Polygonize and log the result
                this.logPolygonization();
            }

            this.clickCount = 0;
            this.points = [];
            this.tempPoint = null;
            this.hoverPoint = null;
            this.redrawCanvas();
        }
    }

    handleColorModeClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const clickedPolygon = this.getPolygonAtPoint({ x, y });
        const coloringMode = this.coloringMode;

        if (clickedPolygon) {

            if (coloringMode === 'random') {
                clickedPolygon.properties.color = this.getRandomColor();
                
            } else{
                const dict = {'four': 4, 'three': 3, 'two': 2}
                const n = dict[coloringMode];
                const currentColor = clickedPolygon.properties.color;
                const indexOfCurrentColor = this.colors.indexOf(currentColor);

                clickedPolygon.properties.color = this.colors[(indexOfCurrentColor + 1) % n]
            }

            this.redrawCanvas();
           
        }
    }

    handleZkModeClick(event){
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const clickedPolygon = this.getPolygonAtPoint({ x, y });

        if (clickedPolygon && !(this.clickedPolygons.includes(clickedPolygon.id)) && this.clickCount < 2) {

            const isFirstOrNeighbor = this.clickCount === 0 || this.neighboringPolygons[clickedPolygon.id][this.clickedPolygons[0]]
            if (isFirstOrNeighbor){

                this.clickedPolygons.push(clickedPolygon.id);
            

                this.clickCount++;

                this.redrawCanvas();

                this.dispatchRevealEvent();

            }

            

        }
    }


    getPolygonAtPoint(point) {
        for (let i = 0; i < this.enclosedRegions.length; i++) {
            if (turf.booleanPointInPolygon(turf.point([point.x, point.y]), this.enclosedRegions[i])) {
                return this.polygons[i];
            }
        }
        return null;
    }

    handleDrawModeMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const snapResult = this.getSnappedPoint({ x, y });
        this.hoverPoint = snapResult.point || { x, y };

        if (this.clickCount === 1) {
            const tempSnapResult = this.getSnappedPoint({ x, y });
            this.tempPoint = tempSnapResult.point || { x, y };
        }

        this.nearbyIntersections = !this.useIntersectionDisplayThreshold ? this.intersections :  this.intersections.filter(intersection =>
            this.getDistanceSquared({ x, y }, intersection) < this.intersectionDisplayThreshold
        );

        this.redrawCanvas();
    }

    clear(){
        this.saveState();

        this.lines = [];
        this.points = [];
        this.intersections = [];
        this.nearbyIntersections = [];
        this.polygons = [];
        this.polygonCenters = [];
        this.enclosedRegions = [];
        this.neighboringPolygons = [];
        this.clickCount = 0;
        this.tempPoint = null;
        this.hoverPoint = null;

    }

    loadPresetMap(mapName) {
        this.polygonThreshold = PRESET_MAPS[mapName]['polygonThreshold'];

        const linesToAdd = PRESET_MAPS[mapName].lines;

        // Clear the current canvas
        this.clear()

        for (let newLine of linesToAdd){
            if (this.isValidLine(newLine)){
                this.lines.push(newLine);
                this.findIntersections(newLine);
            }
        }

        this.logPolygonization();

        //make all colors zero if we are coloring
        if (this.mode === 'color'){
            for (let polygon of this.polygons){
                polygon.properties.color = this.colors[0];
            }
        }

        //generate encoding if we are in zk
        if (this.mode === 'zk' || this.mode === 'zk-postit'){
            this.generateEncodings();
        }

        this.redrawCanvas();
    }

    saveState() {
        const currentState = {
            lines: JSON.parse(JSON.stringify(this.lines)),
            intersections: JSON.parse(JSON.stringify(this.intersections)),
            nearbyIntersections: JSON.parse(JSON.stringify(this.nearbyIntersections)),
            polygons: JSON.parse(JSON.stringify(this.polygons)),
            polygonCenters: JSON.parse(JSON.stringify(this.polygonCenters)),
            enclosedRegions: JSON.parse(JSON.stringify(this.enclosedRegions)),
            neighboringPolygons: JSON.parse(JSON.stringify(this.neighboringPolygons)),
        };
        this.historyStack.push(currentState);
    }

    drawLine(start, end, color = 'black') {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawPoint(point, color = 'red', size = 5) {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, size, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    drawPolygonCenter(point) {
        this.drawPoint(point, 'white', 3);
    }

    drawConnectionLine(start, end) {
        this.drawLine(start, end, 'white');
    }

    drawPolygonNumber(point, number) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(number, point.x + 5, point.y - 5);
    }

    drawEncodingNumber(polygon){
        const index = polygon.id;
        const center = this.polygonCenters[index];
        const encoding = polygon.properties.encoding;
        const product = encoding.reduce((accumulator, currentValue) => accumulator * currentValue, 1);
        
        if (this.clickedPolygons.includes(index)){

            this.ctx.fillStyle = 'white';
        } else {
            this.ctx.fillStyle = 'black';
        }
        
        this.ctx.font = '12px Arial';
        this.ctx.fillText(product, center.x - 15, center.y +6);

    }

    drawPostIt(polygon){
        const index = polygon.id;
        const center = this.polygonCenters[index];
        const color = this.permutedColors[this.colors.indexOf(polygon.properties.color)];

        


        
        if (this.clickedPolygons.includes(index)){
            const radius = 10; // background color of the circle
            const x = center.x - radius;
             const y = center.y - radius;

            // Draw the circle
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false); // Draw a circle
            this.ctx.fillStyle = color; // Set the fill color
            this.ctx.fill(); 
        } else {
            const size = 40;

            const x = center.x - size/2;
            const y = center.y -size/2;

            const width = size; // width of the post-it note
            const height = size; // height of the post-it note
            const noteColor = '#FFEB3B'; // color of the post-it note (light yellow)
            const shadowColor = 'rgba(0, 0, 0, 0.2)'; // color of the shadow

            // Draw the shadow
            this.ctx.fillStyle = shadowColor;
            this.ctx.fillRect(x + 10, y + 10, width, height);

            // Draw the post-it note
            this.ctx.fillStyle = noteColor;
            this.ctx.fillRect(x, y, width, height);

        }
    }


    drawPolygon(polygon) {
        let color = polygon.properties.color;
        if (this.mode === 'zk'){
            if (this.clickedPolygons.includes(polygon.id)){
                color = this.permutedColors[this.colors.indexOf(color)];
            } else {
                color = '#FFFFFF';
            }
        }
        if (this.mode === 'zk-postit'){
            color = '#FFFFFF';
        }

        this.ctx.beginPath();
        this.ctx.moveTo(polygon.geometry.coordinates[0][0][0], polygon.geometry.coordinates[0][0][1]);
        for (let coord of polygon.geometry.coordinates[0]) {
            this.ctx.lineTo(coord[0], coord[1]);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawNeighborConnections() {
        for (let i = 0; i < this.polygons.length; i++) {
            for (let j = i + 1; j < this.polygons.length; j++) {
                if (this.neighboringPolygons[i][j]) {
                    this.drawConnectionLine(this.polygonCenters[i], this.polygonCenters[j]);
                }
            }
        }
    }



    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const showGraph = this.showGraph;

        // Draw polygons with their assigned colors
        for (let polygon of this.polygons) {
            this.drawPolygon(polygon);
        }

        

        for (let line of this.lines) {
            this.drawLine(line.start, line.end);
        }

        for (let intersection of this.nearbyIntersections) {
            this.drawPoint(intersection);
        }

        if (showGraph){
            // Draw polygon centers and numbers
            for (let i = 0; i < this.polygonCenters.length; i++) {
                this.drawPolygonCenter(this.polygonCenters[i]);
                this.drawPolygonNumber(this.polygonCenters[i], i + 1);
            }

            // Draw lines between neighboring polygon centers
            this.drawNeighborConnections();
        }

        if (this.mode === 'zk'){
            for (let polygon of this.polygons) {
                this.drawEncodingNumber(polygon);
            }
        }

        if (this.mode === 'zk-postit'){
            for (let polygon of this.polygons) {
                this.drawPostIt(polygon);
            }
        }

        


        if (this.clickCount === 1 && this.tempPoint) {
            const startSnapResult = this.getSnappedPoint(this.points[0]);
            const startPoint = startSnapResult.point || this.points[0];
            this.drawLine(startPoint, this.tempPoint, 'gray'); // Draw temporary line
        }

        if (this.hoverPoint && this.clickCount === 0) {
            this.drawPoint(this.hoverPoint, 'blue', 5); // Draw starting point preview
        }

        this.dispatchGraphColoringEvent();
    }

    findIntersections(newLine) {
        let newIntersections = [];
        let linesToSplit = new Map();

        for (let line of this.lines) {
            const intersection = this.getIntersection(newLine, line);
            if (intersection) {
                // Round the intersection to the nearest integer
                const roundedIntersection = {
                    x: Math.round(intersection.x),
                    y: Math.round(intersection.y)
                };

                // Add the rounded intersection to the linesToSplit map
                if (!linesToSplit.has(line)) {
                    linesToSplit.set(line, []);
                }
                linesToSplit.get(line).push(roundedIntersection);

                if (!linesToSplit.has(newLine)) {
                    linesToSplit.set(newLine, []);
                }
                linesToSplit.get(newLine).push(roundedIntersection);

                newIntersections.push(roundedIntersection);
            }
        }

        // Split lines at intersections
        for (let [line, points] of linesToSplit) {
            this.splitLine(line, points);
        }

        this.intersections.push(...newIntersections);
        this.intersections.push(newLine.start, newLine.end);
    }

    getIntersection(line1, line2) {
        const { start: p1, end: p2 } = line1;
        const { start: p3, end: p4 } = line2;

        const denominator = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
        if (denominator === 0) {
            return null; // Lines are parallel
        }

        const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denominator;
        const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denominator;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            // Intersection point is within both line segments
            const intersectionX = p1.x + t * (p2.x - p1.x);
            const intersectionY = p1.y + t * (p2.y - p1.y);
            return { x: intersectionX, y: intersectionY };
        }

        return null; // No valid intersection
    }

    getSnappedPoint(mousePoint) {
        let closestPoint = null;
        let snappedLine = null;
        let minDistanceSquared = this.snapThreshold;

        // Check intersections and endpoints
        for (let intersection of this.intersections) {
            const distanceSquared = this.getDistanceSquared(mousePoint, intersection);
            if (distanceSquared < minDistanceSquared) {
                closestPoint = intersection;
                minDistanceSquared = distanceSquared;
                snappedLine = null; // No line is snapped if we snap to an intersection or endpoint
            }
        }

        // Check lines if no close intersection is found
        if (!closestPoint) {
            for (let line of this.lines) {
                const closestPointOnLine = this.getClosestPointOnLine(line, mousePoint);
                const distanceSquared = this.getDistanceSquared(mousePoint, closestPointOnLine);
                if (distanceSquared < minDistanceSquared) {
                    closestPoint = closestPointOnLine;
                    minDistanceSquared = distanceSquared;
                    snappedLine = line; // Store the line we are snapping to
                }
            }
        }

        return { point: closestPoint, line: snappedLine };
    }

    getDistanceSquared(point1, point2) {
        return (point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2;
    }

    getClosestPointOnLine(line, point) {
        const { start, end } = line;
        const lineLengthSquared = this.getDistanceSquared(start, end);
        if (lineLengthSquared === 0) return start;

        const t = ((point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y)) / lineLengthSquared;
        if (t < 0) return start;
        if (t > 1) return end;

        return {
            x: start.x + t * (end.x - start.x),
            y: start.y + t * (end.y - start.y)
        };
    }

    isValidLine(line) {
        if (line.start.x === line.end.x && line.start.y === line.end.y) {
            return false; // Degenerate line
        }

        return !this.lines.some(existingLine =>
            (existingLine.start.x === line.start.x && existingLine.start.y === line.start.y &&
                existingLine.end.x === line.end.x && existingLine.end.y === line.end.y) ||
            (existingLine.start.x === line.end.x && existingLine.start.y === line.end.y &&
                existingLine.end.x === line.start.x && existingLine.end.y === line.start.y)
        );
    }

    splitLine(line, points) {
        // Filter out points that are the endpoints
        points = points.filter(point =>
            !(point.x === line.start.x && point.y === line.start.y) &&
            !(point.x === line.end.x && point.y === line.end.y)
        );

        if (points.length === 0) return;

        // Remove duplicate points
        const uniquePoints = Array.from(new Set(points.map(p => JSON.stringify(p)))).map(str => JSON.parse(str));

        // Sort points along the line
        uniquePoints.sort((a, b) => {
            const distA = this.getDistanceSquared(line.start, a);
            const distB = this.getDistanceSquared(line.start, b);
            return distA - distB;
        });

        // Remove the original line from the lines array
        const index = this.lines.indexOf(line);
        if (index !== -1) {
            this.lines.splice(index, 1);
        }

        // Add new lines
        let currentStart = line.start;
        for (let point of uniquePoints) {
            const newLine = { start: currentStart, end: point };
            if (this.isValidLine(newLine)) {
                this.lines.push(newLine);
                currentStart = point;
            }
        }
        const finalLine = { start: currentStart, end: line.end };
        if (this.isValidLine(finalLine)) {
            this.lines.push(finalLine);
        }
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    logPolygonization() {
        // Convert lines to coordinates array for MultiLineString
        const lineCoords = this.lines.map(line => [[line.start.x, line.start.y], [line.end.x, line.end.y]]);

        // Create a MultiLineString feature
        const multiLineString = turf.multiLineString(lineCoords);

        // Perform polygonization
        const polygonFeatureCollection = turf.polygonize(multiLineString);

        // Deduplicate polygons by normalizing coordinates
        const uniquePolygons = [];
        const seenPolygons = new Set();

        for (let feature of polygonFeatureCollection.features) {
            const normalizedCoords = this.normalizeCoordinates(feature.geometry.coordinates[0]);
            const key = JSON.stringify(normalizedCoords);
            if (!seenPolygons.has(key)) {
                seenPolygons.add(key);
                uniquePolygons.push(feature);
            }
        }

        // Filter out zero-area polygons
        const nonZeroAreaPolygons = uniquePolygons.filter(polygon => Math.log(turf.area(polygon)) > this.polygonThreshold);

        this.polygons = nonZeroAreaPolygons.map(feature => {
            return feature;
        });

        this.polygonCenters = this.polygons.map(polygon => {
            const center = turf.centroid(polygon);
            if (center == null) { console.log("CENTER IS NULL!!!!!") };
            return {
                x: center.geometry.coordinates[0],
                y: center.geometry.coordinates[1]
            };
        });

        this.enclosedRegions = this.polygons.map(polygon => {
            let enclosedRegion = polygon;
            for (let otherPolygon of this.polygons) {
                if (enclosedRegion && polygon !== otherPolygon && turf.booleanContains(polygon, otherPolygon)) {
                    enclosedRegion = turf.difference(enclosedRegion, otherPolygon);
                }
            }
            if (enclosedRegion) {
                return enclosedRegion
            }
            return polygon
        });

        // Sort polygons so that contained polygons are drawn later
        const containmentOrder = this.getContainmentOrder(this.polygons);
        this.polygons = containmentOrder.map(index => this.polygons[index]);
        this.polygonCenters = containmentOrder.map(index => this.polygonCenters[index]);
        this.enclosedRegions = containmentOrder.map(index => this.enclosedRegions[index]);

        //Add index to each polygon
        for (let i = 0; i < this.polygons.length; i++) {
            this.polygons[i]['id'] = i;
        }

        // Determine neighboring polygons
        this.neighboringPolygons = Array(this.polygons.length).fill(null).map(() => Array(this.polygons.length).fill(false));
        for (let i = 0; i < this.polygons.length; i++) {
            for (let j = 0; j < this.polygons.length; j++) {

                if (this.enclosedRegions[i] && this.enclosedRegions[j]) {

                    const iLines = turf.polygonToLine(this.enclosedRegions[i])
                    const jLines = turf.polygonToLine(this.enclosedRegions[j])

                    if (iLines && jLines) {
                        const oLap = turf.lineOverlap(turf.polygonToLine(this.enclosedRegions[i]), turf.polygonToLine(this.enclosedRegions[j]))

                        if (oLap && i !== j && oLap.features.length > 0) {
                            this.neighboringPolygons[i][j] = true;
                        }

                    }

                }

            }
        }

        // Get the selected coloring mode
        const coloringMode = this.coloringMode;

        
        this.errorMessageElement.textContent = ''; // Clear previous error message

        try {
            if (coloringMode === 'four') {
                const coloring = this.colorGraph(this.neighboringPolygons, 4);
                for (let i = 0; i < this.polygons.length; i++) {
                    this.polygons[i].properties.color = this.colors[coloring[i]];
                }
            } else if (coloringMode === 'three') {
                const coloring = this.colorGraph(this.neighboringPolygons, 3);
                for (let i = 0; i < this.polygons.length; i++) {
                    this.polygons[i].properties.color = this.colors[coloring[i]];
                }
            } else if (coloringMode === 'two') {
                const coloring = this.colorGraph(this.neighboringPolygons, 2);
                for (let i = 0; i < this.polygons.length; i++) {
                    this.polygons[i].properties.color = this.colors[coloring[i]];
                }
            } else if (coloringMode === 'random') {
                for (let i = 0; i < this.polygons.length; i++) {
                    this.polygons[i].properties.color = this.getRandomColor();
                }
            }
        } catch (error) {
            // this.errorMessageElement.textContent = error.message;
            for (let i = 0; i < this.polygons.length; i++) {
                this.polygons[i].properties.color = '#FFFFFF';
            }
        }

    }

    normalizeCoordinates(coords) {
        // Sort coordinates to create a canonical representation
        coords = coords.slice(0, -1); // Remove the closing coordinate
        coords.sort((a, b) => a[0] - b[0] || a[1] - b[1]); // Sort by x, then by y
        return coords;
    }

    getContainmentOrder(polygons) {
        const containmentOrder = [];
        const visited = new Array(polygons.length).fill(false);

        function visit(index) {
            if (visited[index]) return;
            visited[index] = true;
            for (let i = 0; i < polygons.length; i++) {
                if (i !== index && turf.booleanContains(polygons[index], polygons[i])) {
                    visit(i);
                }
            }
            containmentOrder.push(index);
        }

        for (let i = 0; i < polygons.length; i++) {
            if (!visited[i]) {
                visit(i);
            }
        }

        return containmentOrder.reverse();
    }

    colorGraph(adjMatrix, maxColors) {
        const n = adjMatrix.length;
        const result = new Array(n).fill(-1);

        function isSafe(v, c) {
            for (let i = 0; i < n; i++) {
                if (adjMatrix[v][i] && c === result[i]) {
                    return false;
                }
            }
            return true;
        }

        function graphColoring(v) {
            if (v === n) {
                return true;
            }

            for (let c = 0; c < maxColors; c++) {
                if (isSafe(v, c)) {
                    result[v] = c;
                    if (graphColoring(v + 1)) {
                        return true;
                    }
                    result[v] = -1;
                }
            }
            return false;
        }

        if (!graphColoring(0)) {
            if (maxColors == 4) throw new Error(`Woah, no ${maxColors}-coloring exists! (You proabably haven't actually disproved the 4-color theorem. The code sometimes has rounding errors.)`)
            throw new Error(`No ${maxColors}-coloring exists!`);
        }

        return result;
    }

    checkGraphColoring() {
        let usedColors = new Set();
        let isColored = true;
    
        // Check each polygon and its neighbors
        for (let i = 0; i < this.polygons.length; i++) {
            const polygon = this.polygons[i];
            if (!polygon.properties.color) {
                isColored = false; // A polygon without a color means the graph is not fully colored
            } else {
                usedColors.add(polygon.properties.color);

                // Check neighboring polygons for color conflict
                for (let j = 0; j < this.polygons.length; j++) {
                    if (this.neighboringPolygons[i][j]) {
                        const neighborPolygon = this.polygons[j];
                        if (neighborPolygon.properties.color === polygon.properties.color) {
                            isColored = false; // Neighboring polygons have the same color
                        }
                    }
                }

            }
    
            

        }
    
        const numberOfColors = usedColors.size;
        return { isColored, numberOfColors };
    }

    dispatchGraphColoringEvent() {
        const { isColored, numberOfColors } = this.checkGraphColoring();
        const polygonCount = this.polygons.length;
        this.container.dispatchEvent(new CustomEvent('graphColoringChanged', {
            detail: { isColored, numberOfColors, polygonCount}
        }));
    }

    dispatchRevealEvent(){
        let reveals = [];
        for (let id of this.clickedPolygons){
            const polygon = this.polygons[id];

            const encoding = polygon.properties.encoding;
            const product = encoding.reduce((accumulator, currentValue) => accumulator * currentValue, 1);
            
            const color = this.permutedColors[this.colors.indexOf(polygon.properties.color)];

            reveals.push({encoding, product, color});
        }

        this.container.dispatchEvent(new CustomEvent('colorRevealed', {
            detail: reveals
        }));
    }


}
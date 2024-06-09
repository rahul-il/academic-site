import { InteractiveCanvas } from './interactiveCanvas.js';

class InteractiveCanvasElement extends HTMLElement {
    connectedCallback() {
        const mode = this.getAttribute('mode') || 'draw';
        const coloringMode = this.getAttribute('coloring-mode') || 'random';
        const containerId = `interactive-canvas-container-${Math.random().toString(36).substr(2, 9)}`;
        const presetMap = this.getAttribute('preset-map') || 'uk';


        this.innerHTML = `<div id="${containerId}"></div>`;
        new InteractiveCanvas(containerId, { mode, coloringMode, presetMap});
    }
}

customElements.define('interactive-canvas', InteractiveCanvasElement);
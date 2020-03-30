
import createPanZoom from 'panzoom';
import createTextMeasure from './measureText';
import createAggregateLayout from './aggregateLayout';
import bus from '../bus';
import createLinkAnimator from './renderer/linkAnimator';

let svg = require('simplesvg');

/**
 * Rendering the results with a new render process
 */
export default function createRenderer(progress) {
  const scene = document.querySelector('#scene');
  const nodeContainer = scene.querySelector('#nodes');
  const edgeContainer = scene.querySelector('#edges');
  const hideTooltipArgs = {isVisible: false};

  const panzoom = createPanZoom(scene);
  const defaultRectangle = {left: -500, right: 500, top: -500, bottom: 500}
  panzoom.showRectangle(defaultRectangle);

  
  let nodes = new Map();

  let layout, graph, currentLayoutFrame = 0, linkAnimator;
  let textMeasure = createTextMeasure(scene);
  bus.on('graph-ready', onGraphReady);

  return {
    render,
    dispose
  }

  function dispose() {
    clearLastScene();
    bus.off('graph-ready', onGraphReady);
  }

  function onMouseMove(e) {
    const id = e.target && e.target.id;
    const link = linkAnimator.getLinkInfo(id);
    if (link) {
      showTooltip(link, e.clientX, e.clientY);
    } else {
      hideTooltip();
    }
  }

  function onSceneClick(e) {
    const id = e.target && e.target.id;
    const info = linkAnimator.getLinkInfo(id);
    if (info)  {
      bus.fire('show-details', info.link);
    }
  }

  function showTooltip(minLink, clientX, clientY) {
    const {fromId, toId} = minLink.link;
    bus.fire('show-tooltip', {
      isVisible: true,
      from: fromId, 
      to: toId, 
      x: clientX,
      y: clientY
    });

    removeHighlight();

    nodes.get(fromId).classList.add('hovered');
    nodes.get(toId).classList.add('hovered');
    minLink.ui.classList.add('hovered');
  }

  function hideTooltip() {
    bus.fire('show-tooltip', hideTooltipArgs);
    removeHighlight();
  }

  function removeHighlight() {
    scene.querySelectorAll('.hovered').forEach(removeHoverClass);
  }

  function removeHoverClass(el) {
    el.classList.remove('hovered');
  }

  function render(newGraph) {
    clearLastScene();
    graph = newGraph;

    layout = createAggregateLayout(graph, progress);
    
    layout.on('ready', drawLinks);

    nodes = new Map();

    graph.forEachNode(addNode);
    graph.on('changed', onGraphStructureChanged);

    cancelAnimationFrame(currentLayoutFrame);
    currentLayoutFrame = requestAnimationFrame(frame)
  }

  function onGraphReady(readyGraph) {
    if (readyGraph === graph) {
      layout.setGraphReady();
      progress.startLayout();
    }
  }

  function frame() {
    if (layout.step()) {
      currentLayoutFrame = requestAnimationFrame(frame)
    }
    updatePositions();
  }

  function onGraphStructureChanged(changes) {
    changes.forEach(change => {
      if (change.changeType === 'add' && change.node) {
        addNode(change.node);
      }
    })
  }

  /**
   * Adding lines between search matches to enable search with click
   */
  function drawLinks() {
    progress.done();
    linkAnimator = createLinkAnimator(graph, layout, edgeContainer);
    document.addEventListener('mousemove', onMouseMove);
    scene.addEventListener('click', onSceneClick, true);
  }

  function clearLastScene() {
    clear(nodeContainer);
    clear(edgeContainer);

    document.removeEventListener('mousemove', onMouseMove);
    scene.removeEventListener('click', onSceneClick, true);
    if (layout) layout.off('ready', drawLinks);
    if (graph) graph.off('changed', onGraphStructureChanged);
    if (linkAnimator) linkAnimator.dispose();
  }

  function clear(el) {
    while (el.lastChild) {
        el.removeChild(el.lastChild);
    }
  }

  /**
   * adding node for a search result depending on the depth of search result
   */
  function addNode(node) {
    const dRatio = (graph.maxDepth - node.data.depth)/graph.maxDepth;
    let pos = getNodePosition(node.id);
    if (node.data.depth === 0) {
      layout.pinNode(node);
    }

    const uiAttributes = getNodeUIAttributes(node.id, dRatio);
    layout.addNode(node.id, uiAttributes);

    const rectAttributes = {
      x: uiAttributes.x,
      y: uiAttributes.y,
      width: uiAttributes.width,
      height: uiAttributes.height,
      rx: uiAttributes.rx,
      ry: uiAttributes.ry,
      fill: 'white',
      'stroke-width': uiAttributes.strokeWidth, 
      stroke: '#58585A'
    }
    const textAttributes = {
      'font-size': uiAttributes.fontSize,
      x: uiAttributes.px,
      y: uiAttributes.py
    }
    
    const rect = svg('rect', rectAttributes);
    const text = svg('text', textAttributes)
    text.text(node.id);

    const ui = svg('g', {
      transform: `translate(${pos.x}, ${pos.y})`
    });
    ui.appendChild(rect);
    ui.appendChild(text);

    nodeContainer.appendChild(ui);
    nodes.set(node.id, ui);
  }


  function getNodeUIAttributes(nodeId, dRatio) {
    const fontSize = 24 * dRatio + 12;
    const size = textMeasure(nodeId, fontSize);
    const width = size.totalWidth + size.spaceWidth * 6;
    const height = fontSize * 1.6;

    return {
      fontSize,
      width,
      height,
      x: -width/2,
      y: -height/2,
      rx: 15 * dRatio + 2,
      ry: 15 * dRatio + 2,
      px: -width/2 + size.spaceWidth*3,
      py: -height/2 + fontSize * 1.1,
      strokeWidth: 4 * dRatio + 1
    };
  }

  function updatePositions() {
    nodes.forEach((ui, nodeId) => {
      let pos = getNodePosition(nodeId)
      ui.attr('transform', `translate(${pos.x}, ${pos.y})`);
    });
  }

  function getNodePosition(nodeId) {
    return layout.getNodePosition(nodeId);
  }
}
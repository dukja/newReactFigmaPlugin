// 제외 페이지명
const exPageNames = ['A1', 'A2', '▼', 'C1', 'Container', 'Cover', 'Scroll', '제작중', 'Heading','📌CDS가 처음이신가요?'];
// 포함 노드 타입
const nodeTypes = ['COMPONENT_SET', 'COMPONENT', 'INSTANCE','SECTION'];
// 제외 노드명
const exNodeNames = ['example', 'document', 'sample', 'dev', '_', '-dev', 'Guide', 'guide'];
// 필터된 페이지
let pageNodes: any = null;
function getPageNodes() {
  if (pageNodes === null) {
    pageNodes = figma.root.children.filter((page) => !isExPage(page));
  }
  return pageNodes;
}

// 제외 페이지
function isExPage(node: any) {
  return node.type === 'PAGE' && exPageNames.some((name) => node.name?.includes(name));
}
// 포함 노드
function isNode(node: any) {
  return (
    nodeTypes.some((type) => node.type?.includes(type)) &&
    !exNodeNames.some((name) => node.name?.includes(name))
  );
}
// 스타일 노드
function getStyledNode(node: any): any {
  let styles = {
    fill: undefined,
    fills: undefined,
    stroke: undefined,
    strokes: undefined,
    effect: undefined,
    text: undefined,
    height: undefined,
    radius: undefined,
    padding: undefined,
  };
  if (node.fillStyleId) {
    styles.fill = node;
  }
  if (node.fills && node.fills[0] && node.fills[0].boundVariables && node.fills[0].boundVariables['color'] && node.fills[0].boundVariables['color'].id!== undefined) {
    styles.fills = node;
  }
  if (node.strokeStyleId) {
    styles.stroke = node;
  }
  if (node.strokes && node.strokes[0] && node.strokes[0].boundVariables && node.strokes[0].boundVariables['color'] && node.strokes[0].boundVariables['color'].id ) {
    styles.strokes = node;
  }
  if (node.effectStyleId) {
    styles.effect = node;
  }
  if ('textStyleId' in node) { 
    styles.text = node;
  }  
  if (node.height) { 
    styles.height = node.height;
  }  
  let radiusValues = [
    node.topLeftRadius,
    node.topRightRadius,
    node.bottomRightRadius,
    node.bottomLeftRadius
  ].filter(r => r !== undefined);
  if (radiusValues.length > 0) {
    styles.radius = [...new Set(radiusValues)];
  }
  let paddingValues = [
    node.paddingTop,
    node.paddingRight,
    node.paddingBottom,
    node.paddingLeft
  ].filter(r => r !== undefined);
  if (paddingValues.length > 0) {
    styles.padding = [...new Set(paddingValues)];;
  }
  if ('children' in node) {
    for (let child of node.children) {
      let styledChild = getStyledNode(child);
      if (styledChild.fillStyleId && !styles.fill) {
        styles.fill = styledChild;
      }
      if(!styles.fills && styledChild.fills && styledChild.fills[0] && styledChild.fills[0].boundVariables && styledChild.fills[0].boundVariables['color'] && styledChild.fills[0].boundVariables['color'].id) {
        styles.fills = styledChild;
      }
      if (styledChild.strokeStyleId && !styles.stroke) {
        styles.stroke = styledChild;
      }
      if (!styles.strokes && styledChild.strokes && styledChild.strokes[0] && styledChild.strokes[0].boundVariables && styledChild.strokes[0].boundVariables['color'] && styledChild.strokes[0].boundVariables['color'].id) {
        styles.strokes = styledChild;
      }
      if (styledChild.effect && !styles.effect) {
        styles.effect = styledChild.effect;
      }
      if (styledChild.text && !styles.text) {
        styles.text = styledChild.text;
      }
      if (styledChild.height && !styles.height) { 
        styles.height = styledChild.height;
      }  
      let radiusValues = [
        styledChild.topLeftRadius,
        styledChild.topRightRadius,
        styledChild.bottomRightRadius,
        styledChild.bottomLeftRadius
      ].filter(r => r !== undefined);
      if (radiusValues.length > 0) {
        styles.radius = [...new Set(radiusValues)];
      }
      let paddingValues = [
        styledChild.paddingTop,
        styledChild.paddingRight,
        styledChild.paddingBottom,
        styledChild.paddingLeft
      ].filter(r => r !== undefined);
      if (paddingValues.length > 0) {
        styles.padding = [...new Set(paddingValues)];
      }
    }
  }

  return styles;
}

// 스타일 이름
function getStyleName(styleId: any) {
    const style = figma.getStyleById(styleId);
    return style ? style.name : null;
}

function getInArray(array, item) {
  if (Array.isArray(array)&& !array.includes(item)) {
    array=[...array,item];
  }
  return array;
}

const setStyleNameToNodeStyles = (styleId, targetArray) => {
  const styleName = getStyleName(styleId);
  let setArray
  if (styleName) {
     setArray = getInArray(targetArray,styleName); 
  }
  return setArray;
};

type NodeStyle = {
  name: string[]| null;
  fill: string[]| null;
  fills: string[] | null;
  stroke: string[]| null;
  strokes: string[] | null;
  effect: string[]| null;
  text: string[]| null;
  height: string[]| null;
  radius: string[]| null;
  padding: string[]| null;
  defaultVariant: string[] | null;
  type: string[] | null;
};

type PageNodeInfo = {
  pageName: string;
  nodeCount: number;
  nodes: NodeStyle[]; 
}

function setNodeInfo(node: any): NodeStyle{
  let nodeinfo: NodeStyle = {
    name: [],
    fill: [],
    fills: [],
    stroke: [],
    strokes: [],
    effect: [],
    text: [],
    height: [],
    radius: [],
    padding: [],
    defaultVariant: [],
    type:[]
  };// 노드 정보
  if ('children' in node) {
    node.children.forEach((childNode: any) => {
      //스타일 노드
      let styleNodes;
      styleNodes = getStyledNode(childNode);
      //노드 스타일 정보
      if (node.name) {
        nodeinfo.name = node.parent.type !== 'PAGE'? node.parent.type !== 'FRAME'? getInArray(nodeinfo.name,node.name):getInArray(nodeinfo.name,node.parent.name): getInArray(nodeinfo.name,node.name)
      }
      if (styleNodes.fill) {
        nodeinfo.fill = setStyleNameToNodeStyles(styleNodes.fill.fillStyleId, nodeinfo.fill);
      }
      if (styleNodes.stroke) {
        nodeinfo.stroke = setStyleNameToNodeStyles(styleNodes.stroke.strokeStyleId, nodeinfo.stroke);
      }
      if (styleNodes.fills) {
        nodeinfo.fills =  getInArray(nodeinfo.fills,figma.variables.getVariableById(styleNodes.fills.fills[0].boundVariables['color'].id).name);
      }
      if (styleNodes.strokes) {
        nodeinfo.strokes = getInArray(nodeinfo.strokes, figma.variables.getVariableById(styleNodes.strokes.strokes[0].boundVariables['color'].id).name) ;
      }
      if (styleNodes.effect) {
        nodeinfo.effect = setStyleNameToNodeStyles(styleNodes.effect.effectStyleId, nodeinfo.effect);
      }
      if (styleNodes.text) {
        nodeinfo.text = setStyleNameToNodeStyles(styleNodes.text.textStyleId, nodeinfo.text);
      }
      if (styleNodes.height) {
        nodeinfo.height = getInArray(nodeinfo.height,styleNodes.height);
      }
      if (styleNodes.radius) {
        nodeinfo.radius = styleNodes.radius;
      }
      if (styleNodes.padding) {
        nodeinfo.padding = styleNodes.padding;
      }
      if (node.defaultVariant) {
        nodeinfo.defaultVariant = node.defaultVariant.name
      }
      if (node.type) {
        nodeinfo.type = node.type
      }
    });
  }
  return nodeinfo;
}
let nodesinfos: PageNodeInfo[] = []; // 배열로 초기화
// 각 페이지의 노드 정보
function getNodeInfo() {
  if (nodesinfos.length > 0) return;
  const removedPage = getPageNodes();
  removedPage.forEach((page: any) => {
    const nodesinfo: PageNodeInfo = {
      pageName: undefined,
      nodeCount: undefined,
      nodes: [],
    };
    
    nodesinfo.pageName = page.name
    //필터된 노드
    page.children.filter((node) => isNode(node)).forEach((node) => {
      let newNodesList: Node[] = [];
      if(node.type === "SECTION" && node.name.includes("🚫Don't Use")) {
        if (node.children) {
          newNodesList = [...newNodesList, ...node.children]; // 자식 노드 추가
        }
      } else {
        newNodesList = [...newNodesList, node]; // 노드 자체 추가
      }
      newNodesList.forEach((node: any) => {
        let combinedNodeInfo = {
          name: [],
          fill: [],
          fills: [],
          stroke: [],
          strokes: [],
          effect: [],
          text: [],
          height: [],
          radius: [],
          padding: [],
          defaultVariant: [],
          type:[]
          // 기타 필요한 속성들 초기화
        };
        node.children.forEach((child)=>{
          let nodeinfo = setNodeInfo(child)
          combinedNodeInfo.name = [...combinedNodeInfo.name, (nodeinfo.name || [])];
          combinedNodeInfo.fill = [...combinedNodeInfo.fill,(nodeinfo.fill || [])];
          combinedNodeInfo.fills = [...combinedNodeInfo.fills, (nodeinfo.fills || [])];
          combinedNodeInfo.stroke = [...combinedNodeInfo.stroke, (nodeinfo.stroke ||[])];
          combinedNodeInfo.strokes = [...combinedNodeInfo.strokes, (nodeinfo.strokes|| [])];
          combinedNodeInfo.effect = [...combinedNodeInfo.effect, (nodeinfo.effect ||[])];
          combinedNodeInfo.text = [...combinedNodeInfo.text, (nodeinfo.text || [])];
          combinedNodeInfo.height = [...combinedNodeInfo.height, (nodeinfo.height || [])];
          combinedNodeInfo.radius = [...combinedNodeInfo.radius, (nodeinfo.radius || [])];
          combinedNodeInfo.padding = [...combinedNodeInfo.padding, (nodeinfo.padding || [])];
          combinedNodeInfo.defaultVariant = [...combinedNodeInfo.defaultVariant, (nodeinfo.defaultVariant || [])];
          combinedNodeInfo.type = [...combinedNodeInfo.type, (nodeinfo.type || [])];
        })
        combinedNodeInfo.name = [...new Set(combinedNodeInfo.name.flatMap(x => x).filter(x => x.length > 0))];
        combinedNodeInfo.fill = [...new Set(combinedNodeInfo.fill.flatMap(x => x).filter(x => x.length > 0))];
        combinedNodeInfo.fills = [...new Set(combinedNodeInfo.fills.flatMap(x => x).filter(x => x.length > 0))];
        combinedNodeInfo.stroke = [...new Set(combinedNodeInfo.stroke.flatMap(x => x).filter(x => x.length > 0))];
        combinedNodeInfo.strokes = [...new Set(combinedNodeInfo.strokes.flatMap(x => x).filter(x => x.length > 0))];
        combinedNodeInfo.effect = [...new Set(combinedNodeInfo.effect.flatMap(x => x).filter(x => x.length > 0))];
        combinedNodeInfo.text = [...new Set(combinedNodeInfo.text.flatMap(x => x).filter(x => x.length > 0))];
        combinedNodeInfo.height = [...new Set(combinedNodeInfo.height.flatMap(x => x).filter(x => x.length > 0))];
        combinedNodeInfo.radius = [...new Set(combinedNodeInfo.radius.flatMap(x => x).filter(x => x.length > 0))];
        combinedNodeInfo.padding = [...new Set(combinedNodeInfo.padding.flatMap(x => x).filter(x => x.length > 0))];
        combinedNodeInfo.defaultVariant = [...new Set(combinedNodeInfo.defaultVariant.flatMap(x => x).filter(x => x.length > 0))];
        combinedNodeInfo.type = [...new Set(combinedNodeInfo.type.flatMap(x => x).filter(x => x.length > 0))];
        nodesinfo.nodes = [...nodesinfo.nodes, combinedNodeInfo];
      });          
    });
     nodesinfo.nodeCount = nodesinfo.nodes.length
     nodesinfos = [...nodesinfos,nodesinfo];   
     
  });
}

let selectedNodeinfos: any[] = []; // 배열로 초기화
function getSelectedNodeInfo(selectedNodes: any) {
  selectedNodeinfos = [];
  let selectedNodeinfo = [];
  selectedNodes.forEach((selectedNode)=>{
    let nodeinfo = setNodeInfo(selectedNode)
    selectedNodeinfo = [...selectedNodeinfo,nodeinfo];
  })
  selectedNodeinfos = [selectedNodeinfo]
}

figma.showUI(__html__, { width: 900, height: 600, title: 'Asset Filter' });

figma.ui.onmessage = (message) => {
  if (message.type === 'open-external-link') {
    figma.notify(`브라우저에서 붙여넣기`);
  }

  if (message.type === 'request_info') {
    if (nodesinfos.length === 0) {
      getNodeInfo();
    }
  }
  figma.ui.postMessage({
    type: 'get_style',
    nodeStyle: nodesinfos,
  });
  const nodeNames = nodesinfos.map((pc) => ({
    pageName: pc.pageName,
    nodeNames: pc.nodes.map((node: { name: any }) => node.name),
  }));
  figma.ui.postMessage({
    type: 'get_name',
    nodeName: nodeNames,
  });
  if (message.type === 'request_selected') {
    
    if (figma.currentPage.selection.length > 0) {
      getSelectedNodeInfo(figma.currentPage.selection);
    }
  }
  figma.ui.postMessage({
    type: 'get_selected',
    seletedNode: selectedNodeinfos,
  });
};
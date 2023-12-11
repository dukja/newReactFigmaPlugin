// 제외 페이지명
const excludedPageNames = ['A1', 'A2', '▼', 'C1', 'Container', 'Cover', 'Scroll', '제작중', 'Heading','📌CDS가 처음이신가요?'];
// 포함 노드 타입
const includedNodeTypes = ['COMPONENT_SET', 'COMPONENT', 'INSTANCE','SECTION'];
// 제외 노드명
const excludedNodeNames = ['example', 'document', 'sample', 'dev', '_', '-dev', 'Guide', 'guide'];
// 필터된 페이지
let removePage: any = null;
function getRemovePage() {
  if (removePage === null) {
    removePage = figma.root.children.filter((page) => !isExcludedPage(page));
  }
  return removePage;
}

// 제외 페이지
function isExcludedPage(node: any) {
  return node.type === 'PAGE' && node.name && excludedPageNames.some((name) => node.name?.includes(name));
}
// 포함 노드
function isIncludedNode(node: any) {
  return (
    includedNodeTypes.some((type) => node.type.includes(type)) &&
    node.name && !excludedNodeNames.some((name) => node.name?.includes(name))
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
  let radiusValues = [
    node.topLeftRadius,
    node.topRightRadius,
    node.bottomRightRadius,
    node.bottomLeftRadius
  ].filter(r => r !== undefined);

  if (radiusValues.length > 0) {
    styles.radius = radiusValues;
  }
  if (node.paddingBottom || node.paddingLeft || node.paddingRight || node.paddingTop) {
    styles.padding = node;
  }
  if ('children' in node) {
    for (let child of node.children) {
      let styledChild = getStyledNode(child);
       console.log('styledChild',styledChild)
      if (styledChild.fillStyleId && !styles.fill) {
        styles.fill = styledChild;
      }
      if(styles.fills === undefined && styledChild.fills && styledChild.fills[0] && styledChild.fills[0].boundVariables && styledChild.fills[0].boundVariables['color'] && styledChild.fills[0].boundVariables['color'].id!== undefined) {
        styles.fills = styledChild;
      }
      if (styledChild.stroke && !styles.stroke) {
        styles.stroke = styledChild.stroke;
      }
      if (styles.strokes === undefined && styledChild.strokes && styledChild.strokes[0] && styledChild.strokes[0].boundVariables && styledChild.strokes[0].boundVariables['color'] && styledChild.strokes[0].boundVariables['color'].id !== undefined) {
        styles.strokes = styledChild;
      }
      if (styledChild.effect && !styles.effect) {
        styles.effect = styledChild.effect;
      }
      if (styledChild.text && !styles.text) {
        styles.text = styledChild.text;
      }
      if (styles.radius === undefined && styledChild.topLeftRadius || styledChild.topRightRadius || styledChild.bottomLeftRadius || styledChild.bottomRightRadius) {
        styles.radius = styledChild;
      }
      if (styles.padding === undefined && styledChild.paddingBottom || styledChild.paddingLeft || styledChild.paddingRight || styledChild.paddingTop) {
        styles.padding = styledChild;
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
  // array가 undefined거나 null일 경우 빈 배열로 초기화
  if (!array) {
    return [item]
  }
  // array에 item이 포함되어 있지 않다면 추가
  if (Array.isArray(array)&& !array.includes(item)) {
    array.push(item);
  }
  return array;
}
// 스타일 이름 추가 함수
const setStyleNameToNodeStyles = (styleId, targetArray) => {
  // 노드 스타일 이름
  const styleName = getStyleName(styleId);
  let setArray
  if (styleName) {
     setArray = getInArray(targetArray,styleName); // 새로운 스타일 이름 추가 (중복은 제거됨)
  }
  return setArray; // 중복되는 스타일 이름이 있으면 그냥 현재 배열을 반환
};
type NodeStyle = {
  name: string[]| null;
  fill: string[]| null;
  fills: string | null;
  stroke: string[]| null;
  strokes: string | null;
  effect: string[]| null;
  text: string[]| null;
  height: string[]| null;
  radius: number[]| null;
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
    fills: null,
    stroke: [],
    strokes: null,
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
      console.log('styleNodes1',styleNodes)
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
        nodeinfo.fills = figma.variables.getVariableById(styleNodes.fills.fills[0].boundVariables['color'].id).name;
      }
      if (styleNodes.strokes) {
        nodeinfo.strokes = figma.variables.getVariableById(styleNodes.strokes.strokes[0].boundVariables['color'].id).name;
      }
      if (styleNodes.effect) {
        nodeinfo.effect = setStyleNameToNodeStyles(styleNodes.effect.effectStyleId, nodeinfo.effect);
      }
      if (styleNodes.text) {
        nodeinfo.text = setStyleNameToNodeStyles(styleNodes.text.textStyleId, nodeinfo.text);
      }
      if (childNode.height) {
        nodeinfo.height = getInArray(nodeinfo.height,childNode.height);
      }
      if (styleNodes.radius) {
        nodeinfo.radius = styleNodes.radius.topLeftRadius,styleNodes.radius.topRightRadius,styleNodes.radius.bottomRightRadius,styleNodes.radius.bottomLeftRadius;
      }
      if (styleNodes.padding) {
        nodeinfo.padding = [styleNodes.padding.paddingTop,styleNodes.padding.paddingRight,styleNodes.padding.paddingBottom,styleNodes.padding.paddingLeft];
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
  const removedPage = getRemovePage();
  removedPage.forEach((page: any) => {
    const nodesinfo: PageNodeInfo = {
      pageName: undefined,
      nodeCount: undefined,
      nodes: [],
    };
    
    nodesinfo.pageName = page.name
    //필터된 노드
    page.children.filter((node: any) => isIncludedNode(node)).forEach((node) => {
      let newNodesList: Node[] = [];
      if(node.type === "SECTION" && node.name.includes("🚫Don't Use")) {
        if (node.children) {
          newNodesList = [...newNodesList, ...node.children]; // 자식 노드 추가
        }
      } else {
        newNodesList = [...newNodesList, node]; // 노드 자체 추가
      }
      newNodesList.forEach((node: any) => {
        let nodeinfo = setNodeInfo(node)
        console.log(node)
        nodesinfo.nodes = [...nodesinfo.nodes,nodeinfo];
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
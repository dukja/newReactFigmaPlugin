
// 제외 페이지명
const excludedPageNames = ['A1', 'A2', '▼', 'C1', 'Container', 'Cover', 'Scroll', '제작중', 'Heading'];
// 포함 노드 타입
const includedNodeTypes = ['COMPONENT_SET', 'COMPONENT', 'INSTANCE','FRAME','TEXT'];
// 제외 노드명
const excludedNodeNames = ['example', 'document', 'sample', 'dev', '_', '-dev', 'Guide', 'guide'];
// 필터된 페이지
let removePage: any = null;
function getremovePage() {
  if (removePage === null) {
    removePage = figma.root.children.filter((page) => !isExcludedPage(page));
  }
  return removePage;
}

// 제외 페이지
function isExcludedPage(node: any) {
  return node.type === 'PAGE' && excludedPageNames.some((name) => node.name.includes(name));
}
// 포함 노드
function isIncludedNode(node: any) {
  return (
    includedNodeTypes.some((type) => node.type.includes(type)) &&
    !excludedNodeNames.some((name) => node.name.includes(name))
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
    font: undefined,
    radius: undefined,
    padding: undefined,
  };
  
  if (node.fillStyleId) {
    styles.fill = node;
  }
  if (node.strokeStyleId) {
    styles.stroke = node;
  }
  if (node.fills && node.fills[0] && node.fills[0].boundVariables && node.fills[0].boundVariables['color'] && node.fills[0].boundVariables['color'].id) {
    styles.fills = node;
  }  
  if (node.strokes && node.strokes[0] && node.strokes[0].boundVariables && node.strokes[0].boundVariables['color'] && node.strokes[0].boundVariables['color'].id) {
    styles.strokes = node;
  }  
  if (node.effectStyleId) {
    styles.effect = node;
  }
  if ('textStyleId' in node) { 
    styles.font = getStyleName(node.textStyleId);
    // console.log(node.textStyleId,getStyleName(node.textStyleId));
  }
  console.log("styles",styles)
  if (node.topLeftRadius || node.topRightRadius || node.bottomLeftRadius || node.bottomRightRadius) {
    styles.radius = node;
  }
  if (node.paddingBottom || node.paddingLeft || node.paddingRight||node.paddingTop) {
    styles.padding = node;
  }
  if ('children' in node) {
    for (let child of node.children) {
      let styledChild = getStyledNode(child);
      if (styles.fill === undefined && styledChild.fillStyleId !== undefined ) {
        styles.fill = styledChild;
      }
      if (styles.stroke === undefined && styledChild.strokeStyleId !== undefined  ) {
        styles.stroke = styledChild;
      }
      if (styles.fills === undefined && styledChild.fills && styledChild.fills[0] && styledChild.fills[0].boundVariables && styledChild.fills[0].boundVariables['color'] && styledChild.fills[0].boundVariables['color'].id=== undefined) {
        styles.fills = styledChild
      }  
      if (styles.strokes === undefined && styledChild.strokes && styledChild.strokes[0] && styledChild.strokes[0].boundVariables && styledChild.strokes[0].boundVariables['color'] && styledChild.strokes[0].boundVariables['color'].id !== undefined) {
        styles.strokes = styledChild
      }  
      if (styles.effect === undefined && styledChild.effectStyleId !== undefined  ) {
        styles.effect = styledChild;
      }
      if (styles.font === undefined && 'textStyleId' in styledChild) {
        styles.font = getStyleName(styledChild.textStyleId);
      }
      if (styles.radius === undefined && styledChild.topLeftRadius || styledChild.topRightRadius || styledChild.bottomLeftRadius || styledChild.bottomRightRadius) {
        styles.radius =styledChild
      }
      if (styles.padding === undefined && styledChild.paddingBottom || styledChild.paddingLeft || styledChild.paddingRight||styledChild.paddingTop) {
        styles.padding = styledChild;
      }
    }
  }  

  return styles;
 
}

// 스타일 이름
function getStyleName(styleId: any) {
  if (typeof styleId === 'string') {
    const style = figma.getStyleById(styleId);
    return style ? style.name : null;
  } else {
    // 유효하지 않은 styleId 처리 (예: 심볼 타입인 경우)
    return null; // 또는 에러 처리
  }
}

function getInArray (array,item) {
  let getArray = array;
 if(!array.includes(item)){
  getArray = [...array, item];
 }
 return getArray
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
  name: string;
  fill: string[];
  stroke: string[];
  fills: string[];
  strokes: string[];
  effect: string[];
  text: string[];
  height: number[];
  radius: number[];
  padding: number[];
  defaultVariant: string | null;
};

type PageNodeInfo = {
  pageName: string;
  nodes: NodeStyle[];
};

// 노드 정보
let nodesinfos: any[] = []; // 배열로 초기화

// 각 페이지의 노드 정보
function getNodeInfo() {
  if (nodesinfos.length > 0) return;
  const removedPage = getremovePage();
  removedPage.forEach((page: any) => {
    //필터된 노드
    const removedNode = page.children.filter((node: any) => isIncludedNode(node));
    const nodesinfo: PageNodeInfo = {
      pageName: page.name,
      nodes: [],
    };
    type Node = {
      type: string;
      name: string;
      children?: Node[];
    };

  let newNodesList: Node[] = [];
  removedNode.forEach((node: any) => {
    if(node.type === "FRAME"){
      if(node.name.includes("🚫")){
          if (node.children) {
              newNodesList = [...newNodesList, ...node.children];
          }}
      else{return}
    }else{
        newNodesList = [...newNodesList, node];
    }})
    newNodesList.forEach((node: any) => {
      const nodeInfo = {
        name: node.name,
        fill: [],
        fills: [],
        stroke: [],
        strokes: [],
        effect: [],
        font: [],
        height:[],
        radius:[],
        padding:[],
        defaultVariant: node.defaultVariant ? node.defaultVariant.name : null,
      };
      if ('children' in node) {
        
        node.children.forEach((childNode: any) => {
          //스타일 노드
          const styleNodes = getStyledNode(childNode);

          //노드 스타일 정보
          if (styleNodes.fill) {
            nodeInfo.fill = setStyleNameToNodeStyles(styleNodes.fill.fillStyleId, nodeInfo.fill);
          }
          if (styleNodes.stroke) {
            nodeInfo.stroke = setStyleNameToNodeStyles(styleNodes.stroke.strokeStyleId, nodeInfo.stroke);
          }
          if (styleNodes.fills) {
            if (styleNodes.fills.fills[0]!== undefined && styleNodes.fills.fills[0].boundVariables!== undefined && styleNodes.fills.fills[0].boundVariables['color']!== undefined && styleNodes.fills.fills[0].boundVariables['color'].id !== undefined)  {
              const fills = figma.variables.getVariableById(styleNodes.fills.fills[0].boundVariables['color'].id).name;
              nodeInfo.fills = [...nodeInfo.fills,fills]
            }
          }
          if (styleNodes.strokes) {
            if (styleNodes.strokes.strokes[0]!== undefined && styleNodes.strokes.strokes[0].boundVariables!== undefined && styleNodes.strokes.strokes[0].boundVariables['color'] !== undefined && styleNodes.strokes.strokes[0].boundVariables['color'].id !== undefined) {
              const strokes = figma.variables.getVariableById(styleNodes.strokes.strokes[0].boundVariables['color'].id).name;
              nodeInfo.strokes = [...nodeInfo.strokes,strokes]
            }
          }
          if (styleNodes.effect) {
            nodeInfo.effect = setStyleNameToNodeStyles(styleNodes.effect.effectStyleId, nodeInfo.effect);
          }
          if (styleNodes.font) {
            nodeInfo.font = setStyleNameToNodeStyles(styleNodes.font.textStyleId, nodeInfo.font);
          }
          if (childNode.height) {
            nodeInfo.height = childNode.height
          }      
          if (styleNodes.radius) {
            nodeInfo.radius = styleNodes.radius.topLeftRadius
          }
          if (styleNodes.padding) {
            nodeInfo.padding = styleNodes.padding
          }
        });
        nodesinfo.nodes = [...nodesinfo.nodes, nodeInfo];
      }
    });
    nodesinfos = [...nodesinfos, nodesinfo];
  });
}

// 선택 노드 정보
let selectedNodeinfos: any[] = []; // 배열로 초기화
function getSelectedNodeInfo(selectedNodes: any) {
  const selectedNodeinfo = {
    name: [],
    fill: [],
    fills: undefined,
    stroke: [],
    strokes:undefined,
    effect: [],
    font: undefined,
    height: [],
    radius: [],
    padding: [],
    defaultVariant: selectedNodes.defaultVariant ? selectedNodes.defaultVariant.name : null,
  };
  
  if ('children' in selectedNodes) {
    selectedNodes.children.forEach((childNode: any) => {
      //스타일 노드
      const styleNodes = getStyledNode(childNode);
      console.log("font", styleNodes.font)
      //노드 스타일 정보
      if (selectedNodes.name) {
        selectedNodeinfo.name = selectedNodes.parent.type !== 'PAGE'? getInArray(selectedNodeinfo.name,selectedNodes.parent.name): getInArray(selectedNodeinfo.name,selectedNodes.name)
      }
      if (styleNodes.fill) {
        selectedNodeinfo.fill = setStyleNameToNodeStyles(styleNodes.fill.fillStyleId, selectedNodeinfo.fill);
      }
      if (styleNodes.stroke) {
        selectedNodeinfo.stroke = setStyleNameToNodeStyles(styleNodes.stroke.strokeStyleId, selectedNodeinfo.stroke);
      }          
      if (styleNodes.fills) {
        selectedNodeinfo.fills = figma.variables.getVariableById(styleNodes.fills.fills[0].boundVariables['color'].id).name;
      }
      if (styleNodes.strokes) {
        selectedNodeinfo.strokes = figma.variables.getVariableById(styleNodes.strokes.strokes[0].boundVariables['color'].id).name;
      }
      if (styleNodes.effect) {
        selectedNodeinfo.effect = setStyleNameToNodeStyles(styleNodes.effect.effectStyleId, selectedNodeinfo.effect);
      }
      if (styleNodes.font) {
        selectedNodeinfo.font = setStyleNameToNodeStyles(styleNodes.font, selectedNodeinfo.font);
        console.log("text")
      }
      if (childNode.height) {
        selectedNodeinfo.height = childNode.height;
      }
      if (styleNodes.radius) {
        selectedNodeinfo.radius = [styleNodes.radius.topLeftRadius,styleNodes.radius.topRightRadius,styleNodes.radius.bottomRightRadius,styleNodes.radius.bottomLeftRadius];
      }
      if (styleNodes.padding) {
        selectedNodeinfo.padding = [styleNodes.padding.paddingTop,styleNodes.padding.paddingRight,styleNodes.padding.paddingBottom,styleNodes.padding.paddingLeft];
      }
    });
    
  }    
  selectedNodeinfos = [selectedNodeinfo];
}


figma.showUI(__html__, { width: 900, height: 600, title: 'CDS Asset Filter' });

figma.ui.onmessage = (message) => {
  if (message.type === 'request_info') {
    if (nodesinfos.length === 0) {
      getNodeInfo();
    }
  }
  if (message.type === 'open-external-link') {
    figma.notify(`브라우저에서 붙여넣기`);
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
    if (figma.currentPage.selection[0] !== null) {
      getSelectedNodeInfo(figma.currentPage.selection[0]);
    }
  }
  figma.ui.postMessage({
    type: 'get_selected',
    seletedNode: selectedNodeinfos,
  });
};
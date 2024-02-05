const excludedPageNames = ['A1', 'A2', '▼', 'C1', 'Container', 'Cover', 'Scroll', '(작업중)','(검토중)','Heading', '📌'];
// 포함 노드 타입
// 제외 페이지명
const includedNodeTypes = ['COMPONENT_SET', 'COMPONENT','SECTION'];
// 제외 노드명
const excludedNodeNames = ['example', 'document', 'sample', 'dev', '_', '-dev', 'Guide', 'guide'];
// 필터된 페이지
let isPageNodes: any = null;
function getPages() {
  if (isPageNodes) return;
  return isPageNodes = figma.root.children.filter((page) => !isExcludedPage(page));
}

// 제외 페이지
function isExcludedPage(node: any) {
  return node.type === 'PAGE' && node.name && excludedPageNames.some((name) => node.name?.includes(name));
}
// 포함 노드
function getNodes(node: any) {
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
    textStyle: undefined,
    radius: undefined,
    padding: undefined,
  };

  if (node.fillStyleId) {
    styles.fill = node;
  }
  if (node?.fills?.[0]?.boundVariables?.['color']?.id) {
    styles.fills = node;
  }
  if (node.strokeStyleId) {
    styles.stroke = node;
  }
  if (node?.strokes?.[0]?.boundVariables?.['color']?.id ) {
    styles.strokes = node;
  }
  if (node.effectStyleId) {
    styles.effect = node;
  }
  if ('textStyleId' in node) { 
    styles.text = node;
  }  
  if ('textStyleId' in node) { 
    styles.textStyle = node;
  }  
  if (node.topLeftRadius || node.topRightRadius || node.bottomLeftRadius || node.bottomRightRadius) {
    styles.radius = node;
  }
  if (node.paddingBottom || node.paddingLeft || node.paddingRight || node.paddingTop) {
    styles.padding = node;
  }
  if ('children' in node && node.children.length > 0) {
    node.children.forEach(child => {
      let childStyles = getStyledNode(child);
      Object.keys(styles).forEach(key => {
        if (!styles[key] && childStyles[key]) {
          styles[key] = childStyles[key];
        }
      });
    });
  }
  return styles;
}
function getArray(array, item) {
  if (Array.isArray(item)) {
    let itemExists = array.some(subArray => {
      return subArray.length === item.length && subArray.every((element, index) => {
        return element === item[index];
      });
    });
  
    if (!itemExists) {
      array=[...array,item]
    }
  }
    
  if (!Array.isArray(item) && !array.includes(item)) {
    array=[...array,item]
  }
  return array;
}
// 스타일 이름
function getStyleName(styleId: string): string | undefined {
  // styleId가 문자열인지 확인하고, 빈 문자열이 아닌지도 체크합니다.
  if (typeof styleId === 'string' && styleId.trim() !== '') {
    // figma.getStyleById를 호출하여 스타일 객체를 가져옵니다.
    // 옵셔널 체이닝을 사용하여 name 속성이 존재하는 경우에만 접근합니다.
    const style = figma.getStyleById(styleId);
    return style?.name;
  } else {
    // styleId가 유효하지 않은 경우, 콘솔에 경고를 출력하거나 undefined를 반환할 수 있습니다.
    console.warn('Invalid styleId:', styleId);
    return undefined;
  }
}


// 노드 정보
let nodesinfos: any[] = []; // 배열로 초기화

// 선택 노드 정보
let selectedNodeinfos: any[] = []; // 배열로 초기화
const selectedNodeinfo = {
  name: [],
  fill: [],
  fills: [],
  stroke: [],
  strokes: [],
  effect: [],
  text: [],
  textStyle: [],
  height: [],
  radius: [],
  padding: [],
  defaultVariant: [],
  nodeType: []
};
function setNodeInfo(nodes,info){
    if(Array.isArray(nodes.children)){
      nodes.children.forEach((childNode: any) => {
        //스타일 노드
        const styleNodes = getStyledNode(childNode);
        //노드 스타일 정보
        if (nodes.name) {
          info.name = nodes.parent.type === 'COMPONENT_SET'? getArray(info.name,nodes.parent.name): getArray(info.name,nodes.name);
        }
        if (styleNodes.fill) {
          info.fill = getArray(info.fill,getStyleName(styleNodes.fill.fillStyleId));
        }
        if (styleNodes.fills) {
          info.fills = getArray(info.fills,figma.variables.getVariableById(styleNodes.fills.fills?.[0]?.boundVariables?.['color'].id)?.name) ;
        }
        if (styleNodes.stroke) {
          info.stroke = getArray(info.stroke,getStyleName(styleNodes.stroke.strokeStyleId));
        }
        if (styleNodes.strokes) {
          info.strokes = getArray(info.strokes,figma.variables.getVariableById(styleNodes.strokes.strokes?.[0]?.boundVariables?.['color'].id)?.name);
        }
        if (styleNodes.effect) {
          info.effect = getArray(info.effect,getStyleName(styleNodes.effect.effectStyleId));
        }
        if (styleNodes.text) {
          info.text = getArray(info.text,getStyleName(styleNodes.text.textStyleId));
        }
        if (styleNodes.textStyle) {
          info.textStyle = getArray(info.textStyle,getStyleName(styleNodes.text.fillStyleId));
        }
        if (childNode.height) {
          info.height = getArray(info.height,childNode.height);
        }
        if (styleNodes.radius) {
          info.radius = getArray(info.radius,[styleNodes.radius.topLeftRadius,styleNodes.radius.topRightRadius,styleNodes.radius.bottomRightRadius,styleNodes.radius.bottomLeftRadius]);
        }
        if (styleNodes.padding) {
          info.padding = getArray(info.padding,[styleNodes.padding.paddingTop,styleNodes.padding.paddingRight,styleNodes.padding.paddingBottom,styleNodes.padding.paddingLeft]);
        }
        info.defaultVariant = nodes.defaultVariant;
        info.nodeType = nodes.parent.type ===  'COMPONENT_SET' || nodes.type;
    });}
}
// 각 페이지의 노드 정보
function getNodeInfo() {
  if (nodesinfos.length>0) return;
  const isPages = getPages();
    isPages.forEach((page: any) => {
      //필터된 노드
      const isNodes = page.children.filter((node: any) => getNodes(node));
      const nodesinfo:any = {
        pageName: page.name,
        pageCount: page.length,
        nodes:[],
      };
      let newNodesWrap: Node[] = [];
      isNodes.forEach((nodes: any) => {
        if(nodes.type === "SECTION" && nodes.name.includes("🚫") && nodes.children){
          newNodesWrap = [...newNodesWrap, ...nodes.children];
        }else{
          newNodesWrap = [...newNodesWrap, nodes];
        }
      })

      newNodesWrap.forEach((nodes: any) => {
        const nodeInfo = {
          name: [],
          fill: [],
          fills: [],
          stroke: [],
          strokes: [],
          effect: [],
          text: [],
          textStyle: [],
          height: [],
          radius: [],
          padding: [],
          defaultVariant: [],
          nodeType: []
        };

        if((nodes.type !=='COMPONENT_SET')){
          setNodeInfo(nodes, nodeInfo)
        }
        if ('children' in nodes) {
          nodes.children.forEach((childNode: any) => {
            setNodeInfo(childNode, nodeInfo)
          });
        }
        nodesinfo.nodes = [...nodesinfo.nodes, nodeInfo];

      });
      nodesinfos = [...nodesinfos, nodesinfo];
    });
}
function getSelectedNodeInfo(selectedNodes: any) {
  selectedNodes.forEach((selectedNode)=>{
    setNodeInfo(selectedNode, selectedNodeinfo)
    return selectedNodeinfos = [...selectedNodeinfos,selectedNodeinfo];;
  })
}



figma.showUI(__html__, { width: 900, height: 600, title: 'CDS Asset Filter' });

figma.ui.onmessage = (message) => {

  if (message.type === 'open-external-link') {
    figma.notify(`브라우저에서 붙여넣기`);
  }

  if (message.type === 'request_style') {
    if (nodesinfos.length === 0) {
      getNodeInfo();
    }
  }
  if (message.type === 'request_reset') {
      nodesinfos.length= 0
      selectedNodeinfos.length = 0;
  }
  if (message.type === 'request_selected') {
    selectedNodeinfos = [];
    if (figma.currentPage.selection) {
      getSelectedNodeInfo(figma.currentPage.selection);
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
    nodeName: nodesinfos.length>0?nodeNames:0,
  });
  figma.ui.postMessage({
    type: 'get_selected',
    seletedNode: selectedNodeinfos,
  });
  figma.ui.postMessage({
    type: 'get_reset',
    nodeStyle: nodesinfos,
    seletedNode: selectedNodeinfos,
  });
};
// 제외 페이지명
const excludedPageNames = [
  "A1",
  "A2",
  "🚫",
  "▼",
  "C1",
  "Container",
  "Cover",
  "Scroll",
  "제작중",
  "Heading"
];
// 포함 노드 타입
const includedNodeTypes = ["COMPONENT_SET", "COMPONENT","INSTANCE"];
// 제외 노드명
const excludedNodeNames = ["example", "document", "sample", "dev", "_","-dev","Guide","guide"];
// 필터된 페이지
let removePage:any = null;
function getremovePage() {
  if (removePage === null) {
    removePage = figma.root.children.filter((page) => !isExcludedPage(page));
  }
  return removePage;
}



// 제외 페이지
function isExcludedPage(node: any) {
  return (
    node.type === "PAGE" &&
    excludedPageNames.some((name) => node.name.includes(name))
  );
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
    fill: null,
    stroke: null,
    effect: null
  };

  if (node.fillStyleId) {
    styles.fill = node;
  }
  if (node.strokeStyleId) {
    styles.stroke = node;
  }
  if (node.effectStyleId) {
    styles.effect = node;
  }

  if ("children" in node) {
    for (let child of node.children) {
      let styledChild = getStyledNode(child);
      if (styledChild.fill && !styles.fill) {
        styles.fill = styledChild.fill;
      }
      if (styledChild.stroke && !styles.stroke) {
        styles.stroke = styledChild.stroke;
      }
      if (styledChild.effect && !styles.effect) {
        styles.effect = styledChild.effect;
      }
    }
  }

  return styles;
}


// 스타일 이름
function getStyleName(styleId:any) {
  const style = figma.getStyleById(styleId);
  return style ? style.name : null;
}

const addStyleNameToNodeStyles = (styleId: any, targetArray: any) => {
  // 노드 스타일 이름
  const styleName = getStyleName(styleId);
  if (styleName && !targetArray.includes(styleName)) {
    return [...targetArray, styleName];
  }
  return targetArray;
};
type NodeStyle = {
  name: string;
  fill: string[];
  stroke: string[];
  effect: string[];
  defaultVariant: string | null;
};

type PageNodeInfo = {
  pageName: string;
  nodes: NodeStyle[];
};

// 노드 정보
let nodesinfos: any[] = [];  // 배열로 초기화


// 각 페이지의 노드 정보
function getNodeInfo(){
  if (nodesinfos.length > 0) return;
  const removedPage = getremovePage();
  removedPage.forEach((page :any) => {
    //필터된 노드
    const removedNode = page.children.filter((node :any) => isIncludedNode(node));
    const nodesinfo: PageNodeInfo = {
      pageName: page.name,
      nodes: [],
    };    
    removedNode.forEach((node:any) => {
      const nodeInfo = { name: node.name, fill: [], stroke: [], effect: [], defaultVariant: node.defaultVariant?node.defaultVariant.name:null};
      if ("children" in node) {

        node.children.forEach((childNode:any) => {  
          //스타일 노드
          const styleNodes = getStyledNode(childNode);
          //노드 스타일 정보
          if (styleNodes.fill) {
            nodeInfo.fill=addStyleNameToNodeStyles(styleNodes.fill.fillStyleId, nodeInfo.fill);
          }
          if (styleNodes.stroke) {
            nodeInfo.stroke=addStyleNameToNodeStyles(styleNodes.stroke.strokeStyleId, nodeInfo.stroke);
          }
          if (styleNodes.effect) {
            nodeInfo.effect=addStyleNameToNodeStyles(styleNodes.effect.effectStyleId, nodeInfo.effect);
          }
        });

        nodesinfo.nodes = [...nodesinfo.nodes,nodeInfo]
      }
    });
    nodesinfos = [...nodesinfos , nodesinfo]
  });
}

// 선택 노드 정보
let selectednNodeinfos: any[] = [];  // 배열로 초기화
function getSelectedNodeInfo (selectednNode:any) {
  const  selectednNodeinfo = {name: selectednNode.name, fill: [], stroke: [], effect: [], defaultVariant: selectednNode.defaultVariant?selectednNode.defaultVariant.name:null}
  if ("children" in selectednNode) {
    selectednNode.children.forEach((childNode:any) => {  
    //스타일 노드
    const styleNodes = getStyledNode(childNode);
    //노드 스타일 정보
    if (styleNodes.fill) {
      selectednNodeinfo.fill=addStyleNameToNodeStyles(styleNodes.fill.fillStyleId, selectednNodeinfo.fill);
    }
    if (styleNodes.stroke) {
      selectednNodeinfo.stroke=addStyleNameToNodeStyles(styleNodes.stroke.strokeStyleId, selectednNodeinfo.stroke);
    }
    if (styleNodes.effect) {
      selectednNodeinfo.effect=addStyleNameToNodeStyles(styleNodes.effect.effectStyleId, selectednNodeinfo.effect);
    }
  });}
  selectednNodeinfos = [selectednNodeinfo]
}




figma.showUI(__html__, { width: 900, height: 600, title: "CDS Asset Filter" });


figma.ui.onmessage = (message) => {

  if (message.type === 'open-external-link') {
    figma.notify(`브라우저에서 붙여넣기`);
  }

  if (message.type === 'request_info') {
    if(nodesinfos.length === 0){
      getNodeInfo()
    }
  }  
    figma.ui.postMessage({
      type: 'get_style',
      nodeStyle: nodesinfos
    });
    const nodeNames = nodesinfos.map(pc => ({
      pageName: pc.pageName,
      nodeNames: pc.nodes.map((node: { name: any; }) => node.name),
    }));      
    figma.ui.postMessage({
      type: 'get_name',
      nodeName: nodeNames
    });
    if (message.type === 'request_selected') {
      if(figma.currentPage.selection[0] !== null){
        getSelectedNodeInfo(figma.currentPage.selection[0])
      }
    }  
    figma.ui.postMessage({
      type: 'get_selected',
      seletedNode: selectednNodeinfos
    });

}
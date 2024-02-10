
function setNode(name) {
  const frame = figma.createFrame();
  return Object.assign(frame,{  
    name : name, 
    layoutMode : "HORIZONTAL", 
    primaryAxisSizingMode : "AUTO",
    counterAxisSizingMode : "AUTO", 
    fills : [{
      type: 'SOLID', 
      color: { r: 1, g: 1, b: 1 }, 
      opacity: 0
    }]
  }); 
}

function getStack(type) {
  let frame = setNode(type);
  const selectedNode = figma.currentPage.selection[0]; 
  if (selectedNode) {
    frame.appendChild(selectedNode);
  }
}
// 이미지 일때 내부 노드
// 스택 상태 노드
// 그리드 샘플
// 테이블 샘플
// 이미지 샘플
// 스페이싱
// asset
// 텍스트 입력
// 버튼 상태 변경
// 샘플 노드 처리, slot 노드 처리
// 재사용 컴포넌트 처리
// 리뷰 컴포넌트
// 컨벤션


figma.showUI(__html__, { width: 600, height: 520, title: 'Create Node' });

figma.ui.onmessage = (message) => {
  switch(message.type){
    case 'request_create':
      const { nodeType } = message;
      return getStack(nodeType)
  }
};
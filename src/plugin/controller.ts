
function setNode(name) {
  const frame = figma.createFrame();
  frame.name = name; 
  frame.layoutMode = "HORIZONTAL"; 
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO"; 
  figma.currentPage.appendChild(frame);
  frame.fills = [{
    type: 'SOLID', // 채우기 타입: 단색
    color: { r: 1, g: 1, b: 1 }, // 색상: 흰색 (RGB 값은 모두 1)
    opacity: 0 // 투명도: 0 (완전 투명)
  }];
  return frame; 
}

function getStack(type) {
  let frame = setNode(type);
  const selectedNode = figma.currentPage.selection[0]; 
  if (selectedNode) {
    frame.appendChild(selectedNode);
  }
}
// 이미지 일때 내부 노드
// 스택 선택 노드
// 그리드 샘플
// 테이블 샘플
// 이미지 샘플

figma.showUI(__html__, { width: 600, height: 520, title: 'Create Node' });

figma.ui.onmessage = (message) => {
  switch(message.type){
    case 'request_create':
      const { nodeType } = message;
      return getStack(nodeType)
  }
};
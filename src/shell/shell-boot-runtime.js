// Keep manual reset useful during playtest.
resetBtn.onclick=()=>{if(confirm('Reset Match hiện tại để test? Room vẫn được giữ nguyên.')){if(S.roomSession)beginNewMatchInRoom()}};
mainBtn.onclick=()=>mainAction();
// v1.11: boot through ShellFlowController only.
S.selectedMode=null;
ShellFlowController.openModeSelect();
if(new URLSearchParams(location.search).get('qa')==='1'){
  setTimeout(()=>{const result=window.DOZEN_QA.run();const pre=document.createElement('pre');pre.id='DOZEN_QA_RESULT';pre.textContent=JSON.stringify(result,null,2);document.body.appendChild(pre);document.title=result.ok?'DOZEN_QA_PASS':'DOZEN_QA_FAIL';},50);
}

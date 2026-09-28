from pathlib import Path

def read(p): return Path(p).read_text(encoding='utf-8')
def write(p,s): Path(p).write_text(s,encoding='utf-8')
def once(s,old,new,label):
    c=s.count(old)
    if c!=1: raise SystemExit(f'{label}: expected 1 anchor, got {c}')
    return s.replace(old,new,1)

p=read('storyprogress.js')
old='function authReady(){return window.CIVILIZATION_AUTH_REQUIRED!==true||!!window.civilizationAuthSession;}function backgroundReady(){return window.BACKGROUND_PRELOAD_READY===true;}function openFormalStory(id){if(typeof openStory!=="function")return false;if(typeof isStoryOpen==="function"&&isStoryOpen())return isStoryOpen(id)===true;return openStory(id,{onComplete:storyId=>{completeStory(storyId);queueResume();}});}'
new='function authReady(){return window.CIVILIZATION_AUTH_REQUIRED!==true||!!window.civilizationAuthSession;}function backgroundReady(){return window.BACKGROUND_PRELOAD_READY===true;}function openFormalStory(id){if(typeof openStory!=="function")return false;if(typeof isStoryOpen==="function"&&isStoryOpen()){const lifecycle=typeof window.activeStoryLifecycleSnapshot==="function"?window.activeStoryLifecycleSnapshot():null;return isStoryOpen(id)===true&&lifecycle?.owner==="formal";}return openStory(id,{lifecycleOwner:"formal",onComplete:storyId=>{completeStory(storyId);queueResume();}});}'
p=once(p,old,new,'formal story owner')
p=once(p,'const lifecycle=typeof window.activeStoryLifecycleSnapshot==="function"?window.activeStoryLifecycleSnapshot():null;if(!lifecycle||lifecycle.storyId!==pending)return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:false,drained:presented>0,presented,deferred:true,reason:"story-identity-unavailable",pendingStory:pending});\n   const closed=await window.waitForStoryClosed({storyId:pending,token:lifecycle.token});','const lifecycle=typeof window.activeStoryLifecycleSnapshot==="function"?window.activeStoryLifecycleSnapshot():null;if(!lifecycle||lifecycle.storyId!==pending||lifecycle.owner!=="formal")return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:false,drained:presented>0,presented,deferred:true,reason:"story-identity-unavailable",pendingStory:pending});\n   const closed=await window.waitForStoryClosed({storyId:pending,token:lifecycle.token,owner:"formal"});','drain formal owner')
write('storyprogress.js',p)

f=read('tests/story/flow.js')
anchor="assert(/activeToken=nextToken\\+\\+/.test(storyui)&&/token-mismatch/.test(storyui)&&/story-mismatch/.test(storyui),'Story lifecycle 必須以 token／storyId 防止誤解鎖');"
addition=anchor+"\nassert(/owner-mismatch/.test(storyui)&&/lifecycleOwner/.test(storyui),'Story lifecycle 必須區分 formal 與 generic owner，避免同 storyId replay／GM 預覽冒充正式流程');\nassert(/lifecycleOwner:\"formal\"/.test(progress)&&/lifecycle\\?\\.owner===\"formal\"/.test(progress),'正式 Story flow 必須只接受 formal lifecycle owner');"
f=once(f,anchor,addition,'flow owner assertion')
write('tests/story/flow.js',f)

t=read('tests/runtime/js-integrity.js')
anchor='assert(/const VERSION=10;/.test(storyUi)&&/LIFECYCLE_WAIT_VERSION=2/.test(storyUi)&&/waitForStoryClosed/.test(storyUi),"Story UI V10 必須提供 identity lifecycle wait API。");'
addition=anchor+'\nassert(/owner-mismatch/.test(storyUi)&&/lifecycleOwner/.test(storyUi)&&/lifecycleOwner:"formal"/.test(storyProgress),"Story lifecycle identity 必須區分 formal／generic owner，避免同 Story ID 的 replay／GM 預覽誤解鎖正式進度。");'
t=once(t,anchor,addition,'runtime owner assertion')
write('tests/runtime/js-integrity.js',t)

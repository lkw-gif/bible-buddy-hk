import {firebaseConfig} from './firebase-config.mjs';
import {mergeProgress, publicMember} from './account-data.mjs';
export const cloudConfigured=Boolean(firebaseConfig?.apiKey&&firebaseConfig?.authDomain&&firebaseConfig?.projectId&&firebaseConfig?.appId);
export function accountError(error) {
  const code=error?.code||'';
  if(code.includes('popup-closed')||code.includes('cancelled-popup'))return '登入視窗已關閉，可以再試。';
  if(code.includes('popup-blocked'))return '請允許登入視窗，並用 Safari 或 Chrome 開啟網站再試。';
  if(code.includes('unauthorized-domain'))return '網站網址未獲 Google 登入授權，請通知網站管理員。';
  if(code.includes('permission-denied'))return '雲端儲存未獲授權，請通知網站管理員檢查設定。';
  if(code.includes('unsupported')||code.includes('disallowed-useragent'))return '請用 Safari 或 Chrome 開啟網站，再登入 Google。';
  if(error?.message==='progress-too-large')return '紀錄太大，未能同步；進度仍保留喺呢部裝置。';
  return '暫時同步唔到，進度已留喺呢部裝置。恢復連線後可以再試。';
}
export async function createCloudAccount(onUser) {
  if(!cloudConfigured)return null;
  const base='https://www.gstatic.com/firebasejs/13.2.0/';
  const [appSdk,authSdk,dbSdk]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
  const app=appSdk.initializeApp(firebaseConfig),auth=authSdk.getAuth(app),db=dbSdk.getFirestore(app);
  await authSdk.setPersistence(auth,authSdk.browserLocalPersistence);
  return {
    observe:()=>authSdk.onAuthStateChanged(auth,onUser),
    login:()=>{const provider=new authSdk.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});return authSdk.signInWithPopup(auth,provider);},
    logout:()=>authSdk.signOut(auth),
    async members(cursor=null) {
      const constraints=[dbSdk.orderBy('xp','desc'),dbSdk.orderBy(dbSdk.documentId(),'desc')];
      if(cursor)constraints.push(dbSdk.startAfter(cursor));
      const snapshot=await dbSdk.getDocs(dbSdk.query(dbSdk.collection(db,'members'),...constraints,dbSdk.limit(50)));
      return {rows:snapshot.docs.map(d=>({id:d.id,...d.data()})),cursor:snapshot.docs.at(-1)||null,more:snapshot.docs.length===50};
    },
    sync(uid,local) {
      if(auth.currentUser?.uid!==uid)throw new Error('account-changed');
      const ref=dbSdk.doc(db,'users',uid,'state','progress');
      return dbSdk.runTransaction(db,async tx=>{
        const snapshot=await tx.get(ref);
        const remote=snapshot.exists()?JSON.parse(snapshot.data().payload):null;
        const merged=mergeProgress(remote,local),payload=JSON.stringify(merged);
        if(new TextEncoder().encode(payload).length>900000)throw new Error('progress-too-large');
        tx.set(ref,{version:1,payload,updatedAt:dbSdk.serverTimestamp()});
        tx.set(dbSdk.doc(db,'members',uid),{...publicMember(merged),updatedAt:dbSdk.serverTimestamp()});
        return merged;
      });
    }
  };
}

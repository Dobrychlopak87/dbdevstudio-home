if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js?v=5',{updateViaCache:'none'}).catch(()=>{}));}

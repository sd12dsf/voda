/* ====== PinkDrop app.js (updated) ====== */

const STORAGE = {
  PRODUCTS: 'pd_products',
  ORDERS: 'pd_orders',
  ADMIN_AUTH: 'pd_admin',
  LANG: 'pd_lang',
  CART: 'pd_cart'
};

// Firebase Realtime Database helper
const firebaseDB = {
  isReady: false,
  db: null,
  init: function(){
    if(!window.firebase || !window.firebase.database) return;
    try {
      this.db = window.firebase.database();
      this.isReady = true;
    } catch(e) {
      console.warn('Firebase DB init failed:', e);
    }
  },
  get: async function(path) {
    if(!this.isReady || !this.db) return null;
    try {
      const ref = this.db.ref(path);
      const snapshot = await ref.get();
      return snapshot.val() || {};
    } catch(e) {
      console.warn('Firebase get failed:', e);
      return null;
    }
  },
  set: async function(path, data) {
    if(!this.isReady || !this.db) return false;
    try {
      await this.db.ref(path).set(data);
      return true;
    } catch(e) {
      console.warn('Firebase set failed:', e);
      return false;
    }
  }
};

const DB = {
  products: () => JSON.parse(localStorage.getItem(STORAGE.PRODUCTS) || '[]'),
  orders: () => JSON.parse(localStorage.getItem(STORAGE.ORDERS) || '[]'),
  saveProducts: (arr) => {
    localStorage.setItem(STORAGE.PRODUCTS, JSON.stringify(arr));
    if(firebaseDB.isReady && firebaseDB.db){
      firebaseDB.db.ref('products').set(arr).catch(e => console.warn('Firebase save products failed:', e));
    }
  },
  saveOrders: (arr) => {
    localStorage.setItem(STORAGE.ORDERS, JSON.stringify(arr));
    if(firebaseDB.isReady && firebaseDB.db){
      firebaseDB.db.ref('orders').set(arr).catch(e => console.warn('Firebase save orders failed:', e));
    }
  },
  cart: () => JSON.parse(localStorage.getItem(STORAGE.CART) || '[]'),
  saveCart: (arr) => localStorage.setItem(STORAGE.CART, JSON.stringify(arr)),
  // Load products from Firebase
  syncProducts: function(callback){
    if(!firebaseDB.isReady || !firebaseDB.db){
      callback && callback();
      return;
    }
    firebaseDB.db.ref('products').once('value', snapshot => {
      const data = snapshot.val();
      if(data && Array.isArray(data)){
        localStorage.setItem(STORAGE.PRODUCTS, JSON.stringify(data));
      }
      callback && callback();
    }).catch(e => {
      console.warn('Firebase sync failed:', e);
      callback && callback();
    });
  }
};

/* ====== Seed with a few real-like images & details ===== */
(function seed(){
  if(DB.products().length === 0){
    DB.saveProducts([
      {id:1,name:'Velvet Tote Bag',price:'$12.99',img:'https://images.unsplash.com/photo-1542293787938-c9e299b8801c?w=800&q=80',country:'China',details:'Stylish velvet tote bag, 35x30cm, perfect for daily use. Ships in 3-6 days.'},
      {id:2,name:'Wireless Earbuds X',price:'$24.50',img:'https://images.unsplash.com/photo-1585386959984-a415522e3b4a?w=800&q=80',country:'China',details:'Bluetooth 5.0 earbuds with charging case. 24h battery, noise reduction.'},
      {id:3,name:'Minimal Watch',price:'$18.00',img:'https://images.unsplash.com/photo-1518544885069-3cddf9b18e2b?w=800&q=80',country:'China',details:'Classic quartz watch, water-resistant, 1-year warranty.'},
      {id:4,name:'Phone Case Pink',price:'$6.99',img:'https://images.unsplash.com/photo-1523475496153-3d6cc9f0c24b?w=800&q=80',country:'China',details:'Soft silicone pink case, fits many models.'},
      {id:5,name:'Thermal Water Bottle',price:'$14.00',img:'https://images.unsplash.com/photo-1548365328-9f4ee6d7b6f4?w=800&q=80',country:'China',details:'500ml stainless steel vacuum insulated bottle.'}
    ]);
  }
})();

/* ===== i18n ===== */
const I18N = {
  en: {place_order:'Place Order',confirm:'Confirm Order',find:'Find products...',buy:'Buy',nav_home:'Home',nav_services:'Services',nav_about:'About',sign_in:'Sign in',sign_out:'Sign out',info1_title:'Worldwide',info1_text:'We ship to all countries',info2_title:'Payments',info2_text:'International cards (via Stripe) + bKash/Nagad',info3_title:'Support',info3_text:'WhatsApp & fast support',view:'View',payment_help_title:'Payment help',payment_help_text:'For international customers we accept cards (Stripe). For bKash/Nagad send money and enter Sender + TxID to verify.',local_auth_title:'Local sign-in',local_auth_msg:'Firebase Google sign-in is not available when opening files locally (file://). Serve the site over http(s) (e.g., run: npx http-server -p 8080), or continue with a local prompt-based sign-in.',run_server:'Copy server command',continue_prompt:'Continue (prompt sign-in)',cancel:'Cancel'},
  bn: {place_order:'অর্ডার করুন',confirm:'অর্ডার নিশ্চিত',find:'পণ্য খুঁজুন...',buy:'কিনুন',nav_home:'হোম',nav_services:'সেবা',nav_about:'আমাদের সম্পর্কে',sign_in:'লগইন',sign_out:'লগআউট',info1_title:'বিশ্বজুড়ে',info1_text:'আমরা সমস্ত দেশে পাঠাই',info2_title:'পেমেন্ট',info2_text:'আন্তর্জাতিক কার্ড (Stripe) + bKash/Nagad',info3_title:'সাহায্য',info3_text:'WhatsApp সহায়তা',view:'ওপেন করুন',payment_help_title:'পেমেন্ট সহায়তা',payment_help_text:'আন্তর্জাতিক গ্রাহকদের জন্য কার্ড (Stripe) গ্রহণ করা হয়। bKash/Nagad এ টাকা পাঠালে Sender + TXID দিয়ে দিন, অ্যাডমিন যাচাই করে পণ্য পাঠাবে।',local_auth_title:'লোকাল সাইন-ইন',local_auth_msg:'ফাইল-প্রোটোকল (file://) এ Firebase Google সাইন-ইন কাজ করে না। সাইটটি http(s) এ সার্ভ করে দেখুন (যেমন: npx http-server -p 8080) অথবা লোকাল প্রম্পট সাইন-ইনের মাধ্যমে চালিয়ে যেতে পারেন।',run_server:'সার্ভার কমান্ড কপি',continue_prompt:'চালিয়ে যান (প্রম্পট সাইন-ইন)',cancel:'বাতিল'},
  hi: {place_order:'ऑर्डर करें',confirm:'पुष्टि करें',find:'उत्पाद खोजেন...',buy:'खरीदें',nav_home:'होम',nav_services:'सेवाएँ',nav_about:'हमारे बारे में',sign_in:'साइन इन',sign_out:'साइन आउट',info1_title:'विश्वव्यापी',info1_text:'हम सभी देशों में शिप करते हैं',info2_title:'भुगतान',info2_text:'अंतरराष्ट्रीय कार्ड (Stripe) + bKash/Nagad',info3_title:'सपोर्ट',info3_text:'WhatsApp सहायता',view:'देखें',payment_help_title:'भुगतान सहायता',payment_help_text:'अंतरराष्ट्रीय ग्राहकों के लिए कार्ड (Stripe) स्वीकार किए जाते हैं। bKash/Nagad के लिए Sender + TXID दर्ज करें, और एडमिन सत्यापित करेगा।'},
  ja: {place_order:'注文する',confirm:'注文を確認',find:'商品を探す...',buy:'購入',nav_home:'ホーム',nav_services:'サービス',nav_about:'会社概要',sign_in:'サインイン',sign_out:'サインアウト',info1_title:'世界中',info1_text:'全世界へ発送',info2_title:'支払い',info2_text:'国際カード (Stripe) + bKash/Nagad',info3_title:'サポート',info3_text:'WhatsApp サポート',view:'見る',payment_help_title:'支払いヘルプ',payment_help_text:'海外のお客様はカード（Stripe）をご利用いただけます。bKash / Nagad の場合は Sender + TXID を入力してください。'},
  ru: {place_order:'Заказать',confirm:'Подтвердить',find:'Найти товары...',buy:'Купить',nav_home:'Главная',nav_services:'Услуги',nav_about:'О нас',sign_in:'Войти',sign_out:'Выйти',info1_title:'По всему миру',info1_text:'Доставляем в все страны',info2_title:'Платежи',info2_text:'Международные карты (Stripe) + bKash/Nagad',info3_title:'Поддержка',info3_text:'WhatsApp поддержка',view:'Открыть',payment_help_title:'Справка по оплате',payment_help_text:'Для международных клиентов принимаются карты (Stripe). Для bKash/Nagad укажите Sender + TXID для проверки.'}
};
let LANG = localStorage.getItem(STORAGE.LANG) || 'en';
function setLang(l){ LANG = l; localStorage.setItem(STORAGE.LANG,l); updateTexts(); renderProducts(); updateUserUI(); }
function updateTexts(){
  const t = I18N[LANG] || I18N.en;
  const q = document.getElementById('q'); if(q) q.placeholder = t.find;
  document.querySelectorAll('.buy-btn').forEach(x=> x.textContent = t.buy);
  const title = document.getElementById('orderTitle'); if(title) title.textContent = t.place_order;
  // nav + sign
  const nh = document.getElementById('navHome'); if(nh) nh.textContent = t.nav_home;
  const ns = document.getElementById('navServices'); if(ns) ns.textContent = t.nav_services;
  const na = document.getElementById('navAbout'); if(na) na.textContent = t.nav_about;
  const sb = document.getElementById('signBtn'); if(sb && !currentUser()) sb.textContent = t.sign_in;
  // info boxes
  const i1t = document.getElementById('info1_title'); if(i1t) i1t.textContent = t.info1_title;
  const i1x = document.getElementById('info1_text'); if(i1x) i1x.textContent = t.info1_text;
  const i2t = document.getElementById('info2_title'); if(i2t) i2t.textContent = t.info2_title;
  const i2x = document.getElementById('info2_text'); if(i2x) i2x.textContent = t.info2_text;
  const i3t = document.getElementById('info3_title'); if(i3t) i3t.textContent = t.info3_title;
  const i3x = document.getElementById('info3_text'); if(i3x) i3x.textContent = t.info3_text;
}

/* ===== Products UI ===== */
function isImageUrl(u){ try{ if(!u) return false; return /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(u); }catch(e){return false;} }

// Try to convert known page links into direct image links (e.g., ibb.co -> i.ibb.co, imgur -> i.imgur.com)
function expandImageLink(u){ try{ if(!u) return u; if(isImageUrl(u)) return u; const m = u.match(/https?:\/\/ibb\.co\/([A-Za-z0-9]+)/); if(m) return `https://i.ibb.co/${m[1]}.jpg`; const mi = u.match(/https?:\/\/(?:www\.)?imgur\.com\/([A-Za-z0-9]+)/); if(mi) return `https://i.imgur.com/${mi[1]}.jpg`; return u; }catch(e){return u;} }

/* ===== Cart Management ===== */
function addToCart(productId){
  const p = DB.products().find(x=>x.id===productId);
  if(!p) return;
  const cart = DB.cart();
  const existing = cart.find(c => c.id === productId);
  if(existing){
    existing.qty += 1;
  } else {
    cart.push({id: productId, name: p.name, price: p.price, img: p.img, qty: 1});
  }
  DB.saveCart(cart);
  updateCartBadge();
  renderCart();
  alert('✓ Added to cart!');
}

function removeFromCart(productId){
  const cart = DB.cart().filter(c => c.id !== productId);
  DB.saveCart(cart);
  updateCartBadge();
  renderCart();
}

function updateCartBadge(){
  const badge = document.getElementById('cartBadge');
  const count = DB.cart().length;
  if(badge){
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function toggleCart(){
  const section = document.getElementById('cartSection');
  if(section) section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

function renderCart(){
  const cartEl = document.getElementById('cartItems');
  const cart = DB.cart();
  if(!cartEl) return;
  cartEl.innerHTML = '';
  if(cart.length === 0){
    cartEl.innerHTML = '<div class="small" style="text-align:center;color:#666;padding:12px">Your cart is empty</div>';
    return;
  }
  let total = 0;
  cart.forEach(item => {
    const price = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
    total += price * item.qty;
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;gap:8px;align-items:center;padding:8px;background:#fff;border-radius:8px;border:1px solid #eee';
    const imgSrc = expandImageLink(item.img) || 'https://via.placeholder.com/50?text=No+Image';
    div.innerHTML = `
      <img src="${imgSrc}" style="width:50px;height:50px;border-radius:6px;object-fit:cover"/>
      <div style="flex:1">
        <div style="font-weight:700;font-size:13px">${item.name}</div>
        <div class="small">${item.price} x ${item.qty}</div>
      </div>
      <button onclick="removeFromCart(${item.id})" style="background:#ffebee;color:#c00;border:0;padding:4px 8px;border-radius:6px;cursor:pointer;font-weight:700">✕</button>
    `;
    cartEl.appendChild(div);
  });
  const totalDiv = document.createElement('div');
  totalDiv.style.cssText = 'padding:8px;background:#fff8fe;border-radius:8px;border-top:2px solid #ff5aa2;margin-top:8px;font-weight:700;color:#ff5aa2;text-align:right';
  totalDiv.textContent = `Total: $${Math.round(total*100)/100}`;
  cartEl.appendChild(totalDiv);
}

function copyLink(link){
  if(navigator.clipboard){
    navigator.clipboard.writeText(link).then(() => {
      alert('✓ Product link copied to clipboard!');
    });
  } else {
    prompt('Copy this link:', link);
  }
}

function renderProducts(){
  const q = (document.getElementById('q')?.value || '').toLowerCase();
  const root = document.getElementById('products'); if(!root) return;
  root.innerHTML = '';
  DB.products().filter(p=>p.name.toLowerCase().includes(q) || (p.country||'').toLowerCase().includes(q) || (p.details||'').toLowerCase().includes(q)).forEach(p=>{
    const div = document.createElement('div'); div.className='card';
    const viewHtml = p.link?`<a href="${p.link}" target="_blank" class="small" style="margin-left:8px">${I18N[LANG]?.view||'View'}</a>`:'';
    const imgSrc = expandImageLink(p.img) || (isImageUrl(p.link)?expandImageLink(p.link):'https://via.placeholder.com/300?text=No+Image');
    const productLink = `${window.location.origin}${window.location.pathname}?product=${p.id}`;
    div.setAttribute('data-product-id', p.id);
    div.innerHTML = `
      <img class="card-img" src="${imgSrc}" alt="${p.name}"/>
      <button class="hover-btn">🔍</button>
      <div class="meta">
        <div style="display:flex;justify-content:space-between;align-items:center"><strong>${p.name}</strong><div class="price">${p.price}</div></div>
        <div class="small">${(p.details||'').slice(0,80)}${(p.details||'').length>80?'...':''}</div>
        <div class="small">From: ${p.country || '—'}</div>
        <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
          <button type="button" class="btn buy-btn" style="flex:1" onclick="selectProduct(${p.id})">${I18N[LANG]?.buy||'Buy'}</button>
          <button type="button" class="btn cart-btn" style="background:#FFD700;color:#000;flex:1" onclick="addToCart(${p.id})">🛒 Cart</button>
          <button type="button" class="btn copy-btn" style="background:#7c3aed;flex:1" title="Copy link" onclick="copyLink('${window.location.origin}${window.location.pathname}?product=${p.id}')">🔗</button>
          ${viewHtml}
        </div>
      </div>`;
    root.appendChild(div);
  });
  updateTexts();
}

// Event delegation for image and hover button clicks (product viewer)
document.addEventListener('click', function(e) {
  const card = e.target.closest('.card');
  if(!card) return;
  
  const productId = parseInt(card.getAttribute('data-product-id'));
  if(!productId) return;
  
  // Handle image and hover button clicks
  if(e.target.classList.contains('card-img') || e.target.classList.contains('hover-btn')){
    console.log('[PD-VIEW] Clicked view for product:', productId);
    e.preventDefault();
    e.stopPropagation();
    showProductViewer(productId);
  }
});

let selectedProduct = null;

// Show product details viewer
function showProductViewer(productId){
  const product = DB.products().find(p => p.id === productId);
  if(!product) return;
  
  const backdrop = document.getElementById('imageViewerBackdrop');
  const viewer = document.getElementById('imageViewer');
  const img = document.getElementById('imageViewerImg');
  const title = document.getElementById('viewerTitle');
  const price = document.getElementById('viewerPrice');
  const details = document.getElementById('viewerDetails');
  const from = document.getElementById('viewerFrom');
  const buyBtn = document.getElementById('viewerBuyBtn');
  const closeBtn = document.getElementById('viewerCloseBtn');
  
  if(backdrop && viewer && img && title && price && details && buyBtn){
    const imgSrc = expandImageLink(product.img) || (isImageUrl(product.link)?expandImageLink(product.link):'https://via.placeholder.com/300?text=No+Image');
    img.src = imgSrc;
    title.textContent = product.name;
    price.textContent = product.price;
    details.textContent = product.details || 'No details available';
    from.textContent = '📍 From: ' + (product.country || 'Unknown');
    
    // Close viewer and open order form
    buyBtn.onclick = () => {
      hideImageViewer();
      selectProduct(productId);
    };
    
    // Close button handler
    if(closeBtn) closeBtn.onclick = hideImageViewer;
    
    backdrop.style.display = 'block';
    viewer.style.display = 'block';
    backdrop.onclick = hideImageViewer;
    viewer.onclick = (e)=>e.stopPropagation();
  }
}

// Show enlarged image viewer (deprecated - now use showProductViewer)
function showImageViewer(imgSrc){
  const product = selectedProduct;
  if(product) showProductViewer(product.id);
}

function closeImageViewerAndBuy(){
  hideImageViewer();
  if(selectedProduct) selectProduct(selectedProduct.id);
}

function hideImageViewer(){
  const backdrop = document.getElementById('imageViewerBackdrop');
  const viewer = document.getElementById('imageViewer');
  if(backdrop) backdrop.style.display = 'none';
  if(viewer) viewer.style.display = 'none';
}

function selectProduct(id){
  console.log('[PD] selectProduct called with id=', id);
  const p = DB.products().find(x=>x.id===id);
  if(!p){ console.warn('[PD] selectProduct: product not found', id); return alert('Product not found'); }
  selectedProduct = p;
  showOrderPanel(p);
}

function showOrderPanel(p){
  const panel = document.getElementById('orderPanel');
  const back = document.getElementById('modalBack');
  selectedProduct = p;
  console.log('[PD] showOrderPanel for product:', p && p.id, 'name:', p && p.name);
  console.log('[PD] currentUser():', currentUser());
  document.getElementById('op_img').src = expandImageLink(p.img) || (isImageUrl(p.link)?expandImageLink(p.link):'https://via.placeholder.com/300?text=No+Image');
  document.getElementById('op_title_detail').textContent = p.name;
  document.getElementById('op_details').textContent = p.details || '';
  document.getElementById('op_price').textContent = p.price;
  // default currency and update converted price
  const curEl = document.getElementById('o_currency'); if(curEl) curEl.value = 'USD';
  document.getElementById('o_qty').value = 1;
  document.getElementById('o_size').value = '';
  // clear manual payment fields
  const t = document.getElementById('o_tx'); if(t) t.value = '';
  updatePriceForCurrency();
  updatePaymentFields();
  // show modal
  if(back) back.style.display = 'block';
  if(panel) panel.style.display = 'block';
  // prefill if user info present
  const cu = currentUser();
  if(cu) document.getElementById('o_name').value = cu;
  const qel = document.getElementById('o_qty'); if(qel) qel.focus();
}

// Hide modal
function hideOrderPanel(){ const panel = document.getElementById('orderPanel'); const back = document.getElementById('modalBack'); if(panel) panel.style.display='none'; if(back) back.style.display='none'; selectedProduct = null; }


/* ===== Login & Gmail requirement ===== */
function login(email){
  // retained for compatibility
  localStorage.setItem('currentUser',email);
}
function firebaseSignIn(){
  // If already signed in locally -> sign out
  if(currentUser()){
    if(window.firebase && firebase.auth){ firebase.auth().signOut().catch(()=>{}); }
    localStorage.removeItem('currentUser'); updateUserUI(); alert('Signed out'); return;
  }

  if(window.firebase && firebase.auth){
    // If environment doesn't support Firebase auth (e.g., file://), show friendly modal with options
    if(!isFirebaseSupportedEnvironment()){
      showSignInModal();
      return;
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(result=>{
      const email = result.user?.email || '';
      if(email.toLowerCase().endsWith('@gmail.com')){ login(email); alert('Signed in: '+email); }
      else { alert('Please sign in with a Gmail account.'); firebase.auth().signOut(); }
    }).catch(err=>{
      if(err && err.code === 'auth/operation-not-supported-in-this-environment'){
        showSignInModal();
      }else{
        alert('Firebase sign-in error: '+(err.message||err));
      }
    });
    return;
  }
  // fallback to prompt (demo)
  loginWithGmail();
} 

function login(email){
  localStorage.setItem('currentUser',email);
  updateUserUI();
}

function updateUserUI(){
  const user = currentUser();
  const signBtn = document.getElementById('signBtn');
  const badge = document.getElementById('userBadge');
  const t = I18N[LANG] || I18N.en;
  if(user){ if(signBtn) signBtn.textContent = t.sign_out; if(badge) badge.textContent = user; }
  else { if(signBtn) signBtn.textContent = t.sign_in; if(badge) badge.textContent = ''; }
}

function loginWithGmail(){
  const email = prompt('Sign in with Gmail (enter your Gmail address)');
  if(!email) return;
  if(!email.toLowerCase().endsWith('@gmail.com')){ alert('Please use a Gmail address to place an order for trust.'); return; }
  login(email);
  alert('Logged in as '+email);
}

function showSignInModal(){
  const t = I18N[LANG] || I18N.en;
  const modal = document.getElementById('localSignModal');
  if(!modal) return alert(t.local_auth_msg || 'Firebase Google sign-in is not available locally.');
  modal.querySelector('.pd-modal-title').textContent = t.local_auth_title || 'Local sign-in';
  modal.querySelector('.pd-modal-msg').textContent = t.local_auth_msg || 'Firebase Google sign-in is not available when opening files locally (file://).';
  modal.querySelector('#pdCopyCmd').textContent = t.run_server || 'Copy server command';
  modal.querySelector('#pdContinuePrompt').textContent = t.continue_prompt || 'Continue (prompt sign-in)';
  modal.querySelector('#pdCancel').textContent = t.cancel || 'Cancel';
  modal.style.display = 'flex';

  // attach handlers (idempotent)
  modal.querySelector('#pdCopyCmd').onclick = function(){
    const cmd = 'npx http-server -p 8080';
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(cmd).then(()=>alert('Copied: '+cmd)).catch(()=>prompt('Copy this command:', cmd)); }
    else prompt('Copy this command:', cmd);
  };
  modal.querySelector('#pdContinuePrompt').onclick = function(){ loginWithGmail(); hideLocalSignModal(); };
  modal.querySelector('#pdCancel').onclick = function(){ hideLocalSignModal(); };
}
function hideLocalSignModal(){ const m = document.getElementById('localSignModal'); if(m) m.style.display='none'; }

function currentUser(){ return localStorage.getItem('currentUser'); }

function isFirebaseSupportedEnvironment(){
  try{
    const proto = (window.location && window.location.protocol) || '';
    if(!(proto === 'http:' || proto === 'https:' || proto === 'chrome-extension:')) return false;
    const key = '__pd_storage_check__'; localStorage.setItem(key,'1'); localStorage.removeItem(key);
    return true;
  }catch(e){
    return false;
  }
}

/* ===== Orders & Payments (simulated where necessary) ===== */
function updatePaymentFields(){
  const pay = document.getElementById('o_pay').value;
  const el = document.getElementById('manualPaymentFields');
  const inst = document.getElementById('paymentInstructions');
  const mobilityFields = document.getElementById('mobilityPaymentFields');
  
  if(pay === 'bkash'){
    el.style.display = 'block';
    mobilityFields.style.display = 'block';
    inst.innerHTML = '📲 Send money to: <strong>01609166109</strong><br/>Then enter your Transaction ID, Sender Number & Screenshot below';
  } else if(pay === 'nagad'){
    el.style.display = 'block';
    mobilityFields.style.display = 'block';
    inst.innerHTML = '📲 Send money to: <strong>01609166109</strong><br/>Then enter your Transaction ID, Sender Number & Screenshot below';
  } else if(pay === 'binance'){
    el.style.display = 'block';
    mobilityFields.style.display = 'block';
    inst.innerHTML = '🪙 Send USDT to Binance ID<br/>Then enter your Transaction ID, Sender ID & Screenshot below';
  } else {
    el.style.display = 'none';
    mobilityFields.style.display = 'none';
  }
  updatePriceForCurrency();
}

function parsePrice(priceStr){
  if(!priceStr) return 0;
  const n = parseFloat(priceStr.replace(/[^0-9.]/g,'')) || 0;
  return n;
}

const CURRENCY_RATES = { USD:1, BDT:110, INR:83, JPY:150, RUB:75, USDT:1 };

function updatePriceForCurrency(){
  const cur = document.getElementById('o_currency')?.value || 'USD';
  const base = selectedProduct ? parsePrice(selectedProduct.price) : 0;
  const rate = CURRENCY_RATES[cur] || 1;
  const qty = parseInt(document.getElementById('o_qty')?.value) || 1;
  const conv = (base * qty * rate);
  window._pd_rate = rate;
  window._pd_converted_total = Math.round(conv*100)/100;
  const symbol = cur === 'USD' ? '$' : cur === 'USDT' ? 'USDT ' : cur + ' ';
  const el = document.getElementById('op_price_conv');
  if(el) el.textContent = `Total: ${symbol}${window._pd_converted_total}`;
}

function showPaymentHelp(){
  const t = I18N[LANG] || I18N.en;
  const msg = t.payment_help_text || 'For international customers we accept cards (Stripe). For bKash/Nagad send money and enter Sender + TxID to verify.';
  alert(msg);
}

function placeOrderFromUI(){
  if(!selectedProduct){ alert('Please select a product first (press Buy)'); return; }
  // require Gmail login for placing real payments
  const user = currentUser();
  if(!user){ if(!confirm('You are not signed in. Sign in with Gmail now?')) return; loginWithGmail(); }
  if(!currentUser() || !currentUser().toLowerCase().endsWith('@gmail.com')){ alert('You must sign in with a Gmail address to place the order.'); return; }

  const paymentMethod = document.getElementById('o_pay').value || 'cod';
  const txid = document.getElementById('o_tx')?.value || '';
  const senderNumber = document.getElementById('o_sender_number')?.value || '';
  const paymentSs = document.getElementById('o_payment_ss')?.value || '';

  // if bkash/nagad/binance require tx details
  if((paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'binance') && !txid){
    alert('Please enter your Transaction ID to verify payment.'); return;
  }
  if((paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'binance') && !senderNumber){
    alert('Please enter your sender mobile number.'); return;
  }

  // ensure price conversion is current
  updatePriceForCurrency();
  const o = {
    id: Date.now(),
    productId: selectedProduct.id,
    productName: selectedProduct.name,
    productDetails: selectedProduct.details || '',
    userName: document.getElementById('o_name').value || currentUser(),
    email: document.getElementById('o_email').value || '',
    phone: document.getElementById('o_phone').value || '',
    postal: document.getElementById('o_postal').value || '',
    address: document.getElementById('o_address').value || '',
    country: document.getElementById('o_country').value || '',
    qty: parseInt(document.getElementById('o_qty').value) || 1,
    size: document.getElementById('o_size').value || '',
    payment: paymentMethod,
    currency: document.getElementById('o_currency')?.value || 'USD',
    currency_rate: window._pd_rate || 1,
    converted_total: window._pd_converted_total || null,
    payment_tx: (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'binance') ? { txid: txid, senderNumber: senderNumber, screenshot: paymentSs } : null,
    binance_id: paymentMethod === 'binance' ? 'BD' + Math.random().toString(36).substr(2,8).toUpperCase() : null,
    status: 'Pending',
    created: new Date().toISOString()
  };

  // handle payment simulation
  if(o.payment === 'card'){
    o.status = 'Paid (card-test)';
    o.paidAt = new Date().toISOString();
  } else if(o.payment === 'bkash' || o.payment === 'nagad' || o.payment === 'binance'){
    o.status = 'Awaiting Payment ('+o.payment+')';
    o.payment_instructions = 'We received your payment details and will verify. Admin will confirm and ship.';
  } else if(o.payment === 'cod'){
    o.status = 'Pending (COD)';
  }

  const arr = DB.orders(); arr.push(o); DB.saveOrders(arr);
  alert('✅ Order placed!\n\nOrder ID: ' + o.id + '\nStatus: ' + o.status + '\n\nWe will verify and ship soon.');
  renderRecentOrders();
  renderUserOrders();
  hideOrderPanel();
}

function getOrderStatusTracker(status){
  const isPending = status.toLowerCase().includes('pending');
  const isConfirmed = status.toLowerCase().includes('confirmed');
  const isShipped = status.toLowerCase().includes('shipped') || status.toLowerCase().includes('paid');
  
  return `
    <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;margin-top:8px;padding:12px;background:#fff8fe;border-radius:8px;border:1px solid #ff88c1">
      <div style="display:flex;gap:16px;align-items:center;flex:1">
        <!-- Pending Stage -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="width:40px;height:40px;border-radius:50%;background:${isPending?'#ff5aa2':'#eee'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px">${isPending?'⏳':'✓'}</div>
          <div style="font-size:11px;color:#666;font-weight:600">Pending</div>
        </div>
        
        <!-- Arrow -->
        <div style="flex:1;height:2px;background:${isConfirmed || isShipped?'#ff5aa2':'#ddd'}"></div>
        
        <!-- Confirmed Stage -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="width:40px;height:40px;border-radius:50%;background:${isConfirmed?'#ff5aa2':'#eee'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px">${isConfirmed?'✓':'▭'}</div>
          <div style="font-size:11px;color:#666;font-weight:600">Confirmed</div>
        </div>
        
        <!-- Arrow -->
        <div style="flex:1;height:2px;background:${isShipped?'#ff5aa2':'#ddd'}"></div>
        
        <!-- Shipped Stage -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="width:40px;height:40px;border-radius:50%;background:${isShipped?'#ff5aa2':'#eee'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px">${isShipped?'🚗':'◯'}</div>
          <div style="font-size:11px;color:#666;font-weight:600">Shipped</div>
        </div>
      </div>
    </div>
  `;
}

function renderRecentOrders(){
  const el = document.getElementById('recentOrdersList'); if(!el) return; el.innerHTML = '';
  const list = DB.orders().slice(-5).reverse();
  if(!list.length){ el.innerHTML = '<div style="padding:12px;text-align:center;color:#999;font-size:13px">No orders yet. Start shopping!</div>'; return; }
  list.forEach(o=>{
    const d = document.createElement('div'); d.className='card'; d.style.marginBottom='12px'; d.style.display='block';
    d.innerHTML = `<div style='margin-bottom:8px'><strong style="color:#ff5aa2">${o.productName}</strong><div class='small'>${o.userName} • ${o.qty} qty • ${o.country}</div><div class='small' style='color:#ff5aa2;margin-top:4px;font-weight:700'>${o.status}</div></div>${getOrderStatusTracker(o.status)}`;
    el.appendChild(d);
  });
}

// Render orders for current signed-in user on Services page
function renderUserOrders(){
  const el = document.getElementById('userOrders'); if(!el) return;
  const user = currentUser(); if(!user){ el.innerHTML = '<div class="card small">Please sign in with Gmail to view your orders.</div>'; return; }
  const list = DB.orders().filter(o => (o.userName||'').toLowerCase() === user.toLowerCase()).sort((a,b)=>b.created.localeCompare(a.created));
  if(!list.length){ el.innerHTML = '<div class="card small">No orders found for your account.</div>'; return; }
  el.innerHTML = '';
  list.forEach(o=>{
    const d = document.createElement('div'); d.className='card'; d.style.marginBottom='8px';
    d.innerHTML = `<div style='display:flex;justify-content:space-between'><div style='flex:1'><strong>${o.productName} <span class='small' style='margin-left:8px'>x${o.qty}</span></strong><div class='small'>Ordered: ${new Date(o.created).toLocaleString()}</div><div class='small'>Status: ${o.status}</div><div class='small'>Payment: ${o.payment} ${o.payment_tx?`• Sender: ${o.payment_tx.sender} • TxID: ${o.payment_tx.txid}`:''}</div><div class='small'>Ship to: ${o.userName} • ${o.phone || '—'} • ${o.address || '—'} • ${o.country || '—'}</div><div class='small'>Details: ${o.productDetails || '—'}</div></div><div style='margin-left:12px;display:flex;flex-direction:column;gap:6px;align-items:flex-end'><div class='small'>${o.converted_total?('Total: '+(o.converted_total)+' '+(o.currency||'')):''}</div>${o.status.startsWith('Awaiting')?"<div class='small' style='color:#d97706'>Awaiting admin verification</div>":''}</div></div>`;
    el.appendChild(d);
  });
}


/* ===== Admin features ===== */
function loginAdmin(){ const pass = document.getElementById('adm_pass')?.value || prompt('Password:'); if(pass === 'admin123'){ localStorage.setItem(STORAGE.ADMIN_AUTH,'1'); showAdmin(); } else alert('Wrong password'); }
function logoutAdmin(){ localStorage.removeItem(STORAGE.ADMIN_AUTH); location.reload(); }
function isAdmin(){ return localStorage.getItem(STORAGE.ADMIN_AUTH) === '1'; }
function showAdmin(){ if(!isAdmin()) return; document.getElementById('authBox').style.display='none'; document.getElementById('adminArea').style.display='block'; renderAdminProducts(); renderAdminOrders(); }

function saveProduct(){
  const id = document.getElementById('p_id').value;
  const name = document.getElementById('p_name').value;
  const price = document.getElementById('p_price').value;
  const img = document.getElementById('p_img').value || 'https://via.placeholder.com/300?text=No+Image';
  const country = document.getElementById('p_country').value;
  const details = document.getElementById('p_details')?.value || '';
  const link = document.getElementById('p_link')?.value || '';
  const sizes = document.getElementById('p_sizes')?.value || '';
  const all = DB.products();
  if(id){ const idx = all.findIndex(x=>x.id==id); if(idx>=0){ all[idx] = {...all[idx],name,price,img,country,details,link,sizes}; DB.saveProducts(all); } }
  else { const nid = all.length?Math.max(...all.map(x=>x.id))+1:1; all.push({id:nid,name,price,img,country,details,link,sizes}); DB.saveProducts(all); }
  document.getElementById('p_id').value=''; document.getElementById('p_name').value=''; document.getElementById('p_price').value=''; document.getElementById('p_img').value=''; document.getElementById('p_country').value=''; document.getElementById('p_details').value=''; document.getElementById('p_link').value=''; document.getElementById('p_sizes').value=''; renderAdminProducts(); renderProducts(); alert('✅ Product saved!'); }

function renderAdminProducts(){ const box = document.getElementById('plist'); box.innerHTML=''; DB.products().forEach(p=>{ const r = document.createElement('div'); r.className='product-row'; const linkHtml = p.link?`<div class='small'><a href='${p.link}' target='_blank'>${I18N[LANG]?.view||'View'}</a></div>`:''; const imgSrc = expandImageLink(p.img) || (isImageUrl(p.link)?expandImageLink(p.link):'https://via.placeholder.com/300?text=No+Image'); r.innerHTML = `<img src="${imgSrc}"/><div style="flex:1"><strong>${p.name}</strong><div class='small'>${p.price} • ${p.country||''}</div><div class='small'>${(p.details||'').slice(0,80)}</div>${linkHtml}</div><div style="display:flex;gap:6px"><button class='btn' onclick='editProduct(${p.id})'>Edit</button><button class='btn danger' onclick='deleteProduct(${p.id})'>Delete</button></div>`; box.appendChild(r); }); }
function editProduct(id){ const p = DB.products().find(x=>x.id===id); if(!p) return; document.getElementById('p_id').value = p.id; document.getElementById('p_name').value = p.name; document.getElementById('p_price').value = p.price; document.getElementById('p_img').value = p.img; document.getElementById('p_country').value = p.country; document.getElementById('p_details').value = p.details; document.getElementById('p_sizes').value = p.sizes || ''; }
function deleteProduct(id){ if(!confirm('Delete product?')) return; const all = DB.products().filter(x=>x.id!==id); DB.saveProducts(all); renderAdminProducts(); renderProducts(); }

function renderAdminOrders(){ const box = document.getElementById('orders'); if(!box) return; box.innerHTML=''; DB.orders().forEach(o=>{ const d = document.createElement('div'); d.className='card'; d.style.marginBottom='8px'; 
    let txHtml = '';
    if(o.payment_tx){ 
      txHtml = `<div class='small' style='margin:4px 0'><strong>📤 TxID:</strong> ${o.payment_tx.txid}</div>`;
      if(o.payment_tx.senderNumber) txHtml += `<div class='small' style='margin:4px 0'><strong>📞 Sender #:</strong> ${o.payment_tx.senderNumber}</div>`;
      if(o.payment_tx.screenshot) txHtml += `<div class='small' style='margin:4px 0'><strong>📸 Screenshot:</strong> <a href='${o.payment_tx.screenshot}' target='_blank' style='color:#ff5aa2;text-decoration:underline'>View</a></div>`;
    }
    if(o.binance_id) txHtml += `<div class='small' style='margin:4px 0'><strong>🪙 Binance ID:</strong> ${o.binance_id}</div>`;
    const isConfirmed = (o.status||'').includes('Confirmed') || (o.status||'').includes('Shipped') || (o.status||'').includes('Paid');
    const statusColor = isConfirmed ? '#ff5aa2' : '#22c55e';
    let actionHtml = `<div style='display:flex;flex-direction:column;gap:6px;margin-top:8px'><button class='btn' onclick='confirmOrder(${o.id})'>✓ Confirm</button><button class='btn' onclick='markShipped(${o.id})'>📦 Mark Shipped</button><button class='btn danger' onclick='cancelOrder(${o.id})'>✕ Cancel</button><button class='btn danger' style='background:#c00' onclick='deleteOrder(${o.id})'>🗑️ Delete</button></div>`;
    if((o.status||'').includes('Awaiting') || o.payment_tx){
      actionHtml = `<div style='display:flex;flex-direction:column;gap:6px;margin-top:8px'><button class='btn' onclick='verifyPayment(${o.id})'>✓ Verify Payment</button><button class='btn danger' onclick='rejectPayment(${o.id})'>✕ Reject Payment</button><button class='btn' onclick='confirmOrder(${o.id})'>✓ Confirm</button><button class='btn' onclick='markShipped(${o.id})'>📦 Mark Shipped</button><button class='btn danger' onclick='cancelOrder(${o.id})'>✕ Cancel</button><button class='btn danger' style='background:#c00' onclick='deleteOrder(${o.id})'>🗑️ Delete</button></div>`;
    }
    d.innerHTML = `<div style='display:grid;gap:8px'><div style='display:flex;justify-content:space-between'><div><strong>${o.productName}</strong><span class='small' style='margin-left:8px;background:${statusColor};color:#fff;padding:2px 6px;border-radius:4px'>${o.status}</span></div></div><div style='padding:8px;background:#fff8fe;border-radius:8px;border-left:3px solid #ff5aa2'><div class='small'><strong>👤 Customer:</strong> ${o.userName}</div><div class='small'><strong>📧 Email:</strong> ${o.email||'—'}</div><div class='small'><strong>📱 Phone:</strong> ${o.phone||'—'}</div><div class='small'><strong>📬 Postal:</strong> ${o.postal||'—'}</div><div class='small'><strong>📍 Address:</strong> ${o.address||'—'}</div><div class='small'><strong>🌍 Country:</strong> ${o.country||'—'}</div><div class='small'><strong>📦 Details:</strong> ${o.productDetails||'—'}</div><div class='small'><strong>👕 Size:</strong> ${o.size||'—'}</div><div class='small'><strong>📊 Qty:</strong> ${o.qty}</div><div class='small'><strong>💵 Payment:</strong> ${o.currency||'USD'} ${o.converted_total||'—'}</div><div class='small'><strong>💳 Method:</strong> ${o.payment}</div>${txHtml}</div><div>${actionHtml}</div></div>`; box.appendChild(d); }); } 

function verifyPayment(orderId){ const all = DB.orders().map(o=>{ if(o.id===orderId){ return {...o, status: 'Paid (verified)', paidAt: new Date().toISOString()}; } return o; }); DB.saveOrders(all); renderAdminOrders(); renderRecentOrders(); renderUserOrders(); alert('Payment verified and marked paid.'); }
function rejectPayment(orderId){ const all = DB.orders().map(o=>{ if(o.id===orderId){ return {...o, status: 'Payment Rejected'}; } return o; }); DB.saveOrders(all); renderAdminOrders(); renderRecentOrders(); renderUserOrders(); alert('Payment rejected.'); }
function markShipped(orderId){ const all = DB.orders().map(o=> o.id===orderId?{...o,status:'Shipped'}:o); DB.saveOrders(all); renderAdminOrders(); renderRecentOrders(); }
function confirmOrder(orderId){ if(!confirm('Confirm this order?')) return; const all = DB.orders().map(o=>{ if(o.id===orderId){ return {...o, status: 'Confirmed', confirmedAt: new Date().toISOString()}; } return o; }); DB.saveOrders(all); renderAdminOrders(); renderRecentOrders(); renderUserOrders(); alert('✓ Order confirmed!'); }
function cancelOrder(orderId){ if(!confirm('Cancel this order?')) return; const all = DB.orders().map(o=>{ if(o.id===orderId){ return {...o, status: 'Cancelled', cancelledAt: new Date().toISOString()}; } return o; }); DB.saveOrders(all); renderAdminOrders(); renderRecentOrders(); renderUserOrders(); alert('✕ Order cancelled!'); }
function deleteOrder(orderId){ if(!confirm('Delete this order permanently?')) return; const all = DB.orders().filter(o=> o.id!==orderId); DB.saveOrders(all); renderAdminOrders(); renderRecentOrders(); renderUserOrders(); alert('🗑️ Order deleted!'); }

function goAdmin(){ location.href = 'admin.html'; }

/* ===== Boot ===== */
window.addEventListener('load', ()=>{
  // Initialize Firebase Database
  if(window.firebase && window.firebase.database){
    firebaseDB.init();
  }
  
  const sel = document.getElementById('lang'); if(sel){ sel.value = LANG; sel.onchange = ()=>setLang(sel.value); }
  
  // Sync products from Firebase first, then render
  DB.syncProducts(() => {
    if(document.getElementById('products')) renderProducts();
    if(isAdmin()) showAdmin();
    renderRecentOrders(); updateTexts(); updateUserUI(); updatePriceForCurrency(); updateCartBadge(); renderCart();
  });
  
  const mb = document.getElementById('modalBack'); if(mb) mb.onclick = hideOrderPanel;
  // Check for product link in URL
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('product');
  if(productId) showProductViewer(parseInt(productId));
  // Firebase environment hint (useful when opening via file://)
  const sb = document.getElementById('signBtn');
  if(window.firebase && sb && !isFirebaseSupportedEnvironment()){
    sb.title = 'Firebase Google sign-in requires serving site over http(s). Use a local server (e.g., npx http-server -p 8080) or use the fallback prompt sign-in.';
  }
});

// Notes: for real payments (Stripe/bKash/Nagad) we need server-side integration and merchant credentials. This demo simulates card payments and provides instructions for mobile payments.

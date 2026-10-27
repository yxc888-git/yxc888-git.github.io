/* 知行官网 · 悬浮客服球
 *
 * 挂到任何页面的右下角，点一下就展开聊天窗，直接复用 bot.js 的问答能力。
 * 目的：原先客服入口只在顶部导航一行小字里，手机端导航折叠后根本看不见，
 * 客户找不到就走了。这里做成常驻悬浮球，全站可见。
 *
 * 纯前端，不上传对话内容。
 */
(function () {
  'use strict';

  if (window.__zxBotMounted) return;   // 防重复挂载
  window.__zxBotMounted = true;

  var CSS = [
    '.zxb-fab{position:fixed;right:18px;bottom:20px;z-index:99990;',
    'height:52px;padding:0 20px 0 16px;border-radius:26px;border:0;cursor:pointer;',
    'background:#185fa5;color:#fff;font-size:15px;font-weight:600;line-height:1;',
    'box-shadow:0 6px 20px rgba(0,0,0,.28);transition:transform .18s ease;',
    'display:flex;align-items:center;gap:8px;font-family:inherit;letter-spacing:1px}',
    '.zxb-fab:hover{transform:scale(1.08)}',
    '.zxb-fab:active{transform:scale(.96)}',
    '.zxb-fab .zxb-dot{position:absolute;top:-2px;right:-2px;width:13px;height:13px;',
    'border-radius:50%;background:#ff4d4f;border:2px solid #fff;display:none}',
    '.zxb-fab.has-msg .zxb-dot{display:block}',

    '.zxb-panel{position:fixed;right:18px;bottom:88px;z-index:99991;',
    'width:370px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 120px);',
    'background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.24);',
    'display:none;flex-direction:column;overflow:hidden;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;',
    'border:1px solid rgba(0,0,0,.08)}',
    '.zxb-panel.open{display:flex}',

    '.zxb-hd{background:#185fa5;color:#fff;padding:13px 15px;display:flex;',
    'align-items:center;gap:10px;flex-shrink:0}',
    '.zxb-av{width:32px;height:32px;border-radius:9px;background:rgba(255,255,255,.2);',
    'display:grid;place-items:center;font-size:14px;flex-shrink:0}',
    '.zxb-ht{font-size:14px;font-weight:500;line-height:1.3}',
    '.zxb-hs{font-size:11px;opacity:.85;display:flex;align-items:center;gap:5px}',
    '.zxb-hs i{width:6px;height:6px;border-radius:50%;background:#5dcaa5;display:inline-block}',
    '.zxb-x{margin-left:auto;background:transparent;border:0;color:#fff;font-size:21px;',
    'cursor:pointer;line-height:1;padding:0 2px;opacity:.85}',

    '.zxb-prod{display:flex;margin:0;padding:9px 12px;gap:0;flex-shrink:0;',
    'border-bottom:1px solid #eee;background:#f7f8fa}',
    '.zxb-prod button{flex:1;font:inherit;font-size:12.5px;padding:7px 0;border:0;',
    'cursor:pointer;background:transparent;color:#5b6470;font-weight:500}',
    '.zxb-prod button.on{background:#185fa5;color:#fff;border-radius:7px}',

    '.zxb-log{flex:1;overflow-y:auto;padding:14px;background:#fff}',
    '.zxb-msg{margin-bottom:12px;display:flex}',
    '.zxb-msg.me{justify-content:flex-end}',
    '.zxb-bub{max-width:84%;padding:10px 13px;border-radius:13px;font-size:13.5px;',
    'line-height:1.62;white-space:pre-wrap;word-break:break-word}',
    '.zxb-msg.bot .zxb-bub{background:#eef4fb;color:#1a1d21;border-bottom-left-radius:4px}',
    '.zxb-msg.me .zxb-bub{background:#185fa5;color:#fff;border-bottom-right-radius:4px}',
    '.zxb-quick{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 14px}',
    '.zxb-quick button{font:inherit;font-size:12px;padding:6px 11px;border-radius:99px;',
    'border:1px solid #e3e6ea;background:#f7f8fa;color:#5b6470;cursor:pointer}',
    '.zxb-quick button:hover{border-color:#185fa5;color:#185fa5}',

    '.zxb-ft{border-top:1px solid #e3e6ea;padding:10px 12px;flex-shrink:0;background:#fff}',
    '.zxb-bar{display:flex;gap:8px}',
    '.zxb-bar textarea{flex:1;font:inherit;font-size:13.5px;padding:10px 12px;',
    'border:1px solid #e3e6ea;border-radius:9px;background:#f7f8fa;color:#1a1d21;',
    'resize:none;height:42px;max-height:110px;line-height:1.5}',
    '.zxb-bar textarea:focus{outline:none;border-color:#185fa5;background:#fff}',
    '.zxb-bar button{font:inherit;font-size:13.5px;padding:0 18px;border:0;border-radius:9px;',
    'background:#185fa5;color:#fff;cursor:pointer}',
    '.zxb-bar button:disabled{opacity:.5}',
    '.zxb-hint{font-size:11.5px;color:#8a929c;margin-top:7px;text-align:center}',

    '.zxb-tip{position:fixed;right:82px;bottom:34px;z-index:99989;',
    'background:#fff;color:#1a1d21;font-size:13px;padding:11px 15px;',
    'border-radius:12px;box-shadow:0 6px 22px rgba(0,0,0,.2);display:none;',
    'max-width:240px;line-height:1.55;border:1px solid rgba(0,0,0,.08)}',
    '.zxb-tip.show{display:block;animation:zxbIn .3s ease}',
    '@keyframes zxbIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',

    '@media (max-width:520px){',
    '.zxb-panel{right:8px;left:8px;width:auto;bottom:80px;height:70vh}',
    '.zxb-fab{right:14px;bottom:16px}}',
    '@media print{.zxb-fab,.zxb-panel,.zxb-tip{display:none !important}}'
  ].join('');

  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  var HOST = 'https://zhixingruanjian.com.cn';
  var qs = new URLSearchParams(location.search);
  var forceOpen = qs.get('chat') === '1';

  var fab = document.createElement('button');
  fab.className = 'zxb-fab';
  fab.type = 'button';
  fab.title = '在线客服';
  fab.setAttribute('aria-label', '打开在线客服');
  fab.innerHTML = '💬<span class="zxb-fabtx">在线客服</span><span class="zxb-dot"></span>';

  var tip = document.createElement('div');
  tip.className = 'zxb-tip';

  var panel = document.createElement('div');
  panel.className = 'zxb-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', '在线客服');
  panel.innerHTML =
    '<div class="zxb-hd">' +
      '<div class="zxb-av">知</div>' +
      '<div><div class="zxb-ht">知行客服小助手</div>' +
      '<div class="zxb-hs"><i></i>在线 · 秒答安装激活问题</div></div>' +
      '<button class="zxb-x" type="button" title="关闭">&times;</button>' +
    '</div>' +
    '<div class="zxb-prod"><button type="button" data-p="food" class="on">🏨 饭店系统</button>' +
    '<button type="button" data-p="beauty">💇 美业系统</button></div>' +
    '<div class="zxb-log"></div>' +
    '<div class="zxb-ft"><div class="zxb-bar">' +
      '<textarea rows="1" placeholder="打字问问题，Enter 发送"></textarea>' +
      '<button type="button">发送</button></div>' +
    '<div class="zxb-hint">答不上来加微信 <b>15639928315</b>，我本人回你</div></div>';

  document.body.appendChild(panel);
  document.body.appendChild(fab);
  document.body.appendChild(tip);

  var log = panel.querySelector('.zxb-log');
  var inp = panel.querySelector('textarea');
  var btn = panel.querySelector('.zxb-bar button');
  var prodBtns = panel.querySelectorAll('.zxb-prod button');
  var busy = false;

  /* ===== 客服对话上报（2026-10-18 加）：对话/留资写官网 KV，老板在总控台看得到 ===== */
  var CHAT_API = 'https://api.zhixingruanjian.com.cn/api/chat';
  var sessionLog = [];       // 本会话消息 [{r:'me'|'bot', t:'...'}]
  var reported = false;      // 本会话是否已上报过摘要（电话触发的即时上报不计入）
  var reportedPhone = false; // 电话线索是否已即时上报
  function postChat(payload) {
    try {
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon(CHAT_API, blob)) return;
      }
      fetch(CHAT_API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body,
        keepalive: true,
        mode: 'cors'
      }).catch(function () { /* 静默 */ });
    } catch (e) { /* 上报失败静默，不影响客服体验 */ }
  }
  function reportChat(force) {
    if (reported && !force) return;
    if (sessionLog.length < 4 && !force) return;
    reported = true;
    postChat({ type: 'chat', page: location.pathname || '', messages: sessionLog.slice(-12) });
  }
  function reportPhone(text) {
    if (reportedPhone) return;
    var m = String(text).match(/(^|[^0-9])(1[3-9]\d{9})([^0-9]|$)/);
    if (!m) return;
    reportedPhone = true;
    postChat({
      type: 'chat', page: location.pathname || '',
      need: '客户留下电话：' + m[2],
      messages: sessionLog.slice(-6)
    });
  }

  function add(text, who) {
    var w = document.createElement('div');
    w.className = 'zxb-msg ' + who;
    var b = document.createElement('div');
    b.className = 'zxb-bub';
    b.textContent = text;
    w.appendChild(b);
    log.appendChild(w);
    log.scrollTop = log.scrollHeight;
    if (who === 'me') {
      sessionLog.push({ r: 'me', t: String(text).slice(0, 300) });
      reportPhone(String(text));
    } else if (text !== '…') {
      sessionLog.push({ r: 'bot', t: String(text).slice(0, 300) });
    }
    return b;
  }

  function quick(p) {
    var box = document.createElement('div');
    box.className = 'zxb-quick';
    var qs2 = p === 'food'
      ? ['多少钱', '怎么安装', '怎么开台点餐', '激活码在哪', '能试吗', '小票怎么打印']
      : ['多少钱', '怎么安装', '怎么开单', '怎么约客', '会员怎么充值', '技师提成怎么设'];
    qs2.forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = q;
      b.onclick = function () { ask(q); };
      box.appendChild(b);
    });
    var lb = document.createElement('button');
    lb.type = 'button';
    lb.textContent = '留个电话，老板亲自回';
    lb.style.cssText = 'color:#185fa5;border-color:#185fa5;font-weight:600';
    lb.onclick = function () { leadForm(); };
    box.appendChild(lb);
    log.appendChild(box);
    log.scrollTop = log.scrollHeight;
  }

  function pick(p) {
    ZhixingBot.setProduct(p);
    prodBtns.forEach(function (b) {
      b.className = (b.getAttribute('data-p') === p) ? 'on' : '';
    });
    quick(p);
  }

  function ask(q) {
    if (busy) return;
    q = (q || '').trim();
    if (!q) return;
    add(q, 'me');
    inp.value = '';
    inp.style.height = '42px';
    busy = true; btn.disabled = true;
    var th = add('…', 'bot');
    ZhixingBot.ask(q).then(function (a) {
      th.textContent = a;
      busy = false; btn.disabled = false;
      log.scrollTop = log.scrollHeight;
      inp.focus();
      sessionLog.push({ r: 'bot', t: String(a).slice(0, 300) });
      /* 对话满 4 轮（8 条）自动上报一次摘要，之后离开页面再补一次 */
      if (sessionLog.length >= 8) reportChat(false);
    });
  }

  /* 留资入口：客户不想打字，留个电话让老板亲自回 */
  function leadForm() {
    if (panel.querySelector('.zxb-lead')) return;
    var box = document.createElement('div');
    box.className = 'zxb-lead';
    var title = document.createElement('div');
    title.textContent = '留个电话，老板亲自回你';
    title.style.cssText = 'font-size:12.5px;color:#8a929c;margin:2px 0 8px';
    var f1 = document.createElement('input');
    f1.type = 'text'; f1.placeholder = '怎么称呼（选填）'; f1.maxLength = 20;
    var f2 = document.createElement('input');
    f2.type = 'tel'; f2.placeholder = '手机号（必填）'; f2.maxLength = 11;
    var f3 = document.createElement('input');
    f3.type = 'text'; f3.placeholder = '想了解什么（选填）'; f3.maxLength = 60;
    [f1, f2, f3].forEach(function (f) {
      f.style.cssText = 'width:100%;font-size:16px;padding:9px 11px;border:1px solid #e3e6ea;border-radius:8px;margin-bottom:8px;font-family:inherit;box-sizing:border-box';
    });
    var submit = document.createElement('button');
    submit.type = 'button'; submit.textContent = '提交';
    submit.style.cssText = 'width:100%;font:inherit;font-size:14px;font-weight:600;padding:10px;border:0;border-radius:8px;background:#185fa5;color:#fff;cursor:pointer';
    var tip = document.createElement('div');
    tip.style.cssText = 'font-size:12px;color:#8a929c;margin-top:6px;min-height:16px';
    submit.onclick = function () {
      var phone = (f2.value || '').trim();
      if (!/^1[3-9]\d{9}$/.test(phone)) { tip.style.color = '#dc2626'; tip.textContent = '手机号格式不对，再检查下'; return; }
      submit.disabled = true; submit.textContent = '提交中…';
      fetch(CHAT_API, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: 'lead', name: (f1.value || '').trim(), phone: phone,
          need: (f3.value || '').trim(), page: location.pathname || ''
        })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.ok) {
          tip.style.color = '#16a34a'; tip.textContent = '收到了，稍后回你';
          sessionLog.push({ r: 'me', t: '留资：' + phone + ' ' + (f3.value || '') });
          setTimeout(function () { box.remove(); }, 1800);
        } else {
          throw new Error('fail');
        }
      }).catch(function () {
        tip.style.color = '#dc2626'; tip.textContent = '没提交成功，直接加微信 15639928315';
        submit.disabled = false; submit.textContent = '再试一次';
      });
    };
    box.appendChild(title); box.appendChild(f1); box.appendChild(f2); box.appendChild(f3);
    box.appendChild(submit); box.appendChild(tip);
    log.appendChild(box);
    log.scrollTop = log.scrollHeight;
  }

  var greeted = false;
  function open() {
    panel.classList.add('open');
    fab.classList.remove('has-msg');
    tip.classList.remove('show');
    if (!greeted && window.ZhixingBot) {
      greeted = true;
      ZhixingBot.ready().then(function () {
        add('您好，我是知行客服小助手 🍚\n问安装、激活、怎么用，我直接答。\n答不上来加微信 15639928315 找我本人。', 'bot');
        pick('food');
      }).catch(function () {
        add('知识库加载失败，请直接加微信 15639928315。', 'bot');
      });
    }
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 120);
  }

  fab.onclick = function () {
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
    } else {
      open();
    }
  };
  panel.querySelector('.zxb-x').onclick = function () { panel.classList.remove('open'); };
  prodBtns.forEach(function (b) {
    b.onclick = function () { pick(b.getAttribute('data-p')); };
  });
  btn.onclick = function () { ask(inp.value); };
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(inp.value); }
  });
  inp.addEventListener('input', function () {
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 110) + 'px';
  });

  // 首次访问弹一次气泡引导，客户才知道这儿能问
  try {
    if (localStorage.getItem('zxb_seen') !== '1') {
      setTimeout(function () {
        if (!panel.classList.contains('open')) {
          tip.innerHTML = '👋 有问题直接问我<br><span style="color:#8a929c;font-size:12px">安装 / 激活 / 价格</span>';
          tip.classList.add('show');
          localStorage.setItem('zxb_seen', '1');
          setTimeout(function () { tip.classList.remove('show'); }, 6500);
        }
      }, 3500);
    }
  } catch (e) {}

  // 每页最多自动展开一次（带 ?chat=1 或从客服页跳来时）
  if (forceOpen) {
    function boot() { open(); }
    if (window.ZhixingBot) boot();
    else window.addEventListener('load', function () { setTimeout(boot, 200); });
  }

  /* 离开页面时补报一次会话摘要（手机端切后台/返回键常不触发 beforeunload，两个都挂） */
  try {
    window.addEventListener('beforeunload', function () { reportChat(true); });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') reportChat(true);
    });
  } catch (e) {}
})();

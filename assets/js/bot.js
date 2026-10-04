/* 知行官网客服机器人 —— 基于产品知识库的本地匹配问答
 *
 * 知识来自 assets/kb.json，与 APP 内「AI 小助手」同源（由 export_kb.py 导出），
 * 所以网站和 APP 的回答口径一致。
 * 纯前端运行，不上传任何对话内容到服务器。
 */
(function (global) {
  'use strict';

  var state = { kb: null, product: 'food' };

  var REFUSE_KEYS = ['万能激活码', '万能码', '万能激活', '破解', '盗版', '免费激活码',
                     '怎么破解', '删掉所有', '删数据', '删除桌台', '清空数据',
                     '改成1元', '价格改成1元', '把价格改成', '把所有菜品价格改',
                     '把营业额改', '伪造', '改账', '清空所有'];

  /* 产品切换词：用户提到另一个产品时自动切过去，省得他点按钮 */
  var SWITCH = [
    { p: 'beauty', keys: ['美业', '美容', '美发', '美甲', '养生理疗', '美容院', '纹绣', '开单', '预约', '技师', '工位'] },
    { p: 'food',   keys: ['饭店', '点餐', '点菜', '开台', '桌台', '菜品', '后厨', '收银台', '服务员'] }
  ];

  function load() {
    if (state.kb) return Promise.resolve(state.kb);
    return fetch('/assets/kb.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) { state.kb = d; return d; });
  }

  function autoSwitch(q) {
    for (var i = 0; i < SWITCH.length; i++) {
      var hit = SWITCH[i].keys.some(function (k) { return q.indexOf(k) >= 0; });
      if (hit) { state.product = SWITCH[i].p; return SWITCH[i].p; }
    }
    return state.product;
  }

  /* 与后端 answer() 同策略：命中关键词计分，取最高分 */
  function match(q) {
    var list = state.kb[state.product] || [];
    var best = null, score = 0;
    for (var i = 0; i < list.length; i++) {
      var s = 0;
      for (var j = 0; j < list[i].keys.length; j++) {
        var k = list[i].keys[j];
        if (q.indexOf(k) >= 0) {
          // 产品切换类关键词权重更高，和后端保持一致
          s += ['美业', '美容', '美发', '饭店', '点餐', '桌台'].indexOf(k) >= 0 ? 3 : 1;
        }
      }
      if (s > score) { score = s; best = list[i].answer; }
    }
    return score >= 1 ? best : null;
  }

  function answer(q) {
    q = (q || '').trim();
    if (!q) return Promise.resolve('您想问什么？打字就行，比如「怎么安装」「多少钱」。');

    if (REFUSE_KEYS.some(function (k) { return q.indexOf(k) >= 0; })) {
      return Promise.resolve(state.kb.refuse[0]);
    }

    autoSwitch(q);
    var a = match(q);
    if (a) return Promise.resolve(a);

    var tips = state.product === 'food'
      ? '「怎么安装」「怎么开台点餐」「怎么结账」「激活码在哪」「小票怎么打印」'
      : '「怎么安装」「怎么开单」「怎么约客」「会员怎么充值」「技师提成怎么设」';
    return Promise.resolve('这个我怕说错耽误您。可以换个说法：' + tips +
      '。还是要我本人帮您，加微信 15639928315。');
  }

  function setProduct(p) { state.product = (p === 'beauty') ? 'beauty' : 'food'; }
  function getProduct() { return state.product; }
  function ready() { return load(); }

  global.ZhixingBot = {
    ask: answer, setProduct: setProduct,
    getProduct: getProduct, ready: ready
  };
})(window);

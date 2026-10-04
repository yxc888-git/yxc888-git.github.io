/* 分片下载器 —— 把散落在服务器上的分片按序拼回完整安装包
 *
 * 原理：每片是一个独立的静态文件。点下载后，浏览器按顺序 fetch 每片，
 *       用 File System Access API 直接流式写到用户磁盘（不占内存）。
 *       不支持该 API 的浏览器回退到 Blob 方案（会吃内存，仅作兜底）。
 */
(function (global) {
  'use strict';

  var CHUNK_RE = /\.part(\d+)$/;

  /** 读 manifest：{ filename, size, parts: [{name, size, sha256}] } */
  function loadManifest(base) {
    return fetch(base + '/manifest.json', { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('清单读取失败 ' + r.status);
        return r.json();
      });
  }

  function fmtSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    if (n < 1073741824) return (n / 1048576).toFixed(1) + ' MB';
    return (n / 1073741824).toFixed(2) + ' GB';
  }

  function hex(buf) {
    var v = new Uint8Array(buf), s = '';
    for (var i = 0; i < v.length; i++) s += v[i].toString(16).padStart(2, '0');
    return s;
  }

  /* 优先走流式落盘；不支持则返回 null 走 Blob 兜底 */
  function pickSink(filename) {
    if (!global.showSaveFilePicker) return Promise.resolve(null);
    return global.showSaveFilePicker({
      suggestedName: filename,
      types: [{ description: '安装包', accept: { 'application/zip': ['.zip'] } }]
    }).then(function (handle) { return handle.createWritable(); })
      .catch(function () { return null; });   // 用户取消 → 当作不支持，交给调用方处理
  }

  function download(base, onProgress) {
    return loadManifest(base).then(function (m) {
      var total = m.parts.length;
      var done = 0, bytes = 0;
      var pickerPromise = pickSink(m.filename);

      return pickerPromise.then(function (sink) {
        var chunks = [];
        var chain = Promise.resolve();

        m.parts.forEach(function (p, idx) {
          chain = chain.then(function () {
            return fetch(base + '/' + p.name, { cache: 'no-store' })
              .then(function (r) {
                if (!r.ok) throw new Error('分片 ' + p.name + ' 读取失败 ' + r.status);
                if (sink) return r.arrayBuffer().then(function (buf) {
                  return sink.write(new Uint8Array(buf));
                });
                return r.arrayBuffer().then(function (buf) { chunks.push(buf); });
              })
              .then(function () {
                done++; bytes += p.size;
                onProgress({ done: done, total: total, bytes: bytes, total2: m.size, part: p, current: idx + 1 });
              });
          });
        });

        return chain.then(function () {
          if (sink) { return sink.close().then(function () { return { streamed: true }; }); }
          var blob = new Blob(chunks, { type: 'application/zip' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url; a.download = m.filename;
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 3000);
          return { streamed: false };
        });
      });
    });
  }

  global.ZhixingSplit = { download: download, fmtSize: fmtSize, hex: hex };
})(window);

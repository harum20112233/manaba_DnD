// content-script.js - manabaのドラッグアンドドロップファイルアップローダー拡張機能
// ページが完全に読み込まれるのを待つ
window.addEventListener("load", () => {
  // manabaの課題提出ページかどうかを確認
  const isReportPage =
    window.location.href.includes("/ct/course_") &&
    (window.location.href.includes("_report_") ||
      document.querySelector('input[type="file"][name="RptSubmitFile"]'));

  if (isReportPage) {
    console.log(
      "Manaba submission page detected, initializing drag and drop..."
    );
    // DOM要素が完全に利用可能になるのを待つため、少し遅延させる
    setTimeout(initDragAndDropOverlay, 500);
  }
});

function initDragAndDropOverlay() {
  // 元のファイル入力要素を取得
  const fileInput = document.querySelector(
    'input[type="file"][name="RptSubmitFile"]'
  );

  if (!fileInput) {
    console.log("No file upload field found on this manaba page");
    return;
  }

  // --- 新しい全画面ドロップゾーンオーバーレイを作成 ---
  const overlayDropZone = document.createElement("div");
  overlayDropZone.id = "manaba-dad-overlay"; // 識別用のID

  // メッセージ要素を作成
  const messageElement = document.createElement("div");
  messageElement.className = "manaba-dad-message";
  // messageElement.textContent =
  //   "ファイルをここにドラッグ＆ドロップ または クリックして選択";
  messageElement.style.fontSize = "1.5em";
  messageElement.style.color = "#555";
  messageElement.style.textAlign = "center";
  messageElement.style.pointerEvents = "none"; // メッセージ自体へのクリックを無効化

  overlayDropZone.appendChild(messageElement);

  // オーバーレイのスタイルを設定
  Object.assign(overlayDropZone.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    width: "100%",
    height: "100%",
    // backgroundColor: "rgba(240, 240, 240, 0.9)", // 半透明の背景
    // border: "3px dashed #aaa",
    borderRadius: "10px",
    display: "flex", // Flexboxで中央揃え
    alignItems: "center",
    justifyContent: "center",
    zIndex: "2",
    cursor: "pointer",
    transition: "background-color 0.3s ease, border-color 0.3s ease", // スムーズな変化
    // 初期状態では非表示にするか、常に表示するか選択できます。
    display: "none", //例: 最初は非表示にしてドラッグ時に表示する場合
  });

  // オーバーレイをページに追加
  document.body.appendChild(overlayDropZone);

  // --- イベントリスナーを新しいオーバーレイに追加 ---

  const baseBgColor = overlayDropZone.style.backgroundColor;
  const baseBorderColor = overlayDropZone.style.borderColor;
  const highlightBgColor = "rgba(220, 235, 255, 0.95)";
  const highlightBorderColor = "#40a9ff";

  // --- オーバーレイを表示する (windowで検知) ---
  window.addEventListener(
    "dragenter",
    (e) => {
      // ファイルのドラッグか確認
      if (e.dataTransfer.types.includes("Files")) {
        overlayDropZone.style.display = "block"; // 表示 (メッセージないのでblock)
      }
    },
    false
  );

  overlayDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    overlayDropZone.style.backgroundColor = highlightBgColor;
    overlayDropZone.style.borderColor = highlightBorderColor;
  });

  overlayDropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // マウスカーソルがウィンドウの外に出たかチェック
    if (
      e.clientX <= 0 ||
      e.clientY <= 0 ||
      e.clientX >= window.innerWidth ||
      e.clientY >= window.innerHeight
    ) {
      // ウィンドウ外に出たら非表示にする
      overlayDropZone.style.display = "none";
      overlayDropZone.style.borderColor = baseBorderColor;
    } else {
      // ウィンドウ内に留まっている場合はボーダー色だけ元に戻す
      overlayDropZone.style.borderColor = baseBorderColor;
    }
  });

  overlayDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // スタイルを元に戻す
    overlayDropZone.style.display = "none";
    overlayDropZone.style.borderColor = baseBorderColor;

    const files = e.dataTransfer.files;

    if (files.length) {
      // DataTransferオブジェクトを使ってファイルを設定
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach((file) => {
        dataTransfer.items.add(file);
      });
      fileInput.files = dataTransfer.files;

      // changeイベントを発火 (manaba側の処理をトリガー)
      const event = new Event("change", { bubbles: true });
      fileInput.dispatchEvent(event);

      // 重要: ドロップ後、オーバーレイを非表示にする
      overlayDropZone.style.display = "none"; // 非表示にする

      // 必要であれば、ファイル選択後のメッセージを元のページ要素に表示する処理を追加
      // 例: 元の .dropzone 内のラベルを探して更新
      const originalDropZoneLabel = document.querySelector(
        ".dropzone label.file-upload-button"
      );
      if (originalDropZoneLabel) {
        const fileNames = Array.from(files)
          .map((f) => f.name)
          .join(", ");
        originalDropZoneLabel.textContent = `選択されたファイル: ${fileNames}`;
      }
    }
  });

  // --- クリック時の処理 ---
  overlayDropZone.addEventListener("click", (e) => {
    // オーバーレイ自身がクリックされた場合のみ
    if (e.target === overlayDropZone) {
      fileInput.click();
      overlayDropZone.style.display = "none"; // ★ 非表示にする
    }
  });

  // ファイル入力が (通常のクリックなどで) 変更された場合もオーバーレイを隠す
  fileInput.addEventListener("change", () => {
    // ファイルが選択されたらオーバーレイを隠す
    if (fileInput.files.length > 0) {
      overlayDropZone.style.display = "none";
    }
    // 必要であれば、ここでも元のラベル等のUI更新を行う
    const originalDropZoneLabel = document.querySelector(
      ".dropzone label.file-upload-button"
    );
    if (originalDropZoneLabel) {
      if (fileInput.files.length > 0) {
        const fileNames = Array.from(fileInput.files)
          .map((f) => f.name)
          .join(", ");
        originalDropZoneLabel.textContent = `選択されたファイル: ${fileNames}`;
      } else {
        // ファイル選択がキャンセルされた場合などのデフォルト表示
        // originalDropZoneLabel.textContent = "ファイルを選択"; // 例
      }
    }
  });

  // --- ドラッグ操作終了時のフォールバック (mouseup) ---
  // ドラッグがドロップされずに終了した場合 (Escキーなど) に対応
  window.addEventListener(
    "mouseup",
    () => {
      if (overlayDropZone.style.display !== "none") {
        // マウスボタンが離された時にオーバーレイが表示されたままなら、非表示にする
        overlayDropZone.style.display = "none";
        overlayDropZone.style.borderColor = baseBorderColor;
      }
    },
    true
  ); // キャプチャフェーズで早めに検知
}

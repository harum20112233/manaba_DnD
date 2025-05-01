// content-script.js - manabaのドラッグアンドドロップファイルアップローダー拡張機能
// ページが完全に読み込まれるのを待つ
window.addEventListener("load", () => {
  // manabaの課題提出ページかどうかを確認
  // manabaの課題提出ページかどうかを確認
  const isReportPage =
    window.location.href.includes("/ct/course_") &&
    (window.location.href.includes("_report_") ||
      document.querySelector('input[type="file"][name="RptSubmitFile"]'));

  if (isReportPage) {
    console.log(
      "Manaba submission page detected, initializing drag and drop..."
    );
    setTimeout(initDragAndDrop, 500); // すべての要素が確実に読み込まれるための少しの遅延
  }
});

function initDragAndDrop() {
  // ファイルアップロードエリアを探す - manabaは通常"attachment"という名前のファイル入力を持っている
  const fileInput = document.querySelector(
    'input[type="file"][name="attachment"]'
  );

  if (!fileInput) {
    console.log("No file upload field found on this manaba page");
    return;
  }

  // ドロップゾーンを追加する親コンテナを取得
  const uploadContainer = fileInput.closest("div") || fileInput.parentElement;

  // ドロップゾーンのオーバーレイを作成
  const dropZone = document.createElement("div");
  dropZone.id = "manaba-drop-zone";
  dropZone.innerHTML =
    '<div class="drop-message">ファイルをここにドラッグ&ドロップ</div>';

  // ドロップゾーンのスタイルを設定
  dropZone.style.cssText = `
    position: relative;
    border: 2px dashed #ccc;
    border-radius: 8px;
    width: 100%;
    min-height: 100px;
    margin: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f9f9f9;
    transition: all 0.3s ease;
    cursor: pointer;
  `;

  // ページにドロップゾーンを追加
  uploadContainer.insertBefore(dropZone, fileInput.nextSibling);

  // ドラッグアンドドロップのためのイベントリスナーを追加
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.backgroundColor = "#e6f7ff";
    dropZone.style.borderColor = "#40a9ff";
  });

  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.backgroundColor = "#f9f9f9";
    dropZone.style.borderColor = "#ccc";
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();

    dropZone.style.backgroundColor = "#f9f9f9";
    dropZone.style.borderColor = "#ccc";

    const files = e.dataTransfer.files;

    if (files.length) {
      // DataTransfer APIを使用してファイルを設定
      const dataTransfer = new DataTransfer();

      Array.from(files).forEach((file) => {
        dataTransfer.items.add(file);
      });

      fileInput.files = dataTransfer.files;

      // 変更イベントを発火
      const event = new Event("change", { bubbles: true });
      fileInput.dispatchEvent(event);

      // 選択されたファイルでUIを更新
      const fileNames = Array.from(files)
        .map((file) => file.name)
        .join(", ");
      dropZone.querySelector(
        ".drop-message"
      ).textContent = `選択されたファイル: ${fileNames}`;
    }
  });

  // ファイルブラウザを開くためにドロップゾーンをクリック可能にする
  dropZone.addEventListener("click", () => {
    fileInput.click();
  });

  // ファイル入力を通じてファイルが選択された時にUIを更新
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      const fileNames = Array.from(fileInput.files)
        .map((file) => file.name)
        .join(", ");
      dropZone.querySelector(
        ".drop-message"
      ).textContent = `選択されたファイル: ${fileNames}`;
    } else {
      dropZone.querySelector(".drop-message").textContent =
        "ファイルをここにドラッグ&ドロップ";
    }
  });
}

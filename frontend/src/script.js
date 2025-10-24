import {
  RefreshGachaHistory,
  GetPhoneAndPassword,
  ReloadFrontend,
  WindowClose,
  WindowMinSize, WindowToggleMaxSize,
} from "../wailsjs/go/main/App";

async function handleReload() {
  await ReloadFrontend();
}

const maxBtn = document.getElementById("maxBtn");

async function updateMaxButtonIcon() {
  const isMax = await WindowToggleMaxSize();
  maxBtn.textContent = isMax ? "🗖" : "🗗";
}

// 点击切换最大化/还原
maxBtn.onclick = async () => {
  await updateMaxButtonIcon(); // 切换后更新图标
};
document.getElementById("minBtn").onclick = () => WindowMinSize();
document.getElementById("closeBtn").onclick = () => WindowClose();


// 页面加载后渐显登录卡片
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('loginContainer').classList.add('show');
  }, 300); // 延迟 300ms
});

window.login = async function () {
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("loginError");

  // 先显示加载层
  const loadingOverlay = document.getElementById("loadingOverlay");
  loadingOverlay.style.display = "flex";
  document.body.style.overflow = "hidden";

  // 隐藏登录页
  document.getElementById("loginContainer").style.display = "none";

  try {
    await GetPhoneAndPassword(phone, password);
    await initApp(); // 内部会更新文字、动画、数据
  } catch (err) {
    errorBox.textContent = "登录失败：" + err;
    // 失败时回到登录页，并清空加载层行内样式
    resetToLogin();
  }
};

async function initApp() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingText    = document.querySelector('.loading-text');
  const loadingProgress= document.querySelector('.loading-progress');
  const loadingLogo    = document.querySelector('.loading-logo');
  const body           = document.body;

  // 重置加载层样式/动画残留
  loadingOverlay.style.display = 'flex';
  loadingOverlay.style.opacity = '1';
  loadingOverlay.style.transform = '';
  loadingOverlay.style.animation = '';
  loadingText.style.opacity = '1';
  loadingText.style.transform = '';
  loadingProgress.style.opacity = '1';
  body.style.overflow = 'hidden';

  // 重置文字
  loadingText.textContent = '加载寻访记录中...';
  loadingText.style.color = '#00796b';
  loadingProgress.style.setProperty('--mdui-color-primary', '0,121,107');

  // 清空主内容区（防止旧图表/旧按钮残留）
  const poolSelector = document.getElementById('poolSelector');
  const chartContainer = document.getElementById('chartContainer');
  const rareCharsContainer = document.getElementById('rareCharsContainer');
  poolSelector.innerHTML = '';
  chartContainer.innerHTML = '';
  rareCharsContainer.innerHTML = '';

  /* ===== 2. 业务逻辑（不变）===== */
  let data = null;
  let currentPool = null;

  try {
    const json = await RefreshGachaHistory();
    data = JSON.parse(json);

    loadingText.textContent = '加载完毕';
    loadingText.style.color = '#00796b';

    createPoolButtons(data);
    if (Object.keys(data).length > 0) {
      currentPool = Object.keys(data)[0];
      updateDisplay(data, currentPool);
    }
    startExitAnimation();
  } catch (error) {
    console.error('【initApp 异常】', error, error.stack);
    handleLoadError();
  }

    function startExitAnimation() {
      setTimeout(() => {
        loadingText.style.transition = "all 0.4s ease-out";
        loadingText.style.opacity = "0";
        loadingText.style.transform = "translateY(-10px)";

        loadingProgress.style.transition = "opacity 0.3s ease-out";
        loadingProgress.style.opacity = "0";

        loadingLogo.style.transition = "all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
        loadingLogo.style.transform = "scale(0.8) translateY(-20px)";
        loadingLogo.style.opacity = "0";

        setTimeout(() => {
          loadingOverlay.style.transition = "all 0.6s cubic-bezier(0.64, 0, 0.35, 1)";
          loadingOverlay.style.transform = "translateY(-100%)";
          loadingOverlay.style.opacity = "0";

          setTimeout(() => {
            body.style.overflow = "auto";
            loadingOverlay.style.display = "none";

            // 显示主内容
            document.querySelector("h1").style.display = "block";
            document.getElementById("poolSelector").style.display = "block";
            document.getElementById("chartContainer").style.display = "block";
            document.getElementById("rareCharsContainer").style.display = "block";

            // 然后再做淡入动画
            const contentElements = document.querySelectorAll("h1, .pool-selector, .chart-container, .rare-chars");
            contentElements.forEach((el, index) => {
              el.style.opacity = "0";
              el.style.transform = "translateY(20px)";
              el.style.transition = `all 0.5s ease-out ${index * 0.1}s`;
              setTimeout(() => {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
              }, 50);
            });
          }, 100);
        }, 300);
      }, 200);
    }

  function handleLoadError() {
    loadingText.textContent = "加载失败，请刷新重试";
    loadingText.style.color = "#ff4444";
    loadingProgress.style.setProperty("--mdui-color-primary", "255, 68, 68");

    // 抖动动画
    loadingOverlay.style.animation = "shake 0.5s cubic-bezier(.36,.07,.19,.97) both";

    setTimeout(() => {
      loadingOverlay.style.transition = "all 0.8s ease";
      loadingOverlay.style.opacity = "0";

      setTimeout(() => {
        // 动画结束后，自动回到登录页
        resetToLogin();
      }, 800);
    }, 3000);
  }

    function createPoolButtons() {
      poolSelector.innerHTML = "";
      const buttonGroup = document.createElement("mdui-segmented-button-group");

      Object.keys(data).forEach((poolName, index) => {
        const button = document.createElement("mdui-segmented-button");
        button.textContent = poolName;
        button.dataset.poolName = poolName;

        if (index === 0) button.setAttribute("selected", "");

        button.addEventListener("click", () => {
          currentPool = poolName;
          updateDisplay();
        });

        buttonGroup.appendChild(button);
      });

      poolSelector.appendChild(buttonGroup);
    }

    function updateDisplay() {
      const chartContainer = document.getElementById("chartContainer");
      const rareCharsContainer = document.getElementById("rareCharsContainer");
      chartContainer.innerHTML = "";
      rareCharsContainer.innerHTML = "";

      if (!currentPool || !data[currentPool]) return;

      createChart(currentPool);
      createRareCharsCard(currentPool);
    }

    function createChart(poolName) {
      const items = data[poolName];
      const rarityCounts = {2: 0, 3: 0, 4: 0, 5: 0};
      const chartContainer = document.getElementById("chartContainer");
      const ctx = document.createElement("canvas");
      ctx.id = `chart_${poolName}`;
      chartContainer.appendChild(ctx);

      items.forEach(item => {
        rarityCounts[item.rarity] += 1;
      });

      new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["3★", "4★", "5★", "6★"],
          datasets: [{
            label: poolName,
            data: Object.values(rarityCounts),
            backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: { position: "top" },
            title: {
              display: true,
              text: `${poolName} 寻访记录`,
              font: { size: 20 }
            }
          }
        }
      });
    }

    function createRareCharsCard(poolName) {
      const items = data[poolName];
      const rareCharsContainer = document.getElementById("rareCharsContainer");
      const rareFiveChars = [];
      const count = items.length;

      items.forEach(item => {
        if (item.rarity === 5) {
          rareFiveChars.push(item.charName);
          if (rareFiveChars.length > 5) rareFiveChars.shift();
        }
      });

      const card = document.createElement("mdui-card");
      card.setAttribute("variant", "elevated");
      card.style.cssText = "width:300px; margin-left:15px; margin-right:15px; min-height:224px; background:transparent;";
      card.innerHTML = `
      <div style="padding:16px; display:flex; flex-direction:column; gap:12px;">
        <div style="font-size:18px; font-weight:600; color:#00796b; width: 240px">
          《${poolName}》
          <span style="font-size:14px; font-weight:600; color:#00796b; margin-left:4px;">
            总寻访数：${count}
          </span>
        </div>
        <div style="display:flex; gap:6px; margin-left: 10px; margin-right: 10px; flex-wrap: wrap; overflow:auto; width: 260px;">
          ${rareFiveChars.map(name => `
            <mdui-chip style="
              background-color:transparent;
              color:#004d40;
              font-size:14px;
              height:28px;
              --mdui-chip-elevation:0 1px 3px rgba(0,0,0,.12);
            ">${name}</mdui-chip>`).join("")}
        </div>
      </div>
    `;
      rareCharsContainer.appendChild(card);
    }
}

function resetToLogin() {
  // 1. 隐藏加载页
  const loadingOverlay = document.getElementById("loadingOverlay");
  loadingOverlay.style.display = "none";

  // 2. 隐藏主内容（防止残留）
  document.querySelector("h1").style.display = "none";
  document.getElementById("poolSelector").style.display = "none";
  document.getElementById("chartContainer").style.display = "none";
  document.getElementById("rareCharsContainer").style.display = "none";

  // 3. 清空登录框、错误提示
  document.getElementById("phone").value = "";
  document.getElementById("password").value = "";
  document.getElementById("loginError").textContent = "";

  // 4. 显示登录页
  document.getElementById("loginContainer").style.display = "flex";
}

window.handleReload = handleReload;


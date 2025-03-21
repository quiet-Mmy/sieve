<script setup>
import { ref, computed, onMounted } from 'vue';

// 骰子游戏状态管理
const diceCount = ref(3); // 默认3个骰子
const diceResults = ref([]);
const isRolling = ref(false);
const coveredDice = ref([]); // 记录被盖住的骰子
const hasRolled = ref(false); // 是否已经投掷过
const isAllCovered = ref(false); // 是否所有骰子都被盖住（骰子盅）

// 音效对象
const diceRollSound = new Audio('/sounds/dice-roll.mp3');
const diceCoverSound = new Audio('/sounds/dice-cover.mp3');
const diceUncoverSound = new Audio('/sounds/dice-uncover.mp3');

// 骰子数量选项
const diceCountOptions = [1, 2, 3, 4, 5, 6];

// 投掷骰子
const rollDice = () => {
  isRolling.value = true;
  
  // 播放骰子投掷音效
  diceRollSound.currentTime = 0;
  diceRollSound.play();
  
  // 如果是第一次投掷或者重新开始，清空结果和盖子状态
  if (!hasRolled.value) {
    diceResults.value = [];
    coveredDice.value = [];
  } else {
    // 如果不是第一次投掷，只重新投掷未被盖住的骰子
    const newResults = [...diceResults.value];
    for (let i = 0; i < diceResults.value.length; i++) {
      if (!coveredDice.value.includes(i)) {
        newResults[i] = Math.floor(Math.random() * 6) + 1;
      }
    }
    diceResults.value = newResults;
  }
  
  // 模拟骰子滚动效果 - 加快滚动频率从100ms到50ms
  const rollInterval = setInterval(() => {
    if (!hasRolled.value) {
      // 第一次投掷，所有骰子都滚动
      diceResults.value = Array(diceCount.value).fill(0).map(() => 
        Math.floor(Math.random() * 6) + 1
      );
    } else {
      // 后续投掷，只有未被盖住的骰子滚动
      const newResults = [...diceResults.value];
      for (let i = 0; i < diceResults.value.length; i++) {
        if (!coveredDice.value.includes(i)) {
          newResults[i] = Math.floor(Math.random() * 6) + 1;
        }
      }
      diceResults.value = newResults;
    }
  }, 50); // 从100ms改为50ms，加快滚动速度
  
  // 缩短停止滚动时间从2秒到1秒
  setTimeout(() => {
    clearInterval(rollInterval);
    isRolling.value = false;
    
    // 最终结果
    if (!hasRolled.value) {
      // 第一次投掷，生成所有骰子结果
      diceResults.value = Array(diceCount.value).fill(0).map(() => 
        Math.floor(Math.random() * 6) + 1
      );
      hasRolled.value = true;
    } else {
      // 后续投掷，只更新未被盖住的骰子
      const newResults = [...diceResults.value];
      for (let i = 0; i < diceResults.value.length; i++) {
        if (!coveredDice.value.includes(i)) {
          newResults[i] = Math.floor(Math.random() * 6) + 1;
        }
      }
      diceResults.value = newResults;
    }
  }, 1000); // 从2000ms改为1000ms，缩短总投掷时间
};

// 更改骰子数量
const changeDiceCount = (count) => {
  diceCount.value = count;
  diceResults.value = [];
  coveredDice.value = [];
  hasRolled.value = false;
};

// 切换全部骰子的盖子状态（骰子盅）
const toggleAllCover = () => {
  if (!hasRolled.value || isRolling.value) return;
  
  isAllCovered.value = !isAllCovered.value;
  
  // 播放对应的音效
  if (isAllCovered.value) {
    diceCoverSound.currentTime = 0;
    diceCoverSound.play();
  } else {
    diceUncoverSound.currentTime = 0;
    diceUncoverSound.play();
  }
};

// 切换骰子的盖子状态
const toggleCover = (index) => {
  if (!hasRolled.value || isRolling.value) return;
  
  if (coveredDice.value.includes(index)) {
    // 如果已经被盖住，则打开
    coveredDice.value = coveredDice.value.filter(i => i !== index);
    diceUncoverSound.currentTime = 0;
    diceUncoverSound.play();
  } else {
    // 如果未被盖住，则盖住
    coveredDice.value.push(index);
    diceCoverSound.currentTime = 0;
    diceCoverSound.play();
  }
};

// 重新开始游戏
const resetGame = () => {
  diceResults.value = [];
  coveredDice.value = [];
  hasRolled.value = false;
  isAllCovered.value = false;
  
  // 重新开始后自动投掷骰子
  rollDice();
};

// 计算总点数
const totalPoints = computed(() => {
  return diceResults.value.reduce((sum, value) => sum + value, 0);
});

// 页面初始化
onMounted(() => {
  // 预加载音效
  diceRollSound.load();
  diceCoverSound.load();
  diceUncoverSound.load();
});
</script>

<template>
  <div class="app-container">
    <div class="header">骰子游戏</div>
    <div class="container">
      <div class="game-container">
        <h2>选择骰子数量</h2>
        <div class="dice-count-selector">
          <button 
            v-for="count in diceCountOptions" 
            :key="count"
            :class="{ 'selected': diceCount === count }"
            @click="changeDiceCount(count)"
            :disabled="isRolling || isAllCovered"
          >
            {{ count }}
          </button>
        </div>
        
        <div class="dice-container">
          <div v-if="diceResults.length > 0" class="dice-results" :class="{'all-covered': isAllCovered}">
            <div v-if="isAllCovered" class="dice-cup">
              <div class="cup-top"></div>
              <div class="cup-body">
                <div class="cup-shine"></div>
              </div>
              <span class="cup-text">骰子盅</span>
            </div>
            <div v-else v-for="(result, index) in diceResults" :key="index" class="dice" 
                 @click="toggleCover(index)" 
                 :class="{'covered': coveredDice.includes(index), 'clickable': hasRolled && !isRolling}">
              <!-- 骰子内容保持不变 -->
              <div class="dice-face" :class="'dice-' + result">
                <!-- 骰子点数显示 -->
                <div v-if="result === 1" class="dot center"></div>
                
                <template v-if="result === 2">
                  <div class="dot top-left"></div>
                  <div class="dot bottom-right"></div>
                </template>
                
                <template v-if="result === 3">
                  <div class="dot top-left"></div>
                  <div class="dot center"></div>
                  <div class="dot bottom-right"></div>
                </template>
                
                <template v-if="result === 4">
                  <div class="dot top-left"></div>
                  <div class="dot top-right"></div>
                  <div class="dot bottom-left"></div>
                  <div class="dot bottom-right"></div>
                </template>
                
                <template v-if="result === 5">
                  <div class="dot top-left"></div>
                  <div class="dot top-right"></div>
                  <div class="dot center"></div>
                  <div class="dot bottom-left"></div>
                  <div class="dot bottom-right"></div>
                </template>
                
                <template v-if="result === 6">
                  <div class="dot top-left"></div>
                  <div class="dot top-right"></div>
                  <div class="dot middle-left"></div>
                  <div class="dot middle-right"></div>
                  <div class="dot bottom-left"></div>
                  <div class="dot bottom-right"></div>
                </template>
              </div>
              <div v-if="coveredDice.includes(index)" class="dice-cover">
                <span>盖</span>
              </div>
            </div>
          </div>
          <div v-else class="placeholder-text">
            点击下方按钮投掷骰子
          </div>
        </div>
        
        <div v-if="diceResults.length > 0" class="result-summary">
          <p v-if="!isAllCovered">总点数: <span class="total-points">{{ totalPoints }}</span></p>
          <div v-if="hasRolled" class="game-instructions">
            <p>点击骰子可以单独"盖"住或"开"启</p>
            <div class="action-buttons">
              <button @click="toggleAllCover" class="cover-button" :disabled="isRolling">
                {{ isAllCovered ? '开' : '盖' }}
              </button>
              <button @click="resetGame" class="reset-button" :disabled="isAllCovered">
                重新开始
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <button @click="rollDice" :disabled="isRolling || isAllCovered" class="roll-button">
        {{ isRolling ? '骰子滚动中...' : '投掷骰子' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f8f8f8;
}

body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f7;
}

.header {
  background-color: #5655EE;
  color: #fff;
  padding: 4vw;
  text-align: center;
  font-size: clamp(16px, 4.5vw, 18px);
}

.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 4vw;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  border-radius: clamp(10px, 2.5vw, 15px);
  padding: 5vw;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 4vw;
  width: 100%;
  box-sizing: border-box;
}

h2 {
  color: #1C274C;
  margin-bottom: 20px;
  font-size: clamp(16px, 4.5vw, 20px);
}

.dice-count-selector {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.dice-count-selector button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #E8E8E8;
  background-color: white;
  font-size: 18px;
  font-weight: bold;
  color: #1C274C;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dice-count-selector button.selected {
  background-color: #5655EE;
  color: white;
  border-color: #5655EE;
  box-shadow: 0 4px 8px rgba(86, 85, 238, 0.3);
}

.dice-count-selector button:hover:not(:disabled) {
  border-color: #5655EE;
  transform: translateY(-2px);
}

.dice-count-selector button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.dice-container {
  width: 100%;
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.dice-results {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  position: relative;
  min-height: 150px;
  width: 100%;
}

.dice-results.all-covered {
  justify-content: center;
  align-items: center;
  perspective: 800px;
}

.dice-cup {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: cupDropAnimation 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top center;
}

.cup-body {
  width: 160px;
  height: 120px;
  background-color: #8A2BE2;
  background-image: linear-gradient(135deg, #9932CC 0%, #8A2BE2 50%, #7B68EE 100%);
  border-radius: 10px 10px 80px 80px;
  position: relative;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 -10px 20px rgba(0, 0, 0, 0.1);
  z-index: 20;
  overflow: hidden;
}

.cup-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
  transform: rotate(30deg);
  pointer-events: none;
}

.cup-top {
  width: 180px;
  height: 30px;
  background-color: #9932CC;
  background-image: linear-gradient(to right, #9932CC 0%, #BA55D3 50%, #9932CC 100%);
  border-radius: 90px 90px 0 0;
  margin-bottom: -10px;
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1), inset 0 5px 10px rgba(255, 255, 255, 0.2);
  z-index: 21;
}

.cup-text {
  position: absolute;
  bottom: 20px;
  color: white;
  font-weight: bold;
  font-size: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  z-index: 22;
}

@keyframes cupDropAnimation {
  0% { 
    transform: translateY(-150px) scale(0.9); 
    opacity: 0.7;
  }
  30% {
    transform: translateY(10px) scale(1.05);
    opacity: 1;
  }
  50% {
    transform: translateY(-5px) scale(0.98);
  }
  70% {
    transform: translateY(3px) scale(1.01);
  }
  100% { 
    transform: translateY(0) scale(1); 
  }
}

@keyframes cupAnimation {
  0% { transform: translateY(-50px) scale(0.8); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.cover-button {
  padding: 8px 16px;
  background-color: #8A2BE2;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.cover-button:hover:not(:disabled) {
  background-color: #9932CC;
  transform: translateY(-2px);
}

.cover-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.dice {
  width: 60px;
  height: 60px;
  perspective: 600px;
  position: relative;
}

.dice.clickable {
  cursor: pointer;
}

.dice-face {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: rollAnimation 0.3s ease-out; /* 从0.5s改为0.3s */
}

.dice-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(86, 85, 238, 0.8);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 20px;
  z-index: 10;
  animation: coverAnimation 0.3s ease-out;
}

@keyframes coverAnimation {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

.game-instructions {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.reset-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button:hover {
  background-color: #e0e0e0;
}

@keyframes rollAnimation {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  50% { transform: rotateX(180deg) rotateY(180deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

.dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #1C274C;
}

.center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
.top-left { top: 20%; left: 20%; }
.top-right { top: 20%; right: 20%; }
.middle-left { top: 50%; left: 20%; transform: translateY(-50%); }
.middle-right { top: 50%; right: 20%; transform: translateY(-50%); }
.bottom-left { bottom: 20%; left: 20%; }
.bottom-right { bottom: 20%; right: 20%; }

.placeholder-text {
  color: #A3A3A3;
  font-size: 16px;
  text-align: center;
}

.result-summary {
  margin-top: 20px;
  text-align: center;
  font-size: 18px;
  color: #1C274C;
}

.total-points {
  font-weight: bold;
  font-size: 24px;
  color: #5655EE;
}

.footer {
  display: flex;
  justify-content: center;
  padding: 4vw;
  background-color: #ffffff;
  position: fixed;
  width: 100%;
  bottom: 0;
  box-sizing: border-box;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.roll-button {
  width: 90%;
  max-width: 540px;
  padding: clamp(10px, 3vw, 15px);
  background-color: #5655EE;
  border: none;
  color: white;
  border-radius: clamp(12px, 3vw, 15px);
  cursor: pointer;
  font-size: clamp(14px, 4vw, 16px);
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(86, 85, 238, 0.2);
}

.roll-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(86, 85, 238, 0.3);
}

.roll-button:active:not(:disabled) {
  transform: translateY(0);
}

.roll-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media screen and (min-width: 768px) {
  .container {
    padding: 20px;
  }

  .dice {
    width: 80px;
    height: 80px;
  }

  .dot {
    width: 16px;
    height: 16px;
  }

  .footer {
    padding: 15px;
  }
}
</style>
